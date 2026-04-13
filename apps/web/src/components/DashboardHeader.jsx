import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const DashboardHeader = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // redirect to homepage
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight">
            AI Math Tutor
          </span>
        </Link>

        {/* Logout Button */}
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>

      </div>
    </header>
  );
};

export default DashboardHeader;