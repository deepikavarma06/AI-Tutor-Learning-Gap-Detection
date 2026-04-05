import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Brain, Target, TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>AI Math Tutor - Learn at Your Pace</title>
        <meta name="description" content="Personalized AI Math Tutor that adapts to your learning style." />
      </Helmet>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1516383274235-5f42d6c6426d" 
              alt="Student studying math" 
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-balance">
              Master Math with Your <span className="text-primary">Personal AI Tutor</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance">
              Adaptive learning that identifies your weak spots and creates a personalized path to mastery. Learn at your own pace, on your own terms.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild className="text-lg px-8">
                <Link
                  to="/signup"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg"
                >
                  Get Started Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8">
                <Link
                  to="/login"
                  className="px-6 py-3 border rounded-lg"
                >
                  Login
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Our intelligent system adapts to your unique learning style.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-card p-8 rounded-2xl shadow-sm border">
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                  <Brain className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Adaptive Learning</h3>
                <p className="text-muted-foreground">Lessons automatically adjust in difficulty based on your performance, ensuring you're always challenged but never overwhelmed.</p>
              </div>

              <div className="bg-card p-8 rounded-2xl shadow-sm border">
                <div className="h-12 w-12 bg-destructive/10 rounded-xl flex items-center justify-center mb-6 text-destructive">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Gap Detection</h3>
                <p className="text-muted-foreground">Our AI identifies exactly which concepts you're struggling with and recommends targeted practice to fill those knowledge gaps.</p>
              </div>

              <div className="bg-card p-8 rounded-2xl shadow-sm border">
                <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-6 text-secondary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Progress Tracking</h3>
                <p className="text-muted-foreground">Watch your mastery grow with detailed analytics and visual progress reports that keep you motivated.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;