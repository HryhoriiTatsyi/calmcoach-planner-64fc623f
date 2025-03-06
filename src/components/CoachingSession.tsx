
import { useState } from 'react';
import { CurrentStateData } from './CurrentState';
import { DesiredStateData } from './DesiredState';
import CurrentState from './CurrentState';
import DesiredState from './DesiredState';
import PathGenerator from './PathGenerator';
import MentalHealthTest from './MentalHealthTest';
import { Button } from '@/components/ui/button';
import { BrainCircuit } from 'lucide-react';

const CoachingSession = () => {
  const [currentState, setCurrentState] = useState<CurrentStateData>({
    emotional: '',
    mental: '',
    career: '',
    relationships: '',
    physical: '',
    needsToSolve: ''
  });
  
  const [desiredState, setDesiredState] = useState<DesiredStateData>({
    emotional: '',
    mental: '',
    career: '',
    relationships: '',
    physical: '',
    timeframe: ''
  });
  
  const [showTest, setShowTest] = useState(false);
  
  const handleTestComplete = (result: { 
    currentState: { 
      emotional: string;
      mental: string;
      career: string;
      relationships: string;
      physical: string;
    },
    desiredState: {
      emotional: string;
      mental: string;
      career: string;
      relationships: string;
      physical: string;
    }
  }) => {
    setCurrentState(prev => ({
      ...prev,
      emotional: result.currentState.emotional,
      mental: result.currentState.mental,
      career: result.currentState.career,
      relationships: result.currentState.relationships,
      physical: result.currentState.physical
    }));
    
    setDesiredState(prev => ({
      ...prev,
      emotional: result.desiredState.emotional,
      mental: result.desiredState.mental,
      career: result.desiredState.career,
      relationships: result.desiredState.relationships,
      physical: result.desiredState.physical,
      timeframe: '3 місяці' // Встановлюємо типовий часовий діапазон
    }));
    
    setShowTest(false);
  };
  
  return (
    <section id="coaching" className="pt-20 pb-20 bg-calm-50/30">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-calm-100 text-calm-800 text-sm font-medium mb-4">
            Ваша подорож трансформації
          </span>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
            Сплануйте свій шлях від точки А до точки Б
          </h2>
          <p className="text-lg text-muted-foreground">
            Заповніть деталі про ваш поточний стан та бажане майбутнє, і Вікторія створить персоналізований план дій, щоб допомогти вам подолати цей розрив.
          </p>
          
          <div className="mt-8">
            <Button 
              variant="outline" 
              onClick={() => setShowTest(true)}
              className="gap-2"
              disabled={showTest}
            >
              <BrainCircuit size={18} />
              Пройти тест ментального здоров'я
            </Button>
          </div>
        </div>
        
        {showTest ? (
          <div className="max-w-3xl mx-auto mb-12 animate-fade-in-up">
            <MentalHealthTest onComplete={handleTestComplete} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <CurrentState data={currentState} onChange={setCurrentState} />
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <DesiredState data={desiredState} onChange={setDesiredState} />
              </div>
            </div>
            
            <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <PathGenerator currentState={currentState} desiredState={desiredState} />
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default CoachingSession;
