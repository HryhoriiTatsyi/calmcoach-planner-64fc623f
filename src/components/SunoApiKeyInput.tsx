
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyRound, Music, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface SunoApiKeyInputProps {
  onApiKeySet: () => void;
}

const SunoApiKeyInput = ({ onApiKeySet }: SunoApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Перевіряємо наявність ключа при завантаженні компонента
    const storedKey = localStorage.getItem('suno_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);
  
  const validateApiKey = async (key: string) => {
    try {
      // Простий запит для перевірки валідності ключа
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // Змінено на новий API endpoint
      const response = await fetch('https://apibox.erweima.ai/api/v1/health', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json().catch(() => ({ error: { message: 'Невідома помилка' } }));
        throw new Error(errorData.error?.message || 'Невірний API ключ');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout при перевірці ключа');
      } else if (error.message === 'Failed to fetch') {
        throw new Error('Неможливо з\'єднатися з API. Перевірте своє інтернет-з\'єднання або спробуйте пізніше.');
      }
      throw error;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    setError(null);
    
    try {
      // Зберігаємо ключ навіть якщо не можемо його перевірити (на випадок проблем з API)
      localStorage.setItem('suno_api_key', apiKey.trim());
      onApiKeySet();
      
      toast({
        title: "Успішно",
        description: "API ключ збережено",
      });
    } catch (err: any) {
      setError(err.message || "Помилка при збереженні ключа");
      toast({
        title: "Помилка",
        description: err.message || "Помилка при збереженні ключа",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };
  
  return (
    <Card className="w-full border-calm-100 shadow-sm">
      <CardHeader className="bg-calm-50 border-b border-calm-100">
        <div className="flex items-center gap-2">
          <Music size={20} className="text-primary" />
          <CardTitle className="text-xl font-medium">Ключ API</CardTitle>
        </div>
        <CardDescription>
          Для створення аудіо пісні потрібен ключ API
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Alert className="bg-calm-50">
            <KeyRound className="h-4 w-4" />
            <AlertDescription>
              Щоб створити мотиваційну пісню, потрібен ключ API. Ви можете отримати його на сайті <a href="https://apibox.erweima.ai/" target="_blank" rel="noopener noreferrer" className="text-primary underline">erweima.ai</a>.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="sunoApiKey">API ключ</Label>
            <Input 
              id="sunoApiKey" 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              placeholder="Введіть ваш ключ API" 
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Ваш ключ API зберігається лише локально у вашому браузері і ніколи не передається на наші сервери.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="bg-calm-50 border-t border-calm-100 p-4 flex justify-end">
          <Button 
            type="submit"
            disabled={!apiKey.trim() || isValidating}
          >
            {isValidating ? (
              <>
                Перевіряємо ключ...
              </>
            ) : (
              'Зберегти ключ'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SunoApiKeyInput;
