import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

function EditTicket() {
    const { id } = useParams();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [category, setCategory] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await api.get(`/Tickets/${id}`);
                const ticket = response.data;
                setTitle(ticket.title);
                setDescription(ticket.description);
                setStatus(ticket.status);
                setPriority(ticket.priority);
                setCategory(ticket.category);
            } catch (err) {
                setError('Ticket not found');
            }
        };
        fetchTicket();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/Tickets/${id}`, {
                title,
                description,
                status,
                priority,
                category,
                assignedToAgentId: null
            });
            navigate('/tickets');
        } catch (err) {
            setError('Update failed');
        }
    };

    return (
        <Container className="mt-4">
            <h2>Edit Ticket #{id}</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option>New</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                        <option>Closed</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option>Hardware</option>
                        <option>Software</option>
                        <option>Network</option>
                        <option>Email</option>
                        <option>Access Request</option>
                        <option>Other</option>
                    </Form.Select>
                </Form.Group>
                <Button variant="primary" type="submit">Save Changes</Button>
            </Form>
        </Container>
    );
}

export default EditTicket;