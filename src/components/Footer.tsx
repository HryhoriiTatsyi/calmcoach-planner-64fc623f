
import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-12 border-t border-calm-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <a href="#" className="text-2xl font-medium text-foreground inline-block mb-6">
            CalmCoach
          </a>
          
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8">
            <a href="#coaching" className="text-muted-foreground hover:text-foreground transition-colors">
              Coaching
            </a>
            <a href="#resources" className="text-muted-foreground hover:text-foreground transition-colors">
              Resources
            </a>
            <a href="#consultation" className="text-muted-foreground hover:text-foreground transition-colors">
              Consultation
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
          </nav>
          
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">
              © {currentYear} CalmCoach. All rights reserved.
            </p>
            <p className="flex items-center justify-center">
              Made with <Heart size={14} className="mx-1 text-red-500" /> for a calmer, more purposeful life
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
