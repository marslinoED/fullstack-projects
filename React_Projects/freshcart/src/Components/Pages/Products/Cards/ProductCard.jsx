import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { ProductsContext } from '../../../../Context/Products/ProductsContext';

export default function ProductCard({ product }) {
    const { WishlistToggle, CartToggle, wishlist, cart } = useContext(ProductsContext);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isInCart, setIsInCart] = useState(false);


    // Update wishlist state when wishlist data changes 
    useEffect(() => {
        setIsInWishlist(wishlist.some(item => item._id === product._id));
    }, [wishlist, product._id]);
    // Update cart state when cart data changes 
    useEffect(() => {
        if (cart?.data?.products) {
            setIsInCart(cart.data.products.some(item => item.product._id === product._id));
        } else {
            setIsInCart(false);
        }
    }, [cart, product._id]);
    
    return (
        <div>
            <div className='alert alert-danger errorMsg' style={{ display: 'none' }}>Error: <span className='error-message'></span></div>

            <div className="scale card card-product">
                <div className="card-body">
                    <div className="text-center position-relative">
                        <div className="position-absolute top-0 start-0">
                            {product.priceAfterDiscount != null && product.priceAfterDiscount > 0 ? <span className="badge bg-danger">Sale</span> : null}
                        </div>
                        <Link to={`/productdetails/${product._id}`}>
                            <img src={product.imageCover}
                                alt={product.title}
                                className="mb-3 img-fluid" />
                        </Link>
                    </div>
                    <div className="text-small mb-1 text-start">
                        <Link to={`/brands/${product.brand._id}`}
                            className="text-decoration-none me-2" style={{ color: "var(--bs-primary)", fontWeight: "bold" }}>{product.brand?.name}
                        </Link>
                        <span
                            className="text-decoration-none text-muted"><small>{product.category?.name}</small>
                        </span>
                    </div>
                    <h2 className="fs-4 text-start">
                        <Link to={`productdetails/${product._id}`}
                            className="text-inherit text-decoration-none nav-icon" style={{ fontWeight: "bold" }}>{product.title.slice(0, product.title.indexOf(' ', 30))}
                        </Link>
                    </h2>
                    <div className="d-flex justify-content-between align-items-center">
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
                            <span className="text-muted small me-2">{product.ratingsAverage || 0}</span>
                            <span className="text-muted small">({product.ratingsQuantity || 0})</span>
                        </div>
                        <div>
                            <span className="text-dark fw-bold">EGP {product.price}</span>
                            {product.priceAfterDiscount != null && product.priceAfterDiscount > 0 ? (
                                <span className="text-decoration-line-through text-muted ms-1 small">EGP {product.priceAfterDiscount}</span>
                            ) : null}
                        </div>
                    </div>
                    <div
                        className="d-flex justify-content-between align-items-center mt-3">
                        <div>
                        </div>
                        <div>
                            <div className="row">

                                <div className="col-auto"
                                    onClick={async () => {
                                        setIsInWishlist(!isInWishlist);
                                        const res = await WishlistToggle(product._id, isInWishlist);
                                        setIsInWishlist(res);
                                    }}>
                                    <Link className="btn btn-outline-secondary" style={{ color: isInWishlist ? 'red' : 'grey' }} data-bs-toggle="tooltip" data-bs-html="true" aria-label="Wishlist">
                                        <i className={`fa-heart ${isInWishlist ? 'fa-solid' : 'fa-regular'}`} aria-hidden="true"></i>
                                    </Link>
                                </div>
                                <div className="col-auto">
                                    <Link className="btn btn-sm"
                                        style={{ backgroundColor: isInCart ? "red" : "var(--bs-primary)", color: "white" }}
                                        onClick={async () => {
                                            setIsInCart(!isInCart);
                                            const res = await CartToggle(product._id, isInCart);
                                            setIsInCart(res);
                                        }}
                                    >
                                        {
                                            isInCart ? "- Remove from cart" :
                                                "+ Add to cart"
                                        }
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
