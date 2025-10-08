import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import store from './store';
import AppRoutes from './routes';
import ErrorBoundary from '../shared/components/ErrorBoundary';

/**
 * Main App Component
 * - Wraps the entire application with Redux Provider
 * - Provides ErrorBoundary for error handling
 * - Manages global app initialization
 */
function App() {
  useEffect(() => {
    // Any global app initialization can go here
    console.log('🚀 Application initialized');
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppRoutes />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
