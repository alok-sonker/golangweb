import React, { useState } from 'react';

function Quiz({ questions, courseId }) {  // Accept courseId to track scores per course
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showScore, setShowScore] = useState(false);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null); // Track selected answer

    const handleAnswerOptionClick = (isCorrect) => {
        setSelectedAnswer(isCorrect); // Track if the selected answer is correct
        if (isCorrect) {
            setScore(score + 1);
        }
    };

    const handleNextQuestion = () => {
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < questions.length) {
            setCurrentQuestion(nextQuestion);
            setSelectedAnswer(null); // Reset the selected answer
        } else {
            setShowScore(true);
            saveQuizScore(courseId, score); // Save the score after the quiz ends
        }
    };
    const currentUser = { id: 1 };

    const saveQuizScore = async (courseId, score) => {
        const response = await fetch('http://localhost:8080/api/quiz-scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: currentUser.id, // Assume user authentication is implemented
                course_id: courseId,
                score: score,
            }),
        });
    
        if (!response.ok) {
            console.error('Failed to save quiz score');
        }
    };
    

    return (
        <div className="quiz-section">
            {showScore ? (
                <div className="score-section">
                    You scored {score} out of {questions.length}
                </div>
            ) : (
                <div>
                    <div className="question-section">
                        <div className="question-text">
                            {questions[currentQuestion].questionText}
                        </div>
                    </div>
                    <div className="answer-section">
                        {questions[currentQuestion].answerOptions.map((answerOption, index) => (
                            <button
                                key={index}
                                className={`answer-btn ${selectedAnswer !== null && answerOption.isCorrect ? 'correct' : ''}`}
                                onClick={() => handleAnswerOptionClick(answerOption.isCorrect)}
                            >
                                {answerOption.answerText}
                            </button>
                        ))}
                    </div>

                    {selectedAnswer !== null && (
                        <div className="feedback-section">
                            {selectedAnswer ? (
                                <p className="text-success">Correct!</p>
                            ) : (
                                <p className="text-danger">Incorrect!</p>
                            )}
                            <button onClick={handleNextQuestion}>Next Question</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default Quiz;

