import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      setApiError('');
      try {
        const response = await axios.post('http://localhost:5000/api/login', {
            email: values.email,
            password: values.password
        });

        console.log("Logged in!", response.data);

        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_role', response.data.role);
        }

        navigate('/reports'); 

      } catch (error) {
        console.error("Login error", error);
        if (error.response && error.response.data) {
            setApiError(error.response.data.message || 'Login failed');
        } else {
            setApiError('Server not responding');
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
            <label className="form-label">Email</label>
            <input 
                name="email" 
                type="email" 
                className="form-control" 
                onChange={formik.handleChange} 
                value={formik.values.email} 
            />
            
            {formik.errors.email && formik.touched.email ? (
                <div className="text-danger small">{formik.errors.email}</div>
            ) : null}
           </div>
           
           <div className="mb-3">
            <label className="form-label">Password</label>
            <input 
                name="password" 
                type="password" 
                className="form-control" 
                onChange={formik.handleChange} 
                value={formik.values.password} 
            />
            
            {formik.errors.password && formik.touched.password ? (
                <div className="text-danger small">{formik.errors.password}</div>
            ) : null}
           </div>

           <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;