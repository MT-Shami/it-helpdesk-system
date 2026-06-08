import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function CreateTicket() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [category, setCategory] = useState('Other');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/Tickets', { title, description, priority, category });
            navigate('/tickets'); // redirect to ticket list after creation
        } catch (err) {
            setError('Failed to create ticket');
        }
    };

    return (
        <Container className="mt-4">
            <h2>Create New Ticket</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control 
                        type="text" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        required 
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        required 
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select value={priority} onChange={e => setPriority(e.target.value)}>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Critical</option>
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select value={category} onChange={e => setCategory(e.target.value)}>
                        <option>Hardware</option>
                        <option>Software</option>
                        <option>Network</option>
                        <option>Email</option>
                        <option>Access Request</option>
                        <option>Other</option>
                    </Form.Select>
                </Form.Group>
                <Button variant="primary" type="submit">Submit</Button>
            </Form>
        </Container>
    );
}

export default CreateTicket;