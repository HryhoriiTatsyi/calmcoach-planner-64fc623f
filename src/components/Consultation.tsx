
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { InstagramIcon, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  phone: z.string().optional(),
  social: z.string().optional(),
  message: z.string().min(10, {
    message: "Повідомлення має містити щонайменше 10 символів.",
  }),
});

const Consultation = () => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone: "",
      social: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    
    // Відправка даних на email
    const emailData = {
      to: 'vikktin@gmail.com',
      subject: 'Новий запит на консультацію',
      text: `
        Телефон: ${values.phone || 'Не вказано'}
        Соціальна мережа: ${values.social || 'Не вказано'}
        Повідомлення: ${values.message}
      `
    };
    
    console.log('Дані для відправки на email:', emailData);
    
    toast({
      title: "Запит надіслано",
      description: "Ми зв'яжемося з вами найближчим часом для планування сесії.",
    });
    form.reset();
  }

  return (
    <section id="consultation" className="py-20 bg-calm-50/30">
      <div className="section-container">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="animate-fade-in">
              <span className="inline-block px-4 py-2 rounded-full bg-calm-100 text-calm-800 text-sm font-medium mb-4">
                Персональний коучинг
              </span>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-6">
                Готові до персоналізованої підтримки?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Замовте індивідуальну консультацію, щоб глибше зануритися у ваші конкретні виклики та цілі. Я допоможу вам створити індивідуальний план, який відповідає вашій унікальній ситуації.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-calm-100 p-3 rounded-full">
                    <div className="h-6 w-6 flex items-center justify-center">1</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Заповніть форму</h3>
                    <p className="text-muted-foreground">Розкажіть трохи про себе та над чим би ви хотіли працювати</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-calm-100 p-3 rounded-full">
                    <div className="h-6 w-6 flex items-center justify-center">2</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Заплануйте дзвінок</h3>
                    <p className="text-muted-foreground">Ми знайдемо час, який підходить для нас обох</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-calm-100 p-3 rounded-full">
                    <div className="h-6 w-6 flex items-center justify-center">3</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Почніть свій шлях</h3>
                    <p className="text-muted-foreground">Почніть досягати значного прогресу з експертним керівництвом</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-[#E1306C] hover:bg-[#C13584] text-white rounded-xl transition-colors"
                >
                  <InstagramIcon className="mr-2 h-5 w-5" />
                  Слідкуйте в Instagram
                </a>
              </div>
            </div>
            
            <div className="glass-panel rounded-2xl p-8 animate-fade-in-up">
              <h3 className="text-xl font-medium mb-6">Запит на консультацію</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Телефон</FormLabel>
                        <FormControl>
                          <Input placeholder="+380 XX XXX XX XX" {...field} className="input-field" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="social"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Посилання на соціальну мережу</FormLabel>
                        <FormControl>
                          <Input placeholder="https://instagram.com/your_profile" {...field} className="input-field" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Над чим би ви хотіли працювати?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Поділіться коротким описом ваших цілей або викликів..." 
                            className="textarea-field" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    Відправити запит <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
              
              <p className="text-xs text-muted-foreground mt-6 text-center">
                Я відповім на ваш запит протягом 24-48 годин. Вся надана інформація є конфіденційною.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Consultation;
