import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';

function CourseDetails() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:8080/api/courses/${id}`)
            .then(response => setCourse(response.data))
            .catch(error => console.error('Error fetching course:', error));
    }, [id]);

    if (!course) {
        return <p>Loading...</p>;
    }

    return (
        <Container>
            <Card>
                <Card.Body>
                    <Card.Title>{course.title}</Card.Title>
                    <Card.Text>{course.desc}</Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default CourseDetails;
