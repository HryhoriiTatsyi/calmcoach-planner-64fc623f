
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-3 bg-background/80 backdrop-blur-lg shadow-sm' : 'py-5 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a href="#" className="text-2xl font-medium text-foreground">
              CalmCoach
            </a>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#coaching" className="text-foreground/80 hover:text-foreground transition-colors">
              Coaching
            </a>
            <a href="#resources" className="text-foreground/80 hover:text-foreground transition-colors">
              Resources
            </a>
            <a href="#consultation" className="text-foreground/80 hover:text-foreground transition-colors">
              Consultation
            </a>
            <Button variant="default" size="sm" className="ml-4">
              Get Started
            </Button>
          </nav>
          
          <button 
            className="block md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="block md:hidden bg-background absolute top-full left-0 right-0 shadow-lg animate-fade-in">
          <div className="px-4 py-6 space-y-4">
            <a href="#coaching" className="block py-2 text-foreground/80 hover:text-foreground transition-colors">
              Coaching
            </a>
            <a href="#resources" className="block py-2 text-foreground/80 hover:text-foreground transition-colors">
              Resources
            </a>
            <a href="#consultation" className="block py-2 text-foreground/80 hover:text-foreground transition-colors">
              Consultation
            </a>
            <Button variant="default" size="default" className="w-full mt-4">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
