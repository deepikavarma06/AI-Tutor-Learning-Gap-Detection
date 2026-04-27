import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Sparkles, BookOpen, GraduationCap } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";

const LessonPlayer = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  
  const [slides, setSlides] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAISlides = async () => {
      try {
        setLoading(true);
        const cleanTopic = lessonId.replace(/_/g, ' ');
        
        const response = await fetch("http://localhost:3001/api/generate-slides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: cleanTopic }),
        });

        const data = await response.json();
        setSlides(data.slides || []);
      } catch (error) {
        console.error("Error fetching slides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAISlides();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-3xl text-center space-y-6">
        <div className="flex justify-center"><GraduationCap className="h-16 w-16 text-indigo-600 animate-bounce" /></div>
        <h2 className="text-2xl font-bold text-slate-800">AI is crafting your personal lesson...</h2>
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="flex justify-between"><Skeleton className="h-10 w-24" /><Skeleton className="h-10 w-24" /></div>
      </div>
    );
  }

  const currentSlide = slides[currentStep];
  const progress = ((currentStep + 1) / slides.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress and Header */}
        <div className="mb-8 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mb-1">Study Session</p>
              <h1 className="text-2xl font-bold text-slate-900">{lessonId.replace(/_/g, ' ')}</h1>
            </div>
            <span className="text-slate-400 font-bold text-sm">Slide {currentStep + 1} of {slides.length}</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2 bg-slate-200" 
            style={{ "--progress-background": "#4f46e5" }}
          />
        </div>

        {/* Slide Content Area */}
        <Card className="border-none shadow-2xl min-h-[450px] p-10 bg-white rounded-[2rem] flex flex-col justify-center transition-all duration-500">
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
            {/* Type Badge */}
            <div className="flex justify-start">
            <Badge className="bg-indigo-50 text-indigo-700 border-none px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {currentSlide?.type || "Learning"}
            </Badge>
            </div>
            
            {/* Heading */}
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            {currentSlide?.heading}
            </h2>
            
            {/* Content: Enforced 6-line spacing */}
            <div className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium">
            {/* We split by new lines or periods to ensure it looks like a clean list if needed */}
            {currentSlide?.content.split('. ').map((sentence, idx) => (
                <p key={idx} className="mb-4 last:mb-0">
                {sentence.trim()}{sentence.endsWith('.') ? '' : '.'}
                </p>
            ))}
            </div>
        </div>
        </Card>

        {/* Navigation Controls */}
        <div className="mt-10 flex justify-between items-center px-4">
          <Button 
            variant="ghost" 
            size="lg"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Previous
          </Button>

          <Button 
            size="lg"
            onClick={() => {
              if (currentStep < slides.length - 1) {
                setCurrentStep(prev => prev + 1);
              } else {
                navigate(`/quiz/${lessonId}`, { state: { topicName: lessonId.replace(/_/g, ' ') } });
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-10 shadow-lg shadow-indigo-200 py-6 text-lg font-bold"
          >
            {currentStep === slides.length - 1 ? "Start Master Quiz" : "Next Slide"}
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;