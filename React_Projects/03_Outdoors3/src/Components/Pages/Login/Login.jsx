import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UsersContext } from '../../../Context/Users/usersContext';
import './Login.css';

export default function Login() {
    const { login, forgotPassword } = useContext(UsersContext);
    const navigate = useNavigate();

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Forgot Password State
    const [forgotEmail, setForgotEmail] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        const loginPromise = login(email, password);

        toast.promise(loginPromise, {
            loading: 'Logging in...',
            success: (res) => {
                if (res?.data?.status === 'success' || res?.status === 200) {
                    navigate('/'); // Redirect to home
                    return 'Logged in successfully!';
                } else {
                    throw new Error(res?.response?.data?.message || 'Something went wrong');
                }
            },
            error: (err) => {
                return err.message || 'Login failed';
            }
        });
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        const forgotPromise = forgotPassword(forgotEmail);

        toast.promise(forgotPromise, {
            loading: 'Sending email...',
            success: (res) => {
                if (res?.data?.status === 'success' || res?.status === 200) {
                    return 'Token sent to email!';
                } else {
                    throw new Error(res?.response?.data?.message || 'Error sending email');
                }
            },
            error: (err) => err.message || 'Error sending email'
        });
    };

    if (showForgotPassword) {
        return (
            <div className="login-form-container">
                <h2 className="heading-secondary">Recover your account</h2>

                <form className="form" onSubmit={handleForgotPassword}>
                    <div className="form__group">
                        <label className="form__label" htmlFor="forgotEmail">Email address</label>
                        <input
                            className="form__input"
                            id="forgotEmail"
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                        />
                    </div>
                    <div className="form__group">
                        <button className="btn btn--green">Send Mail</button>
                        <button
                            type="button"
                            className="btn btn--white"
                            onClick={() => {
                                setShowForgotPassword(false);
                            }}
                            style={{ marginLeft: '10px' }}
                        >
                            Back to Login
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="login-form-container">
            <h2 className="heading-secondary">Log into your account</h2>

            <form className="form" onSubmit={handleLogin}>
                <div className="form__group">
                    <label className="form__label" htmlFor="email">Email address</label>
                    <input
                        className="form__input"
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="form__group">
                    <label className="form__label" htmlFor="password">Password</label>
                    <input
                        className="form__input"
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength="8"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="form__group">
                    <button className="btn btn--green">Login</button>
                    <button
                        type="button"
                        className="forgot-password"
                        onClick={() => setShowForgotPassword(true)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginLeft: '1rem', textDecoration: 'underline' }}
                    >
                        Forgot Password?
                    </button>
                </div>
            </form>
        </div>
    );
}
