import { useState, useRef, useEffect } from 'react';

function AskAIDialog({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error calling agent:', error);
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ask-ai-overlay" onClick={onClose}>
      <div className="ask-ai-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="ask-ai-header">
          <h2>Ask Gorilla Agent 🦍</h2>
          <button className="ask-ai-close" onClick={onClose} aria-label="閉じる">×</button>
        </div>

        <div className="ask-ai-messages">
          {messages.length === 0 && !loading && (
            <p className="ask-ai-placeholder">ゴリラストアの商品について何でも聞いてください！</p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`ask-ai-message ask-ai-message--${msg.role}`}>
              <span className="ask-ai-bubble">{msg.content}</span>
            </div>
          ))}
          {loading && (
            <div className="ask-ai-message ask-ai-message--assistant">
              <span className="ask-ai-bubble ask-ai-typing">
                <span className="ask-ai-dot" />
                <span className="ask-ai-dot" />
                <span className="ask-ai-dot" />
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="ask-ai-input-area">
          <textarea
            className="ask-ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力... (Enter で送信)"
            rows={2}
            disabled={loading}
          />
          <button
            className="ask-ai-send"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}

export default AskAIDialog;
