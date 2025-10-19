import React, { useContext } from 'react'
import { ProductsContext } from '../../../Context/Products/ProductsContext';
import ProductCard from '../../Pages/Products/Cards/ProductCard';
import wishlist_img from '../../../Assets/Images/Icons/wishList.svg'

export default function Wishlist() {
  const { wishlist, ClearWishlist } = useContext(ProductsContext);

  return (
    <div className='Wishlist-Content container py-4'>
      <div className='alert alert-danger errorMsg' style={{ display: 'none' }}>Error: <span className='error-message'></span></div>

      {/* Header with Clear Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className='mb-0'>My <span className="gradient-text">Wishlist</span></h2>
        {wishlist && wishlist.length > 0 && (
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={ClearWishlist}
            title="Clear all items from wishlist"
          >
            <i className="fas fa-trash me-2"></i>
            Clear Wishlist
          </button>
        )}
      </div>

      {
        !wishlist || wishlist.length === 0 ?
          <>
            <img src={wishlist_img} alt="Wishlist" className="img-fluid" />
            <h3 className='text-center my-5'>Your wishlist is empty.</h3>
          </> :
          <div className='row justify-content-center'>
            {wishlist.map(item => (
              <div className='col-md-6 col-lg-4 mb-4 d-flex' key={item._id}>
                <ProductCard product={item} inWishlist={true} />
              </div>
            ))}
          </div>
      }
    </div>
  )
}
