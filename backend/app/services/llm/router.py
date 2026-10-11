from typing import Dict, Any

DEFAULT_GENERAL_MODEL = "qwen2.5:7b-instruct"
DEFAULT_CODING_MODEL = "qwen2.5-coder:7b"
DEFAULT_VISION_MODEL = "llama3.2-vision:11b"

def select_model_for_prompt(prompt: str) -> Dict[str, Any]:
    p_lower = prompt.lower()

    # 1. Vision / Image / OCR intent
    vision_keywords = ["image", "photo", "scan", "ocr", "diagram", "gauge", "visual"]
    if any(k in p_lower for k in vision_keywords):
        return {
            "model_name": DEFAULT_VISION_MODEL,
            "category": "VISION",
            "reason": "Routed to Llama Vision model for visual inspection & OCR evidence processing."
        }

    # 2. Coding / Math / Data Analytics intent
    coding_keywords = ["python", "code", "pandas", "csv", "calculate", "math", "script", "sql", "formula", "percentage"]
    if any(k in p_lower for k in coding_keywords):
        return {
            "model_name": DEFAULT_CODING_MODEL,
            "category": "CODING",
            "reason": "Routed to Qwen Coder model for sandboxed math calculations and tabular data analytics."
        }

    # 3. General reasoning & SOP intent (Default)
    return {
        "model_name": DEFAULT_GENERAL_MODEL,
        "category": "GENERAL",
        "reason": "Routed to Qwen General Instruct model for SOP compliance and engineering analysis."
    }
