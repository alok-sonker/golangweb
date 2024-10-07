import React from 'react';

function Footer() {
    return (
        <footer className="bg-dark text-white text-center py-4 mt-auto">
            <div className="container">
                <p className="mb-1">© 2023 Calhaly Technology. All Rights Reserved.</p>
                <small>Follow us on: 
                    <a href="https://x.com/alok7827" target="_blank" rel="noopener noreferrer" className="text-light">Twitter</a> | 
                    <a href="https://www.linkedin.com/in/aloksonker" target="_blank" rel="noopener noreferrer" className="text-light">LinkedIn</a> | 
                    <a href="https://github.com/alok-sonker" target="_blank" rel="noopener noreferrer" className="text-light">GitHub</a>
                </small>
            </div>
        </footer>
    );
}

export default Footer;
