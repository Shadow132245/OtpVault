window.QRScanner = {
  scanning: false,
  stream: null,

  async scanFromCamera(onResult, videoEl) {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      videoEl.srcObject = this.stream;
      videoEl.play();
      this.scanning = true;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const scan = () => {
        if (!this.scanning) return;
        if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
          canvas.width = videoEl.videoWidth;
          canvas.height = videoEl.videoHeight;
          ctx.drawImage(videoEl, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          if (typeof jsQR !== 'undefined') {
            const code = jsQR(imageData.data, imageData.width, imageData.height);
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

  scanFromFile(file, onResult) {
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
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            onResult(code.data);
          } else {
            alert('No QR code found in image');
          }
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  stop() {
    this.scanning = false;
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }
};
