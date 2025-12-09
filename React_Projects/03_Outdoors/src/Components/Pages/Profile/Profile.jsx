import React, { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { UsersContext } from '../../../Context/Users/usersContext';
import './Profile.css';

export default function Profile() {
    const { user, updatePassword, logout } = useContext(UsersContext);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    // Password Update State
    const [passwordCurrent, setPasswordCurrent] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        const promise = updatePassword(passwordCurrent, password, passwordConfirm);

        toast.promise(promise, {
            loading: 'Updating password...',
            success: (res) => {
                if (res?.data?.status === 'success') {
                    setPasswordCurrent('');
                    setPassword('');
                    setPasswordConfirm('');
                    setShowPasswordForm(false);
                    return 'Password updated successfully!, please log in again!';
                } else {
                    throw new Error(res?.response?.data?.message || 'Error updating password');
                }
            },
            error: (err) => err.message
        });
    };

    if (!user) return <div className="profile-container">Please log in.</div>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <img
                        src={user.photo.startsWith('http') ? user.photo : `https://tours-app-api-drab.vercel.app/img/users/${user.photo}`}
                        alt={user.name}
                        className="profile-img"
                    />
                    <h2 className="heading-secondary">{user.name}</h2>
                </div>

                <div className="profile-details">
                    <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{user.email}</span>
                    </div>
                    <div className="detail-item">
                        <span className="detail-label">Role:</span>
                        <span className="detail-value" style={{ textTransform: 'capitalize' }}>
                            {user.role || 'User'}
                        </span>
                    </div>
                </div>

                <div className="profile-actions">
                    <button
                        className="btn btn--green"
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                    >
                        {showPasswordForm ? 'Cancel' : 'Update Password'}
                    </button>
                    <button className="btn btn--white" onClick={logout}>Log Out</button>
                </div>

                {showPasswordForm && (
                    <form className="form form-profile" onSubmit={handleUpdatePassword}>
                        <h3 className="heading-tertiary">Change Password</h3>
                        <div className="form__group">
                            <label className="form__label" htmlFor="passwordCurrent">Current Password</label>
                            <input
                                className="form__input"
                                id="passwordCurrent"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength="8"
                                value={passwordCurrent}
                                onChange={(e) => setPasswordCurrent(e.target.value)}
                            />
                        </div>
                        <div className="form__group">
                            <label className="form__label" htmlFor="password">New Password</label>
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
                            <label className="form__label" htmlFor="passwordConfirm">Confirm New Password</label>
                            <input
                                className="form__input"
                                id="passwordConfirm"
                                type="password"
                                placeholder="••••••••"
                                required
                                minLength="8"
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                            />
                        </div>
                        <div className="form__group">
                            <button className="btn btn--green">Save Password</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
