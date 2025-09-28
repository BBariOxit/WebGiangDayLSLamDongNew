// App.jsx
import React from 'react';
import { AuthProvider } from './contexts/AuthContext.jsx';
import AppRoutes from './routes/index.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
