import React, { useContext } from 'react'
import Loading from '../../Shared/Loading/Loading'
import { Link, Outlet, useParams } from 'react-router-dom';
import { ProductsContext } from '../../../Context/Products/ProductsContext';

export default function Brands() {
  const { id } = useParams();
  const { brands, loading } = useContext(ProductsContext);

  return (
    <div className='Brands-Content container'>
      <div className='text-center m-5'>
        <h1 className="brands-header" style={{ fontWeight: '700', marginBottom: '15px', fontSize: '3rem' }}>
          Our <span className="gradient-text">Brands</span>
        </h1>
        <p className="lead mb-3" style={{ fontSize: '1.2rem', color: '#6c757d' }}>Explore our premium brands collection</p>
        <p className="text-muted" style={{ fontSize: '1rem' }}>{brands.length} brands available</p>
      </div>
      <style>
        {`
          .brands-header {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            letter-spacing: -0.02em;
          }
          
          .brand-card {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            height: 100%;
            transition: all 0.3s ease;
            box-shadow: 0 4px 8px rgba(0,0,0,0.08);
          }
          .brand-card:hover {
            border-color: var(--bs-primary);
            transform: scale(1.02);
            box-shadow: 0 8px 16px rgba(40, 167, 69, 0.15);
          }
          .brand-card img {
            width: 100%;
            height: 120px;
            object-fit: contain;
            margin-bottom: 15px;
          }
          .brand-name {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
            transition: color 0.3s ease;
          }
          .brand-card:hover .brand-name {
            color: var(--bs-primary);
          }
        `}
      </style>
      {
        (id && brands.length > 0) &&
        <div className="d-flex flex-wrap justify-content-center m-4 p-3">
          <Outlet context={{ brand: brands.find(brand => brand._id === id) }} />
        </div>
      }
      {loading ? <Loading /> : (
        <div className="d-flex flex-wrap justify-content-center m-4 p-3">
          <div className='row'>
            {brands.map(brand => (
              <div className='col-md-3 mb-3' key={brand._id}>
                <Link to={`/brands/${brand._id}`} className="text-decoration-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <div className='brand-card'>
                    <img src={brand.image} alt={brand.name} />
                    <div className="brand-name">{brand.name}</div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
