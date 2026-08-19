const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const url = 'https://dl.google.com/android/repository/android-ndk-r27c-windows.zip';
const destDir = path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk', 'ndk');
const zipPath = path.join(process.env.TEMP || process.env.LOCALAPPDATA, 'android-ndk-r27c-windows.zip');
const extractDir = path.join(destDir, '27.1.12297006');

console.log(`Downloading NDK from ${url}`);
console.log(`Destination: ${zipPath}`);

function download(downloadUrl, filePath) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(downloadUrl);
    
    const makeRequest = (urlStr, redirectCount = 0) => {
      if (redirectCount > 5) {
        reject(new Error('Too many redirects'));
        return;
      }
      
      const parsed = new URL(urlStr);
      const options = {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' },
      };
      
      const protocol = parsed.protocol === 'https:' ? https : require('http');
      
      const req = protocol.get(urlStr, options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          console.log(`Redirecting to ${res.headers.location}`);
          makeRequest(res.headers.location, redirectCount + 1);
          return;
        }
        
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        
        const totalSize = parseInt(res.headers['content-length'], 10);
        console.log(`Total size: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
        
        const file = fs.createWriteStream(filePath);
        let downloaded = 0;
        
        res.on('data', (chunk) => {
          downloaded += chunk.length;
          file.write(chunk);
          if (totalSize) {
            const pct = ((downloaded / totalSize) * 100).toFixed(1);
            process.stdout.write(`\rDownloaded: ${(downloaded / 1024 / 1024).toFixed(1)} MB (${pct}%)`);
          }
        });
        
        res.on('end', () => {
          file.end();
          console.log(`\nDownload complete: ${(downloaded / 1024 / 1024).toFixed(1)} MB`);
          resolve(downloaded);
        });
        
        res.on('error', (err) => {
          file.end();
          reject(err);
        });
      });
      
      req.on('error', reject);
      req.setTimeout(300000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    };
    
    makeRequest(downloadUrl);
  });
}

async function main() {
  try {
    await download(url, zipPath);
    console.log('NDK zip downloaded successfully');
    
    // Extract using PowerShell
    const { execSync } = require('child_process');
    
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }
    
    console.log('Extracting...');
    execSync(`Expand-Archive -Path "${zipPath}" -DestinationPath "${destDir}" -Force`, {
      stdio: 'inherit',
      timeout: 600000,
    });
    
    // The zip extracts to android-ndk-r27c/, we need to move it to 27.1.12297006/
    const extractedNdkDir = path.join(destDir, 'android-ndk-r27c');
    if (fs.existsSync(extractedNdkDir)) {
      console.log(`Moving ${extractedNdkDir} -> ${extractDir}`);
      fs.renameSync(extractedNdkDir, extractDir);
    }
    
    console.log('NDK installation complete!');
    
    // Verify
    const platformsDir = path.join(extractDir, 'platforms');
    if (fs.existsSync(platformsDir)) {
      console.log('Verified: platforms directory exists');
    } else {
      console.log('WARNING: platforms directory not found');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
