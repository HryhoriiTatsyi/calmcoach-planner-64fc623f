
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface TaskResponse {
  code: number;
  msg: string;
  data?: {
    taskId: string;
  };
}

interface TaskDetailsResponse {
  code: number;
  msg: string;
  data?: {
    taskId: string;
    status: string;
    response?: {
      sunoData?: Array<{
        audioUrl?: string;
        streamAudioUrl?: string;
        duration?: number;
      }>;
    };
    errorMessage?: string;
  };
}

export interface SongGenerationOptions {
  lyrics: string;
  title: string;
  style?: string;
}

const useSunoApi = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const { toast } = useToast();

  const getSunoApiKey = (): string => {
    const envKey = import.meta.env.VITE_SUNO_API_KEY;
    const localKey = localStorage.getItem('suno_api_key');
    
    if (!envKey && !localKey) {
      throw new Error('API ключ Suno не знайдено. Будь ласка, додайте VITE_SUNO_API_KEY в .env файл або введіть ключ у відповідному полі.');
    }
    
    return envKey || localKey as string;
  };

  // Функція для генерації пісні
  const generateSong = async (options: SongGenerationOptions) => {
    setIsGenerating(true);
    setError(null);
    setProgress(10);
    setStatusMessage('Починаємо генерацію аудіо...');
    
    try {
      const sunoApiKey = getSunoApiKey();
      console.log('Використовуємо API ключ Suno:', sunoApiKey.substring(0, 5) + '...');
      console.log('Починаємо генерацію аудіо для пісні:', options.title);
      
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
            prompt: options.lyrics,
            style: options.style || "Pop",
            title: options.title,
            customMode: true,
            instrumental: false,
            model: "V4",
            callBackUrl: "https://no-callback.com"
          }),
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        console.log('Статус відповіді:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Помилка відповіді API:', errorText);
          const errorData = JSON.parse(errorText);
          throw new Error(`Помилка API: ${errorData.msg || response.statusText}`);
        }
        
        const data: TaskResponse = await response.json();
        console.log('Дані відповіді:', data);
        
        if (data.code !== 200 || !data.data?.taskId) {
          throw new Error(`Помилка API: ${data.msg || 'Невідома помилка'}`);
        }
        
        console.log('Отримано ID завдання:', data.data.taskId);
        setTaskId(data.data.taskId);
        setProgress(30);
        setStatusMessage('Завдання додано в чергу. Генерація аудіо може зайняти до 5 хвилин...');
        
        // Почати перевіряти статус
        const checkStatus = async () => {
          const result = await checkTaskStatus(data.data.taskId);
          return result;
        };
        
        // Запустити першу перевірку
        checkStatus();
        
        // Запустити інтервал для перевірки
        const intervalId = setInterval(async () => {
          const result = await checkStatus();
          if (result || !isGenerating) {
            clearInterval(intervalId);
          }
        }, 10000);
        
        toast({
          title: "Запит відправлено",
          description: "Генерація аудіо пісні розпочалась. Це може зайняти до 5 хвилин.",
        });
        
        return data.data.taskId;
        
      } catch (fetchError: any) {
        console.error('Помилка запиту до API:', fetchError);
        if (fetchError.name === 'AbortError') {
          throw new Error('Запит до API перевищив час очікування. Будь ласка, спробуйте ще раз.');
        } else if (fetchError.message === 'Failed to fetch') {
          throw new Error('Неможливо з\'єднатися з API. Перевірте своє інтернет-з\'єднання, коректність API ключа або спробуйте пізніше.');
        } else {
          throw fetchError;
        }
      }
    } catch (err: any) {
      console.error('Загальна помилка при генерації аудіо:', err);
      setError(err.message || "Не вдалося згенерувати аудіо пісні");
      setIsGenerating(false);
      setProgress(0);
      
      toast({
        title: "Помилка генерації аудіо",
        description: err.message || "Не вдалося згенерувати аудіо пісні",
        variant: "destructive",
      });
      
      return null;
    }
  };

  // Функція для перевірки статусу завдання
  const checkTaskStatus = async (taskId: string): Promise<boolean> => {
    if (!taskId) return false;
    
    try {
      const sunoApiKey = getSunoApiKey();
      
      console.log('Перевіряємо статус завдання з ID:', taskId);
      console.log('Використовуємо API ключ Suno:', sunoApiKey.substring(0, 5) + '...');
      
      const response = await fetch(`https://apibox.erweima.ai/api/v1/generate/record-info?taskId=${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sunoApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Статус відповіді:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Помилка відповіді API:', errorText);
        const errorData = JSON.parse(errorText);
        throw new Error(`Помилка API: ${errorData.msg || response.statusText}`);
      }
      
      const data: TaskDetailsResponse = await response.json();
      console.log('Дані відповіді:', data);
      
      if (data.code !== 200) {
        throw new Error(`Помилка API: ${data.msg}`);
      }
      
      if (data.data?.status === 'SUCCESS' && data.data.response?.sunoData && data.data.response.sunoData.length > 0) {
        const audioData = data.data.response.sunoData[0];
        const url = audioData.audioUrl || audioData.streamAudioUrl;
        
        console.log('Отримано URL аудіо:', url);
        
        if (url) {
          setAudioUrl(url);
          setIsGenerating(false);
          setProgress(100);
          setStatusMessage('Аудіо пісню успішно згенеровано!');
          
          toast({
            title: "Успішно",
            description: "Аудіо пісню згенеровано успішно!",
          });
          
          return true;
        } else {
          throw new Error('Відповідь API не містить URL аудіо');
        }
      } else if (data.data?.status === 'TEXT_SUCCESS') {
        setProgress(60);
        setStatusMessage('Текст оброблено, генерується аудіо...');
        return false;
      } else if (data.data?.status === 'FIRST_SUCCESS') {
        setProgress(80);
        setStatusMessage('Аудіо майже готове...');
        return false;
      } else if (data.data?.status === 'PENDING') {
        setProgress(40);
        setStatusMessage('Завдання в процесі обробки...');
        return false;
      } else if (data.data?.errorMessage) {
        throw new Error(`Помилка при генерації аудіо: ${data.data.errorMessage}`);
      } else if (data.data?.status === 'CREATE_TASK_FAILED' || 
                data.data?.status === 'GENERATE_AUDIO_FAILED' || 
                data.data?.status === 'CALLBACK_EXCEPTION' || 
                data.data?.status === 'SENSITIVE_WORD_ERROR') {
        throw new Error(`Помилка при генерації аудіо: ${data.data.status}`);
      }
      
      return false;
    } catch (err: any) {
      console.error('Помилка при перевірці статусу завдання:', err);
      setError(err.message || "Не вдалося отримати статус завдання");
      setIsGenerating(false);
      
      toast({
        title: "Помилка генерації аудіо",
        description: err.message || "Не вдалося отримати статус завдання",
        variant: "destructive",
      });
      
      return true; // Повертаємо true, щоб зупинити подальші перевірки
    }
  };

  // Функція для ручної перевірки статусу
  const manualCheckStatus = async () => {
    if (taskId) {
      await checkTaskStatus(taskId);
    }
  };

  return {
    generateSong,
    checkTaskStatus: manualCheckStatus,
    isGenerating,
    taskId,
    audioUrl,
    error,
    progress,
    statusMessage
  };
};

export default useSunoApi;
