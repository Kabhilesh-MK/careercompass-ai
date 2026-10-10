"""AI Mentor chat routes — conversation history + canned replies (Phase 2)."""

from fastapi import APIRouter, Depends

from app.schemas.misc import ChatMessage
from app.services import chat_service
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/mentor", tags=["AI Mentor"])


@router.get("/history", response_model=dict)
async def get_history(user: dict = Depends(get_current_user)):
    return await chat_service.get_history(str(user["_id"]))


@router.post("/message", response_model=dict)
async def send_message(message: ChatMessage, user: dict = Depends(get_current_user)):
    user_id = str(user["_id"])
    # Persist the user's message
    await chat_service.add_message(user_id, message)
    # Generate and persist the contextual assistant reply
    reply = await chat_service.generate_mentor_reply(message.text, user_id=user_id)
    assistant_msg = ChatMessage(role="assistant", text=reply, time="Now")
    history = await chat_service.add_message(user_id, assistant_msg)
    return {"reply": reply, "history": history}


@router.delete("/history", status_code=204)
async def clear_history(user: dict = Depends(get_current_user)):
    await chat_service.clear_history(str(user["_id"]))
