
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
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

const Consultation = () => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Consultation request sent",
      description: "We'll get back to you soon to schedule your session.",
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
                Personal Coaching
              </span>
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-6">
                Ready for personalized guidance?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Book a one-on-one consultation to dive deeper into your specific challenges and goals. I'll help you create a customized plan that addresses your unique situation.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-calm-100 p-3 rounded-full">
                    <div className="h-6 w-6 flex items-center justify-center">1</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Fill the form</h3>
                    <p className="text-muted-foreground">Share a bit about yourself and what you'd like to work on</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-calm-100 p-3 rounded-full">
                    <div className="h-6 w-6 flex items-center justify-center">2</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Schedule a call</h3>
                    <p className="text-muted-foreground">We'll find a time that works for both of us</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-calm-100 p-3 rounded-full">
                    <div className="h-6 w-6 flex items-center justify-center">3</div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-1">Begin your journey</h3>
                    <p className="text-muted-foreground">Start making meaningful progress with expert guidance</p>
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
                  Follow on Instagram
                </a>
              </div>
            </div>
            
            <div className="glass-panel rounded-2xl p-8 animate-fade-in-up">
              <h3 className="text-xl font-medium mb-6">Request a Consultation</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} className="input-field" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} className="input-field" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (123) 456-7890" {...field} className="input-field" />
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
                        <FormLabel>What would you like to work on?</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share a brief description of your goals or challenges..." 
                            className="textarea-field" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full">
                    Submit Request <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </Form>
              
              <p className="text-xs text-muted-foreground mt-6 text-center">
                I'll respond to your inquiry within 24-48 hours. All information shared is confidential.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Consultation;
