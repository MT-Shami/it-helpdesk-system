import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/Admin/categories');
            setCategories(res.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        try {
            setError('');
            await api.post('/Admin/categories', { name: newName.trim() });
            setNewName('');
            fetchCategories();
        } catch (err) {
            setError(err.response?.data || 'Failed to create category');
        }
    };

    const handleUpdate = async (id) => {
        if (!editName.trim()) return;
        try {
            setError('');
            await api.put(`/Admin/categories/${id}`, { name: editName.trim() });
            setEditingId(null);
            setEditName('');
            fetchCategories();
        } catch (err) {
            setError(err.response?.data || 'Failed to update');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this category? This cannot be undone.')) return;
        try {
            setError('');
            await api.delete(`/Admin/categories/${id}`);
            fetchCategories();
        } catch (err) {
            setError(err.response?.data || 'Failed to delete category');
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading categories...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Category Management</h1>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            {/* Add New */}
            <div className="bg-white rounded-xl shadow p-4 mb-6">
                <div className="flex space-x-3">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        placeholder="New category name..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={!newName.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                    >
                        Add Category
                    </button>
                </div>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {categories.map(cat => (
                            <tr key={cat.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-600">{cat.id}</td>
                                <td className="px-6 py-4">
                                    {editingId === cat.id ? (
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleUpdate(cat.id)}
                                                className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => { setEditingId(null); setEditName(''); }}
                                                className="text-gray-500 text-xs"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 flex space-x-2">
                                    <button
                                        onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.id)}
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

export default Categories;
