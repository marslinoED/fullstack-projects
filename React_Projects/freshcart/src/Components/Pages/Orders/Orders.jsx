import React, { useCallback, useContext, useEffect, useState } from 'react'
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../Context/Auth/AuthContext';
import Loading from '../../Shared/Loading/Loading';
import { Link } from 'react-router-dom';
import empty_orders_img from '../../../Assets/Images/Icons/empty-orders.svg'

export default function Orders() {
  const { Token } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  
  const getAllOrders = useCallback(async () => {
    setLoading(true);
    if (!Token) {
      toast.error("You need to be logged in to view your orders.");
      setLoading(false);
      return false;
    }
    try {
      const id = JSON.parse(localStorage.getItem("id"));
      if (!id) {
        toast.error("User ID not found. Please log in again.");
        setLoading(false);
        return false;
      }
      const { data } = await axios.get(`https://ecommerce.routemisr.com/api/v1/orders/user/${id}`, {
        headers: { "token": Token }
      });
      setOrders(data);
    } catch (error) {
      toast.error("Error fetching orders. Please try again later.");
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [Token]);

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders, Token]);

  return (
    <div className='Orders-Content container py-4'>
      <h2 className='text-center mb-2'>My <span className="gradient-text">Orders</span></h2>
      {!loading && orders.length > 0 && (
        <p className='text-center text-muted mb-4'>
          <i className="fas fa-list-alt me-2"></i>
          {orders.length} order{orders.length !== 1 ? 's' : ''} found
        </p>
      )}
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Loading />
        </div>
      ) : orders.length > 0 ? (
        <div className="row g-4">
          {orders.map((order) => (
            <div key={order._id} className="col-12">
              <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '12px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }}>
                
                {/* Order Header */}
                <div className="card-header bg-light border-0 py-3" style={{ borderRadius: '12px 12px 0 0' }}>
                  <div className="row align-items-start">
                    {/* Left Side - Order Info */}
                    <div className="col-12 col-md-6 text-start">
                      <h5 className="mb-2 fw-bold">
                        <i className="fas fa-receipt me-2" style={{ color: "var(--bs-primary)" }}></i>
                        Order #{order.id}
                      </h5>
                      <p className="mb-0 text-muted">
                        <i className="fas fa-calendar-alt me-2"></i>
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    {/* Right Side - Status and Total */}
                    <div className="col-12 col-md-6 text-start text-md-end mt-3 mt-md-0">
                      {/* First Row - Status Badges */}
                      <div className="mb-2">
                        <span className={`badge me-2 px-3 py-2 ${order.isPaid ? 'bg-success' : 'bg-warning'}`}>
                          <i className={`fas ${order.isPaid ? 'fa-check-circle' : 'fa-clock'} me-1`}></i>
                          Payment {order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                        <span className={`badge px-3 py-2 ${order.isDelivered ? 'bg-success' : 'bg-primary'}`}>
                          <i className={`fas ${order.isDelivered ? 'fa-truck' : 'fa-box'} me-1`}></i>
                          Delivery {order.isDelivered ? 'Delivered' : 'Processing'}
                        </span>
                      </div>
                      
                      {/* Second Row - Total Price */}
                      <div className="h4 mb-0 fw-bold" style={{ color: "var(--bs-primary)" }}>
                        EGP {order.totalOrderPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card-body p-4">
                  
                  {/* Branch 1: Shipping Address */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', backgroundColor: 'var(--bs-primary)' }}>
                        <i className="fas fa-map-marker-alt text-white"></i>
                      </div>
                      <h6 className="mb-0 fw-semibold text-start" style={{ color: "var(--bs-primary)" }}>Shipping Address</h6>
                    </div>
                    <div className="ms-5 ps-2">
                      <p className="mb-1 text-start">{order.shippingAddress.details}</p>
                      <p className="mb-1 text-muted text-start">
                        <i className="fas fa-city me-2"></i>
                        {order.shippingAddress.city}
                      </p>
                      <p className="mb-0 text-muted text-start">
                        <i className="fas fa-phone me-2"></i>
                        {order.shippingAddress.phone}
                      </p>
                    </div>
                  </div>

                  {/* Branch 2: Payment Method */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', backgroundColor: 'var(--bs-primary)' }}>
                        <i className="fas fa-credit-card text-white"></i>
                      </div>
                      <h6 className="mb-0 fw-semibold text-start" style={{ color: "var(--bs-primary)" }}>Payment Method</h6>
                    </div>
                    <div className="ms-5 ps-2">
                      <p className="mb-0 text-start">
                        <i className="fas fa-wallet me-2" style={{ color: "var(--bs-primary)" }}></i>
                        {order.paymentMethodType}
                      </p>
                    </div>
                  </div>

                  {/* Branch 3: Order Items */}
                  <div className="mb-0">
                    <div className="d-flex align-items-center mb-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px', backgroundColor: 'var(--bs-primary)' }}>
                        <i className="fas fa-shopping-bag text-white"></i>
                      </div>
                      <h6 className="mb-0 fw-semibold text-start" style={{ color: "var(--bs-primary)" }}>Order Items ({order.cartItems.length} items)</h6>
                    </div>
                    
                    {/* Products List */}
                    <div className="ms-5 ps-2">
                      {order.cartItems.map((item, index) => (
                        <div key={index} className="d-flex align-items-center mb-3 p-3 bg-light rounded-3">
                          <div className="flex-shrink-0 me-3">
                            <Link to={`/productdetails/${item.product._id}`}>
                              <img
                                src={item.product.imageCover}
                                alt={item.product.title}
                                className="rounded"
                                style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }}
                              />
                            </Link>
                          </div>
                          <div className="flex-grow-1">
                            <div className="row align-items-center">
                              <div className="col-12 col-md-6">
                                <h6 className="mb-1 fw-semibold text-start">
                                  <Link to={`/productdetails/${item.product._id}`} className="nav-icon text-decoration-none">
                                    {item.product.title}
                                  </Link>
                                </h6>
                                <small className="text-muted text-start">
                                  <i className="fas fa-tag me-1"></i>
                                  {item.product.category.name} • {item.product.brand.name}
                                </small>
                              </div>
                              <div className="col-12 col-md-3 text-start text-md-center mt-2 mt-md-0">
                                <span className="badge bg-secondary px-3">
                                  <i className="fas fa-boxes me-1"></i>
                                  Qty: {item.count}
                                </span>
                              </div>
                              <div className="col-12 col-md-3 text-start text-md-end mt-2 mt-md-0">
                                <div className="fw-bold fs-6" style={{ color: "var(--bs-primary)" }}>
                                  ${item.price.toFixed(2)}
                                </div>
                                {item.count > 1 && (
                                  <small className="text-muted">
                                    ${(item.price / item.count).toFixed(2)} each
                                  </small>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <img src={empty_orders_img} alt="Empty Orders" className="img-fluid w-25 mb-3" />
          <h4 className="text-muted mb-3">No orders found</h4>
          <p className="text-muted">You haven't placed any orders yet. Start shopping to see your order history here!</p>
        </div>
      )}
    </div>
  )
}
