import { useEffect, useRef, useState } from "react";

import { Button, Icon, Spinner } from "@blueprintjs/core";

import { sendChat, type ChatMessage } from "../services/api";


const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm the Arokya Assistant. I can help you register, book " +
    "appointments, or find your way around the app. How can I help?",
};


export default function ChatWidget() {

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, loading]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();

    const text = input.trim();
    if (!text || loading) {
      return;
    }

    const history = messages.filter((m) => m !== GREETING);
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const result = await sendChat(text, history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err instanceof Error
              ? `Sorry, I couldn't reach the assistant: ${err.message}`
              : "Sorry, something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Arokya Assistant">

          <div className="chat-header">
            <div className="chat-header-title">
              <Icon icon="chat" />
              <span>Arokya Assistant</span>
            </div>
            <Button
              minimal
              small
              icon="cross"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            />
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-bubble chat-${message.role}`}
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <div className="chat-bubble chat-assistant chat-typing">
                <Spinner size={16} />
                <span>Thinking…</span>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask me anything…"
              value={input}
              autoFocus
              onChange={(event) => setInput(event.target.value)}
            />
            <Button
              type="submit"
              icon="send-message"
              intent="primary"
              disabled={loading || !input.trim()}
              aria-label="Send"
            />
          </form>
        </div>
      )}

      <button
        type="button"
        className={`chat-fab${open ? " chat-fab-open" : ""}`}
        aria-label={open ? "Close assistant" : "Open assistant"}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon icon={open ? "cross" : "chat"} size={24} />
      </button>
    </>
  );
}
