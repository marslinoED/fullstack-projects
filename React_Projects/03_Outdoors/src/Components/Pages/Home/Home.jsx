import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { UsersContext } from '../../../Context/Users/usersContext';

export default function Home() {
  const { user } = useContext(UsersContext);

  return (
    <div style={{ backgroundColor: '#333' }}>
      <header className="home-header">
        <div className="header-text-box">
          <h1 className="heading-primary">
            <span className="heading-primary--main">Outdoors</span>
            <span className="heading-primary--sub">is where life happens</span>
          </h1>
          <div className="home-actions">
            {!user && (
              <>
                <Link to="/login" className="btn btn--white">Sign In</Link>
                <Link to="/signup" className="btn btn--white">Sign Up</Link>
              </>
            )}
            <Link to="/tours" className="btn btn--green">View Available Tours</Link>
          </div>
        </div>
      </header>
    </div>
  );
}
