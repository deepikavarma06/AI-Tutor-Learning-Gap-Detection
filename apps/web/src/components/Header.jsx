import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const Header = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  const navLinks = isAuthenticated ? [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Lessons', path: '/lessons' },
    { name: 'Practice', path: '/practice' },
    { name: 'Progress', path: '/progress' },
  ] : [
    { name: 'Home', path: '/' },
  ];

  const NavItems = () => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          onClick={() => setIsOpen(false)}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            location.pathname === link.path ||
            (location.pathname.startsWith(link.path) && link.path !== '/')
              ? 'text-primary' 
              : 'text-muted-foreground'
          }`}
        >
          {link.name}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">AI Math Tutor</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavItems />
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Hi, {currentUser?.name || 'Student'}
              </span>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
              <button onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                <NavItems />
                <div className="pt-4 border-t flex flex-col space-y-4">
                  {isAuthenticated ? (
                    <>
                      <span className="text-sm text-muted-foreground">
                        Hi, {currentUser?.name || 'Student'}
                      </span>
                      <Button variant="outline" onClick={handleLogout} className="w-full">Logout</Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full">
                        <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;