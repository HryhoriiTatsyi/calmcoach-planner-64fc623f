
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Brain, Briefcase, Users, Activity } from 'lucide-react';

export interface DesiredStateData {
  emotional: string;
  mental: string;
  career: string;
  relationships: string;
  physical: string;
  timeframe: string;
}

interface DesiredStateProps {
  data: DesiredStateData;
  onChange: (data: DesiredStateData) => void;
}

const DesiredState = ({ data, onChange }: DesiredStateProps) => {
  const handleChange = (field: keyof DesiredStateData, value: string) => {
    onChange({ ...data, [field]: value });
  };
  
  return (
    <Card className="w-full border-calm-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-calm-50 border-b border-calm-100">
        <CardTitle className="text-xl font-medium">Desired State (Point B)</CardTitle>
        <CardDescription>
          Describe your desired future state in different areas of your life
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
              <Label htmlFor="emotional-desired">What emotional state do you want to achieve?</Label>
              <Textarea 
                id="emotional-desired" 
                placeholder="Describe your desired emotional state, feelings, and overall mood..."
                value={data.emotional}
                onChange={(e) => handleChange('emotional', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="mental" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="mental-desired">What mental state do you want to achieve?</Label>
              <Textarea 
                id="mental-desired" 
                placeholder="Describe your desired mental state, thought patterns, focus, and clarity..."
                value={data.mental}
                onChange={(e) => handleChange('mental', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="career" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="career-desired">What career or professional state do you want to achieve?</Label>
              <Textarea 
                id="career-desired" 
                placeholder="Describe your desired career situation, job satisfaction, goals, and achievements..."
                value={data.career}
                onChange={(e) => handleChange('career', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="relationships" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="relationships-desired">What relationship state do you want to achieve?</Label>
              <Textarea 
                id="relationships-desired" 
                placeholder="Describe your desired relationships with family, friends, colleagues, and romantic partners..."
                value={data.relationships}
                onChange={(e) => handleChange('relationships', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="physical" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="physical-desired">What physical health state do you want to achieve?</Label>
              <Textarea 
                id="physical-desired" 
                placeholder="Describe your desired physical health, energy levels, exercise habits, and overall wellbeing..."
                value={data.physical}
                onChange={(e) => handleChange('physical', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <div className="p-6 border-t border-calm-100">
            <div className="space-y-4">
              <Label htmlFor="timeframe" className="font-medium">Desired timeframe to achieve these changes</Label>
              <Textarea 
                id="timeframe" 
                placeholder="How long do you feel you need to achieve these goals? (e.g., 21 days, 3 months, 6 months)"
                value={data.timeframe}
                onChange={(e) => handleChange('timeframe', e.target.value)}
                className="min-h-[80px]"
              />
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DesiredState;
