import React, { useContext } from 'react'
import freshcart_logo from '../../../Assets/Images/Icons/freshcart-logo.svg'
import { Link, useLocation } from 'react-router-dom'
import { AuthContext } from '../../../Context/Auth/AuthContext';
import { ProductsContext } from '../../../Context/Products/ProductsContext';


export default function Navbar() {
  const { User } = useContext(AuthContext);
  const { wishlist, cart } = useContext(ProductsContext);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div
      className='Navbar-Content container justify-content-center align-items-center'
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <style>
        {`
          .nav-pill{
              color: gray !important;
          }
          .nav-pill:hover {
              color: var(--bs-primary) !important;
            }
            .nav-pill.active {
              color: var(--bs-primary) !important;
          }
        `}
      </style>
      <nav className="navbar navbar-expand-lg bg-white">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand">
            <img src={freshcart_logo} alt='FreshCart Logo' />
          </Link>

          <button className="navbar-toggler mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <form className="d-flex" role="search">
              <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
            </form>
            <ul className="navbar-nav me-auto mb-4 mt-4">
              <div className="nav-pills-container" style={{
                background: '#f1f3f4',
                borderRadius: '50px',
                padding: '4px',
                display: 'flex',
                gap: '4px',
              }}>
                <li className="nav-item">
                  <Link className={`nav-pill ${isActive('/') ? 'active' : ''}`} to="/" style={{
                    padding: '12px 24px',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                  }}>Home</Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-pill ${isActive('/brands') || location.pathname.startsWith('/brands/') ? 'active' : ''}`} to="/brands" style={{
                    padding: '12px 24px',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                  }}>Brands</Link>
                </li>
              </div>
            </ul>
            {/* Icons */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '22px' }}>
              <div className="nav-pills-container" style={{
                background: '#f1f3f4',
                borderRadius: '50px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span
                  className='gradient-text'
                  style={{
                    fontWeight: 500,
                    fontSize: '1rem',
                    color: '#333',
                    marginRight: '8px',
                    marginLeft: '8px'
                  }}>
                  {User?.name || 'Guest'}
                </span>
              </div>
              <div className="nav-icon" style={{ position: 'relative' }} title="Wishlist">
                <Link className='nav-link' to="/wishlist">
                  <i className="fa-solid fa-heart " aria-hidden="true"></i>
                  {
                    (User?.name && wishlist.length > 0) &&
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success"
                      style={{ height: '18px', width: '18px', fontSize: '0.6rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {wishlist.length}
                    </span>
                  }
                </Link>
              </div>
              <div className="nav-icon" style={{ position: 'relative' }} title="Profile">
                <Link className='nav-link' to="/profile">
                  <i className="fa-solid fa-user " aria-hidden="true"></i>
                  {!User?.name &&
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success"
                      style={{ minWidth: '32px', height: '16px', fontSize: '0.65rem', fontWeight: 500, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0 4px', letterSpacing: '0.2px', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                      SignUp
                    </span>}
                </Link>
              </div>
              <div className="nav-icon" style={{ position: 'relative' }} title="Cart">
                <Link className='nav-link' to="/cart">
                  <i className="fas fa-shopping-cart"></i>

                    {
                      (User?.name && cart?.data?.products?.length > 0) &&
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success"
                        style={{ height: '18px', width: '18px', fontSize: '0.6rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {cart?.data?.products?.length}
                      </span>
                    }
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <hr className="m-0" />
    </div>
  )
}
