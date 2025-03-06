
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserInfo } from '../services/openAiService';
import { UserCircle, ChevronRight } from 'lucide-react';

interface UserInfoFormProps {
  onComplete: (userInfo: UserInfo) => void;
}

const UserInfoForm = ({ onComplete }: UserInfoFormProps) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (name && age && gender) {
      onComplete({
        name,
        age,
        gender
      });
    }
  };
  
  const isFormValid = name.trim() !== '' && age.trim() !== '' && gender !== '';
  
  return (
    <Card className="w-full border-calm-100 shadow-sm">
      <CardHeader className="bg-calm-50 border-b border-calm-100">
        <div className="flex items-center gap-2">
          <UserCircle size={20} className="text-primary" />
          <CardTitle className="text-xl font-medium">Перед початком тесту</CardTitle>
        </div>
        <CardDescription>
          Будь ласка, надайте деяку інформацію про себе, щоб ми могли персоналізувати ваші результати
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Ваше ім'я</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Введіть ваше ім'я" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age">Ваш вік</Label>
            <Input 
              id="age" 
              value={age} 
              onChange={(e) => setAge(e.target.value)} 
              placeholder="Введіть ваш вік" 
              type="number"
              min="1"
              max="120"
              required 
            />
          </div>
          
          <div className="space-y-3">
            <Label>Ваша стать</Label>
            <RadioGroup 
              value={gender} 
              onValueChange={setGender}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="чоловіча" id="gender-male" />
                <Label htmlFor="gender-male" className="cursor-pointer">Чоловіча</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="жіноча" id="gender-female" />
                <Label htmlFor="gender-female" className="cursor-pointer">Жіноча</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="інша" id="gender-other" />
                <Label htmlFor="gender-other" className="cursor-pointer">Інша</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        
        <CardFooter className="bg-calm-50 border-t border-calm-100 p-4 flex justify-end">
          <Button 
            type="submit"
            disabled={!isFormValid}
            className="gap-2"
          >
            Продовжити <ChevronRight size={16} />
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default UserInfoForm;
