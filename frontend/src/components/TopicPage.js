import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Card, Accordion, Button } from 'react-bootstrap';
import Quiz from './Quiz';

function TopicPage() {
    const { id } = useParams(); // Get the course ID from the URL
    const [course, setCourse] = useState(null);
    const [completed, setCompleted] = useState(false); // Track if the course is completed

    
    useEffect(() => {
        // Fetch course details from the backend
        axios.get(`http://localhost:8080/api/courses/${id}`)
            .then(response => {
                setCourse(response.data);
                checkIfCourseCompleted(response.data.id); // Check if this course is completed
            })
            .catch(error => console.error('Error fetching course:', error));
    }, [id]);

    // Check if the current course is already marked as completed in localStorage
    const checkIfCourseCompleted = (courseId) => {
        const completedCourses = JSON.parse(localStorage.getItem('completedCourses')) || [];
        if (completedCourses.includes(courseId)) {
            setCompleted(true);
        }
    };

    // Fetch the quiz based on the course ID
    const quizQuestions = getQuizQuestionsForCourse(course?.id);

    const currentUser = { id: 1 };
    // Mark the course as completed and store it in localStorage
    const handleCompleteCourse = async () => {
        const response = await fetch('http://localhost:8080/api/progress', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: currentUser.id, // Assume you have the user ID from authentication
                course_id: course.id,
            }),
        });
    
        if (response.ok) {
            setCompleted(true); // Mark course as completed
        } else {
            console.error('Failed to save progress');
        }
    };
    

    if (!course) {
        return <p>Loading...</p>;
    }

    return (
        <Container className="my-5">
            <Card>
                <Card.Body>
                    <Card.Title>{course.title}</Card.Title>
                    <Card.Text>{course.desc}</Card.Text>
                    <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Topic Details</Accordion.Header>
                            <Accordion.Body>
                                {course.topicDetail}
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>

                    {/* Display completion status */}
                    <div className="mt-4">
                        {completed ? (
                            <p className="text-success">
                                You have completed this course! Feel free to revisit the content and quiz.
                            </p>
                        ) : (
                            <Button onClick={handleCompleteCourse} variant="success">
                                Mark as Completed
                            </Button>
                        )}
                    </div>

                    {/* Display the Quiz */}
                    <div className="mt-5">
                        <h3>Test Your Knowledge</h3>
                        <Quiz questions={quizQuestions} /> {/* Quiz component */}
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}

const getQuizQuestionsForCourse = (courseId) => {
    const quizzes = {
        1: [
            {
                questionText: "What is the correct way to declare a variable in Go?",
                answerOptions: [
                    { answerText: 'let x = 10', isCorrect: false },
                    { answerText: 'var x int = 10', isCorrect: true },
                    { answerText: 'x := 10', isCorrect: true },
                    { answerText: 'int x = 10', isCorrect: false },
                ],
            },
            {
                questionText: "What is the Go keyword to start a Goroutine?",
                answerOptions: [
                    { answerText: 'start', isCorrect: false },
                    { answerText: 'go', isCorrect: true },
                    { answerText: 'func', isCorrect: false },
                    { answerText: 'run', isCorrect: false },
                ],
            },
        ],
        2: [
            {
                questionText: "What is an interface in Go?",
                answerOptions: [
                    { answerText: 'A function definition', isCorrect: false },
                    { answerText: 'A set of method signatures', isCorrect: true },
                    { answerText: 'A struct field', isCorrect: false },
                    { answerText: 'A type alias', isCorrect: false },
                ],
            },
            // More questions...
        ],
        // Add more quizzes for other courses...
    };

    return quizzes[courseId] || [];
};

export default TopicPage;
