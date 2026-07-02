import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { publicApi } from '../api/Axios';
import './Login.css';
import {GoogleIcon, LockIcon, EmailIcon, EyeIcon} from '../components/Icons';

const Form = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await publicApi.post('login/', { email, password });

      if (response.data.access) 
      {
          const storage = rememberMe ? localStorage : sessionStorage;
          
          storage.setItem('userToken', response.data.access);
          storage.setItem('refreshToken', response.data.refresh); // 💡 Save the refresh token too!
          
          navigate('/dashboard');
      }
      
      else {
        throw new Error('Token structure mismatch.');
      }
    } catch (error) {
      // 1. Check if it's a network error from the interceptor
      if (!error.response) {
        setErrorMessage(error.message);
        return;
      }

      // 2. You have full access to the raw backend response data right here!
      const serverError = error.response.data;
      setErrorMessage(serverError.detail|| 'Invalid email or password.');

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="form" onSubmit={handleLogin}>
        
        {errorMessage && (
          <div className="error-banner">⚠️ {errorMessage}</div>
        )}

        <div className="flex-column">
          <label>Email</label>
        </div>
        <div className="inputForm">
          <EmailIcon /> {/* Clean variable component */}
          <input 
            type="email" 
            className="input" 
            placeholder="Enter your Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="flex-column">
          <label>Password</label>
        </div>
        <div className="inputForm">
          <LockIcon />
          <input 
            type={showPassword ? "text" : "password"} 
            className="input" 
            placeholder="Enter your Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
            <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
            <EyeIcon isRevealed={showPassword} />
            </button>

        </div>

        <div className="flex-row">
          <div>
            <input 
              type="checkbox" 
              id="remember" 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember">Remember me</label>
          </div>
          <span className="span">Forgot password?</span>
        </div>

        <button type="submit" className="button-submit" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>

        <p className="p">Don't have an account? <span className="span">Sign Up</span></p>
        <p className="p line">Or</p>
        
        <div className="flex-row">
          <button type="button" className="btn google" disabled="true">
            <GoogleIcon /> <h3>Continue with Google</h3>
          </button>
          {/* <button type="button" className="btn apple">
            <AppleIcon /> Apple
          </button> */}
        </div>
      </form>
    </div>
  );
};


export default Form;