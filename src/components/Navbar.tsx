import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Fuel, Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (location.pathname === '/') {
      e.preventDefault();
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const isLandingPage = location.pathname === '/';
  
  const navClasses = isLandingPage
    ? scrolled
      ? "fixed top-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/30 shadow-sm transition-all duration-300"
      : "fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-transparent transition-all duration-300 py-2"
    : "fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/10 transition-all duration-300";

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Fuel className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              FuelFlow AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#features" onClick={(e) => handleNavClick(e, 'features')} className="text-app-text/60 hover:text-primary transition-colors font-medium">Features</Link>
            <Link to="/#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')} className="text-app-text/60 hover:text-primary transition-colors font-medium">How it Works</Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-all shadow-sm font-bold">
                  Dashboard
                </Link>
                <button onClick={logout} className="text-app-text/60 hover:text-red-600 transition-colors font-medium">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-app-text/60 hover:text-primary transition-colors font-medium">Login</Link>
                <Link to="/signup" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-all shadow-md font-bold">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-app-text/60">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white/90 backdrop-blur-md border-b border-primary/10 px-4 py-6 space-y-4"
          >
            <Link to="/#features" className="block text-app-text/80 font-medium" onClick={(e) => handleNavClick(e, 'features')}>Features</Link>
            <Link to="/#how-it-works" className="block text-app-text/80 font-medium" onClick={(e) => handleNavClick(e, 'how-it-works')}>How it Works</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block text-primary font-bold" onClick={() => setIsOpen(false)}>Dashboard</Link>
                <button onClick={() => { logout(); setIsOpen(false); }} className="block text-red-600 font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-app-text/80 font-medium" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/signup" className="block text-primary font-bold" onClick={() => setIsOpen(false)}>Sign Up</Link>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
