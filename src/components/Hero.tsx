
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const scrollToCoaching = () => {
    document.getElementById('coaching')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 sm:py-0">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-calm-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-calm-200/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-calm-100 text-calm-800 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            Трансформуйте своє життя за допомогою стратегічного коучингу
          </span>
          
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-foreground mb-4 sm:mb-6">
            Сплануйте свій шлях від <br className="hidden sm:block" />
            <span className="text-primary">того, де ви зараз</span> до <br className="hidden sm:block" />
            <span className="text-primary">того, де хочете бути</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-12">
            Мінімалістичний коучинг-планер, який допоможе вам створити значущі зміни у вашому житті з ясністю та метою
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button 
              size="lg" 
              className="rounded-full min-w-[180px] w-full sm:w-auto mb-3 sm:mb-0" 
              onClick={scrollToCoaching}
            >
              Почати шлях
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-full min-w-[180px] w-full sm:w-auto" 
              onClick={() => document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Дізнатися більше
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-5 sm:bottom-10 left-1/2 -translate-x-1/2 animate-pulse-soft hidden sm:flex flex-col items-center">
          <a href="#coaching" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors">
            <span className="mb-2">Дослідити</span>
            <ArrowDown size={20} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
