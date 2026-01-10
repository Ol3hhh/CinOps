import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const RegisterSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email format').required('Email is required'),
  password: Yup.string().min(6, 'Min. 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values) => {
      setServerError('');
      try {
        const response = await axios.post('http://localhost:5000/api/register', {
          email: values.email,
          password: values.password,
          first_name: "New", 
          last_name: "User"
        });

        console.log("Registration successful:", response.data);
        alert("Account created! You can now login.");
        navigate('/login');

      } catch (error) {
        console.error("Registration error", error);
        if (error.response && error.response.data) {
            setServerError(error.response.data.message || 'Registration failed');
        } else {
            setServerError('Server connection error');
        }
      }
    },
  });

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 shadow" style={{ width: '400px' }}>
        <h2 className="text-center mb-4">Register</h2>

        {serverError && <div className="alert alert-danger">{serverError}</div>}
        
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

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className="invalid-feedback">{formik.errors.confirmPassword}</div>
            )}
          </div>

          <button type="submit" className="btn btn-success w-100 mb-3">
            Register
          </button>
          
          <div className="text-center">
            <small>Already have an account? <Link to="/login">Login</Link></small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;