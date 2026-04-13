import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";
import { Helmet } from "react-helmet";
import { toast } from "sonner";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [loginType, setLoginType] = useState("email");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => unsub();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      await signInWithEmailAndPassword(auth, email, password);

      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const fakeEmail = `${phone}@phone.user`;

      await signInWithEmailAndPassword(auth, fakeEmail, password);

      toast.success("Login successful");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Invalid phone or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/30">
      <Helmet>
        <title>Login - AI Math Tutor</title>
      </Helmet>

      <Card className="w-full max-w-md shadow-lg border-none">

        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Welcome back
          </CardTitle>

          <CardDescription className="text-base">
            Sign in to continue your learning journey
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* GOOGLE LOGIN */}

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-11 font-medium bg-white"
              disabled={isLoading}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>

              Login with Google
            </Button>
          </div>

          {/* DIVIDER */}

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

          {/* LOGIN TYPE SWITCH */}

          <div className="flex gap-2">
            <Button
              type="button"
              variant={loginType === "email" ? "default" : "outline"}
              className="w-full"
              onClick={() => setLoginType("email")}
            >
              Email
            </Button>

            <Button
              type="button"
              variant={loginType === "phone" ? "default" : "outline"}
              className="w-full"
              onClick={() => setLoginType("phone")}
            >
              Phone
            </Button>
          </div>

          {/* EMAIL LOGIN */}

          {loginType === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-4">

              <div className="space-y-2">
                <Label>Email</Label>

                <Input
                  type="email"
                  placeholder="Email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>

                <Input
                  type="password"
                  placeholder="Your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11">
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

            </form>
          )}

          {/* PHONE LOGIN */}

          {loginType === "phone" && (
            <form onSubmit={handlePhoneLogin} className="space-y-4">

              <div className="space-y-2">
                <Label>Phone Number</Label>

                <Input
                  type="text"
                  placeholder="Phone number"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Password</Label>

                <Input
                  type="password"
                  placeholder="Your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <Button type="submit" className="w-full h-11">
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

            </form>
          )}

        </CardContent>

        <CardFooter className="flex justify-center pb-6">
          <div className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>

      </Card>
    </div>
  );
}