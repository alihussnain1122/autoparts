import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Notification from './Notification';
import useNotification from '../hooks/useNotification';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { notification, showNotification, hideNotification } = useNotification();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    showNotification('Logged out successfully');
    navigate('/login');
  };

  // Make notification system available globally
  useEffect(() => {
    window.showNotification = showNotification;
    return () => {
      delete window.showNotification;
    };
  }, [showNotification]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        toggleSidebar={toggleSidebar} 
        isSidebarOpen={isSidebarOpen} 
        onLogout={handleLogout}
      />
      <Sidebar isOpen={isSidebarOpen} />
      
      {/* Main content */}
      <div
        className={`transition-all duration-300 ease-in-out pt-16 ${
          isSidebarOpen ? 'lg:ml-64' : 'ml-0'
        }`}
      >
        <main className="p-6">
          {children || <Outlet />}
        </main>
      </div>
      
      <Notification notification={notification} onClose={hideNotification} />
    </div>
  );
};

export default Layout;