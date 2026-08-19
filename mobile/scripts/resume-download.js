const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://dl.google.com/android/repository/android-ndk-r27c-windows.zip';
const zipPath = path.join(process.env.TEMP, 'android-ndk-r27c-windows.zip');

const existingSize = fs.existsSync(zipPath) ? fs.statSync(zipPath).size : 0;
console.log('Existing: ' + (existingSize / 1024 / 1024).toFixed(1) + ' MB, resuming from byte ' + existingSize);

const parsedUrl = new URL(url);
const options = {
  hostname: parsedUrl.hostname,
  path: parsedUrl.pathname,
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0',
    'Range': 'bytes=' + existingSize + '-',
  },
};

const req = https.get(options, (res) => {
  console.log('Status: ' + res.statusCode);
  if (res.statusCode === 206 || res.statusCode === 200) {
    const contentLength = parseInt(res.headers['content-length'], 10);
    let totalSize = existingSize + contentLength;
    if (res.headers['content-range']) {
      totalSize = parseInt(res.headers['content-range'].split('/')[1], 10);
    }
    console.log('Remaining: ' + (contentLength / 1024 / 1024).toFixed(1) + ' MB, Total: ' + (totalSize / 1024 / 1024).toFixed(1) + ' MB');
    
    const file = fs.openSync(zipPath, 'r+');
    let downloaded = existingSize;
    let lastPrint = Date.now();
    
    res.on('data', (chunk) => {
      fs.writeSync(file, chunk, 0, chunk.length, downloaded);
      downloaded += chunk.length;
      if (Date.now() - lastPrint > 5000) {
        const pct = ((downloaded / totalSize) * 100).toFixed(1);
        console.log((downloaded / 1024 / 1024).toFixed(1) + ' MB / ' + (totalSize / 1024 / 1024).toFixed(1) + ' MB (' + pct + '%)');
        lastPrint = Date.now();
      }
    });
    
    res.on('end', () => {
      fs.closeSync(file);
      console.log('Download complete: ' + (downloaded / 1024 / 1024).toFixed(1) + ' MB');
      process.exit(0);
    });
    
    res.on('error', (err) => {
      fs.closeSync(file);
      console.error('Error:', err.message);
      process.exit(1);
    });
  } else {
    console.error('Unexpected status: ' + res.statusCode);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error('Request error:', err.message);
  process.exit(1);
});

req.setTimeout(600000, () => {
  req.destroy();
  console.error('Request timeout');
  process.exit(1);
});
