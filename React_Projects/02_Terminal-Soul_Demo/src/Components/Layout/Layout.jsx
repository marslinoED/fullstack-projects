import React, { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

export default function Layout() {
    const navigate = useNavigate();
  useEffect(() => {
    navigate('/game');
  }, [navigate]);
  return (
    <div className='Layout-Content vh-100 d-flex align-items-center justify-content-center bg-dark'>
        <Outlet />
    </div>
  )
}
