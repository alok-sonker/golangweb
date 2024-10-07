import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function SignupPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');  // Success message
    const history = useHistory();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            // Send signup request to the backend
            await axios.post('http://localhost:8080/api/register', {
                first_name: firstName,
                last_name: lastName,
                username,
                email,
                password,
                mobile_number: mobileNumber,
                address1,
                address2
            });

            // Set success message
            setSuccess('Account created successfully! Redirecting to login...');
            setError('');

            // Redirect to login after 2 seconds
            setTimeout(() => {
                history.push('/login');
            }, 2000);  // 2-second delay before redirecting
        } catch (err) {
            setError('Failed to register user. Please try again.');
            setSuccess('');
        }
    };

    return (
        <div className="container mt-5 mb-5 ">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm p-4">
                        <h2 className="text-center mb-4">Create an Account</h2>
                        <form onSubmit={handleSignup}>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        className="form-control rounded"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                        placeholder="John"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        className="form-control rounded"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-control rounded"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Choose a username"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control rounded"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-control rounded"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter a strong password"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Mobile Number</label>
                                <input
                                    type="tel"
                                    className="form-control rounded"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="+123456789"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Address Line 1</label>
                                <input
                                    type="text"
                                    className="form-control rounded"
                                    value={address1}
                                    onChange={(e) => setAddress1(e.target.value)}
                                    placeholder="123 Main St"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    className="form-control rounded"
                                    value={address2}
                                    onChange={(e) => setAddress2(e.target.value)}
                                    placeholder="Apt, suite, etc."
                                />
                            </div>

                            {error && <p className="text-danger">{error}</p>}
                            {success && <p className="text-success">{success}</p>}  {/* Success message */}
                            <div className="text-center">
                                <button type="submit" className="btn btn-primary w-100">Sign Up</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
