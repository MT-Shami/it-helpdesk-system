import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

function TicketDetails() {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await api.get(`/Tickets/${id}`);
                setTicket(response.data);
            } catch (err) {
                setError('Ticket not found');
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <Container className="mt-4">
            <Card>
                <Card.Header as="h5">Ticket #{ticket.id} - {ticket.title}</Card.Header>
                <Card.Body>
                    <Card.Text><strong>Description:</strong> {ticket.description}</Card.Text>
                    <Card.Text><strong>Status:</strong> {ticket.status}</Card.Text>
                    <Card.Text><strong>Priority:</strong> {ticket.priority}</Card.Text>
                    <Card.Text><strong>Category:</strong> {ticket.category}</Card.Text>
                    <Card.Text><strong>Created By:</strong> {ticket.createdByName}</Card.Text>
                    <Card.Text><strong>Assigned To:</strong> {ticket.assignedToAgentName || 'Unassigned'}</Card.Text>
                </Card.Body>
                <Card.Footer>
                    <Button variant="secondary" onClick={() => navigate('/tickets')}>Back to List</Button>
                </Card.Footer>
            </Card>
        </Container>
    );
}

export default TicketDetails;