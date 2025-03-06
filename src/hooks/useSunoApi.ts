
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface SongData {
  title: string;
  lyrics: string;
}

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

export function useSunoApi() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  const getSunoApiKey = (): string => {
    const envKey = import.meta.env.VITE_SUNO_API_KEY;
    const localKey = localStorage.getItem('suno_api_key');
    
    console.log('useSunoApi: Отримання ключа Suno API', { 
      envKeyExists: !!envKey, 
      localKeyExists: !!localKey 
    });
    
    if (!envKey && !localKey) {
      throw new Error('API ключ не знайдено. Будь ласка, додайте VITE_SUNO_API_KEY в .env файл або введіть ключ у відповідному полі.');
    }
    
    return envKey || localKey as string;
  };

  const generateAudio = async (songData: SongData) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('useSunoApi: Початок генерації аудіо для пісні:', songData.title);
      const sunoApiKey = getSunoApiKey();
      console.log('useSunoApi: Ключ API отримано');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      console.log('useSunoApi: Відправляємо запит до API');
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
      
      console.log('useSunoApi: Отримано відповідь від API:', { 
        status: response.status, 
        ok: response.ok 
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('useSunoApi: Помилка відповіді API:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(`Помилка API: ${errorData.msg || response.statusText}`);
        } catch (e) {
          throw new Error(`Помилка API: ${response.statusText}`);
        }
      }
      
      const data: TaskResponse = await response.json();
      console.log('useSunoApi: Дані відповіді:', data);
      
      if (data.code !== 200 || !data.data?.taskId) {
        throw new Error(`Помилка API: ${data.msg || 'Невідома помилка'}`);
      }
      
      console.log('useSunoApi: Отримано ID завдання:', data.data.taskId);
      setTaskId(data.data.taskId);
      
      toast({
        title: "Запит відправлено",
        description: "Генерація аудіо пісні розпочалась. Це може зайняти до 5 хвилин.",
      });
      
      return data.data.taskId;
    } catch (fetchError: any) {
      console.error('useSunoApi: Помилка при генерації аудіо:', fetchError);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Запит до API перевищив час очікування. Будь ласка, спробуйте ще раз.');
      } else if (fetchError.message === 'Failed to fetch') {
        throw new Error('Неможливо з\'єднатися з API. Перевірте своє інтернет-з\'єднання, коректність API ключа або спробуйте пізніше.');
      } else {
        throw fetchError;
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const checkTaskStatus = async (taskId: string) => {
    try {
      console.log('useSunoApi: Перевіряємо статус завдання з ID:', taskId);
      const sunoApiKey = getSunoApiKey();
      
      const response = await fetch(`https://apibox.erweima.ai/api/v1/generate/record-info?taskId=${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sunoApiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('useSunoApi: Статус відповіді:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('useSunoApi: Помилка відповіді API:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(`Помилка API: ${errorData.msg || response.statusText}`);
        } catch (e) {
          throw new Error(`Помилка API: ${response.statusText}`);
        }
      }
      
      const data: TaskDetailsResponse = await response.json();
      console.log('useSunoApi: Дані відповіді:', data);
      
      if (data.code !== 200) {
        throw new Error(`Помилка API: ${data.msg}`);
      }
      
      if (data.data?.status === 'SUCCESS' && data.data.response?.sunoData && data.data.response.sunoData.length > 0) {
        const audioData = data.data.response.sunoData[0];
        const url = audioData.audioUrl || audioData.streamAudioUrl;
        
        console.log('useSunoApi: Отримано URL аудіо:', url);
        
        if (url) {
          toast({
            title: "Успішно",
            description: "Аудіо пісню згенеровано успішно!",
          });
          return { status: 'SUCCESS', url };
        } else {
          throw new Error('Відповідь API не містить URL аудіо');
        }
      } else if (data.data?.status === 'PENDING' || 
                data.data?.status === 'TEXT_SUCCESS' || 
                data.data?.status === 'FIRST_SUCCESS') {
        console.log(`useSunoApi: Завдання в процесі виконання, статус: ${data.data.status}`);
        return { status: data.data.status, url: null };
      } else if (data.data?.errorMessage) {
        throw new Error(`Помилка при генерації аудіо: ${data.data.errorMessage}`);
      } else if (data.data?.status === 'CREATE_TASK_FAILED' || 
                data.data?.status === 'GENERATE_AUDIO_FAILED' || 
                data.data?.status === 'CALLBACK_EXCEPTION' || 
                data.data?.status === 'SENSITIVE_WORD_ERROR') {
        throw new Error(`Помилка при генерації аудіо: ${data.data.status}`);
      }
      
      return { status: data.data?.status || 'UNKNOWN', url: null };
    } catch (err: any) {
      console.error('useSunoApi: Помилка при перевірці статусу завдання:', err);
      setError(err.message || "Не вдалося отримати статус завдання");
      
      toast({
        title: "Помилка перевірки статусу",
        description: err.message || "Не вдалося отримати статус завдання",
        variant: "destructive",
      });
      
      throw err;
    }
  };

  return {
    isGenerating,
    error,
    taskId,
    generateAudio,
    checkTaskStatus
  };
}

export default useSunoApi;
