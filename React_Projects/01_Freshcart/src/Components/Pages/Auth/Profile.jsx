import React, { useContext, useState } from 'react'
import { AuthContext } from '../../../Context/Auth/AuthContext'

export default function Profile() {
  const { User, changePasswordAPI, logout } = useContext(AuthContext);
  const [Passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showChangingPassword, setShowChangingPassword] = useState(false);

  return (
    <div className='container mt-5 mb-5'>
      <div className="row justify-content-center">
        <div className="col-12">

          <div className="row justify-content-center g-4">
            <div className="col-12 col-lg-6 col-xl-5">
              <div className="card shadow-lg border-0 rounded-4">
                <div className="card-body p-5">
                  {/* Profile Header */}
                  <div className="text-center mb-5">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle text-white fs-1 fw-bold mb-3"
                      style={{
                        width: '120px',
                        height: '120px',
                        backgroundColor: 'var(--bs-primary)'
                      }}
                    >
                      {User?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h2 className="fw-bold text-dark mb-2">
                      {User?.name || 'User Name'}
                    </h2>
                    <p className="text-muted fs-5">
                      {User?.email || 'user@example.com'}
                    </p>
                  </div>

                  {/* Profile Information */}
                  <div className="mb-5">
                    <h4 className="fw-semibold text-dark mb-3 pb-2 border-bottom">Profile Information</h4>
                    <div className="bg-light rounded-3 p-4">
                      <div className="row gy-3">
                        <div className="col-12">
                          <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary-subtle">
                            <span className="fw-medium text-muted">Full Name</span>
                            <span className="fw-semibold text-dark">{User?.name || 'John Doe'}</span>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="d-flex justify-content-between align-items-center py-2 border-bottom border-secondary-subtle">
                            <span className="fw-medium text-muted">Email Address</span>
                            <span className="fw-semibold text-dark">{User?.email || 'john.doe@example.com'}</span>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="d-flex justify-content-between align-items-center py-2">
                            <span className="fw-medium text-muted">Account Status</span>
                            <span className="badge bg-success rounded-pill px-3 py-2">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Logout Section */}
                  <div className="mb-0">
                    <h4 className="fw-semibold text-dark mb-3 pb-2 border-bottom">Account Actions</h4>
                    <button onClick={logout} className="btn btn-danger btn-lg rounded-3 w-100 mb-2">
                      <i className="fa fa-sign-out-alt me-2"></i>
                      Logout
                    </button>
                    <button
                      onClick={async () => {
                        setShowChangingPassword(!showChangingPassword);
                      }}
                      className="btn btn-lg rounded-3 w-100" style={{ backgroundColor: 'var(--bs-primary)', color: 'white' }}>
                      <i className="fa fa-key me-2"></i>
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6 col-xl-5 justify-content-center align-items-center" style={{ display: showChangingPassword ? 'flex' : 'none' }}>
              <div className="card shadow-lg border-0 rounded-4">
                <div className="card-body p-5">

                  {/* Change Password Section */}
                  <div className="mb-5">
                    <h4 className="fw-semibold text-dark mb-3 pb-2 border-bottom">Change Password</h4>
                    <form>
                      <div className="mb-3">
                        <label htmlFor="currentPassword" className="form-label fw-medium">
                          Current Password
                        </label>
                        <div className="input-group">
                          <input
                            type={showPasswords.currentPassword ? "text" : "password"}
                            className="form-control form-control-lg rounded-start-3"
                            id="currentPassword"
                            value={Passwords.currentPassword}
                            onChange={(e) => {
                              setPasswords({ ...Passwords, currentPassword: e.target.value });
                            }}
                            placeholder="Enter your current password"
                          />
                          <button
                            className="btn btn-outline-secondary rounded-end-3"
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, currentPassword: !showPasswords.currentPassword })}
                            style={{ border: '1px solid #ced4da', borderLeft: 'none' }}
                          >
                            <i className={`fa ${showPasswords.currentPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                          </button>
                        </div>
                        {errors.currentPassword && (
                          <div className='alert alert-danger mt-2'>{errors.currentPassword}</div>
                        )}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="newPassword" className="form-label fw-medium">
                          New Password
                        </label>
                        <div className="input-group">
                          <input
                            type={showPasswords.newPassword ? "text" : "password"}
                            className="form-control form-control-lg rounded-start-3"
                            id="newPassword"
                            value={Passwords.newPassword}
                            onChange={(e) => setPasswords({ ...Passwords, newPassword: e.target.value })}
                            placeholder="Enter new password"
                          />
                          <button
                            className="btn btn-outline-secondary rounded-end-3"
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, newPassword: !showPasswords.newPassword })}
                            style={{ border: '1px solid #ced4da', borderLeft: 'none' }}
                          >
                            <i className={`fa ${showPasswords.newPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                          </button>
                        </div>
                        {errors.newPassword && (
                          <div className='alert alert-danger mt-2'>{errors.newPassword}</div>
                        )}
                      </div>
                      <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label fw-medium">
                          Confirm Password
                        </label>
                        <div className="input-group">
                          <input
                            type={showPasswords.confirmPassword ? "text" : "password"}
                            className="form-control form-control-lg rounded-start-3"
                            id="confirmPassword"
                            value={Passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...Passwords, confirmPassword: e.target.value })}
                            placeholder="Confirm new password"
                          />
                          <button
                            className="btn btn-outline-secondary rounded-end-3"
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirmPassword: !showPasswords.confirmPassword })}
                            style={{ border: '1px solid #ced4da', borderLeft: 'none' }}
                          >
                            <i className={`fa ${showPasswords.confirmPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <div className='alert alert-danger mt-2'>{errors.confirmPassword}</div>
                        )}
                      </div>

                      <button onClick={async () => {
                        // Clear previous errors
                        setErrors({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });

                        const { currentPassword, newPassword, confirmPassword } = Passwords;
                        // Validation
                        const newErrors = {};
                        if (!currentPassword) newErrors.currentPassword = 'Current password is required';
                        if (!newPassword) newErrors.newPassword = 'New password is required';
                        if (!confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
                        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
                          newErrors.confirmPassword = 'Passwords do not match';
                        }

                        if (Object.keys(newErrors).length > 0) {
                          setErrors(newErrors);
                          return;
                        }

                        changePasswordAPI(currentPassword, newPassword);
                        setPasswords({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setShowPasswords({
                          currentPassword: false,
                          newPassword: false,
                          confirmPassword: false
                        });


                      }}
                        className="btn btn-lg rounded-3 px-4" style={{ backgroundColor: 'var(--bs-primary)', color: 'white' }}>
                        <i className="fa fa-key me-2"></i>
                        Update Password
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>




        </div>
      </div >
    </div >
  )
}
