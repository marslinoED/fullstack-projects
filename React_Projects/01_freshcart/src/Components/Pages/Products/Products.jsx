import React, { useContext } from 'react'
import ProductCard from './Cards/ProductCard'
import Loading from '../../Shared/Loading/Loading';
import { Link } from 'react-router-dom'
import { ProductsContext } from '../../../Context/Products/ProductsContext';
import no_products_img from '../../../Assets/Images/Icons/no-products.svg'

export default function Products() {
  const { loading, products, setBrandFilter, setSortingType, setCategoryFilter, brands, categories } = useContext(ProductsContext);

  return (
    <>
      <div className="container" style={{ maxWidth: '1080px' }}>
        <div className="d-flex justify-content-end mb-3" style={{ marginLeft: '80%' }}>
          {/* Sorting */}
          <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              Sort By
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
              <li><Link className="dropdown-item" onClick={() => setSortingType('latest')}>Latest (default)</Link></li>
              <li><Link className="dropdown-item" onClick={() => setSortingType('price')}>Price</Link></li>
              <li><Link className="dropdown-item" onClick={() => setSortingType('title')}>Name</Link></li>
            </ul>
          </div>
          {/* Filter by Brand */}
          <div className="dropdown ms-3" >
            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              Filter by Brand
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <li>
                <span className="dropdown-item" onClick={() => { setBrandFilter(null) }}>All</span>
              </li>
              <li><hr className="dropdown-divider" /></li>
              {[...brands].sort((a, b) => a.name.localeCompare(b.name)).map(brand => (
                <li key={brand._id}>
                  <span className="dropdown-item" onClick={() => { setBrandFilter(brand._id) }}>
                    {brand.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* Filter by Category */}
          <div className="dropdown ms-3" >
            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
              Filter by Category
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <li>
                <span className="dropdown-item" onClick={() => { setCategoryFilter(null) }}>All</span>
              </li>
              <li><hr className="dropdown-divider" /></li>
              {[...categories].sort((a, b) => a.name.localeCompare(b.name)).map(category => (
                <li key={category._id}>
                  <span className="dropdown-item" onClick={() => { setCategoryFilter(category._id) }}>
                    {category.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className='Products-Content' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {loading ? (
          <Loading />
        ) : (
          products.length === 0 ?
            <img src={no_products_img} alt="No Products" className="img-fluid w-25 mb-3" /> :
            <div style={{
              marginRight: '60px',
              marginLeft: '60px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(250px, 30%, 350px), 1fr))',
              gap: '20px',
              justifyContent: 'center'
            }}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
        )}
      </div>
    </>
  )
}
