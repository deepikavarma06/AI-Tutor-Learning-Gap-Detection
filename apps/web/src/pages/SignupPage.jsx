import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator} from "@/components/ui/separator";
import { Helmet } from "react-helmet";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { auth, googleProvider } from "@/lib/firebase";

import {
  createUserWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { Label } from "recharts";


function SignupPage() {

  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [phone,setPhone] = useState("");
  const [password,setPassword] = useState("");

  const [isLoading,setIsLoading] = useState(false);

  const [mode,setMode] = useState("email");



  const handleGoogleSignup = async () => {
    try{

      setIsLoading(true);

      await signInWithPopup(auth,googleProvider);

      navigate("/dashboard");

    }catch(error){

      console.error("Google signup error:",error);

    }finally{
      setIsLoading(false);
    }
  };



  const handleEmailSignup = async (e) => {

    e.preventDefault();

    try{

      setIsLoading(true);

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      navigate("/dashboard");

    }catch(error){

      console.error("Email signup error:",error);

    }finally{
      setIsLoading(false);
    }

  };



  const handlePhoneSignup = async (e) => {

    e.preventDefault();

    try{

      setIsLoading(true);

      console.log("Phone signup simulated:",{
        name,
        phone,
        password
      });

      navigate("/dashboard");

    }catch(error){

      console.error(error);

    }finally{
      setIsLoading(false);
    }

  };



  return (

    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/30">
      <Helmet>
        <title>Sign Up - AI Math Tutor</title>
      </Helmet>

      <Card className="w-full max-w-md shadow-lg border-none">

        <CardHeader className="space-y-2 text-center pb-6">

          <CardTitle className="text-3xl font-bold tracking-tight">
            Create an account
          </CardTitle>

          <CardDescription className="text-base">
            Enter your details to get started
          </CardDescription>

        </CardHeader>

        <CardContent className="space-y-6">

          <Button
            onClick={handleGoogleSignup}
            variant="outline"
            className="w-full flex items-center justify-center gap-3 bg-white text-black border"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              className="w-5 h-5"
            />
            Sign Up with Google
          </Button>



          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>

            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue
              </span>
            </div>
          </div>

          <div className="flex gap-2 ">

            <Button
              type="button"
              variant={mode==="email" ? "default":"outline"}
              className="w-full"
              onClick={()=>setMode("email")}
            >
              Email
            </Button>

            <Button
              type="button"
              variant={mode==="phone" ? "default":"outline"}
              className="w-full"
              onClick={()=>setMode("phone")}
            >
              Phone
            </Button>

          </div>



          {mode==="email" && (

            <form
              onSubmit={handleEmailSignup}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Full Name </Label>

                <Input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>

                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  required
                />

              </div>

              <div className="space-y-2">
                <Label>Password</Label>

                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  required
                />

              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Sign Up"}
              </Button>

            </form>

          )}



          {mode==="phone" && (

            <form
              onSubmit={handlePhoneSignup}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Full Name </Label>

                <Input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>

                <Input
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e)=>setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>

                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Sign Up"}
              </Button>

            </form>

          )}



          <div className="text-center text-sm">

            Already have an account?{" "}

            <Link
              to="/login"
              className="text-primary font-medium"
            >
              Login
            </Link>

          </div>

        </CardContent>

      </Card>

    </div>

  );

}

export default SignupPage;