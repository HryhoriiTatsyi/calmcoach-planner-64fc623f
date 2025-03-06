
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Clock, ArrowRight, Download, Loader2, AlertCircle } from 'lucide-react';
import { CurrentStateData } from './CurrentState';
import { DesiredStateData } from './DesiredState';
import { generateActionPlan } from '../services/openAiService';
import { useToast } from '@/components/ui/use-toast';
import ApiKeyInput from './ApiKeyInput';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [apiKeySet, setApiKeySet] = useState(!!localStorage.getItem('openai_api_key'));
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleGeneratePlan = async () => {
    if (!apiKeySet) {
      toast({
        title: "API-ключ відсутній",
        description: "Будь ласка, введіть свій API-ключ OpenAI для продовження",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Використовуємо OpenAI API для генерації плану
      const plan = await generateActionPlan(currentState, desiredState);
      setGeneratedPlan(plan);
    } catch (error: any) {
      setError(error.message || "Не вдалося згенерувати план. Перевірте свій API-ключ та спробуйте знову.");
      toast({
        title: "Помилка генерації",
        description: error.message || "Не вдалося згенерувати план. Перевірте свій API-ключ та спробуйте знову.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownloadPlan = () => {
    if (!generatedPlan) return;
    
    const planText = `
ПЕРСОНАЛІЗОВАНИЙ ПЛАН ВІД ВІКТОРІЇ

КОРОТКИЙ ОГЛЯД:
${generatedPlan.summary}

ОБҐРУНТУВАННЯ:
${generatedPlan.reasoning}

ОРІЄНТОВНИЙ ТЕРМІН: ${generatedPlan.timeframe}

КРОКИ ДІЙ:
${generatedPlan.steps.map((step, index) => `
${index + 1}. ${step.title}
   ${step.description}
   Часові рамки: ${step.timeframe}
`).join('')}
    `;
    
    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'План_від_Вікторії.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
  
  if (!apiKeySet) {
    return (
      <ApiKeyInput onApiKeySet={() => setApiKeySet(true)} />
    );
  }
  
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
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Помилка</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
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
              type="button" // Додаємо тип "button", щоб запобігти перезавантаженню сторінки
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
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleDownloadPlan}
          >
            <Download size={16} />
            Завантажити план
          </Button>
          <Button 
            size="sm" 
            className="gap-2"
            onClick={() => window.open('https://www.instagram.com/viktoria_lifecoach?igsh=bjlieHU1MHdraXlh&utm_source=qr', '_blank')}
          >
            Почати діяти
            <ArrowRight size={16} />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PathGenerator;
