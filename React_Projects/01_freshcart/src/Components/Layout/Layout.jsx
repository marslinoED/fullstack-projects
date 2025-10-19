import React from 'react'
import Navbar from '../Shared/Navbar/Navbar'
import Footer from '../Shared/Footer/Footer'

import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className='Layout-Content'>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}
