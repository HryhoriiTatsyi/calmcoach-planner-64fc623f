
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
    
    // Симуляція виклику API
    setTimeout(() => {
      // Відповідь від Вікторії
      const mockPlan: GeneratedPlan = {
        summary: "Цей персоналізований план фокусується на покращенні емоційної стійкості, досягненні кар'єрних цілей та поліпшенні стосунків. Кожен крок базується на попередньому, створюючи стійкі зміни.",
        reasoning: "На основі вашої інформації, я визначила, що емоційне благополуччя є основою для ваших цілей. План починається з щоденної усвідомленості для розвитку самосвідомості, продовжується діяльністю з розбудови відносин і завершується професійним розвитком. Така послідовність дозволяє кожній сфері підсилювати інші.",
        timeframe: "3 місяці",
        steps: [
          {
            title: "Щоденна практика усвідомленості",
            description: "Почніть з 10-хвилинної щоденної медитації вранці для створення емоційної свідомості та стабільності. Використовуйте додатки, як Headspace або Calm для керівництва.",
            timeframe: "Тижні 1-2"
          },
          {
            title: "Емоційний щоденник",
            description: "Ведіть щоденний емоційний щоденник для відстеження моделей та тригерів. Записуйте три позитивні переживання щодня для розвитку практики вдячності.",
            timeframe: "Тижні 1-4"
          },
          {
            title: "Щотижневий розклад вправ",
            description: "Встановіть постійний розклад вправ з 3 кардіо-сесіями та 2 тренуваннями силових вправ на тиждень для покращення фізичного самопочуття та зменшення стресу.",
            timeframe: "Тижні 2-12"
          },
          {
            title: "Розвиток професійних навичок",
            description: "Визначте одну ключову професійну навичку для розвитку. Витрачайте 3 години на тиждень на курси або практику для покращення кар'єрних перспектив.",
            timeframe: "Тижні 3-10"
          },
          {
            title: "Розбудова стосунків",
            description: "Заплануйте одну змістовну розмову з другом або членом сім'ї щотижня. Практикуйте активне слухання та вразливість.",
            timeframe: "Тижні 3-12"
          },
          {
            title: "Вечори цифрової детоксикації",
            description: "Впровадьте вечори без технологій двічі на тиждень для покращення ясності розуму та присутності з близькими.",
            timeframe: "Тижні 4-12"
          },
          {
            title: "Візуальна дошка кар'єри",
            description: "Створіть візуальне представлення вашої ідеальної кар'єри. Переглядайте щотижня та коригуйте свої дії відповідним чином.",
            timeframe: "Тиждень 5"
          },
          {
            title: "Щотижневий огляд і коригування",
            description: "Виділіть 30 хвилин щонеділі для огляду прогресу, святкування досягнень та коригування діяльності наступного тижня за потреби.",
            timeframe: "Тижні 1-12"
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
          <CardTitle className="text-xl font-medium">Персоналізований план від Вікторії</CardTitle>
        </div>
        <CardDescription>
          Отримайте персоналізований план дій для подолання розриву між вашим поточним та бажаним станами
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {!generatedPlan ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 text-muted-foreground">
              <p className="text-lg mb-4">
                Вікторія проаналізує ваш поточний та бажаний стани, щоб створити персоналізований шлях вперед.
              </p>
              <p>
                План включатиме конкретні кроки, часові рамки та обґрунтування кожної рекомендації.
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
                  Створення плану...
                </>
              ) : (
                <>
                  <Sparkles size={20} className="mr-2" />
                  Створити мій план
                </>
              )}
            </Button>
            
            {!areInputsValid() && (
              <p className="text-sm text-muted-foreground mt-4">
                Будь ласка, заповніть інформацію про ваш поточний та бажаний стани, щоб створити план.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Короткий огляд плану</h3>
              <p className="text-muted-foreground">{generatedPlan.summary}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Обґрунтування</h3>
              <p className="text-muted-foreground">{generatedPlan.reasoning}</p>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={18} />
              <span>Орієнтовний термін: {generatedPlan.timeframe}</span>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Кроки дій</h3>
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
            Завантажити план
          </Button>
          <Button size="sm" className="gap-2">
            Почати діяти
            <ArrowRight size={16} />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PathGenerator;
