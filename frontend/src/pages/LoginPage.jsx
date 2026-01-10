import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      setApiError('');
      
      try {
        console.log("Sending login data:", values);

        const response = await axios.post('http://localhost:5000/api/login', {
            email: values.email,
            password: values.password
        });

        console.log("Success! User role:", response.data.role);

        const token = response.data.token || "demo-token-12345"; 
        
        localStorage.setItem('token', token);
        localStorage.setItem('user_role', response.data.role); 

        console.log("Saved to LocalStorage:", token, response.data.role); 

        if (response.data.role === 'Admin') {
            window.location.href = '/reports'; 
        } else {
            window.location.href = '/movies';
        }

      } catch (error) {
        console.error("Login error:", error);
        
        if (error.response && error.response.data) {
            setApiError(error.response.data.error || 'Login failed');
        } else if (error.message) {
            setApiError(error.message);
        } else {
            setApiError('Server is not responding');
        }
      }
    },
  });

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: '400px' }}>
        <h2 className="text-center mb-4">Login</h2>
        
        {apiError && <div className="alert alert-danger">{apiError}</div>}

        <form onSubmit={formik.handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="invalid-feedback">{formik.errors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className={`form-control ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="invalid-feedback">{formik.errors.password}</div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3">
            Log in
          </button>
          
          <div className="text-center">
             Don't have an account? <Link to="/register">Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;