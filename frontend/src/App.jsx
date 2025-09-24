// App.jsx
import React from 'react';
import { AuthProvider } from './contexts/AuthContext.jsx';
import AppRoutes from './routes/index.jsx';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
