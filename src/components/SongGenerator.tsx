
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music, Loader2, Download, AlertCircle, Play, Pause, VolumeX } from 'lucide-react';
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

const SongGenerator = ({ currentState, desiredState, userInfo }: SongGeneratorProps) => {
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [songLyrics, setSongLyrics] = useState<SongData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

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

  const handleGenerateAudio = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if (!songLyrics) return;
    
    setIsGeneratingAudio(true);
    setError(null);
    
    try {
      const sunoApiKey = localStorage.getItem('suno_api_key');
      
      if (!sunoApiKey) {
        throw new Error('API ключ Suno не знайдено. Будь ласка, введіть свій ключ у відповідному полі.');
      }
      
      // Використовуємо AbortController для таймауту запиту
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 секунд таймаут
      
      try {
        const response = await fetch('https://api.suno.ai/v1/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sunoApiKey}`
          },
          body: JSON.stringify({
            prompt: songLyrics.lyrics,
            title: songLyrics.title,
            style_preset: "pop_happy_cheerful_upbeat",
            language: "ukrainian"
          }),
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }));
          throw new Error(`Помилка Suno API: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        if (data.audio_url) {
          setAudioUrl(data.audio_url);
          
          const newAudio = new Audio(data.audio_url);
          newAudio.addEventListener('ended', () => setIsPlaying(false));
          setAudio(newAudio);
        } else {
          throw new Error('Відповідь API не містить URL аудіо');
        }
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          throw new Error('Запит до Suno API перевищив час очікування. Будь ласка, спробуйте ще раз.');
        } else if (fetchError.message === 'Failed to fetch') {
          throw new Error('Неможливо з\'єднатися з API Suno. Перевірте своє інтернет-з\'єднання, коректність API ключа або спробуйте пізніше.');
        } else {
          throw fetchError;
        }
      }
    } catch (err: any) {
      setError(err.message || "Не вдалося згенерувати аудіо пісні");
      toast({
        title: "Помилка генерації аудіо",
        description: err.message || "Не вдалося згенерувати аудіо пісні",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAudio(false);
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
