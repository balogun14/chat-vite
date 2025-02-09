// src/components/Chat.tsx
import React, { useEffect, useState } from 'react';
import { useChatStore } from './lib/signalR';

interface ChatProps {
  channelId: string;
  token: string;
}

export const Chat: React.FC<ChatProps> = ({ channelId, token }) => {
  const [message, setMessage] = useState('');
  const { connect, disconnect, sendMessage, messages } = useChatStore();

  useEffect(() => {
    connect(channelId, token).catch(console.error);
    return () => {
      disconnect().catch(console.error);
    };
  }, [channelId, connect, disconnect, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log(messages);
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage(channelId, message);
      setMessage('');
    } catch (error) {
        console.error(channelId);
        console.error(token);
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-4">
            <div className="font-bold">{msg.lastEdited?.getDate()}</div>
            <div>{msg.content}</div>
            <div className="text-sm text-gray-500">
              {new Date(msg.timestamp).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
            placeholder="Type a message..."
          />
          <button 
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};