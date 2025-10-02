import React, { useContext, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';
import Notfound from '../../../Shared/Notfound/Notfound';
import Loading from '../../../Shared/Loading/Loading';
import { ProductsContext } from '../../../../Context/Products/ProductsContext';

export default function Productdetails() {
  const { id } = useParams();

  const { WishlistToggle, getProductDetails, loading, CartToggle } = useContext(ProductsContext);

  const [product, setProduct] = useState([]);
  const [mainImg, setMainImg] = useState(null);
  const [error, setError] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    getProductDetails(id).then(res => {

      if (!res.error) {
        setProduct(res.data);
        // console.log(res)
        setIsInWishlist(res.isInWishlist);
        setIsInCart(res.isInCart);
        setMainImg(res.data.imageCover);
      } else {
        setError(res.error);
      }
    });
  }, [id, getProductDetails]);

  if (error) {
    return (
      <Notfound />
    )
  }

  else {
    return (
      loading ? <Loading /> :
        <div className='productDetails-content d-flex justify-content-center align-items-center'>
          <div className='alert alert-danger errorMsg' style={{ display: 'none' }}>Error: <span className='error-message'></span></div>
          <div className="container m-5">
            <div className="row">
              {/* First Column */}
              <div className="col-6">
                {/* First row image */}
                <div className="row mb-3">
                  <div className="col-12 text-center scale">
                    <img src={mainImg} alt="single" className="img-fluid" />
                  </div>
                </div>

                {/* Second row with 4 images */}
                {product && product.images && product.images.length > 0 && (
                  <div className="row text-center scale ">
                    {product.images.map((img, index) => (
                      <div className="col-3" key={index}>
                        <img src={img} alt={`img${index + 2}`} className="scale img-fluid" onClick={() => {
                          setMainImg(img);
                        }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Second Column */}
              <div className="col-6">
                <div className="row mb-2 text-start">
                  {product?.brand && (
                    <Link to={`/brands/${product.brand._id}`} style={{ textDecoration: "none" }}>
                      <div className="col-12 fs-6" style={{ color: "var(--bs-primary)" }}>{product.brand.name}</div>
                    </Link>
                  )}
                </div>
                <div className="row mb-2 text-start">
                  <div className="col-12 fs-4" style={{ fontWeight: "bold" }}>{product?.title}</div>
                </div>
                <div className="row mb-2 text-start">
                  <div className="d-flex align-items-center">
                    <div className="text-warning me-2">
                      {Array.from({ length: 5 }, (_, index) => {
                        const rating = product.ratingsAverage || 0;
                        const starValue = index + 1;

                        if (rating >= starValue) {
                          // Full star - filled yellow
                          return <i key={index} className="bi bi-star-fill" style={{ color: '#ffc107' }}></i>;
                        } else if (rating >= starValue - 0.5) {
                          // Half star
                          return <i key={index} className="bi bi-star-half" style={{ color: '#ffc107' }}></i>;
                        } else {
                          // Empty star - gray outline only
                          return <i key={index} className="bi bi-star" style={{ color: '#dee2e6' }}></i>;
                        }
                      })}
                    </div>
                    <div className="text-muted small me-2">
                      <span>{product.ratingsAverage || 0}</span>
                      <span> ({product.ratingsQuantity || 0})</span>
                    </div>
                    <div className="fs-7" style={{ fontWeight: "bold" }}>
                      <span className="text-dark fw-bold">EGP {product.price}</span>
                      {product.priceAfterDiscount != null && product.priceAfterDiscount > 0 ? (
                        <span className="text-decoration-line-through text-muted ms-1 small">EGP {product.priceAfterDiscount}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="row mb-2 text-start">
                  <div className="col-12 fs-7 text-muted">{product?.description}</div>
                </div>
                <div className="row mb-4 text-start align-items-center">

                  {/* Add to cart button */}
                  <div className="col-auto">
                    <button
                      type="button"
                      className="btn"
                      onClick={async () => {
                        setIsInCart(!isInCart);
                        const res = await CartToggle(product._id, isInCart);
                        setIsInCart(res);
                      }}
                      style={{ backgroundColor: isInCart ? "red" : "var(--bs-primary)", color: "#fff" }}
                    >
                      {isInCart ? "Remove from cart" : "Add to cart"}
                    </button>
                  </div>
                  <div className="col-auto">
                    <Link className="btn btn-outline-secondary" style={{ color: isInWishlist ? 'red' : 'grey' }} data-bs-toggle="tooltip" data-bs-html="true" aria-label="Wishlist"
                      onClick={async () => {
                        setIsInWishlist(!isInWishlist);
                        const res = await WishlistToggle(product._id, isInWishlist); setIsInWishlist(res);
                      }}>
                      <i className={`fa-heart ${isInWishlist ? 'fa-solid' : 'fa-regular'}`} aria-hidden="true"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    )
  }
}


