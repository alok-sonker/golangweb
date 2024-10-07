import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ProfilePage from './components/ProfilePage';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';  // Import the AuthProvider

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="d-flex flex-column min-vh-100">  {/* Flexbox layout with full height */}
                    <Header />  {/* Standard header */}
                    
                    <main className="flex-fill">  {/* Main content grows to fill available space */}
                        <Switch>
                            <Route path="/" exact component={HomePage} />
                            <Route path="/login" component={LoginPage} />
                            <Route path="/signup" component={SignupPage} />
                            <Route path="/profile" component={ProfilePage} />
                        </Switch>
                    </main>

                    <Footer />  {/* Footer sticks to the bottom */}
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
