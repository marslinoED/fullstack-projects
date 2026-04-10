import React from 'react';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className='Layout-Content'>
      <h2>Layout Page</h2>
      <Outlet />
    </div>
  );
}
