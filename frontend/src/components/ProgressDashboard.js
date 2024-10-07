import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col } from 'react-bootstrap';

function ProgressDashboard() {
    const [completedCourses, setCompletedCourses] = useState([]);
    const [quizScores, setQuizScores] = useState({});
    // Temporarily hardcode a user ID until authentication is implemented
    const currentUser = { id: 1 }; // Hardcoded user ID
    useEffect(() => {
        // Fetch completed courses from the backend
        fetch(`http://localhost:8080/api/progress?user_id=${currentUser.id}`)
            .then((response) => response.json())
            .then((data) => setCompletedCourses(data))
            .catch((error) => console.error('Error fetching progress:', error));
    
        // Fetch quiz scores from the backend
        fetch(`http://localhost:8080/api/quiz-scores?user_id=${currentUser.id}`)
            .then((response) => response.json())
            .then((data) => setQuizScores(data))
            .catch((error) => console.error('Error fetching quiz scores:', error));
    }, []);
    

    return (
        <Container className="py-5">
            <h1 className="my-4 text-center">Your Progress</h1>
            <Row className="g-4">
                {completedCourses.length === 0 ? (
                    <Col>
                        <p className="text-center">You haven't completed any courses yet.</p>
                    </Col>
                ) : (
                    completedCourses.map((courseId) => (
                        <Col key={courseId} xs={12} md={6} lg={4}>
                            <Card className="h-100">
                                <Card.Body>
                                    <Card.Title>Course ID: {courseId}</Card.Title>
                                    <Card.Text>Quiz Score: {quizScores[courseId] || 0}</Card.Text>
                                    <a href={`/course/${courseId}`} className="btn btn-primary">Retake Course</a>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))
                )}
            </Row>
        </Container>
    );
}

export default ProgressDashboard;
