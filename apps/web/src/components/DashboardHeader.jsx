import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Dumbbell } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

import AIDoubtBot from "./AIDoubtBot"; // Import the bot

const DashboardHeader = () => {

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container mx-auto px-6 flex h-16 items-center justify-between">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-indigo-600" />
          <span className="font-bold text-lg">AI Math Tutor</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-3">

          <Button variant="outline" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link to="/lessons">Browse Lessons</Link>
          </Button>

          <Button variant="outline" asChild>
            <Link to="/practice">
              <Dumbbell className="mr-2 h-4 w-4" />
              Practice
            </Link>
          </Button>

          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>

        </div>

      </div>

      <AIDoubtBot /> {/* Add the bot to the dashboard */}
    </header>
  );
};

export default DashboardHeader;