import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UsersContext } from '../../../Context/Users/usersContext';
import '../Login/Login.css';

export default function Signup() {
    const { signup } = useContext(UsersContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Removed local message/error state

    const handleSubmit = async (e) => {
        e.preventDefault();

        const signupPromise = signup(name, email, password, confirmPassword);

        toast.promise(signupPromise, {
            loading: 'Creating account...',
            success: (res) => {
                if (res?.data?.status === 'success' || res?.status === 201 || res?.status === 200) {
                    navigate('/login');
                    return 'Account created successfully!';
                } else {
                    throw new Error(res?.response?.data?.message || 'Error creating account');
                }
            },
            error: (err) => err.message
        });
    };

    return (
        <div className="login-form-container">
            <h2 className="heading-secondary">Create your account!</h2>

            <form className="form" onSubmit={handleSubmit}>
                <div className="form__group">
                    <label className="form__label" htmlFor="name">Your Name</label>
                    <input
                        className="form__input"
                        id="name"
                        type="text"
                        placeholder="Your Name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
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
                    <label className="form__label" htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        className="form__input"
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                        minLength="8"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <div className="form__group">
                    <button className="btn btn--green">Sign up</button>
                </div>
            </form>
        </div>
    );
}
