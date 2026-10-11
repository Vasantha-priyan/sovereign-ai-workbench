from typing import Dict, Any

def parse_txt_document(file_path: str) -> Dict[str, Any]:
    raw_content = ""
    for enc in ["utf-8", "latin-1", "cp1252"]:
        try:
            with open(file_path, "r", encoding=enc) as f:
                raw_content = f.read()
            break
        except UnicodeDecodeError:
            continue

    normalized = raw_content.replace("\r\n", "\n").strip()

    return {
        "page_count": 1,
        "total_characters": len(normalized),
        "content_formatted": normalized
    }
