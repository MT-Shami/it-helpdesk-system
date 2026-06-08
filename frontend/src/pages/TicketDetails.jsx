import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function TicketDetails() {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const fetchTicket = async () => {
        try {
            const response = await api.get(`/Tickets/${id}`);
            setTicket(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'New': return 'bg-blue-100 text-blue-800';
            case 'In Progress': return 'bg-orange-100 text-orange-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Resolved': return 'bg-green-100 text-green-800';
            case 'Closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch(priority) {
            case 'Low': return 'bg-gray-100 text-gray-800';
            case 'Medium': return 'bg-blue-100 text-blue-800';
            case 'High': return 'bg-orange-100 text-orange-800';
            case 'Critical': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSendReply = async () => {
        // Placeholder: will be implemented when comments feature is added
        alert('Reply feature coming soon (requires backend comments).');
        setReply('');
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading ticket details...</div>;
    if (!ticket) return <div className="text-center p-8 text-red-600">Ticket not found</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Ticket #{ticket.id} - {ticket.title}</h1>
                    <div className="flex space-x-2 mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-medium rounded-full">
                            {ticket.category}
                        </span>
                    </div>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column - Conversation */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow p-4">
                        <h3 className="font-medium text-gray-800 mb-3">Conversation</h3>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                                    {ticket.createdByName?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800">
                                        <span className="font-medium">{ticket.createdByName}</span>
                                        <span className="text-xs text-gray-400 ml-2">
                                            {new Date(ticket.createdAt).toLocaleString()}
                                        </span>
                                    </p>
                                    <p className="bg-gray-100 rounded-lg p-3 text-sm mt-1">{ticket.description}</p>
                                </div>
                            </div>
                            {/* Placeholder for future replies */}
                            <div className="text-center text-sm text-gray-400 border-t pt-4">No additional comments yet.</div>
                        </div>

                        {/* Reply area */}
                        <div className="mt-4">
                            <textarea
                                rows="3"
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Write a reply..."
                            ></textarea>
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handleSendReply}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                                >
                                    Send Reply
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right column - Ticket Information */}
                    <div className="bg-white rounded-xl shadow p-4">
                        <h3 className="font-medium text-gray-800 mb-3">Ticket Information</h3>
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Category:</dt>
                                <dd>{ticket.category}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Priority:</dt>
                                <dd className="capitalize">{ticket.priority}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Status:</dt>
                                <dd>{ticket.status}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Created:</dt>
                                <dd>{new Date(ticket.createdAt).toLocaleString()}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Created By:</dt>
                                <dd>{ticket.createdByName}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Assigned To:</dt>
                                <dd>{ticket.assignedToAgentName || 'Unassigned'}</dd>
                            </div>
                        </dl>
                        <div className="mt-4 pt-4 border-t">
                            <button
                                onClick={() => navigate('/tickets')}
                                className="text-blue-600 hover:underline text-sm"
                            >
                                ← Back to Tickets
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TicketDetails;