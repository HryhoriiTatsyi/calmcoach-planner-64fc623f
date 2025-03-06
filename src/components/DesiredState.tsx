
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
        <CardTitle className="text-xl font-medium">Бажаний стан (Точка Б)</CardTitle>
        <CardDescription>
          Опишіть ваш бажаний майбутній стан у різних сферах життя
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
              <Label htmlFor="emotional-desired">Якого емоційного стану ви хочете досягти?</Label>
              <Textarea 
                id="emotional-desired" 
                placeholder="Опишіть ваш бажаний емоційний стан, почуття та загальний настрій..."
                value={data.emotional}
                onChange={(e) => handleChange('emotional', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="mental" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="mental-desired">Якого ментального стану ви хочете досягти?</Label>
              <Textarea 
                id="mental-desired" 
                placeholder="Опишіть ваш бажаний ментальний стан, схеми мислення, фокус та ясність..."
                value={data.mental}
                onChange={(e) => handleChange('mental', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="career" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="career-desired">Якого кар'єрного чи професійного стану ви хочете досягти?</Label>
              <Textarea 
                id="career-desired" 
                placeholder="Опишіть ваш бажаний кар'єрний стан, задоволення роботою, цілі та досягнення..."
                value={data.career}
                onChange={(e) => handleChange('career', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="relationships" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="relationships-desired">Якого стану стосунків ви хочете досягти?</Label>
              <Textarea 
                id="relationships-desired" 
                placeholder="Опишіть ваші бажані стосунки з сім'єю, друзями, колегами та романтичними партнерами..."
                value={data.relationships}
                onChange={(e) => handleChange('relationships', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="physical" className="p-6 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <Label htmlFor="physical-desired">Якого стану фізичного здоров'я ви хочете досягти?</Label>
              <Textarea 
                id="physical-desired" 
                placeholder="Опишіть ваш бажаний стан фізичного здоров'я, рівень енергії, звички щодо фізичних вправ та загальне самопочуття..."
                value={data.physical}
                onChange={(e) => handleChange('physical', e.target.value)}
                className="min-h-[120px]"
              />
            </div>
          </TabsContent>
          
          <div className="p-6 border-t border-calm-100">
            <div className="space-y-4">
              <Label htmlFor="timeframe" className="font-medium">Бажаний час для досягнення цих змін</Label>
              <Textarea 
                id="timeframe" 
                placeholder="Скільки часу, на вашу думку, вам потрібно, щоб досягти цих цілей? (наприклад, 21 день, 3 місяці, 6 місяців)"
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
