import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateTicket() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [category, setCategory] = useState('Other');
    const [error, setError] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/Tickets', { title, description, priority, category });
            navigate('/tickets');
        } catch (err) {
            setError('Failed to create ticket');
        }
    };

    const handleAiSuggest = async () => {
        if (!title.trim() || !description.trim()) {
            setError('Please enter a title and description first');
            return;
        }
        setAiLoading(true);
        setError('');
        try {
            const res = await api.post('/AI/suggest-category-priority', {
                title: title.trim(),
                description: description.trim()
            });
            if (res.data.category) setCategory(res.data.category);
            if (res.data.priority) setPriority(res.data.priority);
        } catch (err) {
            setError('AI suggestion failed. Please fill in manually.');
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Create New Ticket</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Brief description of the issue"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        rows="4"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Detailed description of the problem"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="Hardware">Hardware</option>
                            <option value="Software">Software</option>
                            <option value="Network">Network</option>
                            <option value="Email">Email</option>
                            <option value="Access Request">Access Request</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <button
                        type="button"
                        onClick={handleAiSuggest}
                        disabled={aiLoading}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>{aiLoading ? 'Analyzing...' : 'AI Suggest Category & Priority'}</span>
                    </button>

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/tickets')}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                        >
                            Create Ticket
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default CreateTicket;
