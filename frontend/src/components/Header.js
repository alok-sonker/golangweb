import React, { useContext } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';  // Import AuthContext

function Header() {
    const { user, setUser } = useContext(AuthContext);  // Access the user and setUser function
    const history = useHistory();

    const handleLogout = () => {
        localStorage.removeItem('token');  // Remove the JWT token from localStorage
        setUser(null);  // Clear the global user state
        history.push('/login');  // Redirect to the login page
    };

    return (
        <header className="bg-dark text-white py-3">
            <div className="container d-flex justify-content-between align-items-center">
                {/* Company Logo and Name */}
                <div className="d-flex align-items-center">
                    <Link to="/">  {/* Logo links to the home page */}
                        <img src="/logo.png" alt="Calhaly Technology" style={{ height: '50px', marginRight: '15px', cursor: 'pointer' }} />
                    </Link>
                    <h1 className="h4 mb-0">Calhaly Technology</h1>
                </div>

                {/* Conditional Rendering Based on Login State */}
                <nav>
                    {user ? (
                        <div className="dropdown">
                            <button
                                className="btn btn-outline-light dropdown-toggle"
                                type="button"
                                id="userDropdown"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                {user.username}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li><Link to="/profile" className="dropdown-item">View Profile</Link></li>
                                <li><button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button></li>
                            </ul>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline-light me-2">Sign In</Link>
                            <Link to="/signup" className="btn btn-outline-light me-2">Sign Up</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;
