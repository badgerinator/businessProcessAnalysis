import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, Home, List, Play, FileText } from 'lucide-react';
import useStore from '../store';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { darkMode, setDarkMode } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { path: '/', label: 'Ana Sayfa', icon: <Home size={20} /> },
    { path: '/interviews', label: 'Mülakatlar', icon: <List size={20} /> },
    { path: '/run', label: 'Mülakat', icon: <Play size={20} /> },
    { path: '/review', label: 'İnceleme', icon: <FileText size={20} /> },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 transition-colors duration-200">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleMobileMenu}
            >
              <Menu size={24} />
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <Play className="text-indigo-600 dark:text-indigo-400" size={24} />
              <span className="font-semibold text-xl">Mülakat Koçu</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path === '/run' || item.path === '/review' ? '#' : item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950'
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                onClick={(e) => {
                  if (item.path === '/run' || item.path === '/review') {
                    e.preventDefault();
                  }
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleDarkMode}
            title={darkMode ? 'Açık tema' : 'Koyu tema'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-zinc-800/50 dark:bg-black/50" onClick={toggleMobileMenu}>
          <div 
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-950 p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <Link to="/" className="flex items-center gap-2" onClick={toggleMobileMenu}>
                <Play className="text-indigo-600 dark:text-indigo-400" size={24} />
                <span className="font-semibold text-xl">Mülakat Koçu</span>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMobileMenu}
              >
                <Menu size={20} />
              </Button>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path === '/run' || item.path === '/review' ? '#' : item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  onClick={(e) => {
                    if (item.path === '/run' || item.path === '/review') {
                      e.preventDefault();
                    } else {
                      toggleMobileMenu();
                    }
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;