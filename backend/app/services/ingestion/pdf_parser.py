import pypdf
from typing import List, Dict, Any

def parse_pdf_document(file_path: str) -> Dict[str, Any]:
    pages_data = []
    total_characters = 0
    scanned_pages_count = 0

    reader = pypdf.PdfReader(file_path)
    total_pages = len(reader.pages)

    for i, page in enumerate(reader.pages):
        page_num = i + 1
        page_text = page.extract_text() or ""
        cleaned_text = page_text.strip()
        char_count = len(cleaned_text)

        # Scanned page detection: text < 20 characters
        needs_ocr = char_count < 20

        if needs_ocr:
            scanned_pages_count += 1

        total_characters += char_count
        pages_data.append({
            "page_number": page_num,
            "text": cleaned_text,
            "char_count": char_count,
            "needs_ocr": needs_ocr,
            "content_type": "TEXT" if not needs_ocr else "OCR_PENDING"
        })

    is_scanned_pdf = scanned_pages_count > 0 and (scanned_pages_count / max(1, total_pages)) >= 0.5

    return {
        "page_count": total_pages,
        "total_characters": total_characters,
        "is_scanned_pdf": is_scanned_pdf,
        "scanned_pages_count": scanned_pages_count,
        "pages": pages_data
    }
