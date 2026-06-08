import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';

function MyTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await api.get('/Tickets');
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteTicket = async (id) => {
        if (window.confirm('Are you sure you want to delete this ticket?')) {
            try {
                await api.delete(`/Tickets/${id}`);
                fetchTickets(); // refresh the list
            } catch (error) {
                console.error('Error deleting ticket:', error);
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <Container fluid className="mt-4">
            <Row className="mb-3">
                <Col><h2>My Tickets</h2></Col>
                <Col className="text-end">
                    <Link to="/tickets/create">
                        <Button variant="primary">Create New Ticket</Button>
                    </Link>
                </Col>
            </Row>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                            <td>{ticket.id}</td>
                            <td>{ticket.title}</td>
                            <td>{ticket.category}</td>
                            <td>{ticket.priority}</td>
                            <td>{ticket.status}</td>
                            <td>
                                <Link to={`/tickets/${ticket.id}`}>
                                    <Button variant="info" size="sm" className="me-2">View</Button>
                                </Link>
                                <Link to={`/tickets/edit/${ticket.id}`}>
                                    <Button variant="warning" size="sm" className="me-2">Edit</Button>
                                </Link>
                                <Button variant="danger" size="sm" onClick={() => deleteTicket(ticket.id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default MyTickets;