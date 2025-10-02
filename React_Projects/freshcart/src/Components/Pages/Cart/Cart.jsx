import React, { useContext, useState } from 'react'
import { ProductsContext } from '../../../Context/Products/ProductsContext';
import empty_cart_img from '../../../Assets/Images/Icons/empty-cart.svg'
import { Link } from 'react-router-dom';

export default function Cart() {
  const { cart, changeCartCount, CartToggle, ClearCart } = useContext(ProductsContext);
  const [loadingItems, setLoadingItems] = useState(new Set());

  const handleQuantityChange = async (productId, newCount) => {
    setLoadingItems(prev => new Set(prev).add(productId));
    await changeCartCount(productId, newCount);
    setLoadingItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
  };
  return (
    <div className='Cart-Content m-2 m-md-4 d-flex flex-column align-items-center'>
      {/* Header with View Orders Link */}
      <div className="w-100 d-flex justify-content-between align-items-center mb-4" style={{ maxWidth: '1200px' }}>
        <h2 className='mb-0'>My <span className="gradient-text">Cart</span></h2>
        <Link
          to="/orders"
          className="btn btn-sm"
          style={{ background: 'var(--bs-primary)', color: 'white' }}
          title="View your order history"
        >
          <i className="fas fa-receipt me-2"></i>
          View Orders
        </Link>
      </div>

      <div className="w-100 d-flex justify-content-center">
        <div className="card shadow-lg border-0 rounded-4 w-100" style={{ maxWidth: '1200px' }}>
          <div className="card-body p-3 p-md-5">
            <div className="mb-4">
              {!cart?.data?.products || cart.data.products.length === 0 ?
                <>
                  <img src={empty_cart_img} alt="Empty Cart" className="img-fluid w-50" />
                  <h3 className='text-center my-5'>Your cart is empty.</h3>
                </>
                :
                <>
                  {/* Unified Card Layout for All Screen Sizes */}
                  <div className="cart-items">
                    {cart?.data?.products?.map((item) => (
                      <div key={item._id} className="card mb-3 border-0 shadow-sm">
                        <div className="card-body p-3 p-md-4">
                          <div className="row align-items-center">
                            {/* Product Image */}
                            <div className="col-3 col-md-2">
                              <Link to={`/productdetails/${item.product._id}`}>
                                <img
                                  src={item.product.imageCover}
                                  alt={item.product.title}
                                  className="img-fluid rounded"
                                  style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                                />
                              </Link>
                            </div>

                            {/* Product Info */}
                            <div className="col-9 col-md-4">
                              <Link to={`/productdetails/${item.product._id}`} className='mb-1 fs-5 fw-semibold text-decoration-none nav-icon'>
                                {item.product.title}
                              </Link>
                              <div className="text-muted small">
                                <span className="d-block d-md-inline">Unit Price: </span>
                                <span className="fw-semibold">${item.price.toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            {loadingItems.has(item.product._id) ?
                              <div className="col-12 col-md-3 mt-2 mt-md-0">
                                <div className="d-flex align-items-center justify-content-start justify-content-md-center">
                                  <span className="text-muted small me-2 d-md-none">Qty:</span>
                                  <div style={{ width: '98px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="spinner-border spinner-border-sm" role="status" style={{ color: 'var(--bs-primary)' }}>
                                      <span className="visually-hidden">Loading...</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              :
                              <div className="col-12 col-md-3 mt-2 mt-md-0">
                                <div className="d-flex align-items-center justify-content-start justify-content-md-center">
                                  <span className="text-muted small me-2 d-md-none">Qty:</span>
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    style={{ width: '32px', height: '32px', padding: '0' }}
                                    onClick={() => {
                                      if (item.count > 1) {
                                        handleQuantityChange(item.product._id, item.count - 1);
                                      }
                                    }}
                                    disabled={item.count <= 1}
                                  >
                                    <i className="fas fa-minus" style={{ fontSize: '12px' }}></i>
                                  </button>
                                  <span className="mx-3 fw-semibold" style={{ minWidth: '30px', textAlign: 'center' }}>
                                    {item.count}
                                  </span>
                                  <button
                                    className="btn btn-outline-secondary btn-sm"
                                    style={{ width: '32px', height: '32px', padding: '0' }}
                                    onClick={() => {
                                      handleQuantityChange(item.product._id, item.count + 1);
                                    }}
                                  >
                                    <i className="fas fa-plus" style={{ fontSize: '12px' }}></i>
                                  </button>
                                </div>
                              </div>}

                            {/* Total Price */}
                            <div className="col-6 col-md-2 mt-2 mt-md-0">
                              <div className="text-center">
                                <div className="text-muted small d-md-none">Total</div>
                                <div className="fw-bold h6 mb-0" style={{ color: "var(--bs-primary)" }}>
                                  ${(item.price * item.count).toFixed(2)}
                                </div>
                              </div>
                            </div>

                            {/* Remove Button */}
                            <div className="col-6 col-md-1 mt-2 mt-md-0 text-end">
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => {
                                  CartToggle(item.product._id, true);
                                }}
                                title="Remove item"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="card bg-light border-0 mt-4">
                    <div className="card-body p-3 p-md-4">
                      <div className="row align-items-center">
                        <div className="col-12 col-md-6 mb-3 mb-md-0">
                          <h4 className="mb-0">
                            Total: <span style={{ color: "var(--bs-primary)" }}>
                              ${cart?.data?.products?.reduce((acc, item) => acc + (item.price * item.count), 0).toFixed(2) || '0.00'}
                            </span>
                          </h4>
                          <small className="text-muted">
                            {cart?.data?.products?.reduce((acc, item) => acc + item.count, 0) || 0} item(s) in cart
                          </small>
                        </div>
                        <div className="col-12 col-md-6">
                          <div className="d-flex gap-2 justify-content-md-end">
                            <button
                              className="btn btn-outline-danger flex-fill flex-md-grow-0"
                              onClick={() => ClearCart()}
                              style={{ minWidth: '120px' }}
                            >
                              <i className="fas fa-trash me-2"></i>Clear Cart
                            </button>
                            <Link
                              to={`/checkout/${cart?.data?._id}`}
                              className="btn flex-fill flex-md-grow-0"
                              style={{ minWidth: '160px', background: 'var(--bs-primary)', color: 'white' }}
                            >
                              <i className="fas fa-credit-card me-2"></i>Proceed to Checkout
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
