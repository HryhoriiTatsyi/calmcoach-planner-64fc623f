
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, Brain, Briefcase, Users, Leaf, BookOpen, Coffee, Moon } from 'lucide-react';

interface ResourceItem {
  title: string;
  description: string;
  type: string;
  duration?: string;
  link: string;
}

const resourcesData: Record<string, ResourceItem[]> = {
  meditation: [
    {
      title: "Morning Mindfulness",
      description: "Start your day with a 10-minute guided meditation for focus and clarity",
      type: "Audio",
      duration: "10 min",
      link: "#"
    },
    {
      title: "Stress Relief Breathing",
      description: "Simple breathing techniques to calm your nervous system during stressful moments",
      type: "Video",
      duration: "8 min",
      link: "#"
    },
    {
      title: "Body Scan Relaxation",
      description: "Deep relaxation practice to release tension and connect with your body",
      type: "Audio",
      duration: "20 min",
      link: "#"
    },
    {
      title: "Loving-Kindness Meditation",
      description: "Cultivate compassion for yourself and others with this heart-centered practice",
      type: "Audio",
      duration: "15 min",
      link: "#"
    }
  ],
  morning: [
    {
      title: "Energizing Morning Routine",
      description: "A step-by-step morning routine to boost energy and set a positive tone for the day",
      type: "Article",
      link: "#"
    },
    {
      title: "Journal Prompts for Clarity",
      description: "Five powerful questions to reflect on each morning for greater purpose and focus",
      type: "Text",
      link: "#"
    },
    {
      title: "5-Minute Morning Movement",
      description: "Quick, gentle movements to wake up your body and energize your mind",
      type: "Video",
      duration: "5 min",
      link: "#"
    }
  ],
  evening: [
    {
      title: "Digital Sunset Protocol",
      description: "A structured approach to winding down from technology for better sleep",
      type: "Article",
      link: "#"
    },
    {
      title: "Gratitude Practice",
      description: "Simple evening ritual to cultivate appreciation and positive reflection",
      type: "Text",
      link: "#"
    },
    {
      title: "Sleep Preparation Meditation",
      description: "Gentle guided meditation to prepare your mind and body for restorative sleep",
      type: "Audio",
      duration: "12 min",
      link: "#"
    }
  ],
  nutrition: [
    {
      title: "Mindful Eating Guide",
      description: "Learn to develop a healthier relationship with food through mindful eating practices",
      type: "Article",
      link: "#"
    },
    {
      title: "Energy-Boosting Meal Ideas",
      description: "Simple, nutritious meal suggestions to support mental clarity and sustained energy",
      type: "Text",
      link: "#"
    },
    {
      title: "Hydration Tracker Template",
      description: "A downloadable template to help you maintain optimal hydration throughout the day",
      type: "Download",
      link: "#"
    }
  ]
};

const Resources = () => {
  return (
    <section id="resources" className="py-20">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-calm-100 text-calm-800 text-sm font-medium mb-4">
            Wellness Resources
          </span>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
            Tools for Daily Practice
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore our curated collection of meditation guides, routines, and wellness practices to support your transformation journey.
          </p>
        </div>
        
        <Tabs defaultValue="meditation" className="w-full">
          <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-4 mb-12">
            <TabsTrigger value="meditation" className="data-[state=active]:bg-calm-100 data-[state=active]:text-calm-800">
              <Heart size={16} className="mr-2" /> Meditation
            </TabsTrigger>
            <TabsTrigger value="morning" className="data-[state=active]:bg-calm-100 data-[state=active]:text-calm-800">
              <Coffee size={16} className="mr-2" /> Morning Routines
            </TabsTrigger>
            <TabsTrigger value="evening" className="data-[state=active]:bg-calm-100 data-[state=active]:text-calm-800">
              <Moon size={16} className="mr-2" /> Evening Rituals
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="data-[state=active]:bg-calm-100 data-[state=active]:text-calm-800">
              <Leaf size={16} className="mr-2" /> Nutrition
            </TabsTrigger>
          </TabsList>
          
          {Object.entries(resourcesData).map(([category, items]) => (
            <TabsContent key={category} value={category} className="focus-visible:outline-none focus-visible:ring-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item, index) => (
                  <Card key={index} className="border-calm-100 shadow-sm h-full card-hover">
                    <CardHeader className="pb-2">
                      <div className="text-xs font-medium flex items-center gap-1 text-muted-foreground mb-1">
                        <BookOpen size={12} />
                        {item.type} {item.duration && `• ${item.duration}`}
                      </div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <a href={item.link}>View Resource</a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default Resources;
