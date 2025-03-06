import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music, Loader2, Download, AlertCircle, Play, Pause } from 'lucide-react';
import { generateMotivationalSong, UserInfo } from '../services/openAiService';
import { useToast } from '@/components/ui/use-toast';

interface SongGeneratorProps {
  currentState: any;
  desiredState: any;
  userInfo: UserInfo;
}

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

const SongGenerator = ({ currentState, desiredState, userInfo }: SongGeneratorProps) => {
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [songLyrics, setSongLyrics] = useState<SongData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedSongLyrics = localStorage.getItem('songLyrics');
      const savedAudioUrl = localStorage.getItem('songAudioUrl');
      const savedTaskId = localStorage.getItem('songTaskId');
      
      if (savedSongLyrics) {
        setSongLyrics(JSON.parse(savedSongLyrics));
      }
      
      if (savedAudioUrl) {
        setAudioUrl(savedAudioUrl);
        const newAudio = new Audio(savedAudioUrl);
        newAudio.addEventListener('ended', () => setIsPlaying(false));
        setAudio(newAudio);
      }
      
      if (savedTaskId) {
        setTaskId(savedTaskId);
        if (savedTaskId && !savedAudioUrl) {
          checkTaskStatus(savedTaskId);
          
          const interval = window.setInterval(() => {
            checkTaskStatus(savedTaskId);
          }, 10000);
          
          setPollingInterval(interval);
        }
      }
    } catch (error) {
      console.error('Помилка при завантаженні даних з localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (songLyrics) {
        localStorage.setItem('songLyrics', JSON.stringify(songLyrics));
      }
    } catch (error) {
      console.error('Помилка при збереженні songLyrics в localStorage:', error);
    }
  }, [songLyrics]);

  useEffect(() => {
    try {
      if (audioUrl) {
        localStorage.setItem('songAudioUrl', audioUrl);
      }
    } catch (error) {
      console.error('Помилка при збереженні audioUrl в localStorage:', error);
    }
  }, [audioUrl]);

  useEffect(() => {
    try {
      if (taskId) {
        localStorage.setItem('songTaskId', taskId);
      }
    } catch (error) {
      console.error('Помилка при збереженні taskId в localStorage:', error);
    }
  }, [taskId]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
      
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [audio, pollingInterval]);

  const checkTaskStatus = async (taskId: string) => {
    try {
      const sunoApiKey = localStorage.getItem('suno_api_key');
      
      if (!sunoApiKey) {
        throw new Error('API ключ не знайдено. Будь ласка, введіть свій ключ у відповідному полі.');
      }
      
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
          const newAudio = new Audio(url);
          newAudio.addEventListener('ended', () => setIsPlaying(false));
          setAudio(newAudio);
          
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          
          setIsGeneratingAudio(false);
          localStorage.setItem('songAudioUrl', url);
          
          toast({
            title: "Успішно",
            description: "Аудіо пісню згенеровано успішно!",
          });
        } else {
          throw new Error('Відповідь API не містить URL аудіо');
        }
      } else if (data.data?.status === 'PENDING' || 
                data.data?.status === 'TEXT_SUCCESS' || 
                data.data?.status === 'FIRST_SUCCESS') {
        console.log(`Завдання в процесі виконання, статус: ${data.data.status}`);
      } else if (data.data?.errorMessage) {
        throw new Error(`Помилка при генерації аудіо: ${data.data.errorMessage}`);
      } else if (data.data?.status === 'CREATE_TASK_FAILED' || 
                data.data?.status === 'GENERATE_AUDIO_FAILED' || 
                data.data?.status === 'CALLBACK_EXCEPTION' || 
                data.data?.status === 'SENSITIVE_WORD_ERROR') {
        throw new Error(`Помилка при генерації аудіо: ${data.data.status}`);
      }
    } catch (err: any) {
      console.error('Помилка при перевірці статусу завдання:', err);
      
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      
      setIsGeneratingAudio(false);
      setError(err.message || "Не вдалося отримати статус завдання");
      toast({
        title: "Помилка генерації аудіо",
        description: err.message || "Не вдалося отримати статус завдання",
        variant: "destructive",
      });
    }
  };

  const handleGenerateLyrics = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    setIsGeneratingLyrics(true);
    setError(null);
    setSongLyrics(null);
    setAudioUrl(null);
    
    try {
      console.log('Генеруємо текст пісні для:', userInfo.name);
      const songData = await generateMotivationalSong(currentState, desiredState, userInfo);
      console.log('Отримано текст пісні:', songData.title);
      
      setSongLyrics(songData);
      localStorage.setItem('songLyrics', JSON.stringify(songData));
    } catch (err: any) {
      console.error('Помилка при генерації тексту пісні:', err);
      setError(err.message || "Не вдалося згенерувати текст пісні");
      toast({
        title: "Помилка генерації тексту",
        description: err.message || "Не вдалося згенерувати текст пісні",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  const handleGenerateAudio = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!songLyrics) {
      console.error('Немає тексту пісні для генерації аудіо');
      return;
    }
    
    setIsGeneratingAudio(true);
    setError(null);
    
    try {
      const sunoApiKey = localStorage.getItem('suno_api_key');
      
      if (!sunoApiKey) {
        throw new Error('API ключ не знайдено. Будь ласка, введіть свій ключ у відповідному полі.');
      }
      
      console.log('Використовуємо API ключ Suno:', sunoApiKey.substring(0, 5) + '...');
      console.log('Починаємо генерацію аудіо для пісні:', songLyrics.title);
      
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
            prompt: songLyrics.lyrics,
            style: "Pop",
            title: songLyrics.title,
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
        localStorage.setItem('songTaskId', data.data.taskId);
        
        const interval = window.setInterval(() => {
          checkTaskStatus(data.data.taskId);
        }, 10000);
        
        setPollingInterval(interval);
        
        checkTaskStatus(data.data.taskId);
        
        toast({
          title: "Запит відправлено",
          description: "Генерація аудіо пісні розпочалась. Це може зайняти до 5 хвилин.",
        });
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
      setIsGeneratingAudio(false);
      
      toast({
        title: "Помилка генерації аудіо",
        description: err.message || "Не вдалося згенерувати аудіо пісні",
        variant: "destructive",
      });
    }
  };

  const togglePlayPause = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(error => {
        console.error('Помилка відтворення аудіо:', error);
        toast({
          title: "Помилка відтворення",
          description: "Не вдалося відтворити аудіо. Спробуйте знову.",
          variant: "destructive",
        });
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', audioUrl, true);
    xhr.responseType = 'blob';
    
    xhr.onload = function() {
      if (this.status === 200) {
        const blob = new Blob([this.response], { type: 'audio/mpeg' });
        const blobUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `${songLyrics?.title || 'motivation_song'}.mp3`;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        }, 100);
      } else {
        console.error('Помилка завантаження файлу:', this.status);
        toast({
          title: "Помилка завантаження",
          description: "Не вдалося завантажити аудіофайл",
          variant: "destructive",
        });
      }
    };
    
    xhr.onerror = function() {
      console.error('Помилка мережі при завантаженні файлу');
      toast({
        title: "Помилка мережі",
        description: "Не вдалося завантажити аудіофайл через помилку мережі",
        variant: "destructive",
      });
    };
    
    xhr.send();
  };

  const formatLyrics = (lyrics: string) => {
    return lyrics.split('\n').map((line, index) => (
      <p key={index} className={line.trim() === '' ? 'h-4' : 'my-1'}>
        {line || '\u00A0'}
      </p>
    ));
  };

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

  const getFullUserName = () => {
    if (!userInfo || !userInfo.name) return 'користувача';
    return getFullName(userInfo.name);
  };

  const handleManualCheckStatus = async () => {
    if (!taskId) return;
    
    try {
      await checkTaskStatus(taskId);
      toast({
        title: "Перевірка",
        description: "Статус пісні перевірено. Процес може тривати до 5 хвилин.",
      });
    } catch (error) {
      console.error('Помилка при перевірці статусу:', error);
    }
  };

  return (
    <Card className="w-full border-calm-100 shadow-sm">
      <CardHeader className="bg-calm-50 border-b border-calm-100">
        <div className="flex items-center gap-2">
          <Music size={20} className="text-primary" />
          <CardTitle className="text-xl font-medium">Мотиваційна пісня</CardTitle>
        </div>
        <CardDescription>
          Створіть персоналізовану мотиваційну пісню на основі вашого бажаного стану
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Помилка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!songLyrics ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="mb-6 text-muted-foreground max-w-md">
              <p>Натисніть кнопку нижче, щоб створити персоналізовану мотиваційну пісню, яка допоможе вам досягти бажаного стану.</p>
            </div>
            
            <Button 
              onClick={handleGenerateLyrics}
              disabled={isGeneratingLyrics}
              className="min-w-[200px]"
              type="button"
            >
              {isGeneratingLyrics ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Генеруємо текст пісні...
                </>
              ) : (
                <>
                  <Music size={20} className="mr-2" />
                  Створити пісню
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue="lyrics" className="w-full">
              <TabsList className="w-full overflow-x-auto">
                <TabsTrigger value="lyrics">Текст пісні</TabsTrigger>
                <TabsTrigger value="audio" disabled={!audioUrl}>Аудіо</TabsTrigger>
              </TabsList>
              
              <TabsContent value="lyrics" className="p-4 border rounded-md mt-4">
                <div className="mb-4">
                  <h3 className="text-xl font-medium mb-2 break-words">{songLyrics.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Персоналізована пісня для {getFullUserName()}
                  </p>
                </div>
                
                <ScrollArea className="h-[300px] w-full pr-4">
                  <div className="space-y-2 text-base">
                    {formatLyrics(songLyrics.lyrics)}
                  </div>
                </ScrollArea>
                
                {!audioUrl && (
                  <div className="mt-6">
                    {isGeneratingAudio ? (
                      <div className="text-center space-y-2">
                        <Loader2 size={24} className="mx-auto animate-spin" />
                        <p className="text-sm text-muted-foreground">Створюємо аудіо (може зайняти до 5 хвилин)...</p>
                        
                        {taskId && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleManualCheckStatus}
                            className="mt-2"
                          >
                            Перевірити статус
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button 
                        onClick={handleGenerateAudio}
                        disabled={isGeneratingAudio}
                        className="w-full"
                        type="button"
                      >
                        <Music size={20} className="mr-2" />
                        Створити аудіо пісні
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="audio" className="p-4 border rounded-md mt-4">
                {audioUrl && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-medium mb-2 break-words">{songLyrics.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Персоналізована пісня для {getFullUserName()}
                      </p>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={togglePlayPause}
                      >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={downloadAudio}
                      >
                        <Download size={20} />
                      </Button>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-md">
                      <p className="text-sm text-center">
                        Пісня створена з використанням штучного інтелекту на основі вашого бажаного стану.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>

      {songLyrics && (
        <CardFooter className="bg-calm-50 border-t border-calm-100 p-4 flex justify-between flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleGenerateLyrics}
            disabled={isGeneratingLyrics}
            type="button"
          >
            Згенерувати новий текст
          </Button>
          
          {audioUrl && (
            <Button 
              onClick={downloadAudio}
              className="gap-2"
              type="button"
            >
              <Download size={16} />
              Завантажити пісню
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default SongGenerator;
