import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatApp.css';

function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [user, setUser] = useState('');
  const [isUserSet, setIsUserSet] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const API_URL = '/api/messages';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      alert('Failed to load messages. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
  e.preventDefault();
  if (!text.trim()) return;

  console.log('Sending message:', { text, user }); // Debug log

  try {
    const response = await axios.post(API_URL, { 
      text: text.trim(), 
      user: user.trim() 
    });
    console.log('Response:', response.data); // Debug log
    setMessages([...messages, response.data]);
    setText('');
  } catch (error) {
    console.error('Error sending message:', error);
    console.error('Error response:', error.response?.data); // More details
    alert(`Failed to send message: ${error.response?.data?.message || error.message}`);
  }
};

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (user.trim()) {
      setIsUserSet(true);
    }
  };

  const changeUser = () => {
    setIsUserSet(false);
    setUser('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isUserSet) {
    return (
      <div className="chat-container">
        <div className="welcome-screen">
          <div className="welcome-card">
            <h1>🚀 Three-Tier Chat App</h1>
            <p>Enter your name to start chatting</p>
            <form onSubmit={handleUserSubmit}>
              <input
                type="text"
                placeholder="Your name..."
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="user-input"
                maxLength={20}
                required
              />
              <button type="submit" className="join-btn">
                Join Chat
              </button>
            </form>
            <div className="tech-stack">
              <span className="badge">React</span>
              <span className="badge">Node.js</span>
              <span className="badge">MongoDB</span>
              <span className="badge">Kubernetes</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <h2>💬 Three-Tier Chat</h2>
          <div className="user-info">
            <span className="current-user">👤 {user}</span>
            <button onClick={changeUser} className="change-user-btn">
              Change
            </button>
          </div>
        </div>
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Be the first to say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={msg._id || index}
              className={`message ${msg.user === user ? 'own-message' : 'other-message'}`}
            >
              <div className="message-content">
                <div className="message-header">
                  <span className="message-user">{msg.user}</span>
                  <span className="message-time">
                    {formatTime(msg.timestamp || msg.createdAt)}
                  </span>
                </div>
                <div className="message-text">{msg.text}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          placeholder="Type your message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="message-input"
          maxLength={500}
        />
        <button type="submit" className="send-btn">
          Send 📤
        </button>
      </form>
    </div>
  );
}

export default ChatApp;
