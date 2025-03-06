
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
      title: "Ранкова усвідомленість",
      description: "Почніть свій день з 10-хвилинної керованої медитації для фокусу та ясності",
      type: "Аудіо",
      duration: "10 хв",
      link: "https://www.youtube.com/watch?v=SEfs5TJZ6Nk"
    },
    {
      title: "Дихальні техніки для зняття стресу",
      description: "Прості дихальні техніки для заспокоєння вашої нервової системи в моменти стресу",
      type: "Відео",
      duration: "8 хв",
      link: "https://www.youtube.com/watch?v=rJNwDu0AK6c"
    },
    {
      title: "Сканування тіла для розслаблення",
      description: "Глибока практика релаксації для зняття напруги та з'єднання з вашим тілом",
      type: "Аудіо",
      duration: "20 хв",
      link: "https://www.youtube.com/watch?v=RlX0vzDUoLs"
    },
    {
      title: "Медитація люблячої доброти",
      description: "Розвивайте співчуття до себе та інших з цією практикою, орієнтованою на серце",
      type: "Аудіо",
      duration: "15 хв",
      link: "https://www.youtube.com/watch?v=AgvJRMYDQdw"
    }
  ],
  morning: [
    {
      title: "Енергізуюча ранкова рутина",
      description: "Покрокова ранкова рутина для підвищення енергії та створення позитивного настрою на день",
      type: "Стаття",
      link: "https://www.thelifehub.com.ua/5-krashchyh-rankovyh-zvychok/"
    },
    {
      title: "Запитання для щоденника ясності",
      description: "П'ять потужних запитань для роздумів щоранку для більшої мети та фокусу",
      type: "Текст",
      link: "https://www.thelifehub.com.ua/rankovyj-ritual-zapysy-v-shchodennyk/"
    },
    {
      title: "5-хвилинний ранковий рух",
      description: "Швидкі, м'які рухи, щоб розбудити ваше тіло та енергізувати розум",
      type: "Відео",
      duration: "5 хв",
      link: "https://www.youtube.com/watch?v=3e09e8qJmXg"
    }
  ],
  evening: [
    {
      title: "Протокол цифрового заходу сонця",
      description: "Структурований підхід до відключення від технологій для кращого сну",
      type: "Стаття",
      link: "https://shotam.info/yak-pozbutysia-tsilodobovoi-pov-iazanosti-z-telefonom-poiasniuie-psykholoh/"
    },
    {
      title: "Практика вдячності",
      description: "Простий вечірній ритуал для культивування вдячності та позитивних роздумів",
      type: "Текст",
      link: "https://www.thelifehub.com.ua/shchodennyk-vdjachnosti-shho-cze-take-ta-jak-vesty/"
    },
    {
      title: "Медитація підготовки до сну",
      description: "М'яка керована медитація для підготовки вашого розуму та тіла до відновлюючого сну",
      type: "Аудіо",
      duration: "12 хв",
      link: "https://www.youtube.com/watch?v=Evss8Xhv4Hs"
    }
  ],
  nutrition: [
    {
      title: "Посібник з усвідомленого харчування",
      description: "Навчіться розвивати здоровіші стосунки з їжею через практики усвідомленого харчування",
      type: "Стаття",
      link: "https://suspilne.media/195297-svidomne-harcuvanna-so-take-mindful-eating-i-ak-jogo-praktikuvati/"
    },
    {
      title: "Ідеї енергетичних прийомів їжі",
      description: "Прості, поживні пропозиції щодо прийомів їжі для підтримки ментальної ясності та стійкої енергії",
      type: "Текст",
      link: "https://life.pravda.com.ua/health/2021/01/14/243659/"
    },
    {
      title: "Шаблон відстеження гідратації",
      description: "Завантажуваний шаблон, щоб допомогти вам підтримувати оптимальну гідратацію протягом дня",
      type: "Завантаження",
      link: "https://drive.google.com/file/d/1VrPXj-GZJB7pKnDw-b-_8EIKxjdlAMGE/view?usp=sharing"
    }
  ]
};

const Resources = () => {
  return (
    <section id="resources" className="py-20">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full bg-calm-100 text-calm-800 text-sm font-medium mb-4">
            Ресурси для благополуччя
          </span>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight mb-4">
            Інструменти для щоденної практики
          </h2>
          <p className="text-lg text-muted-foreground">
            Досліджуйте нашу ретельно підібрану колекцію посібників з медитації, рутин і практик для благополуччя, щоб підтримати ваш шлях трансформації.
          </p>
        </div>
        
        <Tabs defaultValue="meditation" className="w-full">
          <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-4 mb-12">
            <TabsTrigger value="meditation" className="data-[state=active]:bg-calm-100 data-[state=active]:text-calm-800">
              <Heart size={16} className="mr-2" /> Медитація
            </TabsTrigger>
            <TabsTrigger value="morning" className="data-[state=active]:bg-calm-100 data-[state=active]:text-calm-800">
              <Coffee size={16} className="mr-2" /> Ранкові рутини
            </TabsTrigger>
            <TabsTrigger value="evening" className="data-[state=active]:bg-calm-100 data-[state=active]:text-calm-800">
              <Moon size={16} className="mr-2" /> Вечірні ритуали
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="data-[state=active]:bg-calm-100 data-[state=active]:text-calm-800">
              <Leaf size={16} className="mr-2" /> Харчування
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
                        <a href={item.link} target="_blank" rel="noopener noreferrer">Переглянути ресурс</a>
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
