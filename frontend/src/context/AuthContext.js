// import React, { createContext, useState, useEffect } from 'react';
// import { jwtDecode } from "jwt-decode";

// // Create the AuthContext
// export const AuthContext = createContext();

// // Create a provider for the AuthContext
// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);

//     // Check if a user is already logged in (i.e., if the JWT token exists in localStorage)
//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             // Decode the token to get the user info
//             const decoded = jwtDecode(token);
//             setUser({ username: decoded.username });  // Set real username in context
//         }
//     }, []);

//     return (
//         <AuthContext.Provider value={{ user, setUser }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };



// export default AuthContext; 

import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';  // Import jwt-decode


// Create the AuthContext
export const AuthContext = createContext();

// Create a provider for the AuthContext
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Check if a user is already logged in (i.e., if the JWT token exists in localStorage)
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Decode the token to get the user info
            const decoded = jwtDecode(token);
            setUser({ username: decoded.username });  // Set real username in global state
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
