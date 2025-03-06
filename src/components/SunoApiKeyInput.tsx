
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyRound, Music } from 'lucide-react';

interface SunoApiKeyInputProps {
  onApiKeySet: () => void;
}

const SunoApiKeyInput = ({ onApiKeySet }: SunoApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState('');
  
  useEffect(() => {
    // Перевіряємо наявність ключа при завантаженні компонента
    const storedKey = localStorage.getItem('suno_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (apiKey.trim()) {
      localStorage.setItem('suno_api_key', apiKey.trim());
      onApiKeySet();
    }
  };
  
  return (
    <Card className="w-full border-calm-100 shadow-sm">
      <CardHeader className="bg-calm-50 border-b border-calm-100">
        <div className="flex items-center gap-2">
          <Music size={20} className="text-primary" />
          <CardTitle className="text-xl font-medium">Ключ SunoAPI</CardTitle>
        </div>
        <CardDescription>
          Для створення аудіо пісні потрібен ключ API Suno
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-6">
          <Alert className="bg-calm-50">
            <KeyRound className="h-4 w-4" />
            <AlertDescription>
              Щоб створити мотиваційну пісню, потрібен ключ API Suno. Ви можете отримати його на сайті <a href="https://sunoapi.org/" target="_blank" rel="noopener noreferrer" className="text-primary underline">SunoAPI</a>.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="sunoApiKey">API ключ Suno</Label>
            <Input 
              id="sunoApiKey" 
              type="password" 
              value={apiKey} 
              onChange={(e) => setApiKey(e.target.value)} 
              placeholder="Введіть ваш ключ API Suno" 
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
            disabled={!apiKey.trim()}
          >
            Зберегти ключ
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default SunoApiKeyInput;
