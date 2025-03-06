
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
    return () => {
      // Очищення ресурсів при розмонтуванні компонента
      if (audio) {
        audio.pause();
        audio.src = '';
      }
      
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [audio, pollingInterval]);

  const handleGenerateLyrics = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    setIsGeneratingLyrics(true);
    setError(null);
    setSongLyrics(null);
    setAudioUrl(null);
    
    try {
      const songData = await generateMotivationalSong(currentState, desiredState, userInfo);
      setSongLyrics(songData);
    } catch (err: any) {
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

  const checkTaskStatus = async (taskId: string) => {
    try {
      const sunoApiKey = localStorage.getItem('suno_api_key');
      
      if (!sunoApiKey) {
        throw new Error('API ключ не знайдено. Будь ласка, введіть свій ключ у відповідному полі.');
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
      
      const data: TaskDetailsResponse = await response.json();
      
      if (data.code !== 200) {
        throw new Error(`Помилка API: ${data.msg}`);
      }
      
      // Перевіряємо статус завдання
      if (data.data?.status === 'SUCCESS' && data.data.response?.sunoData && data.data.response.sunoData.length > 0) {
        // Завдання успішно виконано, знаходимо URL аудіо
        const audioData = data.data.response.sunoData[0];
        const url = audioData.audioUrl || audioData.streamAudioUrl;
        
        if (url) {
          setAudioUrl(url);
          const newAudio = new Audio(url);
          newAudio.addEventListener('ended', () => setIsPlaying(false));
          setAudio(newAudio);
          
          // Очищаємо інтервал опитування
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          
          setIsGeneratingAudio(false);
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
        // Завдання ще в процесі, продовжуємо опитування
        console.log(`Завдання в процесі виконання, статус: ${data.data.status}`);
      } else if (data.data?.errorMessage) {
        // Завдання завершилося з помилкою
        throw new Error(`Помилка при генерації аудіо: ${data.data.errorMessage}`);
      } else if (data.data?.status === 'CREATE_TASK_FAILED' || 
                data.data?.status === 'GENERATE_AUDIO_FAILED' || 
                data.data?.status === 'CALLBACK_EXCEPTION' || 
                data.data?.status === 'SENSITIVE_WORD_ERROR') {
        throw new Error(`Помилка при генерації аудіо: ${data.data.status}`);
      }
    } catch (err: any) {
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

  const handleGenerateAudio = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!songLyrics) return;
    
    setIsGeneratingAudio(true);
    setError(null);
    
    try {
      const sunoApiKey = localStorage.getItem('suno_api_key');
      
      if (!sunoApiKey) {
        throw new Error('API ключ не знайдено. Будь ласка, введіть свій ключ у відповідному полі.');
      }
      
      // Використовуємо AbortController для таймауту запиту
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 секунд таймаут
      
      try {
        // Використовуємо API endpoint і формат запиту згідно з документацією
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
            instrumental: false, // Створюємо пісню з вокалом
            model: "V4",
            callBackUrl: ""  // Виправляємо порожній рядок на дійсне значення
          }),
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ msg: response.statusText }));
          throw new Error(`Помилка API: ${errorData.msg || response.statusText}`);
        }
        
        const data: TaskResponse = await response.json();
        
        if (data.code !== 200 || !data.data?.taskId) {
          throw new Error(`Помилка API: ${data.msg || 'Невідома помилка'}`);
        }
        
        // Зберігаємо taskId для подальшого опитування статусу
        setTaskId(data.data.taskId);
        
        // Починаємо опитування статусу завдання кожні 5 секунд
        const interval = window.setInterval(() => {
          checkTaskStatus(data.data.taskId);
        }, 5000);
        
        setPollingInterval(interval);
        
        // Перше опитування статусу
        checkTaskStatus(data.data.taskId);
        
        toast({
          title: "Запит відправлено",
          description: "Генерація аудіо пісні розпочалась. Це може зайняти кілька хвилин.",
        });
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Запит до API перевищив час очікування. Будь ласка, спробуйте ще раз.');
        } else if (fetchError.message === 'Failed to fetch') {
          throw new Error('Неможливо з\'єднатися з API. Перевірте своє інтернет-з\'єднання, коректність API ключа або спробуйте пізніше.');
        } else {
          throw fetchError;
        }
      }
    } catch (err: any) {
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
    
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `${songLyrics?.title || 'motivation_song'}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatLyrics = (lyrics: string) => {
    return lyrics.split('\n').map((line, index) => (
      <p key={index} className={line.trim() === '' ? 'h-4' : 'my-1'}>
        {line || '\u00A0'}
      </p>
    ));
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
      
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Помилка</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!songLyrics ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
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
              <TabsList>
                <TabsTrigger value="lyrics">Текст пісні</TabsTrigger>
                <TabsTrigger value="audio" disabled={!audioUrl}>Аудіо</TabsTrigger>
              </TabsList>
              
              <TabsContent value="lyrics" className="p-4 border rounded-md mt-4">
                <div className="mb-4">
                  <h3 className="text-xl font-medium mb-2">{songLyrics.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Персоналізована пісня для {userInfo.name}
                  </p>
                </div>
                
                <ScrollArea className="h-[300px] w-full pr-4">
                  <div className="space-y-2 text-base">
                    {formatLyrics(songLyrics.lyrics)}
                  </div>
                </ScrollArea>
                
                {!audioUrl && (
                  <div className="mt-6">
                    <Button 
                      onClick={handleGenerateAudio}
                      disabled={isGeneratingAudio}
                      className="w-full"
                      type="button"
                    >
                      {isGeneratingAudio ? (
                        <>
                          <Loader2 size={20} className="mr-2 animate-spin" />
                          Створюємо аудіо...
                        </>
                      ) : (
                        <>
                          <Music size={20} className="mr-2" />
                          Створити аудіо пісні
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="audio" className="p-4 border rounded-md mt-4">
                {audioUrl && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-medium mb-2">{songLyrics.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Персоналізована пісня для {userInfo.name}
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
        <CardFooter className="bg-calm-50 border-t border-calm-100 p-4 flex justify-between">
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
