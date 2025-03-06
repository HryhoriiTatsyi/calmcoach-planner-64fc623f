
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Clock, ArrowRight, Download, Loader2, AlertCircle, Music } from 'lucide-react';
import { CurrentStateData } from './CurrentState';
import { DesiredStateData } from './DesiredState';
import { generateActionPlan, generateMotivationalSong, UserInfo } from '../services/openAiService';
import { useToast } from '@/components/ui/use-toast';
import ApiKeyInput from './ApiKeyInput';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import SunoApiKeyInput from './SunoApiKeyInput';
import { Progress } from '@/components/ui/progress';

interface PathGeneratorProps {
  currentState: CurrentStateData;
  desiredState: DesiredStateData;
  userInfo: UserInfo | null;
}

interface Step {
  title: string;
  description: string;
  timeframe: string;
}

interface GeneratedPlan {
  summary: string;
  reasoning: string;
  timeframe: string;
  steps: Step[];
}

interface SongProgress {
  isGenerating: boolean;
  stage: 'lyrics' | 'audio' | 'complete';
  progress: number;
  message: string;
}

const PathGenerator = ({ currentState, desiredState, userInfo }: PathGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [apiKeySet, setApiKeySet] = useState(!!localStorage.getItem('openai_api_key'));
  const [sunoApiKeySet, setSunoApiKeySet] = useState(!!localStorage.getItem('suno_api_key'));
  const [error, setError] = useState<string | null>(null);
  const [songProgress, setSongProgress] = useState<SongProgress | null>(null);
  const { toast } = useToast();
  
  const generateSongAfterPlan = async () => {
    if (!userInfo) return;
    
    try {
      // Встановлюємо стан прогресу для генерації тексту пісні
      setSongProgress({
        isGenerating: true,
        stage: 'lyrics',
        progress: 10,
        message: 'Генеруємо текст пісні...'
      });
      
      // Генеруємо текст пісні
      const songData = await generateMotivationalSong(currentState, desiredState, userInfo);
      
      // Оновлюємо прогрес після генерації тексту
      setSongProgress({
        isGenerating: true,
        stage: 'audio',
        progress: 40,
        message: 'Створюємо аудіо пісні...'
      });
      
      // Генеруємо аудіо пісні
      await generateAudio(songData);
      
      // Завершуємо процес
      setSongProgress({
        isGenerating: false,
        stage: 'complete',
        progress: 100,
        message: 'Генерація завершена!'
      });
      
      // Відкладене скидання індикатора прогресу
      setTimeout(() => {
        setSongProgress(null);
      }, 3000);
      
    } catch (error: any) {
      console.error('Помилка при генерації пісні:', error);
      
      // Скидаємо стан прогресу у випадку помилки
      setSongProgress(null);
      
      toast({
        title: "Пісня не згенерована",
        description: "Процес генерації пісні завершився з помилкою, але план дій успішно створено",
        variant: "destructive",
      });
    }
  };
  
  const generateAudio = async (songData: { title: string, lyrics: string }) => {
    const sunoApiKey = localStorage.getItem('suno_api_key');
    
    if (!sunoApiKey) {
      throw new Error('API ключ не знайдено. Будь ласка, введіть свій ключ у відповідному полі.');
    }
    
    // Використовуємо AbortController для таймауту запиту
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch('https://apibox.erweima.ai/api/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${sunoApiKey}`
        },
        body: JSON.stringify({
          prompt: songData.lyrics,
          style: "Pop",
          title: songData.title,
          customMode: true,
          instrumental: false,
          model: "V4",
          callBackUrl: "https://no-callback.com"
        }),
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ msg: response.statusText }));
        throw new Error(`Помилка API: ${errorData.msg || response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.code !== 200 || !data.data?.taskId) {
        throw new Error(`Помилка API: ${data.msg || 'Невідома помилка'}`);
      }
      
      // Починаємо опитування статусу завдання
      await pollTaskStatus(data.data.taskId);
      
      // Відправляємо електронний лист з інформацією
      await sendEmailWithUserData();
      
    } catch (fetchError: any) {
      if (fetchError.name === 'AbortError') {
        throw new Error('Запит до API перевищив час очікування. Будь ласка, спробуйте ще раз.');
      } else if (fetchError.message === 'Failed to fetch') {
        throw new Error('Неможливо з\'єднатися з API. Перевірте своє інтернет-з\'єднання, коректність API ключа або спробуйте пізніше.');
      } else {
        throw fetchError;
      }
    }
  };
  
  const pollTaskStatus = (taskId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      let pollingCount = 0;
      const maxPollingAttempts = 12; // 1 хвилина (12 * 5 секунд)
      
      const pollInterval = setInterval(async () => {
        try {
          pollingCount++;
          
          // Оновлюємо прогрес на основі кількості спроб
          const progressValue = Math.min(40 + (pollingCount * 5), 95);
          setSongProgress(prev => prev ? {
            ...prev,
            progress: progressValue,
            message: `Створюємо аудіо пісні... ${Math.round(progressValue)}%`
          } : null);
          
          const sunoApiKey = localStorage.getItem('suno_api_key');
          
          if (!sunoApiKey) {
            clearInterval(pollInterval);
            reject(new Error('API ключ не знайдено. Будь ласка, введіть свій ключ у відповідному полі.'));
            return;
          }
          
          const response = await fetch(`https://apibox.erweima.ai/api/v1/generate/record-info?taskId=${taskId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${sunoApiKey}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ msg: response.statusText }));
            throw new Error(`Помилка API: ${errorData.msg || response.statusText}`);
          }
          
          const data = await response.json();
          
          if (data.code !== 200) {
            throw new Error(`Помилка API: ${data.msg}`);
          }
          
          if (data.data?.status === 'SUCCESS' && data.data.response?.sunoData && data.data.response.sunoData.length > 0) {
            clearInterval(pollInterval);
            resolve();
            return;
          } else if (data.data?.errorMessage || 
                    data.data?.status === 'CREATE_TASK_FAILED' || 
                    data.data?.status === 'GENERATE_AUDIO_FAILED' || 
                    data.data?.status === 'CALLBACK_EXCEPTION' || 
                    data.data?.status === 'SENSITIVE_WORD_ERROR') {
            clearInterval(pollInterval);
            reject(new Error(`Помилка при генерації аудіо: ${data.data.errorMessage || data.data.status}`));
            return;
          }
          
          // Якщо перевищено максимальну кількість спроб
          if (pollingCount >= maxPollingAttempts) {
            clearInterval(pollInterval);
            resolve(); // Завершуємо опитування, але не вважаємо це помилкою
          }
          
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, 5000);
    });
  };
  
  const sendEmailWithUserData = async () => {
    try {
      // Створюємо об'єкт з даними для відправки
      const emailData = {
        to: 'vikktin@gmail.com',
        subject: `Нові дані коучинг-сесії від ${userInfo?.name || 'користувача'}`,
        text: `
          Ім'я: ${userInfo?.name || 'Не вказано'}
          Вік: ${userInfo?.age || 'Не вказано'}
          Стать: ${userInfo?.gender || 'Не вказано'}
          
          Поточний стан:
          ${JSON.stringify(currentState, null, 2)}
          
          Бажаний стан:
          ${JSON.stringify(desiredState, null, 2)}
          
          Ця інформація була згенерована автоматично.
        `
      };
      
      // У реальному проекті тут був би код для відправки електронної пошти
      // Оскільки ми не маємо бекенду, просто логуємо дані
      console.log('Дані для відправки на email:', emailData);
      
    } catch (error) {
      console.error('Помилка при спробі відправити email:', error);
    }
  };
  
  const handleGeneratePlan = async () => {
    if (!apiKeySet) {
      toast({
        title: "API-ключ відсутній",
        description: "Будь ласка, введіть свій API-ключ OpenAI для продовження",
        variant: "destructive",
      });
      return;
    }

    if (!userInfo) {
      toast({
        title: "Персональна інформація відсутня",
        description: "Будь ласка, пройдіть тест ментального здоров'я щоб внести персональну інформацію",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Використовуємо OpenAI API для генерації плану
      const plan = await generateActionPlan(currentState, desiredState, userInfo);
      setGeneratedPlan(plan);
      
      // Запускаємо автоматичну генерацію пісні як бонусу
      generateSongAfterPlan();
      
      toast({
        title: "План згенеровано успішно",
        description: "Ваш персоналізований план дій готовий. Розпочалась генерація бонусної пісні!",
      });
      
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
  
  const downloadPlan = () => {
    if (!generatedPlan) return;
    
    // Створюємо текстовий вміст для документу
    let content = `ПЕРСОНАЛІЗОВАНИЙ ПЛАН ДІЙ\n\n`;
    content += `Для: ${userInfo?.name || 'Користувача'}\n`;
    content += `Вік: ${userInfo?.age || 'Не вказано'}\n`;
    content += `Стать: ${userInfo?.gender || 'Не вказано'}\n\n`;
    content += `РЕЗЮМЕ\n${generatedPlan.summary}\n\n`;
    content += `ОБҐРУНТУВАННЯ\n${generatedPlan.reasoning}\n\n`;
    content += `ЧАСОВІ РАМКИ\n${generatedPlan.timeframe}\n\n`;
    content += `КРОКИ ДЛЯ ДОСЯГНЕННЯ ЦІЛЕЙ\n\n`;
    
    generatedPlan.steps.forEach((step, index) => {
      content += `${index + 1}. ${step.title}\n`;
      content += `   ${step.description}\n`;
      content += `   Часові рамки: ${step.timeframe}\n\n`;
    });
    
    // Створюємо об'єкт Blob для документу
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    
    // Створюємо посилання для завантаження
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `План_дій_${userInfo?.name || 'користувача'}.txt`;
    
    // Додаємо посилання до документу, симулюємо клік і видаляємо посилання
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const areInputsValid = () => {
    const currentStateValid = currentState.emotional && 
                            currentState.mental && 
                            currentState.career && 
                            currentState.relationships && 
                            currentState.physical;
                            
    const desiredStateValid = desiredState.emotional && 
                            desiredState.mental && 
                            desiredState.career && 
                            desiredState.relationships && 
                            desiredState.physical &&
                            desiredState.timeframe;
                            
    return currentStateValid && desiredStateValid && userInfo !== null;
  };
  
  if (!apiKeySet) {
    return (
      <ApiKeyInput onApiKeySet={() => setApiKeySet(true)} />
    );
  }

  if (!sunoApiKeySet) {
    return (
      <SunoApiKeyInput onApiKeySet={() => setSunoApiKeySet(true)} />
    );
  }
  
  return (
    <Card className="w-full border-calm-100 shadow-sm">
      <CardHeader className="bg-calm-50 border-b border-calm-100">
        <CardTitle className="text-xl font-medium">Ваш персоналізований план дій</CardTitle>
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
        
        {songProgress && songProgress.isGenerating && (
          <div className="mb-6 p-4 bg-calm-50 rounded-lg border border-calm-100">
            <div className="flex items-center gap-2 mb-2">
              <Music size={18} className="text-primary animate-pulse" />
              <h4 className="font-medium">Бонус: Генерація мотиваційної пісні</h4>
            </div>
            <Progress value={songProgress.progress} className="h-2 mb-2" />
            <p className="text-sm text-muted-foreground">{songProgress.message}</p>
          </div>
        )}
        
        {!generatedPlan ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 text-muted-foreground">
              <p className="mb-2">Заповніть інформацію про ваш поточний та бажаний стан у формах вище. Потім натисніть кнопку нижче, щоб згенерувати персоналізований план дій.</p>
              
              {!userInfo && (
                <p className="text-orange-500 font-medium mt-4">
                  Будь ласка, пройдіть тест ментального здоров'я, щоб надати вашу персональну інформацію.
                </p>
              )}
            </div>
            
            <Button 
              size="lg" 
              onClick={handleGeneratePlan}
              disabled={isGenerating || !areInputsValid()}
              className="min-w-[200px]"
              type="button" 
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Генеруємо план...
                </>
              ) : (
                <>
                  <Sparkles size={20} className="mr-2" />
                  Створити план дій
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-medium">{userInfo?.name ? `План дій для ${userInfo.name}` : 'Ваш персоналізований план дій'}</h3>
                <p className="text-muted-foreground">Досягніть бажаних цілей крок за кроком</p>
              </div>
              
              <Button 
                variant="outline" 
                onClick={downloadPlan}
                size="sm" 
                className="shrink-0"
                type="button"
              >
                <Download size={16} className="mr-2" /> Завантажити план
              </Button>
            </div>
            
            <div className="p-4 bg-calm-50 rounded-lg border border-calm-100">
              <p className="font-medium">{generatedPlan.summary}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Clock size={16} className="mr-2" /> Часові рамки
                </h4>
                <p>{generatedPlan.timeframe}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Обґрунтування</h4>
                <p>{generatedPlan.reasoning}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Кроки для досягнення цілей</h3>
              
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {generatedPlan.steps.map((step, index) => (
                    <div key={index} className="relative pl-8 pb-6 border-l border-dashed border-calm-200">
                      <div className="absolute left-0 -translate-x-1/2 bg-white border border-calm-200 rounded-full w-6 h-6 flex items-center justify-center">
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-calm-100 shadow-sm">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h4 className="font-medium">{step.title}</h4>
                          <span className="text-xs bg-calm-100 text-calm-800 px-2 py-1 rounded-full whitespace-nowrap">
                            {step.timeframe}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PathGenerator;
