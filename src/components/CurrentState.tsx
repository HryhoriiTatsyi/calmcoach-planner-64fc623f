
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
        <CardTitle className="text-xl font-medium">Поточний стан (Точка А)</CardTitle>
        <CardDescription>
          Опишіть вашу поточну ситуацію в різних сферах життя
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="emotional" className="w-full">
          <TabsList className="w-full justify-start p-0 rounded-none bg-calm-50/50 border-b border-calm-100">
            <TabsTrigger value="emotional" className="data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Heart size={16} className="mr-2" /> Емоційний
            </TabsTrigger>
            <TabsTrigger value="mental" className="data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Brain size={16} className="mr-2" /> Ментальний
            </TabsTrigger>
            <TabsTrigger value="career" className="data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Briefcase size={16} className="mr-2" /> Кар'єрний
            </TabsTrigger>
            <TabsTrigger value="relationships" className="data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Users size={16} className="mr-2" /> Стосунки
            </TabsTrigger>
            <TabsTrigger value="physical" className="data-[state=active]:bg-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
              <Activity size={16} className="mr-2" /> Фізичний
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="emotional" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="emotional-state">Як ви почуваєтеся емоційно?</Label>
              <Textarea 
                id="emotional-state" 
                placeholder="Опишіть ваш поточний емоційний стан, почуття та загальний настрій..."
                value={data.emotional}
                onChange={(e) => handleChange('emotional', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="mental" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="mental-state">Який ваш ментальний стан?</Label>
              <Textarea 
                id="mental-state" 
                placeholder="Опишіть ваш поточний ментальний стан, схеми мислення, фокус та ясність..."
                value={data.mental}
                onChange={(e) => handleChange('mental', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="career" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="career-state">Як ваша кар'єра чи професійне життя?</Label>
              <Textarea 
                id="career-state" 
                placeholder="Опишіть вашу поточну кар'єрну ситуацію, задоволення роботою, цілі та виклики..."
                value={data.career}
                onChange={(e) => handleChange('career', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="relationships" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="relationships-state">Як ваші стосунки?</Label>
              <Textarea 
                id="relationships-state" 
                placeholder="Опишіть ваші поточні стосунки з сім'єю, друзями, колегами та романтичними партнерами..."
                value={data.relationships}
                onChange={(e) => handleChange('relationships', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="physical" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="physical-state">Як ваше фізичне здоров'я?</Label>
              <Textarea 
                id="physical-state" 
                placeholder="Опишіть ваше поточне фізичне здоров'я, рівень енергії, звички щодо фізичних вправ та загальне самопочуття..."
                value={data.physical}
                onChange={(e) => handleChange('physical', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <div className="p-6 border-t border-calm-100">
            <div className="space-y-4">
              <Label htmlFor="needs" className="font-medium">Які конкретні потреби чи проблеми ви хотіли б вирішити?</Label>
              <Textarea 
                id="needs" 
                placeholder="Опишіть конкретні потреби або проблеми, які ви хочете вирішити за допомогою коучингу..."
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
