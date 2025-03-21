
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Brain, CheckCircle2 } from 'lucide-react';
import { generateMentalHealthTest, UserInfo } from '../services/openAiService';
import { useToast } from '@/components/ui/use-toast';
import ApiKeyInput from './ApiKeyInput';
import UserInfoForm from './UserInfoForm';

interface Question {
  id: number;
  text: string;
  options: string[];
}

const mentalHealthQuestions: Question[] = [
  {
    id: 1,
    text: "Як часто ти відчуваєш стрес або тривогу?",
    options: ["Рідко або ніколи", "Іноді", "Досить часто", "Майже весь час"]
  },
  {
    id: 2,
    text: "Як би ти оцінив(ла) якість свого сну?",
    options: ["Відмінна", "Добра", "Задовільна", "Погана"]
  },
  {
    id: 3,
    text: "Як часто ти відчуваєш себе виснаженим або без енергії?",
    options: ["Рідко або ніколи", "Іноді", "Досить часто", "Майже весь час"]
  },
  {
    id: 4,
    text: "Наскільки легко тобі сконцентруватися на завданнях?",
    options: ["Дуже легко", "Легко", "Не завжди легко", "Важко"]
  },
  {
    id: 5,
    text: "Чи відчуваєш ти радість від діяльності, яка раніше приносила задоволення?",
    options: ["Так, повною мірою", "Здебільшого так", "Не так як раніше", "Майже ні"]
  },
  {
    id: 6,
    text: "Як би ти оцінив(ла) свою продуктивність на роботі або навчанні?",
    options: ["Відмінна", "Добра", "Задовільна", "Низька"]
  },
  {
    id: 7,
    text: "Наскільки ти задоволений(а) своїми стосунками з близькими людьми?",
    options: ["Дуже задоволений(а)", "Здебільшого задоволений(а)", "Частково задоволений(а)", "Не задоволений(а)"]
  },
  {
    id: 8,
    text: "Як часто ти займаєшся фізичними вправами або активним відпочинком?",
    options: ["Регулярно (3-5 разів на тиждень)", "Час від часу (1-2 рази на тиждень)", "Рідко", "Майже ніколи"]
  },
  {
    id: 9,
    text: "Наскільки ти задоволений(а) своїм професійним розвитком?",
    options: ["Дуже задоволений(а)", "Здебільшого задоволений(а)", "Частково задоволений(а)", "Не задоволений(а)"]
  },
  {
    id: 10,
    text: "Як часто ти практикуєш техніки релаксації або медитації?",
    options: ["Регулярно", "Час від часу", "Рідко", "Ніколи"]
  }
];

interface TestResult {
  currentState: {
    emotional: string;
    mental: string;
    career: string;
    relationships: string;
    physical: string;
  };
  desiredState: {
    emotional: string;
    mental: string;
    career: string;
    relationships: string;
    physical: string;
  };
}

interface MentalHealthTestProps {
  onComplete: (result: TestResult, userInfo: UserInfo) => void;
}

const MentalHealthTest = ({ onComplete }: MentalHealthTestProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [apiKeySet, setApiKeySet] = useState(!!localStorage.getItem('openai_api_key') || !!import.meta.env.VITE_OPENAI_API_KEY);
  const { toast } = useToast();
  
  useEffect(() => {
    const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (envApiKey && !apiKeySet) {
      setApiKeySet(true);
    }
  }, [apiKeySet]);
  
  const handleAnswer = (questionId: number, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };
  
  const handleNext = () => {
    if (currentStep < mentalHealthQuestions.length) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleUserInfoComplete = (info: UserInfo) => {
    setUserInfo(info);
    setShowUserInfo(false);
  };

  const handleComplete = async () => {
    if (!apiKeySet) {
      toast({
        title: "API-ключ відсутній",
        description: "Будь ласка, введи свій API-ключ OpenAI для продовження",
        variant: "destructive",
      });
      return;
    }

    if (!userInfo) {
      toast({
        title: "Інформація користувача відсутня",
        description: "Будь ласка, введи свою особисту інформацію перед продовженням",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const result = await generateMentalHealthTest(answers, userInfo);
      
      setIsGenerating(false);
      setTestCompleted(true);
      onComplete(result, userInfo);
    } catch (error: any) {
      setIsGenerating(false);
      toast({
        title: "Помилка генерації",
        description: error.message || "Не вдалося згенерувати результати тесту. Перевір свій API-ключ та спробуй знову.",
        variant: "destructive",
      });
    }
  };
  
  if (!apiKeySet) {
    return (
      <ApiKeyInput onApiKeySet={() => setApiKeySet(true)} />
    );
  }

  if (showUserInfo) {
    return (
      <UserInfoForm onComplete={handleUserInfoComplete} />
    );
  }
  
  const currentQuestion = mentalHealthQuestions[currentStep];
  const isLastQuestion = currentStep === mentalHealthQuestions.length - 1;
  const canProceed = currentQuestion && answers[currentQuestion.id] !== undefined;
  
  return (
    <Card className="w-full border-calm-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-calm-50 border-b border-calm-100 py-4">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-primary" />
          <CardTitle className="text-xl font-medium">Тест ментального здоров'я</CardTitle>
        </div>
        <CardDescription>
          Цей тест допоможе оцінити твій поточний стан та визначити бажаний стан у різних сферах життя
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-5">
        {!testCompleted ? (
          currentStep < mentalHealthQuestions.length ? (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Питання {currentStep + 1} з {mentalHealthQuestions.length}</span>
                <span>Заповнено: {Math.round(Object.keys(answers).length / mentalHealthQuestions.length * 100)}%</span>
              </div>
              
              <div className="h-2 bg-calm-50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300" 
                  style={{ width: `${Math.round(Object.keys(answers).length / mentalHealthQuestions.length * 100)}%` }}
                ></div>
              </div>
              
              <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
              
              <RadioGroup 
                value={answers[currentQuestion.id]?.toString()} 
                onValueChange={(value) => handleAnswer(currentQuestion.id, parseInt(value))}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${currentQuestion.id}-${index}`} />
                    <Label htmlFor={`option-${currentQuestion.id}-${index}`} className="cursor-pointer">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-medium mb-2">Тест завершено!</h3>
              <p className="text-muted-foreground mb-5">
                Дякуємо за проходження тесту. Зараз Вікторія проаналізує твої відповіді 
                та підготує персоналізовані рекомендації щодо твого поточного та бажаного стану.
              </p>
              
              <Button 
                size="lg" 
                onClick={handleComplete}
                disabled={isGenerating}
                className="min-w-[200px]"
                type="button"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Аналізуємо результати...
                  </>
                ) : "Отримати результати"}
              </Button>
            </div>
          )
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 size={48} className="text-primary mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Аналіз завершено!</h3>
            <p className="text-muted-foreground">
              Результати тесту були використані для заповнення полів поточного та бажаного стану. 
              Тепер ти можеш переглянути їх і за необхідності відредагувати.
            </p>
          </div>
        )}
      </CardContent>
      
      {currentStep < mentalHealthQuestions.length && !testCompleted && (
        <CardFooter className="bg-calm-50 border-t border-calm-100 p-4 flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 0}
            type="button"
          >
            Назад
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!canProceed}
            type="button"
          >
            {isLastQuestion ? "Завершити тест" : "Далі"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default MentalHealthTest;
