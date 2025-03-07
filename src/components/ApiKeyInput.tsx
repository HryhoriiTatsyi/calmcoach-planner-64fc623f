
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, Save, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ApiKeyInput = ({ onApiKeySet }: { onApiKeySet: () => void }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Перевіряємо наявність ключа в env або localStorage
    const checkAndSetApiKey = () => {
      try {
        console.log('ApiKeyInput: Починаємо перевірку ключів');
        
        // Спочатку перевіряємо змінну середовища
        const envApiKey = import.meta.env.VITE_OPENAI_API_KEY;
        
        if (envApiKey) {
          console.log('ApiKeyInput: Знайдено ключ у змінних середовища');
          // Зберігаємо env ключ в localStorage для подальшого використання
          localStorage.setItem('openai_api_key', envApiKey);
          setApiKey(envApiKey);
          setIsSaved(true);
          onApiKeySet();
          return;
        }
        
        // Якщо ENV ключ не знайдено, перевіряємо localStorage
        const savedKey = localStorage.getItem('openai_api_key');
        
        if (savedKey) {
          console.log('ApiKeyInput: Знайдено збережений ключ у localStorage');
          setApiKey(savedKey);
          setIsSaved(true);
          onApiKeySet();
          return;
        }
        
        console.log('ApiKeyInput: Ключ не знайдено ні в ENV, ні в localStorage');
      } catch (err) {
        console.error('ApiKeyInput: Помилка при перевірці ключів:', err);
      }
    };
    
    checkAndSetApiKey();
  }, [onApiKeySet]);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      console.log('ApiKeyInput: Зберігаємо ключ у localStorage');
      localStorage.setItem('openai_api_key', apiKey.trim());
      setIsSaved(true);
      toast({
        title: "API-ключ збережено",
        description: "Ваш API-ключ успішно збережено для подальшого використання",
        variant: "default",
      });
      onApiKeySet();
    } else {
      console.error('ApiKeyInput: Спроба зберегти порожній ключ');
      toast({
        title: "Помилка",
        description: "Будь ласка, введіть дійсний API-ключ",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full border-calm-100 shadow-sm">
      <CardHeader className="bg-calm-50 border-b border-calm-100">
        <div className="flex items-center gap-2">
          <Key size={20} className="text-primary" />
          <CardTitle className="text-xl font-medium">API-ключ OpenAI</CardTitle>
        </div>
        <CardDescription>
          Для генерації персоналізованого плану та тесту потрібен API-ключ OpenAI
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Введіть свій API-ключ OpenAI для доступу до функцій генерації тесту та плану. 
            Ваш ключ зберігається локально у вашому браузері і не передається нікуди, крім API OpenAI.
          </p>
          <p className="text-sm text-green-600">
            Альтернативно, ви можете додати ключ у файл .env як VITE_OPENAI_API_KEY.
          </p>
          
          <div className="flex items-center gap-2">
            <Input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsSaved(false);
              }}
              className="font-mono"
            />
            <Button 
              onClick={handleSaveKey}
              disabled={isSaved || !apiKey.trim()}
              className="gap-2"
            >
              {isSaved ? (
                <>
                  <CheckCircle size={18} />
                  Збережено
                </>
              ) : (
                <>
                  <Save size={18} />
                  Зберегти
                </>
              )}
            </Button>
          </div>
          
          {isSaved && (
            <p className="text-sm text-calm-600">
              <CheckCircle size={16} className="inline mr-1 text-green-500" />
              API-ключ успішно збережено
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyInput;
