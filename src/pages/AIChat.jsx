import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiRobot2Line, RiSendPlaneLine, RiUserLine } from 'react-icons/ri';
import { chat } from '../services/api';

const SUGGESTIONS = [
  'How do I create a will?',
  'How does the Dead Man\'s Switch work?',
  'How do I add crypto assets?',
  'What documents should I upload?',
];

const formatMessage = (text) => {
  // Convert **bold** and bullet points to styled output
  return text.split('\n').map((line, i) => {
    const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <p key={i} style={{ marginBottom: '4px' }} dangerouslySetInnerHTML={{ __html: boldLine || '&nbsp;' }} />;
  });
};

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hello! I'm your DigiAsset estate planning assistant. Ask me anything about protecting your digital legacy, creating wills, managing beneficiaries, or setting up inheritance plans.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await chat({ message: msg });
      setMessages((prev) => [...prev, { role: 'ai', text: res.data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - var(--header-height) - 80px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="page-title">AI Chat</h1>
          <p className="page-subtitle">Ask anything about your digital estate</p>
        </div>
      </div>

      <div className="chat-container" style={{ flex: 1, minHeight: 0 }}>
        {/* Chat header */}
        <div className="chat-header">
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
            <RiRobot2Line />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>DigiAsset AI</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-teal)' }}>● Online</div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`chat-message ${msg.role}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.role === 'ai' && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                    <RiRobot2Line />
                  </div>
                )}
                <div className="chat-bubble">
                  {msg.role === 'ai' ? formatMessage(msg.text) : msg.text}
                </div>
                {msg.role === 'user' && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-gold-dim)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>
                    <RiUserLine />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="chat-message ai">
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                <RiRobot2Line />
              </div>
              <div className="chat-bubble">
                <div className="typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="chat-suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip" onClick={() => sendMessage(s)}>{s}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <input
            type="text"
            placeholder="Ask about your digital estate..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
            <RiSendPlaneLine />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
