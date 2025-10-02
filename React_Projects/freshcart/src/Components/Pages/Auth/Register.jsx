import { useFormik } from 'formik';
import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../Context/Auth/AuthContext';

export default function Register() {

  const { registerAPI } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const navigate = useNavigate();
  let user = {
    name: "",
    email: "",
    phone: "",
    password: "",
    rePassword: ""
  };


  async function handleRegister(values) {
    let res = await registerAPI(values);
    if (res?.data?.message === 'success') {
      console.log("Registered Successfully");
      toast("Registered Successfully", { duration: 1000, style: { background: 'green', color: 'white' } });
      navigate('/login');
    }
    else {
      console.log(res.response);
      res?.response?.data?.errors ? toast(`${res?.response?.data?.errors?.param} : ${res?.response?.data?.errors?.msg}`, { duration: 1000, style: { background: 'red', color: 'white' } }) :
        toast(`${res?.response?.data?.message}`, { duration: 1000, style: { background: 'red', color: 'white' } });
    }
  }

  function submitForm(values, { resetForm }) {
    console.log("Submitted");
    // console.log(values);
    handleRegister(values);
    resetForm();
  }

  function validateForm(values) {
    // Initialize errors object
    let errors = {}

    // Name validation: required and minimum length
    if (values.name.length < 3) {
      errors.name = 'Name must be at least 3 characters'
    }

    // Email validation: required and format
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'Invalid email address'
    }

    // Password validation: required, length, and match
    if (values.password.length < 6 || values.password.length > 20) {
      errors.password = 'Password must be between 6 and 20 characters'
    }

    // Confirm password validation: must match password
    if (values.rePassword !== values.password || values.rePassword === '') {
      errors.rePassword = 'Passwords do not match'
    }

    // Phone validation: required and format
    if (!/^01[0125][0-9]{8}$/.test(values.phone)) {
      errors.phone = 'Invalid phone number'
    }

    return errors
  }

  let userFormik = useFormik({
    initialValues: user,
    onSubmit: submitForm,
    validate: validateForm,
  });
  return (
    <div className='Register-Content me-auto text-start container mt-3'>

      <h2>Register:</h2>
      <form onSubmit={userFormik.handleSubmit}>

        <label htmlFor='name'>name</label>
        <input id="name" type="text" placeholder='name' className="form-control mb-3" value={userFormik.values.name} onChange={userFormik.handleChange} onBlur={userFormik.handleBlur} />
        {(userFormik.errors.name && userFormik.touched.name) ? <div className='alert alert-danger'>{userFormik.errors.name}</div> : null}

        <label htmlFor='email'>email</label>
        <input id="email" type="email" placeholder='email' className="form-control mb-3" value={userFormik.values.email} onChange={userFormik.handleChange} onBlur={userFormik.handleBlur} />
        {(userFormik.errors.email && userFormik.touched.email) ? <div className='alert alert-danger'>{userFormik.errors.email}</div> : null}

        <label htmlFor='phone'>phone</label>
        <input id="phone" type="text" placeholder='phone' className="form-control mb-3" value={userFormik.values.phone} onChange={userFormik.handleChange} onBlur={userFormik.handleBlur} />
        {(userFormik.errors.phone && userFormik.touched.phone) ? <div className='alert alert-danger'>{userFormik.errors.phone}</div> : null}

        <label htmlFor='password'>password</label>
        <div className="input-group">
          <input 
            id="password" 
            type={showPassword ? "text" : "password"} 
            placeholder='password' 
            className="form-control" 
            value={userFormik.values.password} 
            onChange={userFormik.handleChange} 
            onBlur={userFormik.handleBlur} 
          />
          <button 
            className="btn btn-outline-secondary" 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            style={{ border: '1px solid #ced4da', borderLeft: 'none' }}
          >
            <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
          </button>
        </div>
        {(userFormik.errors.password && userFormik.touched.password) ? <div className='alert alert-danger'>{userFormik.errors.password}</div> : null}

        <label htmlFor='rePassword'>rePassword</label>
        <div className="input-group mb-3">
          <input 
            id="rePassword" 
            type={showRePassword ? "text" : "password"} 
            placeholder='rePassword' 
            className="form-control" 
            value={userFormik.values.rePassword} 
            onChange={userFormik.handleChange} 
            onBlur={userFormik.handleBlur} 
          />
          <button 
            className="btn btn-outline-secondary" 
            type="button" 
            onClick={() => setShowRePassword(!showRePassword)}
            style={{ border: '1px solid #ced4da', borderLeft: 'none' }}
          >
            <i className={`fa ${showRePassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
          </button>
        </div>
        {(userFormik.errors.rePassword && userFormik.touched.rePassword) ? <div className='alert alert-danger'>{userFormik.errors.rePassword}</div> : null}

        <div className="d-flex justify-content-between align-items-center">
          <button type='submit' className='btn mb-3' style={{ background: "var(--bs-primary)", color: 'white' }}>Register</button>
          <div className="text-end">
            <label htmlFor='login' className="me-2">Already have an account?</label>
            <button id='login' type='button' onClick={() => navigate('/login')} className='btn mb-3' style={{ background: "gray", color: 'white' }}>Login</button>
          </div>
        </div>
      </form>
    </div>
  )
}
