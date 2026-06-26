use image::load_from_memory;
use rqrr::PreparedImage;

pub struct QrScanner;

impl QrScanner {
    pub fn scan_bytes(bytes: &[u8]) -> Result<String, String> {
        let img = load_from_memory(bytes).map_err(|e| format!("Failed to load image: {}", e))?;
        let gray = img.to_luma8();
        let mut prepared = PreparedImage::prepare(gray);
        let grids = prepared.detect_grids();
        let grid = grids.first().ok_or_else(|| "No QR code found".to_string())?;
        let (_, content) = grid
            .decode()
            .map_err(|e| format!("Failed to decode QR: {}", e))?;
        Ok(content)
    }

    pub fn scan_file(path: &str) -> Result<String, String> {
        let img = image::open(path).map_err(|e| format!("Failed to open image: {}", e))?;
        let gray = img.to_luma8();
        let mut prepared = PreparedImage::prepare(gray);
        let grids = prepared.detect_grids();
        let grid = grids.first().ok_or_else(|| "No QR code found".to_string())?;
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
