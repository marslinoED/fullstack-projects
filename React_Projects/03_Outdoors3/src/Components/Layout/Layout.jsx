import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';

export default function Layout() {
  return (
    <div className='Layout-Content'>
      <Navbar />
      <div style={{ minHeight: '80vh' }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
