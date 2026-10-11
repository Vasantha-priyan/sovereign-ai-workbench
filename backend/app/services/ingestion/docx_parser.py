import docx
from typing import Dict, Any

def parse_docx_document(file_path: str) -> Dict[str, Any]:
    doc = docx.Document(file_path)
    paragraphs_data = []
    full_text = []

    for idx, p in enumerate(doc.paragraphs):
        text = p.text.strip()
        if not text:
            continue
        style_name = p.style.name if p.style else "Normal"
        is_heading = "Heading" in style_name
        paragraphs_data.append({
            "index": idx + 1,
            "text": text,
            "is_heading": is_heading,
            "style": style_name
        })
        full_text.append(text)

    # Tables extraction
    tables_data = []
    for t_idx, table in enumerate(doc.tables):
        t_rows = []
        for row in table.rows:
            t_rows.append([cell.text.strip() for cell in row.cells])
        tables_data.append({
            "table_index": t_idx + 1,
            "rows": t_rows
        })
        full_text.append(f"\n[TABLE {t_idx + 1} ({len(t_rows)} rows)]")
        for r in t_rows:
            full_text.append(" | ".join(r))

    combined_content = "\n".join(full_text)

    return {
        "page_count": 1,
        "paragraph_count": len(paragraphs_data),
        "table_count": len(tables_data),
        "total_characters": len(combined_content),
        "content_formatted": combined_content,
        "paragraphs": paragraphs_data,
        "tables": tables_data
    }
