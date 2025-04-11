import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../createClient';
import './login.css';

const Login = ({ handleLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);


      // Then try to authenticate
      const { data: user, error: loginError } = await supabase
        .from('users')  // Changed from 'users' to 'User'
        .select('username, password, role')
        .eq('username', username.trim())
        .maybeSingle();  // Use maybeSingle() instead of single()

      if (loginError) {
        console.error('Login query error:', loginError);
        throw new Error('Invalid username');
      }

      if (!user) {
        throw new Error('Invalid username or password');
      }


      // Check password
      if (user.password !== password) {
        throw new Error('Invalid password');
      }

      // If we get here, login is successful
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('username', user.username);
      handleLogin();
      navigate('/dashboard', { replace: true });

    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-container'>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;