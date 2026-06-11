import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function KnowledgeBase() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        fetchArticles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category]);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const params = {};
            if (category) params.category = category;
            const res = await api.get('/kb/articles', { params });
            setArticles(res.data);
        } catch (err) {
            console.error('Error fetching articles:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const res = await api.get('/kb/articles/search', { params: { q: search } });
            setArticles(res.data);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const categories = ['Hardware', 'Software', 'Network', 'Email', 'Access Request', 'Other'];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Knowledge Base</h1>

            {/* Search & Filter */}
            <div className="flex space-x-4 mb-6">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search articles..."
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        className="absolute right-2 top-2 text-gray-400 hover:text-blue-600"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">All Categories</option>
                    {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">Loading articles...</div>
            ) : articles.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
                    No articles found
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map(article => (
                        <Link
                            key={article.id}
                            to={`/knowledge-base/${article.id}`}
                            className="bg-white rounded-xl shadow p-6 hover:shadow-md transition-shadow"
                        >
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                {article.category}
                            </span>
                            <h3 className="text-lg font-semibold text-gray-800 mt-3">{article.title}</h3>
                            <p className="text-xs text-gray-400 mt-2">
                                Updated {new Date(article.updatedAt).toLocaleDateString()}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default KnowledgeBase;
