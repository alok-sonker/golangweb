import React, { useState } from 'react';

function HomePage() {
    const [languages, setLanguages] = useState([
        { id: 1, name: "Python", description: "Master the versatile Python programming language.", link: "/course/python" },
        { id: 2, name: "JavaScript", description: "Build dynamic websites with JavaScript.", link: "/course/javascript" },
        { id: 3, name: "C++", description: "Dive into the fast and powerful C++ programming language.", link: "/course/cplusplus" },
    ]);

    const [showAddForm, setShowAddForm] = useState(false);
    const [newLanguage, setNewLanguage] = useState({ name: '', description: '', link: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLanguage({ ...newLanguage, [name]: value });
    };

    const handleAddLanguage = (e) => {
        e.preventDefault();
        if (!newLanguage.name || !newLanguage.description || !newLanguage.link) {
            alert('Please fill out all fields.');
            return;
        }

        setLanguages([...languages, { ...newLanguage, id: languages.length + 1 }]);
        setNewLanguage({ name: '', description: '', link: '' });
        setShowAddForm(false);
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-4">Learn Programming Languages</h1>
            <p className="text-center mb-5">Select a programming language below to get started!</p>

            {/* Language Cards */}
            <div className="row g-4">  {/* Use Bootstrap's grid system with better spacing */}
                {languages.map((language) => (
                    <div className="col-md-4" key={language.id}>
                        <div className="card h-100 shadow-sm" style={{ backgroundColor: '#fff', borderRadius: '10px' }}>
                            <div className="card-body text-center">
                                <h5 className="card-title" style={{ fontWeight: '500', color: '#333' }}>{language.name.charAt(0).toUpperCase() + language.name.slice(1)}</h5> {/* Capitalize first letter */}
                                <p className="card-text" style={{ fontSize: '14px', color: '#666' }}>{language.description}</p>
                                <a href={language.link} className="btn btn-primary btn-start">Start Learning</a>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Plus Button Tile for Adding New Language */}
                <div className="col-md-4 mb-4">
                    <div 
                        className="card h-100 d-flex justify-content-center align-items-center shadow-sm" 
                        style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', borderRadius: '10px' }}
                        onClick={() => setShowAddForm(true)}
                    >
                        <h1 style={{ fontSize: '3rem', color: '#333' }}>+</h1>
                        <p style={{ color: '#333' }}>Add a new language</p>
                    </div>
                </div>
            </div>

            {showAddForm && (
                <div className="mt-5 mb-5"> {/* Add padding at the bottom */}
                    <h3>Add a New Programming Language</h3>
                    <form onSubmit={handleAddLanguage}>
                        <div className="mb-3">
                            <label className="form-label">Language Name</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                name="name" 
                                value={newLanguage.name} 
                                onChange={handleInputChange}
                                required 
                                placeholder="Enter language name" 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                name="description" 
                                value={newLanguage.description} 
                                onChange={handleInputChange}
                                required 
                                placeholder="Enter description" 
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Link</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                name="link" 
                                value={newLanguage.link} 
                                onChange={handleInputChange}
                                required 
                                placeholder="Enter course link" 
                            />
                        </div>
                        <button type="submit" className="btn btn-success btn-add">Add Language</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default HomePage;
