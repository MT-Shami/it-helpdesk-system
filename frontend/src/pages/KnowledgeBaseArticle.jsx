import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

function KnowledgeBaseArticle() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchArticle();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchArticle = async () => {
        try {
            const res = await api.get(`/kb/articles/${id}`);
            setArticle(res.data);
        } catch (err) {
            console.error('Error fetching article:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64">Loading article...</div>;
    if (!article) return <div className="text-center p-8 text-red-600">Article not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Link to="/knowledge-base" className="text-blue-600 hover:underline text-sm mb-4 inline-block">
                &larr; Back to Knowledge Base
            </Link>
            <div className="bg-white rounded-xl shadow p-8">
                <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {article.category}
                    </span>
                    {!article.isApproved && (
                        <span className="text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                            Pending Approval
                        </span>
                    )}
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{article.title}</h1>
                <div className="text-xs text-gray-400 mb-6">
                    Last updated {new Date(article.updatedAt).toLocaleDateString()}
                </div>
                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {article.content}
                </div>
            </div>
        </div>
    );
}

export default KnowledgeBaseArticle;
