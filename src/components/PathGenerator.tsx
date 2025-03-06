import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Clock, Download, Loader2, AlertCircle, Music, UserCircle } from 'lucide-react';
import { CurrentStateData } from './CurrentState';
import { DesiredStateData } from './DesiredState';
import { generateActionPlan, generateMotivationalSong, UserInfo } from '../services/openAiService';
import { useToast } from '@/components/ui/use-toast';
import ApiKeyInput from './ApiKeyInput';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import SunoApiKeyInput from './SunoApiKeyInput';
import { Progress } from '@/components/ui/progress';
import UserInfoForm from './UserInfoForm';

interface PathGeneratorProps {
  currentState: CurrentStateData;
  desiredState: DesiredStateData;
  userInfo: UserInfo | null;
  onUpdateUserInfo: (info: UserInfo) => void;
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

const getFullName = (name: string): string => {
  const nameMap: Record<string, string> = {
    'Саша (ч)': 'Олександр',
    'Саша (ж)': 'Олександра',
    'Гріша': 'Григорій',
    'Міша': 'Михайло',
    'Діма': 'Дмитро',
    'Коля': 'Микола',
    'Ваня': 'Іван',
    'Катя': 'Катерина',
    'Женя (ч)': 'Євген',
    'Женя (ж)': 'Євгенія',
    'Юля': 'Юлія',
    'Вова': 'Володимир',
    'Толя': 'Анатолій',
    'Льоша': 'Олексій',
    'Віка': 'Вікторія',
    'Роза': 'Розалія',
    'Таня': 'Тетяна',
    'Лєна': 'Олена',
    'Надя': 'Надія',
    'Оля': 'Ольга',
    'Петя': 'Петро',
    'Валя (ч)': 'Валентин',
    'Валя (ж)': 'Валентина',
    'Соня': 'Софія',
    'Андрій': 'Андрій',
    'Максим': 'Максим',
    'Рома': 'Роман',
    'Сергій': 'Сергій',
    'Паша': 'Павло',
    'Маша': 'Марія',
    'Аня': 'Анна',
    'Наталя': 'Наталія',
    'Іра': 'Ірина',
    'Галя': 'Галина',
    'Люда': 'Людмила',
    'Зіна': 'Зінаїда',
    'Боря': 'Борис',
    'Костя': 'Костянтин',
    'Слава': 'В\'ячеслав'
  };

  return nameMap[name] || name;
};

const PathGenerator = ({ currentState, desiredState, userInfo, onUpdateUserInfo }: PathGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [apiKeySet, setApiKeySet] = useState(!!localStorage.getItem('openai_api_key') || !!import.meta.env.VITE_OPENAI_API_KEY);
  const [sunoApiKeySet, setSunoApiKeySet] = useState(!!localStorage.getItem('suno_api_key') || !!import.meta.env.VITE_SUNO_API_KEY);
  const [error, setError] = useState<string | null>(null);
  const [songProgress, setSongProgress] = useState<SongProgress | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [showUserInfoForm, setShowUserInfoForm] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    try {
      const savedPlan = localStorage.getItem('generatedPlan');
      const savedSongProgress = localStorage.getItem('songProgress');
      const savedAudioUrl = localStorage.getItem('audioUrl');
      const savedTaskId = localStorage.getItem('taskId');
      
      if (savedPlan) {
        setGeneratedPlan(JSON.parse(savedPlan));
      }
      
      if (savedSongProgress) {
        setSongProgress(JSON.parse(savedSongProgress));
      }
      
      if (savedAudioUrl) {
        setAudioUrl(savedAudioUrl);
      }
      
      if (savedTaskId) {
        setTaskId(savedTaskId);
      }
    } catch (error) {
      console.error('Помилка при завантаженні даних з localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (generatedPlan) {
        localStorage.setItem('generatedPlan', JSON.stringify(generatedPlan));
      }
    } catch (error) {
      console.error('Помилка при збереженні даних в localStorage:', error);
    }
  }, [generatedPlan]);

  useEffect(() => {
    try {
      if (songProgress) {
        localStorage.setItem('songProgress', JSON.stringify(songProgress));
      }
    } catch (error) {
      console.error('Помилка при збереженні даних в localStorage:', error);
    }
  }, [songProgress]);

  useEffect(() => {
    try {
      if (audioUrl) {
        localStorage.setItem('audioUrl', audioUrl);
      }
    } catch (error) {
      console.error('Помилка при збереженні даних в localStorage:', error);
    }
  }, [audioUrl]);

  useEffect(() => {
    try {
      if (taskId) {
        localStorage.setItem('taskId', taskId);
      }
    } catch (error) {
      console.error('Помилка при збереженні даних в localStorage:', error);
    }
  }, [taskId]);
  
  const getFullUserName = () => {
    if (!userInfo || !userInfo.name) return 'користувача';
    return getFullName(userInfo.name);
  };
  
  useEffect(() => {
    if (!songProgress?.isGenerating || !userInfo || !taskId) return;
    
    const checkForAudio = async () => {
      try {
        const sunoApiKey = localStorage.getItem('suno_api_key');
        
        if (!sunoApiKey) return;
        
        const response = await fetch(`https://apibox.erweima.ai/api/v1/generate/record-info?taskId=${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sunoApiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.code !== 200 || !data.data) return;
        
        if (data.data.status === 'SUCCESS' && data.data.response?.sunoData?.length > 0) {
          const audioData = data.data.response.sunoData[0];
          const url = audioData.audioUrl || audioData.streamAudioUrl;
          
          if (url) {
            setAudioUrl(url);
            setSongProgress({
              isGenerating: false,
              stage: 'complete',
              progress: 100,
              message: 'Пісню згенеровано успішно!'
            });
          }
        } else if (data.data.status === 'PENDING' || 
                   data.data.status === 'TEXT_SUCCESS' || 
                   data.data.status === 'FIRST_SUCCESS') {
          let progress = songProgress.progress;
          let message = songProgress.message;
          
          if (data.data.status === 'TEXT_SUCCESS') {
            progress = Math.max(progress, 60);
            message = 'Текст створено, генеруємо аудіо...';
          } else if (data.data.status === 'FIRST_SUCCESS') {
            progress = Math.max(progress, 80);
            message = 'Аудіо майже готове, очікуйте...';
          }
          
          setSongProgress(prev => prev ? {
            ...prev,
            progress,
            message
          } : null);
        }
      } catch (error) {
        console.error('Помилка при перевірці аудіо:', error);
      }
    };
    
    checkForAudio();
    
    const intervalId = setInterval(checkForAudio, 10000);
    return () => clearInterval(intervalId);
  }, [songProgress, userInfo, taskId]);
  
  const generateSongAfterPlan = async () => {
    if (!userInfo) return;
    
    try {
      setSongProgress({
        isGenerating: true,
        stage: 'lyrics',
        progress: 10,
        message: 'Генеруємо текст пісні...'
      });
      
      const songData = await generateMotivationalSong(currentState, desiredState, userInfo);
      
      setSongProgress({
        isGenerating: true,
        stage: 'audio',
        progress: 40,
        message: 'Створюємо аудіо пісні (може зайняти до 5 хвилин)...'
      });
      
      const newTaskId = await generateAudio(songData);
      if (newTaskId) {
        setTaskId(newTaskId);
      }
      
      setSongProgress({
        isGenerating: true,
        stage: 'audio',
        progress: 60,
        message: 'Очікуємо завершення генерації аудіо (може зайняти до 5 хвилин)...'
      });
      
      await sendEmailWithUserData();
      
    } catch (error: any) {
      console.error('Помилка при генерації пісні:', error);
      
      setSongProgress({
        isGenerating: false,
        stage: 'complete',
        progress: 0,
        message: 'Помилка генерації пісні!'
      });
      
      setTimeout(() => {
        setSongProgress(null);
      }, 3000);
      
      toast({
        title: "Пісня не згенерована",
        description: "Процес генерації пісні завершився з помилкою, але план дій успішно створено",
        variant: "destructive",
      });
    }
  };
  
  const generateAudio = async (songData: { title: string, lyrics: string }) => {
    console.log('PathGenerator: Починаємо генерацію аудіо');
    
    const envApiKey = import.meta.env.VITE_SUNO_API_KEY;
    if (envApiKey) {
      console.log('PathGenerator: Використовуємо ключ Suno API з ENV змінних');
      localStorage.setItem('suno_api_key', envApiKey);
    }
    
    const sunoApiKey = envApiKey || localStorage.getItem('suno_api_key');
    
    if (!sunoApiKey) {
      console.error('PathGenerator: Suno API ключ не знайдено ні в ENV змінних, ні в localStorage');
      throw new Error('API ключ не знайдено. Будь ласка, введіть свій ключ у відповідному полі.');
    }
    
    console.log('PathGenerator: Знайдено Suno API ключ, починаємо генерацію аудіо');
    
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
      
      setSongProgress(prev => prev ? {
        ...prev,
        progress: 50,
        message: 'Завдання на створення пісні додано в чергу. Генерація може зайняти до 5 хвилин...'
      } : null);
      
      return data.data.taskId;
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
  
  const sendEmailWithUserData = async () => {
    try {
      const emailData = {
        to: 'vikktin@gmail.com',
        subject: `Нові дані коучинг-сесії від ${getFullUserName()}`,
        text: `
          Ім'я: ${getFullUserName() || 'Не вказано'}
          Вік: ${userInfo?.age || 'Не вказано'}
          Стать: ${userInfo?.gender || 'Не вказано'}
          
          Поточний стан:
          ${JSON.stringify(currentState, null, 2)}
          
          Бажаний стан:
          ${JSON.stringify(desiredState, null, 2)}
          
          ${audioUrl ? `Посилання на пісню: ${audioUrl}` : 'Пісня ще генерується'}
          
          Ця інформація була згенерована автоматично.
        `
      };
      
      console.log('Дані для відправки на email:', emailData);
    } catch (error) {
      console.error('Помилка при спробі відправити email:', error);
    }
  };

  const validateInputs = () => {
    if (!currentState.emotional) return "Будь ласка, заповніть поле 'Емоційний стан' у Поточному стані";
    if (!currentState.mental) return "Будь ласка, заповніть поле 'Ментальний стан' у Поточному стані";
    if (!currentState.career) return "Будь ласка, заповніть поле 'Кар'єрний стан' у По��очному стані";
    if (!currentState.relationships) return "Будь ласка, заповніть поле 'Стосунки' у Поточному стані";
    if (!currentState.physical) return "Будь ласка, заповніть поле 'Фізичний стан' у Поточному стані";
    
    if (!desiredState.emotional) return "Будь ласка, заповніть поле 'Емоційний стан' у Бажаному стані";
    if (!desiredState.mental) return "Будь ласка, заповніть поле 'Ментальний стан' у Бажаному стані";
    if (!desiredState.career) return "Будь ласка, заповніть поле 'Кар'єрний стан' у Бажаному стані";
    if (!desiredState.relationships) return "Будь ласка, заповніть поле 'Стосунки' у Бажаному стані";
    if (!desiredState.physical) return "Будь ласка, заповніть поле 'Фізичний стан' у Бажаному стані";
    if (!desiredState.timeframe) return "Будь ласка, заповніть поле 'Часовий діапазон' у Бажаному стані";
    
    return null;
  };
  
  const handleGeneratePlan = async () => {
    if (!apiKeySet) {
      toast({
        title: "API-ключ відсутній",
        description: "Будь ласка, введіть ��вій API-ключ OpenAI для продовження",
        variant: "destructive",
      });
      return;
    }

    if (!userInfo) {
      setShowUserInfoForm(true);
      return;
    }

    const validationResult = validateInputs();
    if (validationResult) {
      setValidationError(validationResult);
      toast({
        title: "Заповніть всі поля",
        description: validationResult,
        variant: "destructive",
      });
      return;
    }
    
    setValidationError(null);
    setIsGenerating(true);
    setError(null);
    
    try {
      const plan = await generateActionPlan(currentState, desiredState, userInfo);
      setGeneratedPlan(plan);
      
      toast({
        title: "План згенеровано успішно",
        description: "Ваш персоналізований план дій готовий. Розпочалась генерація бонусної пісні!",
      });
      
      if (sunoApiKeySet) {
        generateSongAfterPlan();
      }
      
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
  
  const handleUserInfoSubmit = (info: UserInfo) => {
    onUpdateUserInfo(info);
    setShowUserInfoForm(false);
    localStorage.setItem('userInfo', JSON.stringify(info));
    
    handleGeneratePlan();
  };
  
  const downloadPlan = () => {
    if (!generatedPlan) return;
    
    let content = `ПЕРСОНАЛІЗОВАНИЙ ПЛАН ДІЙ\n\n`;
    content += `Для: ${getFullUserName() || 'Користувача'}\n`;
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
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `План_дій_${getFullUserName()}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleManualCheckStatus = async () => {
    console.log('PathGenerator: Починаємо перевірку статусу пісні');
    
    const envApiKey = import.meta.env.VITE_SUNO_API_KEY;
    if (envApiKey) {
      console.log('PathGenerator: Використовуємо ключ Suno API з ENV змінних для перевірки статусу');
      localStorage.setItem('suno_api_key', envApiKey);
    }
    
    const sunoApiKey = envApiKey || localStorage.getItem('suno_api_key');
    
    if (!taskId) {
      console.error('PathGenerator: Відсутній taskId для перевірки статусу');
      return;
    }
    
    try {
      if (!sunoApiKey) {
        console.error('PathGenerator: Suno API ключ не знайдено ні в ENV змінних, ні в localStorage');
        toast({
          title: "Помилка",
          description: "API ключ не знайдено. Будь ласка, введіть свій ключ у відповідному полі.",
          variant: "destructive",
        });
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
        toast({
          title: "Помилка перевірки",
          description: "Не вдалося перевірити статус генерації пісні",
          variant: "destructive",
        });
        return;
      }
      
      const data = await response.json();
      
      if (data.code !== 200 || !data.data) {
        toast({
          title: "Помилка API",
          description: data.msg || "Невідома помилка при перевірці статусу",
          variant: "destructive",
        });
        return;
      }
      
      if (data.data.status === 'SUCCESS' && data.data.response?.sunoData?.length > 0) {
        const audioData = data.data.response.sunoData[0];
        const url = audioData.audioUrl || audioData.streamAudioUrl;
        
        if (url) {
          setAudioUrl(url);
          setSongProgress({
            isGenerating: false,
            stage: 'complete',
            progress: 100,
            message: 'Пісню згенеровано успішно!'
          });
          
          toast({
            title: "Успіх",
            description: "Пісню успішно згенеровано!",
          });
        }
      } else {
        let statusMessage = "Статус: ";
        
        switch(data.data.status) {
          case 'PENDING':
            statusMessage += "В очікуванні обробки";
            break;
          case 'TEXT_SUCCESS':
            statusMessage += "Текст оброблено, генерується аудіо";
            break;
          case 'FIRST_SUCCESS':
            statusMessage += "Аудіо майже готове";
            break;
          default:
            statusMessage += data.data.status || "Невідомий статус";
        }
        
        toast({
          title: "Пісня в обробці",
          description: `${statusMessage}. Перевірте ще раз пізніше, генерація може зайняти до 5 хвилин.`,
        });
      }
    } catch (error) {
      console.error('Помилка при перевірці статусу:', error);
      toast({
        title: "Помилка",
        description: "Не вдалося перевірити статус генерації пісні",
        variant: "destructive",
      });
    }
  };
  
  const downloadAudio = async (url: string, filename: string) => {
    try {
      console.log('PathGenerator: Починаємо завантаження аудіо з URL:', url);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      
      document.body.appendChild(a);
      a.click();
      
      console.log('PathGenerator: Клік по елементу завантаження виконано');
      
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
      
      toast({
        title: "Завантаження розпочато",
        description: "Ваша пісня завантажується. Перевірте папку з завантаженнями.",
      });
    } catch (error) {
      console.error('PathGenerator: Помилка при завантаженні аудіо:', error);
      toast({
        title: "Помилка завантаження",
        description: "Не вдалося завантажити аудіофайл. Спробуйте ще раз або скопіюйте посилання вручну.",
        variant: "destructive",
      });
    }
  };
  
  if (showUserInfoForm) {
    return (
      <div className="mb-6">
        <Card className="w-full border-calm-100 shadow-sm">
          <CardHeader className="bg-calm-50 border-b border-calm-100">
            <div className="flex items-center gap-2">
              <UserCircle size={20} className="text-primary" />
              <CardTitle className="text-xl font-medium">Введіть вашу інформацію</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <UserInfoForm onComplete={handleUserInfoSubmit} />
          </CardContent>
        </Card>
      </div>
    );
  }
  
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
      
      <CardContent className="p-4 sm:p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Помилка</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {validationError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Заповніть всі поля</AlertTitle>
            <AlertDescription>
              {validationError}
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
            <p className="text-xs text-muted-foreground mt-2">Повна генерація пісні може зайняти до 5 хвилин. Ви можете перезавантажити сторінку і повернутися пізніше - прогрес буде збережено.</p>
            
            {taskId && songProgress.progress >= 50 && !audioUrl && (
              <div className="mt-3 text-right">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManualCheckStatus}
                  className="text-xs"
                >
                  Перевірити статус пісні
                </Button>
              </div>
            )}
          </div>
        )}
        
        {!generatedPlan ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="mb-6 text-muted-foreground">
              <p className="mb-2">Заповніть інформацію про ваш поточний та бажаний стан у формах вище. Потім натисніть кнопку нижче, щоб згенерувати персоналізований план дій.</p>
              
              {!userInfo && (
                <p className="text-orange-500 font-medium mt-4">
                  Увага: Вам потрібно спочатку додати вашу персональну інформацію. Натисніть кнопку нижче, і вас попросять її ввести.
                </p>
              )}
            </div>
            
            <Button 
              size="lg" 
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="min-w-[200px] w-full sm:w-auto"
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
                <h3 className="text-xl font-medium overflow-hidden text-ellipsis">{userInfo?.name ? `План дій для ${getFullUserName()}` : 'Ваш персоналізований план дій'}</h3>
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
            
            {audioUrl && (
              <div className="mt-2 p-4 bg-calm-50 rounded-lg border border-calm-100">
                <div className="flex items-center gap-2 mb-3">
                  <Music size={18} className="text-primary" />
                  <h4 className="font-medium">Ваша мотиваційна пісня</h4>
                </div>
                <audio controls className="w-full max-w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  Ваш браузер не підтримує аудіо елемент.
                </audio>
                <div className="mt-2 text-right">
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-primary" 
                    onClick={() => downloadAudio(audioUrl, `Мотиваційна_пісня_для_${getFullUserName()}.mp3`)}
                  >
                    <Download size={16} className="mr-1" /> Завантажити пісню
                  </Button>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-calm-50 rounded-lg border border-calm-100">
              <p className="font-medium text-sm sm:text-base break-words">{generatedPlan.summary}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Clock size={16} className="mr-2" /> Часові рамки
                </h4>
                <p className="text-sm sm:text-base break-words">{generatedPlan.timeframe}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Обґрунтування</h4>
                <p className="text-sm sm:text-base break-words">{generatedPlan.reasoning}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-lg font-medium mb-4">Кроки для досягнення цілей</h3>
              
              <div className="space-y-4 sm:space-y-6">
                {generatedPlan.steps.map((step, index) => (
                  <div key={index} className="relative pl-8 pb-6 border-l border-dashed border-calm-200">
                    <div className="absolute left-0 -translate-x-1/2 bg-white border border-calm-200 rounded-full w-6 h-6 flex items-center justify-center">
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>
                    
                    <div className="bg-white p-3 sm:p-4 rounded-lg border border-calm-100 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-2">
                        <h4 className="font-medium text-sm sm:text-base break-words">{step.title}</h4>
                        <span className="text-xs bg-calm-100 text-calm-800 px-2 py-1 rounded-full whitespace-nowrap self-start">
                          {step.timeframe}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground space-y-2">
                        <p className="break-words">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PathGenerator;
