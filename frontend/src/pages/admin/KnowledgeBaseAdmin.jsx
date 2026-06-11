import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function KnowledgeBaseAdmin() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', category: 'Other', isApproved: false });

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const res = await api.get('/kb/articles');
            setArticles(res.data);
        } catch (err) {
            console.error('Error fetching articles:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({ title: '', content: '', category: 'Other', isApproved: false });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (article) => {
        setForm({
            title: article.title,
            content: article.content || '',
            category: article.category || 'Other',
            isApproved: article.isApproved !== undefined ? article.isApproved : true
        });
        setEditingId(article.id);
        setShowForm(true);
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.content.trim()) return;
        try {
            if (editingId) {
                await api.put(`/kb/articles/${editingId}`, form);
            } else {
                await api.post('/kb/articles', form);
            }
            resetForm();
            fetchArticles();
        } catch (err) {
            console.error('Error saving article:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this article?')) return;
        try {
            await api.delete(`/kb/articles/${id}`);
            fetchArticles();
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    const handleToggleApproval = async (article) => {
        try {
            await api.put(`/kb/articles/${article.id}`, {
                title: article.title,
                content: article.content,
                category: article.category,
                isApproved: !article.isApproved
            });
            fetchArticles();
        } catch (err) {
            console.error('Approval toggle error:', err);
        }
    };

    const categories = ['Hardware', 'Software', 'Network', 'Email', 'Access Request', 'Other'];

    if (loading) return <div className="flex justify-center items-center h-64">Loading articles...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Knowledge Base Management</h1>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                    + New Article
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">{editingId ? 'Edit Article' : 'New Article'}</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                            <textarea
                                rows="8"
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isApproved"
                                checked={form.isApproved}
                                onChange={(e) => setForm({ ...form, isApproved: e.target.checked })}
                                className="rounded"
                            />
                            <label htmlFor="isApproved" className="text-sm text-gray-700">Approved (visible to users)</label>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                {editingId ? 'Update' : 'Create'}
                            </button>
                            <button
                                onClick={resetForm}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Updated</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {articles.map(article => (
                            <tr key={article.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{article.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{article.category}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${article.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {article.isApproved ? 'Approved' : 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(article.updatedAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(article)}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleToggleApproval(article)}
                                        className="text-yellow-600 hover:underline text-sm"
                                    >
                                        {article.isApproved ? 'Unapprove' : 'Approve'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(article.id)}
                                        className="text-red-600 hover:underline text-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default KnowledgeBaseAdmin;
