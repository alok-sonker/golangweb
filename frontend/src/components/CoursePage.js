import React from 'react';
import { useParams } from 'react-router-dom';

function CoursePage() {
    const { id } = useParams();
    return (
        <div>
            <h1>Course Details</h1>
            <p>Course ID: {id}</p>
        </div>
    );
}

export default CoursePage;
