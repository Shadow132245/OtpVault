window.QRScanner = {
  scanning: false,
  stream: null,
  _videoEl: null,

  async scanFromCamera(onResult, videoEl) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      videoEl.srcObject = this.stream;
      videoEl.play();
      this.scanning = true;
      this._videoEl = videoEl;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let lastScan = 0;
      const SCAN_INTERVAL = 300;

      const scan = () => {
        if (!this.scanning) return;
        const now = Date.now();
        if (now - lastScan < SCAN_INTERVAL) {
          requestAnimationFrame(scan);
          return;
        }
        if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
          lastScan = now;
          canvas.width = videoEl.videoWidth;
          canvas.height = videoEl.videoHeight;
          ctx.drawImage(videoEl, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          if (typeof jsQR !== 'undefined') {
            const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
            if (code && code.data) {
              this.stop();
              onResult(code.data);
              return;
            }
          }
        }
        requestAnimationFrame(scan);
      };
      scan();
    } catch (err) {
      console.error('Camera access denied:', err);
      throw err;
    }
  },

  captureFrame() {
    if (!this._videoEl || !this.scanning) return null;
    const video = this._videoEl;
    if (video.readyState !== video.HAVE_ENOUGH_DATA) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (typeof jsQR !== 'undefined') {
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
      if (code && code.data) {
        this.stop();
        return code.data;
      }
    }
    return null;
  },

  scanFromFile(file, onResult, onError) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (typeof jsQR !== 'undefined') {
          const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
          if (code && code.data) {
            onResult(code.data);
          } else {
            if (onError) onError('No QR code found in image');
          }
        } else {
          if (onError) onError('QR library not loaded');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  stop() {
    this.scanning = false;
    this._videoEl = null;
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }
};
