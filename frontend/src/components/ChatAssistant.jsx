import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

function ChatAssistant() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Hello! I\'m the IT Helpdesk assistant. How can I help you?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await api.post('/AI/chat', { message: userMsg });
            setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an error. Please try again.' }]);
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
        <>
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center z-50 transition-transform hover:scale-110"
            >
                {open ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                )}
            </button>

            {open && (
                <div className="fixed bottom-24 right-6 w-96 bg-white rounded-xl shadow-2xl border z-50 flex flex-col" style={{ height: '500px' }}>
                    <div className="p-4 bg-blue-600 text-white rounded-t-xl">
                        <h3 className="font-semibold">AI Assistant</h3>
                        <p className="text-xs text-blue-200">IT Helpdesk support chatbot</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-none'
                                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg rounded-bl-none text-sm">
                                    <span className="animate-pulse">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-3 border-t">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading || !input.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ChatAssistant;
