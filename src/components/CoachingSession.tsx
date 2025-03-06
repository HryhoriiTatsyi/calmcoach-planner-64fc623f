
import { useState } from 'react';
import { CurrentStateData } from './CurrentState';
import { DesiredStateData } from './DesiredState';
import CurrentState from './CurrentState';
import DesiredState from './DesiredState';
import PathGenerator from './PathGenerator';

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
  
  return (
    <section id="coaching" className="pt-20 pb-20 bg-calm-50/30">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-calm-100 text-calm-800 text-sm font-medium mb-4">
            Your Transformation Journey
          </span>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
            Map Your Journey from A to B
          </h2>
          <p className="text-lg text-muted-foreground">
            Fill in the details about your current state and desired future, and our AI coach will create a personalized action plan to help you bridge the gap.
          </p>
        </div>
        
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
      </div>
    </section>
  );
};

export default CoachingSession;
