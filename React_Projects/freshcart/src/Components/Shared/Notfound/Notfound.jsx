import React from 'react'
import notfound_img from '../../../Assets/Images/Icons/page_not_found.svg'
import { Link } from 'react-router-dom'

export default function Notfound() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <img src={notfound_img} alt="Not Found" className="img-fluid" />
        <h5 className="mt-2">Page Not Found</h5>
        <p className="text-muted">The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary" style={{ background: 'var(--bs-primary)' }}>Go to Home</Link>
      </div>

    </div>
  )
}
