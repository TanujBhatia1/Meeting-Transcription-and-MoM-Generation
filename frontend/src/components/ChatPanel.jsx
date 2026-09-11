import { useState } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { askChat } from "../api";

function ChatPanel({ meeting, onError }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Ask me about decisions, action items, discussion points, or anything from your stored meetings.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  async function submitQuestion(event) {
    event.preventDefault();

    const text = question.trim();

    if (!text || loading) return;

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: text,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await askChat(text, meeting?.id || null);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.answer || "No answer was returned.",
          sources: response.sources || [],
        },
      ]);
    } catch (error) {
      onError(error.message);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: "I could not answer that question.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-layout">
      <div className="chat-header card">
        <div className="assistant-icon">
          <Sparkles size={22} />
        </div>

        <div>
          <p className="eyebrow">MEETING KNOWLEDGE</p>
          <h2>Ask anything about your meetings</h2>
          <p className="muted">
            Answers should be grounded in stored minutes and transcripts.
          </p>
        </div>
      </div>

      <div className="chat-card card">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              className={`chat-message ${
                message.role === "user" ? "chat-message-user" : ""
              }`}
              key={index}
            >
              <div className="chat-avatar">
                {message.role === "user" ? (
                  <User size={17} />
                ) : (
                  <Bot size={17} />
                )}
              </div>

              <div className="chat-bubble">
                <p>{message.content}</p>

                {message.sources?.length > 0 && (
                  <div className="sources">
                    <small>Sources</small>
                    {message.sources.slice(0, 3).map((source, sourceIndex) => (
                      <span key={sourceIndex}>
                        {source.text || "Meeting source"}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message">
              <div className="chat-avatar">
                <Bot size={17} />
              </div>
              <div className="chat-bubble typing-indicator">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
        </div>

        <form className="chat-form" onSubmit={submitQuestion}>
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Example: What decisions were made about the release?"
          />

          <button
            className="primary-button"
            type="submit"
            disabled={!question.trim() || loading}
          >
            <Send size={17} />
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPanel;