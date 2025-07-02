import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  // Set initial state based on screen width
  const getInitialSidebarState = () => window.innerWidth > 768;

  const [isSidebarOpen, setIsSidebarOpen] = useState(getInitialSidebarState);

  useEffect(() => {
    const handleResize = () => {
      // If resizing to mobile, collapse sidebar
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      }
      // If resizing to desktop, expand sidebar
      else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export default SidebarContext; 