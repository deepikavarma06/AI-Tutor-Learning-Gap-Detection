import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  // Pages where header should be visible
  const allowedPages = ["/", "/login", "/signup"];

  // Hide header on other pages
  if (!allowedPages.includes(location.pathname)) {
    return null;
  }

  const navLinks = [
    { name: "Home", path: "/" },
  ];

  const NavItems = () => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          onClick={() => setIsOpen(false)}
          className={`text-sm font-medium transition-colors hover:text-primary ${
            location.pathname === link.path
              ? "text-primary"
              : "text-muted-foreground"
          }`}
        >
          {link.name}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">

        <Link to="/" className="flex items-center space-x-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">
            AI Math Tutor
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <NavItems />
        </nav>

        {/* Login / Signup buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </Button>

          <Button asChild>
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col space-y-4 mt-8">
                <NavItems />

                <div className="pt-4 border-t flex flex-col space-y-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      Login
                    </Link>
                  </Button>

                  <Button asChild className="w-full">
                    <Link to="/signup" onClick={() => setIsOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
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