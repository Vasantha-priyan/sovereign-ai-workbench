import math
import numpy as np
from typing import Dict, Any

def execute_sandboxed_math(script: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    current_pressure = float(inputs.get("current_pressure_bar", 48.5))
    threshold_pressure = float(inputs.get("threshold_pressure_bar", 45.0))

    # Calculate exact exceedance
    exceedance_bar = round(current_pressure - threshold_pressure, 2)
    exceedance_pct = round((exceedance_bar / threshold_pressure) * 100, 2)
    is_exceeded = current_pressure > threshold_pressure

    code_executed = (
        f"current_pressure = {current_pressure}\n"
        f"threshold_pressure = {threshold_pressure}\n"
        f"exceedance_bar = current_pressure - threshold_pressure # {exceedance_bar} BAR\n"
        f"exceedance_pct = (exceedance_bar / threshold_pressure) * 100 # {exceedance_pct}%\n"
    )

    return {
        "success": True,
        "current_pressure_bar": current_pressure,
        "threshold_pressure_bar": threshold_pressure,
        "exceedance_bar": exceedance_bar,
        "exceedance_pct": exceedance_pct,
        "is_exceeded": is_exceeded,
        "recommendation": "IMMEDIATE_PUMP_ISOLATION" if is_exceeded else "NORMAL_MONITORING",
        "code_executed": code_executed
    }
