import React from 'react';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './components/LoginPage';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <LoginPage />
      </div>
    </AuthProvider>
  );
}

export default App;