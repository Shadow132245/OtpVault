package com.otpvault.desktop;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import java.io.File;
import java.io.FileNotFoundException;

/**
 * Exposes a downloaded APK from the app's external cache directory to the
 * system package installer through a content:// URI. The provider is not
 * exported; temporary read access is granted per install intent.
 */
public final class UpdateFileProvider extends ContentProvider {

  private static final String AUTHORITY = "com.otpvault.desktop.updatefileprovider";

  public static Uri uriForFile(android.content.Context context, File file) {
    return Uri.parse("content://" + AUTHORITY + "/" + file.getName());
  }

  @Override
  public boolean onCreate() {
    return true;
  }

  @Override
  public ParcelFileDescriptor openFile(Uri uri, String mode) throws FileNotFoundException {
    File dir = getContext() != null ? getContext().getExternalFilesDir(null) : null;
    if (dir == null) {
      throw new FileNotFoundException("External files dir unavailable");
    }
    File file = new File(dir, uri.getLastPathSegment());
    return ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY);
  }

  @Override
  public String getType(Uri uri) {
    return "application/vnd.android.package-archive";
  }

  @Override
  public Cursor query(Uri uri, String[] projection, String selection, String[] selectionArgs, String sortOrder) {
    return null;
  }

  @Override
  public Uri insert(Uri uri, ContentValues values) {
    return null;
  }

  @Override
  public int delete(Uri uri, String selection, String[] selectionArgs) {
    return 0;
  }

  @Override
  public int update(Uri uri, ContentValues values, String selection, String[] selectionArgs) {
    return 0;
  }
}