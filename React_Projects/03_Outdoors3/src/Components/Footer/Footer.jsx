import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer__logo-box">
                <h2 className="footer__logo">Outdoors</h2>
            </div>
            <p className="footer__copyright">
                Built by <a href="#" className="footer__link">Marslino Edward</a> for the Learning purpose only.<br />
                Copyright &copy; by Marslino Edward.<br />
                You are 100% allowed to use this webpage for both personal and commercial use, but NOT to claim it as your own design. <br />
                A credit to the original author, Jonas Schmedtmann.
            </p>
        </footer>
    );
}
