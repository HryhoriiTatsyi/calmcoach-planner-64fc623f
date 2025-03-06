
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Brain, CheckCircle2 } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
}

const mentalHealthQuestions: Question[] = [
  {
    id: 1,
    text: "Як часто ви відчуваєте стрес або тривогу?",
    options: ["Рідко або ніколи", "Іноді", "Досить часто", "Майже весь час"]
  },
  {
    id: 2,
    text: "Як би ви оцінили якість свого сну?",
    options: ["Відмінна", "Добра", "Задовільна", "Погана"]
  },
  {
    id: 3,
    text: "Як часто ви відчуваєте себе виснаженим або без енергії?",
    options: ["Рідко або ніколи", "Іноді", "Досить часто", "Майже весь час"]
  },
  {
    id: 4,
    text: "Наскільки легко вам сконцентруватися на завданнях?",
    options: ["Дуже легко", "Легко", "Не завжди легко", "Важко"]
  },
  {
    id: 5,
    text: "Чи відчуваєте ви радість від діяльності, яка раніше приносила задоволення?",
    options: ["Так, повною мірою", "Здебільшого так", "Не так як раніше", "Майже ні"]
  }
];

interface TestResult {
  currentState: string;
  desiredState: string;
}

interface MentalHealthTestProps {
  onComplete: (result: TestResult) => void;
}

const MentalHealthTest = ({ onComplete }: MentalHealthTestProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  
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

  const handleComplete = () => {
    setIsGenerating(true);
    
    // Замість OpenAI ми використовуємо заглушку для демонстрації
    setTimeout(() => {
      // Аналіз відповідей і генерація результату
      const result: TestResult = {
        currentState: "На основі ваших відповідей, здається, що ви переживаєте періоди підвищеної тривоги та помірного стресу. Ваш сон не завжди якісний, що може впливати на ваш рівень енергії та концентрацію протягом дня. Ви можете помічати, що деякі речі, які раніше приносили вам радість, зараз приносять менше задоволення.",
        desiredState: "Ідеальний ментальний стан, до якого варто прагнути: внутрішній спокій і стійкість до стресових ситуацій, здоровий сон, який дає відчуття відпочинку, енергія та мотивація для щоденних занять, здатність концентруватися та знаходити радість у повсякденних справах і хобі, що приносять задоволення."
      };
      
      setIsGenerating(false);
      setTestCompleted(true);
      onComplete(result);
    }, 2500);
  };
  
  const currentQuestion = mentalHealthQuestions[currentStep];
  const isLastQuestion = currentStep === mentalHealthQuestions.length - 1;
  const canProceed = currentQuestion && answers[currentQuestion.id] !== undefined;
  
  return (
    <Card className="w-full border-calm-100 shadow-sm overflow-hidden">
      <CardHeader className="bg-calm-50 border-b border-calm-100">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-primary" />
          <CardTitle className="text-xl font-medium">Тест ментального здоров'я</CardTitle>
        </div>
        <CardDescription>
          Цей тест допоможе оцінити поточний стан вашого ментального здоров'я та визначити бажаний стан
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {!testCompleted ? (
          currentStep < mentalHealthQuestions.length ? (
            <div className="space-y-6">
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 size={48} className="text-primary mb-4" />
              <h3 className="text-xl font-medium mb-2">Тест завершено!</h3>
              <p className="text-muted-foreground mb-6">
                Дякуємо за проходження тесту. Зараз Вікторія проаналізує ваші відповіді та підготує 
                персоналізовані рекомендації щодо вашого поточного та бажаного ментального стану.
              </p>
              
              <Button 
                size="lg" 
                onClick={handleComplete}
                disabled={isGenerating}
                className="min-w-[200px]"
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
          <div className="text-center py-8">
            <CheckCircle2 size={48} className="text-primary mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Аналіз завершено!</h3>
            <p className="text-muted-foreground">
              Результати тесту були використані для заповнення полів поточного та бажаного стану. 
              Тепер ви можете переглянути їх і за необхідності відредагувати.
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
          >
            Назад
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!canProceed}
          >
            {isLastQuestion ? "Завершити тест" : "Далі"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default MentalHealthTest;
