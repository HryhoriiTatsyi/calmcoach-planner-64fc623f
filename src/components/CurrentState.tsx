
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Brain, Briefcase, Users, Activity } from 'lucide-react';

export interface CurrentStateData {
  emotional: string;
  mental: string;
  career: string;
  relationships: string;
  physical: string;
  needsToSolve: string;
}

interface CurrentStateProps {
  data: CurrentStateData;
  onChange: (data: CurrentStateData) => void;
}

const CurrentState = ({ data, onChange }: CurrentStateProps) => {
  const handleChange = (field: keyof CurrentStateData, value: string) => {
    onChange({ ...data, [field]: value });
  };
  
  return (
    <Card className="w-full border-calm-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-calm-50 border-b border-calm-100">
        <CardTitle className="text-xl font-medium">Current State (Point A)</CardTitle>
        <CardDescription>
          Describe your current situation in different areas of your life
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="emotional" className="w-full">
          <TabsList className="w-full justify-start p-0 rounded-none bg-calm-50/50 border-b border-calm-100">
            <TabsTrigger value="emotional" className="data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Heart size={16} className="mr-2" /> Emotional
            </TabsTrigger>
            <TabsTrigger value="mental" className="data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Brain size={16} className="mr-2" /> Mental
            </TabsTrigger>
            <TabsTrigger value="career" className="data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Briefcase size={16} className="mr-2" /> Career
            </TabsTrigger>
            <TabsTrigger value="relationships" className="data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Users size={16} className="mr-2" /> Relationships
            </TabsTrigger>
            <TabsTrigger value="physical" className="data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Activity size={16} className="mr-2" /> Physical
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="emotional" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="emotional-state">How are you feeling emotionally?</Label>
              <Textarea 
                id="emotional-state" 
                placeholder="Describe your current emotional state, feelings, and overall mood..."
                value={data.emotional}
                onChange={(e) => handleChange('emotional', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="mental" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="mental-state">How is your mental state?</Label>
              <Textarea 
                id="mental-state" 
                placeholder="Describe your current mental state, thought patterns, focus, and clarity..."
                value={data.mental}
                onChange={(e) => handleChange('mental', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="career" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="career-state">How is your career or professional life?</Label>
              <Textarea 
                id="career-state" 
                placeholder="Describe your current career situation, job satisfaction, goals, and challenges..."
                value={data.career}
                onChange={(e) => handleChange('career', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="relationships" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="relationships-state">How are your relationships?</Label>
              <Textarea 
                id="relationships-state" 
                placeholder="Describe your current relationships with family, friends, colleagues, and romantic partners..."
                value={data.relationships}
                onChange={(e) => handleChange('relationships', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="physical" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="physical-state">How is your physical health?</Label>
              <Textarea 
                id="physical-state" 
                placeholder="Describe your current physical health, energy levels, exercise habits, and overall wellbeing..."
                value={data.physical}
                onChange={(e) => handleChange('physical', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <div className="p-6 border-t border-calm-100">
            <div className="space-y-4">
              <Label htmlFor="needs" className="font-medium">What specific needs or issues would you like to address?</Label>
              <Textarea 
                id="needs" 
                placeholder="Describe the specific needs or issues you want to solve through coaching..."
                value={data.needsToSolve}
                onChange={(e) => handleChange('needsToSolve', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CurrentState;
