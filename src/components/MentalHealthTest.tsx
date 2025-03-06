
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  },
  {
    id: 6,
    text: "Як би ви оцінили свою продуктивність на роботі або навчанні?",
    options: ["Відмінна", "Добра", "Задовільна", "Низька"]
  },
  {
    id: 7,
    text: "Наскільки задоволені ви своїми стосунками з близькими людьми?",
    options: ["Дуже задоволений", "Здебільшого задоволений", "Частково задоволений", "Не задоволений"]
  },
  {
    id: 8,
    text: "Як часто ви займаєтесь фізичними вправами або активним відпочинком?",
    options: ["Регулярно (3-5 разів на тиждень)", "Час від часу (1-2 рази на тиждень)", "Рідко", "Майже ніколи"]
  },
  {
    id: 9,
    text: "Наскільки ви задоволені своїм професійним розвитком?",
    options: ["Дуже задоволений", "Здебільшого задоволений", "Частково задоволений", "Не задоволений"]
  },
  {
    id: 10,
    text: "Як часто ви практикуєте техніки релаксації або медитації?",
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
    
    // Імітація запиту до AI для аналізу результатів тесту
    setTimeout(() => {
      // Аналіз відповідей і формування персоналізованого результату
      const emotionalScore = answers[1] || 0;
      const sleepScore = answers[2] || 0;
      const energyScore = answers[3] || 0;
      const focusScore = answers[4] || 0;
      const joyScore = answers[5] || 0;
      const productivityScore = answers[6] || 0;
      const relationshipsScore = answers[7] || 0;
      const exerciseScore = answers[8] || 0;
      const careerScore = answers[9] || 0;
      
      // Персоналізована відповідь на основі відповідей користувача
      const result: TestResult = {
        currentState: {
          emotional: getEmotionalState(emotionalScore, sleepScore, joyScore),
          mental: getMentalState(focusScore, energyScore),
          career: getCareerState(productivityScore, careerScore),
          relationships: getRelationshipsState(relationshipsScore),
          physical: getPhysicalState(exerciseScore, energyScore)
        },
        desiredState: {
          emotional: getDesiredEmotionalState(emotionalScore, sleepScore, joyScore),
          mental: getDesiredMentalState(focusScore, energyScore),
          career: getDesiredCareerState(productivityScore, careerScore),
          relationships: getDesiredRelationshipsState(relationshipsScore),
          physical: getDesiredPhysicalState(exerciseScore, energyScore)
        }
      };
      
      setIsGenerating(false);
      setTestCompleted(true);
      onComplete(result);
    }, 3000);
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
          Цей тест допоможе оцінити ваш поточний стан та визначити бажаний стан у різних сферах життя
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
                Дякуємо за проходження тесту. Зараз Вікторія проаналізує ваші відповіді 
                та підготує персоналізовані рекомендації щодо вашого поточного та бажаного стану.
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

// Функції для формування персоналізованих результатів
const getEmotionalState = (emotionalScore: number, sleepScore: number, joyScore: number) => {
  if (emotionalScore > 2 || sleepScore > 2) {
    return "Ви відчуваєте підвищений рівень стресу і тривоги, що може негативно впливати на ваше емоційне благополуччя. Ваш сон не завжди якісний, що може посилювати відчуття емоційного виснаження.";
  } else if (joyScore > 2) {
    return "Хоча ваш рівень стресу контрольований, ви помічаєте, що деякі речі, які раніше приносили радість, зараз дають менше задоволення. Це може свідчити про певне емоційне виснаження.";
  } else {
    return "Ваш емоційний стан здебільшого збалансований. Ви добре справляєтесь зі стресом, маєте якісний сон і здатні отримувати задоволення від звичних речей.";
  }
};

const getMentalState = (focusScore: number, energyScore: number) => {
  if (focusScore > 2 && energyScore > 2) {
    return "Вам часто важко зосередитися на завданнях і підтримувати фокус уваги. Ви відчуваєте нестачу ментальної енергії, що може впливати на продуктивність і прийняття рішень.";
  } else if (focusScore > 2 || energyScore > 2) {
    return "Ваша здатність до концентрації коливається. Бувають періоди, коли вам важко підтримувати фокус, особливо при стомленні. Ви маєте резерви ментальної енергії, але вони виснажуються швидше, ніж хотілося б.";
  } else {
    return "Ваш ментальний стан дозволяє вам добре концентруватися на завданнях. Ви маєте достатньо ментальної енергії для повсякденних справ і зазвичай приймаєте зважені рішення.";
  }
};

const getCareerState = (productivityScore: number, careerScore: number) => {
  if (productivityScore > 2 && careerScore > 2) {
    return "Ви відчуваєте незадоволення своїм професійним розвитком і помічаєте знижену продуктивність. Можливо, ви не бачите чіткого шляху кар'єрного зростання або працюєте не в тій сфері, яка відповідає вашим цінностям та інтересам.";
  } else if (productivityScore > 2 || careerScore > 2) {
    return "Хоча ви досягаєте певних результатів у професійній сфері, ви відчуваєте, що могли б реалізувати свій потенціал повніше. Ваша продуктивність коливається, і ви шукаєте способи привнести більше задоволення у свою робочу діяльність.";
  } else {
    return "Ви задоволені своїм професійним розвитком і зазвичай демонструєте високу продуктивність. Ваша робота відповідає вашим цінностям і дає відчуття реалізації.";
  }
};

const getRelationshipsState = (relationshipsScore: number) => {
  if (relationshipsScore > 2) {
    return "Ваші стосунки з близькими людьми потребують уваги. Можливо, ви відчуваєте нестачу глибокого зв'язку, розуміння або підтримки. Комунікація може бути ускладнена, що впливає на якість взаємодії.";
  } else if (relationshipsScore === 2) {
    return "Ваші стосунки здебільшого задовільні, але є сфери, які потребують розвитку. Можливо, ви хотіли б поглибити деякі зв'язки або покращити комунікацію в певних відносинах.";
  } else {
    return "Ви маєте здорові, підтримуючі стосунки з близькими людьми. Ви відчуваєте розуміння і підтримку, здатні відкрито спілкуватися і вирішувати конфлікти конструктивно.";
  }
};

const getPhysicalState = (exerciseScore: number, energyScore: number) => {
  if (exerciseScore > 2 && energyScore > 2) {
    return "Ви рідко займаєтесь фізичними вправами і часто відчуваєте нестачу енергії. Це може впливати на ваше загальне самопочуття, імунітет і здатність справлятися зі стресом.";
  } else if (exerciseScore > 2 || energyScore > 2) {
    return "Ваша фізична активність не є регулярною, і ви іноді відчуваєте зниження енергії. Ваше тіло потребує більше руху і кращого режиму відпочинку для оптимального функціонування.";
  } else {
    return "Ви підтримуєте добрий рівень фізичної активності і зазвичай маєте достатньо енергії для повсякденних справ. Ваше тіло отримує необхідне навантаження, що сприяє загальному здоров'ю.";
  }
};

const getDesiredEmotionalState = (emotionalScore: number, sleepScore: number, joyScore: number) => {
  if (emotionalScore > 2 || sleepScore > 2) {
    return "Баланс емоційного стану: регулярно практикувати техніки зниження стресу, покращити якість сну, знаходити час для занять, що приносять радість і задоволення. Розвивати емоційну стійкість для ефективного управління життєвими викликами.";
  } else if (joyScore > 2) {
    return "Відновлення здатності отримувати задоволення: знайти нові джерела радості та натхнення, відкрити для себе захоплюючі хобі, посилити практики вдячності у повсякденному житті.";
  } else {
    return "Зберегти наявний емоційний баланс, розвиваючи додаткові копінг-стратегії для майбутніх викликів. Продовжувати практики, що підтримують якісний сон та позитивні емоції.";
  }
};

const getDesiredMentalState = (focusScore: number, energyScore: number) => {
  if (focusScore > 2 && energyScore > 2) {
    return "Покращення ментальної ясності і фокусу: розвинути регулярні практики медитації уваги, створити оптимальне робоче середовище, навчитись правильно розподіляти ментальну енергію та відновлюватись.";
  } else if (focusScore > 2 || energyScore > 2) {
    return "Стабілізація здатності до концентрації: структурувати робочий процес для максимального використання періодів високої продуктивності, розвивати когнітивну гнучкість, практикувати техніки відновлення ментальної енергії.";
  } else {
    return "Підтримання високого рівня когнітивних функцій: регулярно включати нові інтелектуальні виклики, зберігати збалансований підхід до розподілу ментальної енергії, розвивати креативне мислення.";
  }
};

const getDesiredCareerState = (productivityScore: number, careerScore: number) => {
  if (productivityScore > 2 && careerScore > 2) {
    return "Переосмислення професійного шляху: визначити свої ключові таланти і сильні сторони, знайти сферу, що відповідає вашим цінностям, розробити чіткий план кар'єрного розвитку з конкретними кроками.";
  } else if (productivityScore > 2 || careerScore > 2) {
    return "Оптимізація професійної діяльності: виявити і усунути фактори, що знижують продуктивність, розробити стратегію професійного зростання, знайти додаткові джерела мотивації та задоволення від роботи.";
  } else {
    return "Подальший професійний розвиток: вивчити додаткові сфери спеціалізації, розширити професійну мережу, розпочати менторську діяльність або знайти нові виклики в поточній ролі.";
  }
};

const getDesiredRelationshipsState = (relationshipsScore: number) => {
  if (relationshipsScore > 2) {
    return "Трансформація відносин: розвивати навички ефективної комунікації, практикувати емпатичне слухання, навчитися виражати свої потреби і встановлювати здорові межі, поглиблювати емоційну інтимність з близькими.";
  } else if (relationshipsScore === 2) {
    return "Покращення якості стосунків: приділяти більше часу значущим відносинам, покращувати навички вирішення конфліктів, виявляти більше вразливості та відкритості з близькими людьми.";
  } else {
    return "Підтримка і розвиток наявних стосунків: продовжувати інвестувати в близькі зв'язки, розширювати коло спілкування, знаходити нові способи поглиблення взаєморозуміння з близькими.";
  }
};

const getDesiredPhysicalState = (exerciseScore: number, energyScore: number) => {
  if (exerciseScore > 2 && energyScore > 2) {
    return "Формування звички регулярної фізичної активності: розпочати з коротких, легких тренувань, поступово збільшуючи інтенсивність, знайти приємний вид фізичної активності, покращити режим харчування і сну для підвищення рівня енергії.";
  } else if (exerciseScore > 2 || energyScore > 2) {
    return "Встановлення стабільної системи фізичного здоров'я: створити регулярний розклад тренувань, що відповідає вашому способу життя, збалансувати фізичну активність з відпочинком, розробити стратегію для підтримки енергії протягом дня.";
  } else {
    return "Оптимізація фізичної форми: урізноманітнити тренування для всебічного розвитку, встановити нові фізичні цілі, впровадити практики активного відновлення і регенерації.";
  }
};

export default MentalHealthTest;
