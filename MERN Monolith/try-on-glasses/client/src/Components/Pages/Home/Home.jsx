import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className='Home-Content'>
      <h2>Home Page</h2>
      <p>
        Open the virtual try-on camera at <Link to='/widget'>Widget</Link>.
      </p>
    </div>
  );
}
