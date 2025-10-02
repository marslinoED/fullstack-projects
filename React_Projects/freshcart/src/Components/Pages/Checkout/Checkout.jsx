import React, { useContext, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProductsContext } from '../../../Context/Products/ProductsContext';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { id } = useParams();
  const { submitCashPayment, loading, submitCreditPayment } = useContext(ProductsContext);
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [shippingDetails, setShippingDetails] = useState({
    details: '',
    phone: '',
    city: ''
  });
  const [errors, setErrors] = useState({
    details: false,
    phone: false,
    city: false
  });

  const handleInputChange = (field, value) => {
    setShippingDetails(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      details: !shippingDetails.details.trim(),
      phone: !shippingDetails.phone.trim(),
      city: !shippingDetails.city.trim()
    };
    
    setErrors(newErrors);
    
    // Check if any field has an error
    const hasErrors = Object.values(newErrors).some(error => error);
    
    if (hasErrors) {
      toast.error('Please fill in all required fields');
      return false;
    }
    
    return true;
  };



  const handleCheckout = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    if (paymentMethod === 'cash') {
      const result = await submitCashPayment(shippingDetails, id);
      if (result) {
        navigate('/orders');
      }
    } else if (paymentMethod === 'credit') {
      await submitCreditPayment(shippingDetails, id);
    }
  };

  return (
    <div className='container mt-4 mb-4'>
      <div className="row justify-content-center">
        <div className="col-12 col-sm-9 col-md-7 col-lg-5 col-xl-4">
          <div className="card border-0 shadow-lg" style={{ borderRadius: '20px', overflow: 'hidden' }}>

            {/* Header */}
            <div className="text-white text-center py-3" style={{ background: 'linear-gradient(135deg, #20B2AA, var(--bs-primary))' }}>
              <h2 className="h3 fw-bold mb-1">Checkout Now</h2>
              <p className="mb-0 opacity-90">Complete your purchase securely</p>
            </div>

            <div className="card-body p-3 p-md-4">

              {/* Payment Method */}
              <div className="mb-4">
                <h5 className="fw-semibold text-dark mb-3">Payment Method</h5>
                <div className="row g-2">

                  {/* Cash Option */}
                  <div className="col-6">
                    <div
                      className={`card h-100 text-center cursor-pointer ${paymentMethod === 'cash' ? 'border-success border-3' : 'border-2'}`}
                      style={{
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: paymentMethod === 'cash' ? '#e8f5e8' : 'white',
                        borderColor: paymentMethod === 'cash' ? '#28a745' : '#e9ecef'
                      }}
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <div className="card-body py-3">
                        <div
                          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: paymentMethod === 'cash' ? '#28a745' : '#6c757d'
                          }}
                        >
                          <i className="fas fa-money-bill-wave text-white"></i>
                        </div>
                        <h6 className="fw-semibold mb-0" style={{ color: paymentMethod === 'cash' ? '#28a745' : '#6c757d' }}>
                          Cash
                        </h6>
                      </div>
                    </div>
                  </div>

                  {/* Credit Card Option */}
                  <div className="col-6">
                    <div
                      className={`card h-100 text-center cursor-pointer ${paymentMethod === 'credit' ? 'border-success border-3' : 'border-2'}`}
                      style={{
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: paymentMethod === 'credit' ? '#e8f5e8' : 'white',
                        borderColor: paymentMethod === 'credit' ? '#28a745' : '#e9ecef'
                      }}
                      onClick={() => setPaymentMethod('credit')}
                    >
                      <div className="card-body py-3">
                        <div
                          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: paymentMethod === 'credit' ? '#28a745' : '#6c757d'
                          }}
                        >
                          <i className="fas fa-credit-card text-white"></i>
                        </div>
                        <h6 className="fw-semibold mb-0" style={{ color: paymentMethod === 'credit' ? '#28a745' : '#6c757d' }}>
                          Credit Card
                        </h6>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Shipping Details */}
              <div className="mb-3">
                <h5 className="fw-semibold text-dark mb-3">Shipping Details</h5>

                {/* City */}
                <div className="mb-3">
                  <h6 className="fw-medium text-dark mb-2">City *</h6>
                  <div className="input-group">
                    <span className={`input-group-text bg-light border-end-0 ${errors.city ? 'border-danger' : ''}`} style={{ borderRadius: '8px 0 0 8px', border: `2px solid ${errors.city ? '#dc3545' : '#28a745'}` }}>
                      <i className={`fas fa-city ${errors.city ? 'text-danger' : 'text-success'}`}></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control border-start-0 ps-0 ${errors.city ? 'border-danger' : ''}`}
                      placeholder="Enter your city"
                      value={shippingDetails.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      style={{
                        borderRadius: '0 8px 8px 0',
                        border: `2px solid ${errors.city ? '#dc3545' : '#28a745'}`,
                        borderLeft: 'none'
                      }}
                    />
                  </div>
                  {errors.city && <small className="text-danger mt-1 d-block">City is required</small>}
                </div>

                {/* Address */}
                <div className="mb-3">
                  <h6 className="fw-medium text-dark mb-2">Address *</h6>
                  <div className="input-group">
                    <span className={`input-group-text bg-light border-end-0 ${errors.details ? 'border-danger' : ''}`} style={{ borderRadius: '8px 0 0 8px', border: `2px solid ${errors.details ? '#dc3545' : '#28a745'}` }}>
                      <i className={`fas fa-map-marker-alt ${errors.details ? 'text-danger' : 'text-success'}`}></i>
                    </span>
                    <input
                      type="text"
                      className={`form-control border-start-0 ps-0 ${errors.details ? 'border-danger' : ''}`}
                      placeholder="Enter your complete address"
                      value={shippingDetails.details}
                      onChange={(e) => handleInputChange('details', e.target.value)}
                      style={{
                        borderRadius: '0 8px 8px 0',
                        border: `2px solid ${errors.details ? '#dc3545' : '#28a745'}`,
                        borderLeft: 'none'
                      }}
                    />
                  </div>
                  {errors.details && <small className="text-danger mt-1 d-block">Address is required</small>}
                </div>

                {/* Phone Number */}
                <div className="mb-4">
                  <h6 className="fw-medium text-dark mb-2">Phone Number *</h6>
                  <div className="input-group">
                    <span className={`input-group-text bg-light border-end-0 ${errors.phone ? 'border-danger' : ''}`} style={{ borderRadius: '8px 0 0 8px', border: `2px solid ${errors.phone ? '#dc3545' : '#28a745'}` }}>
                      <i className={`fas fa-phone ${errors.phone ? 'text-danger' : 'text-success'}`}></i>
                    </span>
                    <input
                      type="tel"
                      className={`form-control border-start-0 ps-0 ${errors.phone ? 'border-danger' : ''}`}
                      placeholder="Enter your phone number"
                      value={shippingDetails.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      style={{
                        borderRadius: '0 8px 8px 0',
                        border: `2px solid ${errors.phone ? '#dc3545' : '#28a745'}`,
                        borderLeft: 'none'
                      }}
                    />
                  </div>
                  {errors.phone && <small className="text-danger mt-1 d-block">Phone number is required</small>}
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                className="btn w-100 text-white fw-semibold py-2 mb-3"
                style={{
                  background: 'linear-gradient(135deg, #28a745, #20c997)',
                  border: 'none',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onClick={handleCheckout}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.background = 'linear-gradient(135deg, #56aa6aff, var(--bs-primary))';
                    e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.background = 'linear-gradient(135deg, #20c997, var(--bs-primary))';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-credit-card me-2"></i>
                    Pay Now
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="text-center">
                <p className="text-muted mb-0 small">
                  <i className="fas fa-shield-alt text-success me-2"></i>
                  Your information is securely encrypted
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
