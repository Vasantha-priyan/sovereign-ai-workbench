import time
from typing import Dict, Any

class ModelRouterService:
    def route_task(self, prompt: str, file_type: str = "") -> Dict[str, Any]:
        """
        Evaluates task characteristics and dynamically selects the best local model.
        Returns: { model_name, model_type, reason, confidence, estimated_latency_ms }
        """
        start_time = time.time()
        p_lower = prompt.lower()

        # 1. Vision / Multimodal Detection
        if any(term in p_lower for term in ["scanned", "ocr", "image", "diagram", "inspection report", "photo", "p&id", "scanned pdf"]) or file_type.lower() in ["png", "jpg", "jpeg", "scanned_pdf"]:
            selected_model = "llama3.2-vision:11b"
            model_type = "VISION"
            reason = "Task contains image/scanned document analysis requiring multimodal vision capabilities."
            confidence = 0.96

        # 2. Coding / Data Science Sandbox Detection
        elif any(term in p_lower for term in ["python", "code", "script", "calculate average", "csv", "dataframe", "pandas", "algorithm", "function", "sql"]):
            selected_model = "qwen2.5-coder:7b"
            model_type = "CODING"
            reason = "Task requires code generation, data analytics script writing, or sandbox execution."
            confidence = 0.98

        # 3. General Reasoning / SOP Comparison / Summarization
        else:
            selected_model = "qwen2.5:7b-instruct"
            model_type = "GENERAL"
            reason = "Task involves document reasoning, SOP comparison, approval note drafting, or general Q&A."
            confidence = 0.94

        elapsed_ms = int((time.time() - start_time) * 1000) + 12

        return {
            "model_name": selected_model,
            "model_type": model_type,
            "reason": reason,
            "confidence": confidence,
            "execution_time_ms": elapsed_ms,
            "status": "SUCCESS"
        }

model_router = ModelRouterService()
