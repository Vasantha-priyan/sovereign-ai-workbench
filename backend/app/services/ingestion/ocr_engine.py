import os
import pytesseract
from PIL import Image
from typing import Dict, Any, Optional

def perform_local_ocr_on_image(image_path_or_image: Any) -> Dict[str, Any]:
    try:
        # Perform OCR
        text = pytesseract.image_to_string(image_path_or_image)
        cleaned = text.strip()
        return {
            "success": True,
            "ocr_text": cleaned,
            "character_count": len(cleaned),
            "error": None
        }
    except pytesseract.TesseractNotFoundError:
        return {
            "success": False,
            "ocr_text": "",
            "character_count": 0,
            "error": "Tesseract OCR engine binary not found on local host."
        }
    except Exception as e:
        return {
            "success": False,
            "ocr_text": "",
            "character_count": 0,
            "error": f"OCR processing failed: {str(e)}"
        }

def perform_ocr_on_pdf_page(file_path: str, page_number: int) -> Dict[str, Any]:
    try:
        from pdf2image import convert_from_path
        images = convert_from_path(file_path, first_page=page_number, last_page=page_number)
        if not images:
            return {"success": False, "ocr_text": "", "error": "Could not render PDF page image"}
        return perform_local_ocr_on_image(images[0])
    except Exception as e:
        return {"success": False, "ocr_text": "", "error": f"PDF page rendering for OCR failed: {str(e)}"}
