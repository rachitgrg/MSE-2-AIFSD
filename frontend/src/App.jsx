import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login    from './pages/Login';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }) =>
  localStorage.getItem('token') ? children : <Navigate to="/login" replace />;

const PublicRoute = ({ children }) =>
  localStorage.getItem('token') ? <Navigate to="/dashboard" replace /> : children;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
