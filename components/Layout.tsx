
import React from 'react';
import { Page } from '../types';
import { useAuth } from '../context/AuthContext';
import Login from './Login';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const NavItem: React.FC<{
  page: Page;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}> = ({ page, currentPage, setCurrentPage }) => {
  const isActive = currentPage === page;
  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`px-4 py-2 text-sm rounded-md transition-colors duration-200 ${
        isActive
          ? 'bg-gray-700 text-white'
          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {page}
    </button>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage }) => {
  const navItems = [Page.Dashboard, Page.Image, Page.Video, Page.Gallery, Page.Social, Page.Billing];
  const { user, signOut } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#0A1024] text-gray-200 font-sans">
      <header className="sticky top-0 z-20 bg-[#111827] bg-opacity-50 backdrop-blur-sm border-b border-gray-800">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">Photo Studio</h1>
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((page) => (
                <NavItem
                  key={page}
                  page={page}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300 hidden sm:block">Welcome, {user.name}</span>
            {user.picture && <img src={user.picture} alt="User profile" className="w-8 h-8 rounded-full" />}
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm rounded-md bg-gray-600 hover:bg-gray-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </header>
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;