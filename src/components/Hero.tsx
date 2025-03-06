
import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-calm-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-calm-200/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-fade-in-up">
          <span className="inline-block px-4 py-2 rounded-full bg-calm-100 text-calm-800 text-sm font-medium mb-8">
            Transform your life with strategic coaching
          </span>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-foreground mb-6">
            Plan your journey from <br />
            <span className="text-primary">where you are</span> to <br />
            <span className="text-primary">where you want to be</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12">
            A minimalist, AI-powered coaching planner to help you create meaningful change in your life with clarity and purpose
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="rounded-full min-w-[180px]">
              Start Your Journey
            </Button>
            <Button variant="outline" size="lg" className="rounded-full min-w-[180px]">
              Learn More
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-pulse-soft">
          <a href="#coaching" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors">
            <span className="mb-2">Explore</span>
            <ArrowDown size={20} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
