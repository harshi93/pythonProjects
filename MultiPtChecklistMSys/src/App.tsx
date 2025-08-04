import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChecklistProvider } from './contexts/ChecklistContext';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import theme from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ChecklistProvider>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </MainLayout>
        </Router>
      </ChecklistProvider>
    </ThemeProvider>
  );
}

export default App;
