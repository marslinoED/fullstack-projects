import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UsersContext } from '../../Context/Users/usersContext';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useContext(UsersContext);

    return (
        <nav className="navbar">
            <div className="navbar__logo">
                <Link to="/tours">Outdoors</Link>
            </div>
            <div className="navbar__menu">
                {user ? (
                    <Link to="/profile" className="nav__user">
                        <img
                            src={user.photo}
                            alt={`Photo of ${user.name}`}
                            className="nav__user-img"
                        />
                        <span>{user.name.split(' ')[0]}</span>
                    </Link>
                ) : (
                    <>
                        <Link to="/login" className="navbar__link">Log in</Link>
                        <Link to="/signup" className="navbar__link navbar__link--cta">Sign up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
