import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Components/page/login/login';
import Dashboard from './Components/page/dashboard/dashboard';
import ToolsList from './Components/page/toolslist/toolslist';  
import Tracking from './Components/page/tracking/tracking';    
import History from './Components/page/history/history';       
import Profile from './Components/page/profile/profile';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebar, setSidebar] = useState(true);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/" />; 
  };

  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login handleLogin={handleLogin} />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard sidebar={sidebar} />
            </PrivateRoute>
          }
        />
        <Route
          path="/toolslist"
          element={
            <PrivateRoute>
              <ToolsList sidebar={sidebar} />
            </PrivateRoute>
          }
        />
        <Route
          path="/tracking"
          element={
            <PrivateRoute>
              <Tracking sidebar={sidebar} />
            </PrivateRoute>
          }
        />
        <Route
          path="/history"
          element={
            <PrivateRoute>
              <History sidebar={sidebar} />
            </PrivateRoute>
          }
        />
       <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile sidebar={sidebar} />
            </PrivateRoute>
          }
        />


      </Routes>
    </Router>
  );
};

export default App;
