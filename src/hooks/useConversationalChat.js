import { useRef, useState } from "react";
import { sendConversational } from "../services/api";

/**
 * Simple conversational chat hook that tracks session_id and conversation_history
 */
export default function useConversationalChat(defaultUserId = "angel-acv") {
  const [sessionId, setSessionId] = useState("");
  const conversationHistoryRef = useRef([]);

  async function send(text) {
    const payload = {
      message: text,
      user_id: defaultUserId,
      session_id: sessionId || undefined,
      conversation_history: conversationHistoryRef.current
    };
    const res = await sendConversational(payload);
    // update sessionId if new
    if (!sessionId) setSessionId(res.session_id);

    // push user and assistant turns to in-memory history (minimal schema)
    conversationHistoryRef.current = [
      ...conversationHistoryRef.current,
      { role: "user", content: text, timestamp: new Date().toISOString() },
      { role: "assistant", content: res.response, timestamp: res.timestamp }
    ];

    return res;
  }

  function reset() {
    setSessionId("");
    conversationHistoryRef.current = [];
  }

  return { send, reset, sessionId, history: conversationHistoryRef.current };
}