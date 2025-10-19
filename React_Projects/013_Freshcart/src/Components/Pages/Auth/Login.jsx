import { useFormik } from 'formik';
import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../Context/Auth/AuthContext';

export default function Login() {
  const { loginAPI, User, setUser, setToken } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(values) {
    let res = await loginAPI(values);
    if (res?.data?.message === 'success') {
      localStorage.setItem('token', JSON.stringify(res?.data.token));
      localStorage.setItem('user', JSON.stringify(res?.data.user));
      setToken(res?.data.token);
      setUser(res?.data.user);
      toast("Welcome to FreshCart", { duration: 1000, style: { background: 'green', color: 'white' } });
      navigate('/');
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
    handleLogin(values);
    resetForm();
  }

  function validateForm(values) {
    // Initialize errors object
    let errors = {}

    // Email validation: required and format
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'Invalid email address'
    }

    // Password validation: required, length, and match
    if (values.password.length < 6 || values.password.length > 20) {
      errors.password = 'Password must be between 6 and 20 characters'
    }
    return errors
  }

  let userFormik = useFormik({
    initialValues: User || { email: "", password: "" },
    onSubmit: submitForm,
    validate: validateForm,
  });
  return (
    <div className='Register-Content me-auto text-start container mt-3'>
      <h2>Login:</h2>
      <form onSubmit={userFormik.handleSubmit}>

        <label htmlFor='email'>email</label>
        <input id="email" type="email" placeholder='email' className="form-control mb-3" value={userFormik.values.email} onChange={userFormik.handleChange} onBlur={userFormik.handleBlur} />
        {(userFormik.errors.email && userFormik.touched.email) ? <div className='alert alert-danger'>{userFormik.errors.email}</div> : null}

        <label htmlFor='password'>password</label>
        <div className="input-group mb-3">
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

        <div className="d-flex justify-content-between align-items-center">
          <button type='submit' className='btn mb-3' style={{ background: "var(--bs-primary)", color: 'white' }}>Login</button>
          <div className="text-end">
            <label htmlFor='register' className="me-2">Don't have an account?</label>
            <button id='register' type='button' onClick={() => navigate('/register')} className='btn mb-3' style={{ background: "gray", color: 'white' }}>Register</button>
          </div>
        </div>
      </form>
    </div>
  )
}
