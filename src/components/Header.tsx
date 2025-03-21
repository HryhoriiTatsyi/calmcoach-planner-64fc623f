
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

  const scrollToCoaching = () => {
    document.getElementById('coaching')?.scrollIntoView({ behavior: 'smooth' });
    if (isMenuOpen) setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'py-2 bg-background/80 backdrop-blur-lg shadow-sm' : 'py-3 sm:py-5 bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a href="#" className="text-xl sm:text-2xl font-medium text-foreground">
              Коучинг з Вікторією
            </a>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a href="#coaching" className="text-foreground/80 hover:text-foreground transition-colors">
              Коучинг
            </a>
            <a href="#resources" className="text-foreground/80 hover:text-foreground transition-colors">
              Ресурси
            </a>
            <a href="#consultation" className="text-foreground/80 hover:text-foreground transition-colors">
              Консультація
            </a>
            <Button variant="default" size="sm" className="ml-4" onClick={scrollToCoaching}>
              Почати
            </Button>
          </nav>
          
          <button 
            className="block md:hidden text-foreground p-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Закрити меню" : "Відкрити меню"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="block md:hidden bg-background/95 backdrop-blur-sm absolute top-full left-0 right-0 shadow-lg animate-fade-in">
          <div className="px-4 py-6 space-y-4">
            <a 
              href="#coaching" 
              className="block py-2 text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Коучинг
            </a>
            <a 
              href="#resources" 
              className="block py-2 text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Ресурси
            </a>
            <a 
              href="#consultation" 
              className="block py-2 text-foreground/80 hover:text-foreground transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Консультація
            </a>
            <Button variant="default" size="default" className="w-full mt-4" onClick={scrollToCoaching}>
              Почати
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
