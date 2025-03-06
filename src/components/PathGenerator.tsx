
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Clock, ArrowRight, Download, Loader2 } from 'lucide-react';
import { CurrentStateData } from './CurrentState';
import { DesiredStateData } from './DesiredState';

interface PathGeneratorProps {
  currentState: CurrentStateData;
  desiredState: DesiredStateData;
}

interface PlanStep {
  title: string;
  description: string;
  timeframe: string;
}

interface GeneratedPlan {
  summary: string;
  reasoning: string;
  timeframe: string;
  steps: PlanStep[];
}

const PathGenerator = ({ currentState, desiredState }: PathGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  
  const handleGeneratePlan = () => {
    setIsGenerating(true);
    
    // Simulate API call to OpenAI
    setTimeout(() => {
      // Mock response from AI
      const mockPlan: GeneratedPlan = {
        summary: "This personalized plan focuses on improving emotional resilience while advancing career goals and enhancing relationships. Each step builds on the previous one to create sustainable change.",
        reasoning: "Based on your input, I've identified that emotional wellbeing is foundational to your goals. The plan starts with daily mindfulness to build self-awareness, followed by relationship-building activities, and finally career development. This sequence allows each area to reinforce the others.",
        timeframe: "3 months",
        steps: [
          {
            title: "Daily Mindfulness Practice",
            description: "Begin with 10 minutes of daily meditation in the morning to create emotional awareness and stability. Use apps like Headspace or Calm to guide you.",
            timeframe: "Weeks 1-2"
          },
          {
            title: "Emotion Journal",
            description: "Keep a daily emotion journal to track patterns and triggers. Write three positive experiences each day to build gratitude practice.",
            timeframe: "Weeks 1-4"
          },
          {
            title: "Weekly Exercise Routine",
            description: "Establish a consistent exercise routine with 3 cardio sessions and 2 strength training sessions per week to improve physical wellbeing and reduce stress.",
            timeframe: "Weeks 2-12"
          },
          {
            title: "Professional Skill Development",
            description: "Identify one key professional skill to develop. Spend 3 hours weekly on coursework or practice to enhance career prospects.",
            timeframe: "Weeks 3-10"
          },
          {
            title: "Relationship Building",
            description: "Schedule one meaningful conversation with a friend or family member each week. Practice active listening and vulnerability.",
            timeframe: "Weeks 3-12"
          },
          {
            title: "Digital Detox Evenings",
            description: "Implement technology-free evenings twice weekly to improve mental clarity and be present with loved ones.",
            timeframe: "Weeks 4-12"
          },
          {
            title: "Career Vision Board",
            description: "Create a visual representation of your ideal career. Review weekly and adjust your actions accordingly.",
            timeframe: "Week 5"
          },
          {
            title: "Weekly Review & Adjustment",
            description: "Set aside 30 minutes each Sunday to review progress, celebrate wins, and adjust the coming week's activities as needed.",
            timeframe: "Weeks 1-12"
          }
        ]
      };
      
      setGeneratedPlan(mockPlan);
      setIsGenerating(false);
    }, 3000);
  };
  
  const areInputsValid = () => {
    return (
      currentState.emotional.trim() !== '' || 
      currentState.mental.trim() !== '' || 
      currentState.career.trim() !== '' || 
      currentState.relationships.trim() !== '' || 
      currentState.physical.trim() !== ''
    ) && (
      desiredState.emotional.trim() !== '' || 
      desiredState.mental.trim() !== '' || 
      desiredState.career.trim() !== '' || 
      desiredState.relationships.trim() !== '' || 
      desiredState.physical.trim() !== ''
    );
  };
  
  return (
    <Card className="w-full border-calm-100 shadow-sm">
      <CardHeader className="bg-calm-50 border-b border-calm-100">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-primary" />
          <CardTitle className="text-xl font-medium">AI-Generated Path</CardTitle>
        </div>
        <CardDescription>
          Create a personalized action plan to bridge the gap between your current and desired states
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {!generatedPlan ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 text-muted-foreground">
              <p className="text-lg mb-4">
                Our AI will analyze your current and desired states to create a personalized path forward.
              </p>
              <p>
                The plan will include concrete steps, a timeline, and reasoning behind each recommendation.
              </p>
            </div>
            
            <Button
              size="lg"
              onClick={handleGeneratePlan}
              disabled={isGenerating || !areInputsValid()}
              className="min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles size={20} className="mr-2" />
                  Generate My Path
                </>
              )}
            </Button>
            
            {!areInputsValid() && (
              <p className="text-sm text-muted-foreground mt-4">
                Please fill in information about your current and desired states to generate a plan.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Plan Summary</h3>
              <p className="text-muted-foreground">{generatedPlan.summary}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">AI Reasoning</h3>
              <p className="text-muted-foreground">{generatedPlan.reasoning}</p>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={18} />
              <span>Estimated timeframe: {generatedPlan.timeframe}</span>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Action Steps</h3>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {generatedPlan.steps.map((step, index) => (
                    <div key={index} className="border border-calm-100 rounded-xl p-4 bg-white">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white font-medium">
                          {index + 1}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">{step.title}</h4>
                          <p className="text-muted-foreground text-sm">{step.description}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-2">
                            <Clock size={14} className="mr-1" />
                            <span>{step.timeframe}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
      
      {generatedPlan && (
        <CardFooter className="bg-calm-50 border-t border-calm-100 p-4 flex justify-between items-center">
          <Button variant="outline" size="sm" className="gap-2">
            <Download size={16} />
            Download Plan
          </Button>
          <Button size="sm" className="gap-2">
            Take Action
            <ArrowRight size={16} />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PathGenerator;
