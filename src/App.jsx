/**
 * App — root komponen yang membungkus seluruh provider global:
 * BrowserRouter, AuthContext, dan NotificationContext.
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppRoutes } from './routes/AppRoutes';
import { initMockDb } from './data/mockDb';

// Inisialisasi mock database (seed data) sekali saat app boot
initMockDb();

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
