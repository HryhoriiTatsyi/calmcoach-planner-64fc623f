
import { Heart, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-12 border-t border-calm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <a href="#" className="text-2xl font-medium text-foreground inline-block mb-6">
            Коучинг з Вікторією
          </a>
          
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
            <a href="#coaching" className="text-muted-foreground hover:text-foreground transition-colors">
              Коучинг
            </a>
            <a href="#resources" className="text-muted-foreground hover:text-foreground transition-colors">
              Ресурси
            </a>
            <a href="#consultation" className="text-muted-foreground hover:text-foreground transition-colors">
              Консультація
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Політика конфіденційності
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Умови використання
            </a>
          </nav>
          
          <div className="flex justify-center items-center mb-4">
            <a 
              href="https://www.instagram.com/viktoria_lifecoach?igsh=bjlieHU1MHdraXlh&utm_source=qr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              <Instagram size={24} />
              <span>@viktoria_lifecoach</span>
            </a>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              © {currentYear} Коучинг з Вікторією. Усі права захищені.
            </p>
            <p className="flex items-center justify-center">
              Створено з <Heart size={14} className="mx-1 text-red-500" /> для спокійнішого, більш цілеспрямованого життя
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
