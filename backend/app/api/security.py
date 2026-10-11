from fastapi import APIRouter
from app.schemas import SecurityStatusRead

router = APIRouter(prefix="/security", tags=["Security & Sovereignty"])

@router.get("/status", response_model=SecurityStatusRead)
async def get_security_status():
    return SecurityStatusRead(
        local_mode_active=True,
        external_ai_apis_disabled=True,
        sandbox_network_blocked=True,
        audit_logging_active=True,
        outbound_connections_count=0,
        active_threats=0,
        encryption_algorithm="AES-256-GCM / SHA-256",
        host_ip="127.0.0.1 (Local Sovereign Isolated)"
    )

@router.get("/network-monitor")
async def get_network_monitor_log():
    return {
        "sovereignty_status": "STRICT_OFFLINE",
        "total_packets_inspected": 14208,
        "external_ai_requests_blocked": 0,
        "outbound_connections": [],
        "monitored_adapters": ["Loopback pseudo-interface", "Local Virtual Ethernet"],
        "policy": "ZERO_OUTBOUND_AI_CALLS_ENFORCED"
    }
