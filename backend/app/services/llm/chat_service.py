import json
from typing import Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models import Conversation, Message, User, AuditLog
from app.services.rag.retriever import perform_rag_query
from app.services.llm.router import select_model_for_prompt
from app.services.llm.inference import execute_local_inference

async def process_chat_message(
    conversation_id: Optional[str],
    prompt: str,
    kb_id: Optional[str],
    db: AsyncSession
) -> Dict[str, Any]:
    # 1. Fetch or create user & conversation
    user_res = await db.execute(select(User))
    user = user_res.scalars().first()

    # 2. Model Routing
    routing_info = select_model_for_prompt(prompt)
    target_model = routing_info["model_name"]

    is_coding = (
        target_model == "qwen2.5-coder:7b" or
        any(k in prompt.lower() for k in ["code", "python", "function", "script", "calculate", "algorithm", "def ", "class ", "heat rate", "compute"])
    )

    if not conversation_id:
        conv = Conversation(
            user_id=user.id if user else "user-1",
            title=prompt[:40] if prompt else "Pump P-102A Inspection Review",
            selected_model=target_model
        )
        db.add(conv)
        await db.flush()
        conversation_id = conv.id

    # Save user message
    user_msg = Message(
        conversation_id=conversation_id,
        role="user",
        content=prompt
    )
    db.add(user_msg)
    await db.flush()

    # 3. RAG Retrieval (Skip document retrieval for pure coding/script generation tasks)
    citations = []
    if not is_coding:
        rag_result = await perform_rag_query(kb_id=kb_id or "kb-1", query=prompt, db=db)
        citations = rag_result.get("citations", [])

    # 4. Local Inference
    context_chunks = [
        {
            "document_name": c["document_name"],
            "page_number": c["page_number"],
            "excerpt": c["excerpt"]
        }
        for c in citations
    ]
    inference_res = await execute_local_inference(
        prompt=prompt,
        model_name=target_model,
        context_chunks=context_chunks
    )

    # 5. Save assistant message
    citations_json_str = json.dumps(citations)
    ai_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=inference_res["text"],
        model_used=target_model,
        citations_json=citations_json_str
    )
    db.add(ai_msg)

    # 6. Audit Logging
    audit = AuditLog(
        organization_id=user.organization_id if user else "org-1",
        user_id=user.id if user else "user-1",
        user_name=user.full_name if user else "Rajesh Verma",
        action="AI_WORKBENCH_QUERY",
        resource_type="WORKBENCH_SESSION",
        resource_id=conversation_id,
        status="SUCCESS",
        details_json=json.dumps({
            "model_used": target_model,
            "latency_ms": inference_res["latency_ms"],
            "citations_count": len(citations)
        })
    )
    db.add(audit)
    await db.commit()
    await db.refresh(ai_msg)

    return {
        "id": ai_msg.id,
        "conversation_id": conversation_id,
        "role": "assistant",
        "content": inference_res["text"],
        "model_used": target_model,
        "latency_ms": inference_res["latency_ms"],
        "provider": inference_res["provider"],
        "citations": citations,
        "action_shortcuts": [
            "Create Emergency Shutdown Approval Note (.docx)",
            "Run Sandboxed Python Calculation",
            "Export Compliance Summary (.xlsx)"
        ]
    }
