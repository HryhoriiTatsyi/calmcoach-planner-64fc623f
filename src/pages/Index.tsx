
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CoachingSession from '@/components/CoachingSession';
import Resources from '@/components/Resources';
import Consultation from '@/components/Consultation';
import Footer from '@/components/Footer';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Симуляція завантаження сторінки
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Перевіряємо, чи є дані сесії користувача
  useEffect(() => {
    // Перевірка наявності даних в localStorage
    const hasSession = localStorage.getItem('currentState') || 
                       localStorage.getItem('desiredState') || 
                       localStorage.getItem('userInfo');
    
    if (hasSession) {
      console.log('Знайдено збережену сесію користувача');
    }
  }, []);
  
  return (
    <div className={`min-h-screen flex flex-col transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <Header />
      <main className="flex-grow overflow-x-hidden">
        <Hero />
        <CoachingSession />
        <Resources />
        <Consultation />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
