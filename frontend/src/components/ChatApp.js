import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ChatApp() {
  const [text, setText] = useState('');
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/messages');
      setMessages(res.data);
    } catch (err) { console.log(err); }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) return;
    try {
      await axios.post('http://localhost:5000/api/messages', { text });
      setText('');
      fetchMessages();
    } catch (err) { console.log(err); }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Chat App</h1>
      <form onSubmit={handleSubmit} className="flex mb-4">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow border p-2 rounded"
        />
        <button type="submit" className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
          Send
        </button>
      </form>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg._id} className="p-2 border rounded bg-gray-50">
            {msg.text}
            <div className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatApp;
