import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import { AuthContext } from '../context/AuthContext';  // Access user data from AuthContext

function ProfilePage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobileNumber, setMobileNumber] = useState('');
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');
   // const { user } = useContext(AuthContext);  // Access the logged-in user
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true); 
    //useEffect(() => {
        // Load user details from API or localStorage (this is mocked for demo)
        // In a real app, this data should be fetched from the backend
        // const fetchUserData = async () => {
        //     try {
        //         const response = await axios.get('http://localhost:8080/api/profile', {
        //             headers: { Authorization: `Bearer ${token}` }
        //         });
        //         const user = response.data;
        //         setFirstName(user.first_name);
        //         setLastName(user.last_name);
        //         setEmail(user.email);
        //         setMobileNumber(user.mobile_number);
        //         setAddress1(user.address1);
        //         setAddress2(user.address2);
        //     } catch (err) {
        //         setMessage('Failed to load profile');
        //     }
        // };
    //     const fetchUserProfile = async () => {
    //         const token = localStorage.getItem('token');
    //         const response = await fetch('http://localhost:8080/api/profile', {
    //             method: 'GET',
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         });
            
    //         if (response.ok) {
    //             const userProfile = await response.json();
    //             console.log(userProfile);  // Log or display user profile
    //         } else {
    //             console.error('Failed to fetch user profile');
    //         }
    //     };

    //     fetchUserProfile();
    // }, [token]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                'http://localhost:8080/api/profile',
                {
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    mobile_number: mobileNumber,
                    address1,
                    address2
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setMessage('Profile updated successfully');
        } catch (err) {
            setMessage('Failed to update profile');
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found, redirecting to login');
                return;
            }
            console.log("Tocken ",token);

            try {
                const response = await fetch('http://localhost:8080/api/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,  // Pass the JWT token in Authorization header
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const profileData = await response.json();
                    console.log('Profile data fetched:', profileData); 
                    setProfile(profileData);
                    setLoading(false);
                } else {
                    console.error('Failed to fetch profile, status:', response.status);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        };

        fetchProfile();
    }, []);

     // Show a loading message while fetching the profile data
     if (loading) {
        return <p>Loading...</p>;
    }

    // If profile is not set, return an error message
    if (!profile) {
        return <p>Failed to load profile = </p>;
    }


    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm p-4">
                        <h2 className="text-center mb-4">Update Profile</h2>
                        <form onSubmit={handleUpdateProfile}>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">First Name</label>
                                    <input
                                        type="text"
                                        className="form-control rounded"
                                        value={profile.first_name}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Last Name</label>
                                    <input
                                        type="text"
                                        className="form-control rounded"
                                        value={profile.last_name}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control rounded"
                                    value={profile.email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">New Password (Optional)</label>
                                <input
                                    type="password"
                                    className="form-control rounded"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Mobile Number</label>
                                <input
                                    type="tel"
                                    className="form-control rounded"
                                    value={profile.mobile_number}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Address Line 1</label>
                                <input
                                    type="text"
                                    className="form-control rounded"
                                    value={profile.address1}
                                    onChange={(e) => setAddress1(e.target.value)}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Address Line 2 (Optional)</label>
                                <input
                                    type="text"
                                    className="form-control rounded"
                                    value={profile.address2}
                                    onChange={(e) => setAddress2(e.target.value)}
                                />
                            </div>

                            <div className="text-center">
                                <button type="submit" className="btn btn-primary w-100">Update Profile</button>
                            </div>
                            {message && <p className="mt-3 text-center">{message}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
