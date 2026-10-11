import csv
import json
from typing import Dict, Any

def parse_csv_document(file_path: str) -> Dict[str, Any]:
    rows = []
    headers = []

    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        try:
            headers = next(reader)
        except StopIteration:
            return {
                "page_count": 1,
                "row_count": 0,
                "col_count": 0,
                "headers": [],
                "content_formatted": "Empty CSV File",
                "table_json": json.dumps({"headers": [], "rows": []})
            }

        for row in reader:
            if row:
                rows.append(row)

    col_count = len(headers)
    row_count = len(rows)

    # Format tabular representation
    table_dict = {
        "headers": headers,
        "rows": rows[:100], # Cap at 100 sample rows for DB content
        "total_rows": row_count,
        "total_cols": col_count
    }

    formatted_text = f"CSV DATA TABLE ({row_count} rows, {col_count} columns)\nHeaders: {', '.join(headers)}\n\nSample Rows:\n"
    for r in rows[:10]:
        formatted_text += " | ".join(r) + "\n"

    return {
        "page_count": 1,
        "row_count": row_count,
        "col_count": col_count,
        "headers": headers,
        "content_formatted": formatted_text,
        "table_json": json.dumps(table_dict)
    }
