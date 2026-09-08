use image::load_from_memory;

pub struct QrScanner;

impl QrScanner {
    pub fn scan_bytes(bytes: &[u8]) -> Result<String, String> {
        let img = load_from_memory(bytes).map_err(|e| format!("Failed to load image: {}", e))?;
        Self::scan_image(&img)
    }

    pub fn scan_file(path: &str) -> Result<String, String> {
        let img = image::open(path).map_err(|e| format!("Failed to open image: {}", e))?;
        Self::scan_image(&img)
    }

    fn scan_image(img: &image::DynamicImage) -> Result<String, String> {
        let gray = img.to_luma8();
        match Self::decode(&gray) {
            Ok(content) => Ok(content),
            Err(_) => {
                // Retry on a 2x upscaled copy so small / distant codes can be decoded.
                let big = image::imageops::resize(
                    &gray,
                    gray.width() * 2,
                    gray.height() * 2,
                    image::imageops::FilterType::Lanczos3,
                );
                Self::decode(&big)
            }
        }
    }

    fn decode(gray: &image::GrayImage) -> Result<String, String> {
        let mut prepared = rqrr::PreparedImage::prepare(gray.clone());
        let grids = prepared.detect_grids();
        let grid = grids
            .first()
            .ok_or_else(|| "No QR code found".to_string())?;
        let (_, content) = grid
            .decode()
            .map_err(|e| format!("Failed to decode QR: {}", e))?;
        Ok(content)
    }
}

#[tauri::command]
pub fn scan_qr_file(path: String) -> Result<String, String> {
    QrScanner::scan_file(&path)
}

#[tauri::command]
pub fn scan_qr_bytes(bytes: Vec<u8>) -> Result<String, String> {
    QrScanner::scan_bytes(&bytes)
}