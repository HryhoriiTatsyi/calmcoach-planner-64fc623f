
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
    const envApiKey = import.meta.env.VITE_SUNO_API_KEY;
    const storedKey = localStorage.getItem('suno_api_key');
    
    console.log('SunoApiKeyInput: Перевірка ключів', { 
      envKeyExists: !!envApiKey, 
      storedKeyExists: !!storedKey 
    });
    
    if (envApiKey) {
      // Якщо ключ є в змінних середовища, автоматично переходимо далі
      console.log('SunoApiKeyInput: Знайдено ключ у змінних середовища');
      localStorage.setItem('suno_api_key', envApiKey); // Зберігаємо ключ в localStorage для використання в API
      onApiKeySet();
      return;
    } else if (storedKey) {
      console.log('SunoApiKeyInput: Знайдено збережений ключ у localStorage');
      setApiKey(storedKey);
    } else {
      console.log('SunoApiKeyInput: Ключ не знайдено');
    }
  }, [onApiKeySet]);
  
  const validateApiKey = async (key: string) => {
    try {
      console.log('SunoApiKeyInput: Починаємо валідацію ключа');
      // Простий запит для перевірки валідності ключа через health endpoint
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch('https://apibox.erweima.ai/api/v1/health', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: controller.signal
      }).finally(() => clearTimeout(timeoutId));
      
      console.log('SunoApiKeyInput: Отримано відповідь від API:', { 
        status: response.status, 
        ok: response.ok 
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('SunoApiKeyInput: Відповідь API:', data);
        
        if (data.code === 200) {
          console.log('SunoApiKeyInput: Ключ валідний');
          return true;
        } else {
          console.error('SunoApiKeyInput: Невалідний ключ:', data);
          throw new Error(data.msg || 'Невірний API ключ');
        }
      } else {
        console.error('SunoApiKeyInput: Помилка відповіді API:', response.status, response.statusText);
        throw new Error('Невірний API ключ або проблеми з сервером');
      }
    } catch (error: any) {
      console.error('SunoApiKeyInput: Помилка валідації ключа:', error);
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
      console.log('SunoApiKeyInput: Спроба збереження ключа');
      // Спробуємо перевірити ключ перед збереженням
      await validateApiKey(apiKey.trim());
      
      // Якщо перевірка пройшла успішно, зберігаємо ключ
      localStorage.setItem('suno_api_key', apiKey.trim());
      console.log('SunoApiKeyInput: Ключ успішно збережено');
      onApiKeySet();
      
      toast({
        title: "Успішно",
        description: "API ключ збережено",
      });
    } catch (err: any) {
      console.error('SunoApiKeyInput: Помилка збереження ключа:', err);
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
            <p className="text-xs text-green-600">
              Альтернативно, ви можете додати ключ у файл .env як VITE_SUNO_API_KEY.
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
