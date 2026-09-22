package com.otpvault.desktop;

import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.widget.Toast;
import java.io.File;

/**
 * Downloads a new APK with the system DownloadManager and hands it to the
 * package installer once complete. The installer screen is the OS's own
 * (one tap), because a normal app cannot install packages silently.
 */
public final class UpdateInstaller {

  private static final String FILE_NAME = "otpvault-update.apk";

  public static void installUpdate(final Context context, final String url) {
    try {
      final DownloadManager dm = (DownloadManager) context.getSystemService(Context.DOWNLOAD_SERVICE);
      if (dm == null) {
        toast(context, "Download service unavailable");
        return;
      }
      File existing = new File(context.getExternalFilesDir(null), FILE_NAME);
      if (existing.exists()) {
        existing.delete();
      }

      DownloadManager.Request req = new DownloadManager.Request(Uri.parse(url));
      req.setTitle("OtpVault Update");
      req.setDescription("Downloading the new version…");
      req.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
      req.setDestinationInExternalFilesDir(context, null, FILE_NAME);

      final long id = dm.enqueue(req);

      BroadcastReceiver receiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context ctx, Intent intent) {
          long got = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L);
          if (got != id) {
            return;
          }
          try {
            ctx.unregisterReceiver(this);
          } catch (Exception ignored) {
          }
          File done = new File(ctx.getExternalFilesDir(null), FILE_NAME);
          try {
            Uri uri = UpdateFileProvider.uriForFile(ctx, done);
            Intent install = new Intent(Intent.ACTION_VIEW, uri);
            install.setDataAndType(uri, "application/vnd.android.package-archive");
            install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            install.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(install);
          } catch (Exception e) {
            toast(ctx, "Install failed: " + e.getMessage());
          }
        }
      };

      context.registerReceiver(receiver, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
      toast(context, "Downloading update…");
    } catch (Exception e) {
      toast(context, "Update error: " + e.getMessage());
    }
  }

  private static void toast(final Context context, final String msg) {
    try {
      Toast.makeText(context, msg, Toast.LENGTH_SHORT).show();
    } catch (Exception ignored) {
    }
  }
}