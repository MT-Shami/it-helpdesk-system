import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function TicketDetails() {
    const { id } = useParams();
    const { user, isAdminOrAgent } = useAuth();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

    // Comments
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [sending, setSending] = useState(false);

    // Activity
    const [activities, setActivities] = useState([]);

    // Attachments
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    // AI
    const [aiLoading, setAiLoading] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (id) {
            fetchTicket();
            fetchComments();
            fetchActivity();
            fetchAttachments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchTicket = async () => {
        try {
            const res = await api.get(`/Tickets/${id}`);
            setTicket(res.data);
            setStatus(res.data.status);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await api.get(`/Tickets/${id}/comments`);
            setComments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchActivity = async () => {
        try {
            const res = await api.get(`/Tickets/${id}/activity`);
            setActivities(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAttachments = async () => {
        try {
            const res = await api.get(`/Tickets/${id}/attachments`);
            setAttachments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSendComment = async () => {
        if (!commentText.trim() || sending) return;
        setSending(true);
        try {
            await api.post(`/Tickets/${id}/comments`, {
                commentText: commentText.trim(),
                isInternal
            });
            setCommentText('');
            setIsInternal(false);
            fetchComments();
            fetchActivity();
        } catch (err) {
            console.error('Comment error:', err);
        } finally {
            setSending(false);
        }
    };

    const handleAssignToMe = async () => {
        try {
            await api.put(`/Tickets/${id}/assign`);
            fetchTicket();
            fetchActivity();
        } catch (err) {
            console.error('Assign error:', err);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await api.put(`/Tickets/${id}/status`, { status: newStatus });
            setStatus(newStatus);
            fetchTicket();
            fetchActivity();
        } catch (err) {
            console.error('Status change error:', err);
        }
    };

    const handleUpload = async () => {
        const files = fileInputRef.current?.files;
        if (!files || files.length === 0) return;
        setUploading(true);
        try {
            const formData = new FormData();
            for (let f of files) formData.append('files', f);
            await api.post(`/Tickets/${id}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchAttachments();
            fileInputRef.current.value = '';
        } catch (err) {
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAttachment = async (attachmentId) => {
        if (!window.confirm('Delete this attachment?')) return;
        try {
            await api.delete(`/Attachments/${attachmentId}`);
            fetchAttachments();
        } catch (err) {
            console.error('Delete attachment error:', err);
        }
    };

    const handleAiSuggestReply = async () => {
        setAiLoading(true);
        try {
            const conversation = comments.map(c =>
                `${c.isInternal ? '[Internal] ' : ''}${c.userName}: ${c.commentText}`
            ).join('\n');
            const res = await api.post('/AI/suggest-reply', { conversationHistory: conversation || ticket.description });
            setCommentText(res.data.suggestedReply);
        } catch (err) {
            console.error('AI suggestion error:', err);
        } finally {
            setAiLoading(false);
        }
    };

    const getStatusColor = (s) => {
        switch (s) {
            case 'New': return 'bg-blue-100 text-blue-800';
            case 'In Progress': return 'bg-orange-100 text-orange-800';
            case 'Resolved': return 'bg-green-100 text-green-800';
            case 'Closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'Low': return 'bg-gray-100 text-gray-800';
            case 'Medium': return 'bg-blue-100 text-blue-800';
            case 'High': return 'bg-orange-100 text-orange-800';
            case 'Critical': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading ticket details...</div>;
    if (!ticket) return <div className="text-center p-8 text-red-600">Ticket not found</div>;

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800">
                                Ticket #{ticket.id} - {ticket.title}
                            </h1>
                            <div className="flex items-center space-x-2 mt-2">
                                {isAdminOrAgent ? (
                                    <select
                                        value={status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(status)}`}
                                    >
                                        <option value="New">New</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                ) : (
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                )}
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                                    {ticket.priority}
                                </span>
                                <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-medium rounded-full">
                                    {ticket.category}
                                </span>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            {isAdminOrAgent && !ticket.assignedToAgentId && (
                                <button
                                    onClick={handleAssignToMe}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                                >
                                    Assign to Me
                                </button>
                            )}
                            {isAdminOrAgent && (
                                <button
                                    onClick={handleAiSuggestReply}
                                    disabled={aiLoading}
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                                >
                                    {aiLoading ? 'Thinking...' : 'AI Suggest Reply'}
                                </button>
                            )}
                            <button
                                onClick={() => navigate(`/tickets/edit/${ticket.id}`)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left column - Conversation + Comments */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Original Description */}
                        <div className="bg-white rounded-xl shadow p-4">
                            <h3 className="font-medium text-gray-800 mb-3">Description</h3>
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
                                    <p className="bg-gray-100 rounded-lg p-3 text-sm mt-1 whitespace-pre-wrap">{ticket.description}</p>
                                </div>
                            </div>
                        </div>

                        {/* Comments Timeline */}
                        <div className="bg-white rounded-xl shadow p-4">
                            <h3 className="font-medium text-gray-800 mb-3">Conversation ({comments.length})</h3>
                            <div className="space-y-4 mb-4">
                                {comments.length === 0 ? (
                                    <p className="text-center text-sm text-gray-400 border-t pt-4">No comments yet.</p>
                                ) : (
                                    comments.map((c, i) => (
                                        <div key={c.id || i} className={`flex items-start space-x-3 ${c.userName === user?.fullName || c.userName === user?.email ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${c.isInternal ? 'bg-yellow-500' : 'bg-blue-500'} text-white`}>
                                                {c.userName?.charAt(0) || 'U'}
                                            </div>
                                            <div className={`flex-1 max-w-md ${c.userName === user?.fullName || c.userName === user?.email ? 'text-right' : ''}`}>
                                                <p className="text-xs text-gray-500">
                                                    <span className="font-medium">{c.userName}</span>
                                                    <span className="ml-2">{new Date(c.createdAt).toLocaleString()}</span>
                                                </p>
                                                <div className={`rounded-lg p-3 text-sm mt-1 ${c.isInternal
                                                        ? 'bg-yellow-50 border border-yellow-200'
                                                        : 'bg-gray-100'
                                                    }`}>
                                                    {c.isInternal && (
                                                        <span className="text-xs font-medium text-yellow-700 block mb-1">
                                                            Internal Note
                                                        </span>
                                                    )}
                                                    <p className="whitespace-pre-wrap">{c.commentText}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Reply Box */}
                            <div className="border-t pt-4">
                                <textarea
                                    rows="3"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Write a reply..."
                                />
                                <div className="flex items-center justify-between mt-2">
                                    {isAdminOrAgent && (
                                        <label className="flex items-center space-x-2 text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={isInternal}
                                                onChange={(e) => setIsInternal(e.target.checked)}
                                                className="rounded"
                                            />
                                            <span>Internal Note (Agent only)</span>
                                        </label>
                                    )}
                                    <div className="flex space-x-2">
                                        {isAdminOrAgent && (
                                            <button
                                                onClick={handleAiSuggestReply}
                                                disabled={aiLoading}
                                                className="text-purple-600 hover:text-purple-700 text-sm px-3 py-2"
                                            >
                                                {aiLoading ? '...' : 'AI Suggest'}
                                            </button>
                                        )}
                                        <button
                                            onClick={handleSendComment}
                                            disabled={!commentText.trim() || sending}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                                        >
                                            {sending ? 'Sending...' : 'Send'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attachments */}
                        <div className="bg-white rounded-xl shadow p-4">
                            <h3 className="font-medium text-gray-800 mb-3">Attachments ({attachments.length})</h3>

                            {/* Upload */}
                            {isAdminOrAgent && (
                                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        multiple
                                        className="text-sm flex-1"
                                    />
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                                    >
                                        {uploading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>
                            )}

                            {/* File List */}
                            <div className="space-y-2">
                                {attachments.length === 0 ? (
                                    <p className="text-sm text-gray-400">No attachments</p>
                                ) : (
                                    attachments.map(a => (
                                        <div key={a.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                <div>
                                                    <a
                                                        href={a.downloadUrl}
                                                        className="text-sm text-blue-600 hover:underline"
                                                        target="_blank"
                                                        rel="noreferrer"
                                                    >
                                                        {a.fileName}
                                                    </a>
                                                    <p className="text-xs text-gray-400">{formatFileSize(a.fileSizeBytes)}</p>
                                                </div>
                                            </div>
                                            {isAdminOrAgent && (
                                                <button
                                                    onClick={() => handleDeleteAttachment(a.id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right column - Ticket Info + Activity */}
                    <div className="space-y-6">
                        {/* Ticket Information */}
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
                                    &larr; Back to Tickets
                                </button>
                            </div>
                        </div>

                        {/* Activity History */}
                        <div className="bg-white rounded-xl shadow p-4">
                            <h3 className="font-medium text-gray-800 mb-3">Activity History</h3>
                            <div className="space-y-3">
                                {activities.length === 0 ? (
                                    <p className="text-sm text-gray-400">No activity recorded</p>
                                ) : (
                                    activities.map(a => (
                                        <div key={a.id} className="flex items-start space-x-2 text-sm">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-gray-800">{a.action}</p>
                                                <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                    <span>{a.userName}</span>
                                                    <span>&middot;</span>
                                                    <span>{new Date(a.timestamp).toLocaleString()}</span>
                                                </div>
                                                {a.details && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{a.details}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TicketDetails;
