import OpenAI from "openai";

export interface UserInfo {
  name: string;
  age: string;
  gender: string;
}

export interface CurrentStateData {
  emotional: string;
  mental: string;
  career: string;
  relationships: string;
  physical: string;
  needsToSolve?: string;
}

export interface DesiredStateData {
  emotional: string;
  mental: string;
  career: string;
  relationships: string;
  physical: string;
  timeframe: string;
}

export interface Step {
  title: string;
  description: string;
  timeframe: string;
}

export interface GeneratedPlan {
  summary: string;
  reasoning: string;
  timeframe: string;
  steps: Step[];
}

// Функція для генерації персоналізованого плану дій
export const generateActionPlan = async (
  currentState: CurrentStateData,
  desiredState: DesiredStateData,
  userInfo: UserInfo
): Promise<GeneratedPlan> => {
  try {
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
      throw new Error('API ключ не знайдено. Будь ласка, введіть свій ключ у відповідному полі.');
    }

    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    const prompt = `
      Створи детальний персоналізований план дій для ${userInfo.name} (вік: ${userInfo.age}, стать: ${userInfo.gender}), 
      враховуючи поточний стан та бажаний майбутній стан.
      
      ПОТОЧНИЙ СТАН:
      - Емоційний стан: ${currentState.emotional}
      - Ментальний стан: ${currentState.mental}
      - Кар'єрний стан: ${currentState.career}
      - Стосунки: ${currentState.relationships}
      - Фізичний стан: ${currentState.physical}
      
      БАЖАНИЙ СТАН:
      - Емоційний стан: ${desiredState.emotional}
      - Ментальний стан: ${desiredState.mental}
      - Кар'єрний стан: ${desiredState.career}
      - Стосунки: ${desiredState.relationships}
      - Фізичний стан: ${desiredState.physical}
      
      План повинен бути реалістичним для досягнення протягом вказаного часового діапазону: ${desiredState.timeframe}.
      
      Відповідь повинна бути структурована у наступному форматі:
      
      РЕЗЮМЕ: Короткий опис загального плану (один абзац).
      
      ОБҐРУНТУВАННЯ: Обґрунтування запропонованого підходу (один абзац).
      
      ЧАСОВІ РАМКИ: Загальний часовий діапазон для досягнення всіх цілей.
      
      КРОКИ: (список з 5-7 кроків)
      1. Назва кроку - Детальний опис кроку (2-3 речення) із конкретними прикладами, практичними вправами та посиланнями на дослідження чи наукові факти. Часові рамки: (коли цей крок має бути завершений)
      
      Зроби кожен крок максимально конкретним, практичним та таким, що базується на наукових дослідженнях, з корисними посиланнями. Забезпечте детальні приклади для кожного кроку, щоб людина могла одразу почати діяти. Уникайте загальних порад і давайте точні, конкретні дії.
      
      Відповідь має бути українською мовою у форматі JSON:
      {
        "summary": "текст резюме",
        "reasoning": "текст обґрунтування",
        "timeframe": "загальні часові рамки",
        "steps": [
          {
            "title": "назва кроку 1",
            "description": "розгорнутий опис кроку 1 з прикладами та науковими посиланнями",
            "timeframe": "часові рамки кроку 1"
          },
          ...і так далі для кожного кроку
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { "role": "system", "content": "Ти - професійний коуч з психології та особистого розвитку. Створюєш детальні плани дій з науковим підґрунтям для досягнення особистих цілей. Твої плани містять конкретні, дієві кроки з прикладами, обґрунтуванням та посиланнями на дослідження." },
        { "role": "user", "content": prompt }
      ],
      response_format: { type: "json_object" }
    });

    const planText = completion.choices[0]?.message?.content;
    
    if (!planText) {
      throw new Error('Не вдалося згенерувати план. Спробуйте ще раз або зверніться до підтримки.');
    }
    
    try {
      const plan = JSON.parse(planText);
      return plan as GeneratedPlan;
    } catch (parseError) {
      console.error('Помилка при парсингу JSON:', parseError);
      throw new Error('Отримано неправильний формат відповіді від API. Спробуйте ще раз.');
    }
    
  } catch (error: any) {
    if (error.code === 'insufficient_quota') {
      throw new Error('Недостатньо коштів на рахунку API. Будь ласка, поповніть свій баланс або використайте інший API ключ.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Недійсний API ключ. Будь ласка, перевірте свій ключ та спробуйте знову.');
    } else if (error.response?.status === 429) {
      throw new Error('Забагато запитів до API. Будь ласка, зачекайте та спробуйте знову пізніше.');
    } else {
      throw error;
    }
  }
};

export const generateMotivationalSong = async (
  currentState: CurrentStateData,
  desiredState: DesiredStateData,
  userInfo: UserInfo
): Promise<{ title: string; lyrics: string }> => {
  try {
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
      throw new Error('API ключ не знайдено. Будь ласка, введіть свій ключ у відповідному полі.');
    }

    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    const prompt = `
      Напиши мотиваційну пісню для ${userInfo.name} (вік: ${userInfo.age}, стать: ${userInfo.gender}), 
      враховуючи поточний стан та бажаний майбутній стан.
      
      ПОТОЧНИЙ СТАН:
      - Емоційний стан: ${currentState.emotional}
      - Ментальний стан: ${currentState.mental}
      - Кар'єрний стан: ${currentState.career}
      - Стосунки: ${currentState.relationships}
      - Фізичний стан: ${currentState.physical}
      
      БАЖАНИЙ СТАН:
      - Емоційний стан: ${desiredState.emotional}
      - Ментальний стан: ${desiredState.mental}
      - Кар'єрний стан: ${desiredState.career}
      - Стосунки: ${desiredState.relationships}
      - Фізичний стан: ${desiredState.physical}
      
      Пісня повинна бути натхненною та мотивувати до дій. Вона повинна відображати перехід від поточного стану до бажаного, 
      підкреслюючи можливості та позитивні зміни, які чекають на людину в майбутньому.
      
      Структура пісні:
      - Куплет 1: Опис поточного стану та викликів.
      - Куплет 2: Відображення бажаного стану та мрій.
      - Приспів: Мотиваційний заклик до дії та віри в себе.
      - Міст: Підтримка та надія на краще майбутнє.
      - Куплет 3: Конкретні кроки та дії для досягнення цілей.
      - Приспів: (повторення)
      
      Відповідь має бути структурована у наступному форматі JSON:
      {
        "title": "Назва пісні",
        "lyrics": "Текст пісні (куплети, приспів, міст)"
      }
      
      Зроби пісню оптимістичною, енергійною та такою, що легко запам'ятовується. Використовуй позитивні образи та метафори, щоб підкреслити важливість саморозвитку та досягнення цілей.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { "role": "system", "content": "Ти - професійний автор пісень, який створює надихаючі та мотиваційні тексти для людей, що прагнут змін та особистого розвитку. Твої пісні допомагають людям повірити в себе та зробити перший крок до кращого майбутнього." },
        { "role": "user", "content": prompt }
      ],
      response_format: { type: "json_object" }
    });

    const songText = completion.choices[0]?.message?.content;
    
    if (!songText) {
      throw new Error('Не вдалося згенерувати пісню. Спробуйте ще раз або зверніться до підтримки.');
    }
    
    try {
      const song = JSON.parse(songText);
      return song as { title: string; lyrics: string };
    } catch (parseError) {
      console.error('Помилка при парсингу JSON:', parseError);
      throw new Error('Отримано неправильний формат відповіді від API. Спробуйте ще раз.');
    }
    
  } catch (error: any) {
    if (error.code === 'insufficient_quota') {
      throw new Error('Недостатньо коштів на рахунку API. Будь ласка, поповніть свій баланс або використайте інший API ключ.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Недійсний API ключ. Будь ласка, перевірте свій ключ та спробуйте знову.');
    } else if (error.response?.status === 429) {
      throw new Error('Забагато запитів до API. Будь ласка, зачекайте та спробуйте знову пізніше.');
    } else {
      throw error;
    }
  }
};

// Функція для генерації тесту ментального здоров'я
export const generateMentalHealthTest = async (
  answers: {[key: number]: number},
  userInfo: UserInfo
): Promise<{
  currentState: {
    emotional: string;
    mental: string;
    career: string;
    relationships: string;
    physical: string;
  };
  desiredState: {
    emotional: string;
    mental: string;
    career: string;
    relationships: string;
    physical: string;
    timeframe: string;
  };
}> => {
  try {
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
      throw new Error('API ключ не знайдено. Будь ласка, введіть свій ключ у відповідному полі.');
    }

    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    // Перетворення відповідей у формат для аналізу
    const formattedAnswers = Object.entries(answers).map(([id, value]) => {
      const question = mentalHealthQuestions.find(q => q.id === parseInt(id));
      return {
        question: question?.text || `Питання ${id}`,
        answer: question?.options[value] || `Відповідь ${value}`
      };
    });

    const prompt = `
      Проаналізуй відповіді користувача ${userInfo.name} (вік: ${userInfo.age}, стать: ${userInfo.gender}) 
      на тест ментального здоров'я та створи опис поточного стану та бажаного стану для 
      різних сфер життя.
      
      ВІДПОВІДІ КОРИСТУВАЧА:
      ${formattedAnswers.map(a => `- ${a.question}: ${a.answer}`).join('\n')}
      
      На основі цих відповідей, сформулюй поточний стан та бажаний стан для наступних сфер:
      
      1. Емоційний стан (напр., рівень стресу, тривоги, загальне емоційне благополуччя)
      2. Ментальний стан (напр., концентрація, ясність мислення, творчість)
      3. Кар'єрний стан (напр., задоволеність роботою, професійний розвиток)
      4. Стосунки (напр., соціальні зв'язки, стосунки з близькими)
      5. Фізичний стан (напр., енергія, сон, фізична активність)
      
      Також визнач реалістичний часовий діапазон для досягнення бажаного стану.
      
      Формат відповіді повинен бути у вигляді JSON:
      {
        "currentState": {
          "emotional": "опис поточного емоційного стану",
          "mental": "опис поточного ментального стану",
          "career": "опис поточного кар'єрного стану",
          "relationships": "опис поточного стану стосунків",
          "physical": "опис поточного фізичного стану"
        },
        "desiredState": {
          "emotional": "опис бажаного емоційного стану",
          "mental": "опис бажаного ментального стану",
          "career": "опис бажаного кар'єрного стану",
          "relationships": "опис бажаного стану стосунків",
          "physical": "опис бажаного фізичного стану",
          "timeframe": "часовий діапазон для досягнення"
        }
      }
      
      Відповідь має бути українською мовою, конкретна та персоналізована, враховуючи 
      відповіді користувача та його особисті дані.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          "role": "system", 
          "content": "Ти - експерт з психології та особистого розвитку, який аналізує результати тестів ментального здоров'я та створює персоналізовані описи поточного та бажаного стану для різних сфер життя." 
        },
        { 
          "role": "user", 
          "content": prompt 
        }
      ],
      response_format: { type: "json_object" }
    });

    const resultText = completion.choices[0]?.message?.content;
    
    if (!resultText) {
      throw new Error('Не вдалося згенерувати результати. Спробуйте ще раз або зверніться до підтримки.');
    }
    
    try {
      const result = JSON.parse(resultText);
      
      // Додаємо часовий діапазон, якщо його немає
      if (!result.desiredState.timeframe) {
        result.desiredState.timeframe = "3-6 місяців";
      }
      
      return result;
    } catch (parseError) {
      console.error('Помилка при парсингу JSON:', parseError);
      throw new Error('Отримано неправильний формат відповіді від API. Спробуйте ще раз.');
    }
    
  } catch (error: any) {
    if (error.code === 'insufficient_quota') {
      throw new Error('Недостатньо коштів на рахунку API. Будь ласка, поповніть свій баланс або використайте інший API ключ.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Недійсний API ключ. Будь ласка, перевірте свій ключ та спробуйте знову.');
    } else if (error.response?.status === 429) {
      throw new Error('Забагато запитів до API. Будь ласка, зачекайте та спробуйте знову пізніше.');
    } else {
      throw error;
    }
  }
};

// Список питань для тесту ментального здоров'я
const mentalHealthQuestions = [
  {
    id: 1,
    text: "Як часто ви відчуваєте стрес або тривогу?",
    options: ["Рідко або ніколи", "Іноді", "Досить часто", "Майже весь час"]
  },
  {
    id: 2,
    text: "Як би ви оцінили якість свого сну?",
    options: ["Відмінна", "Добра", "Задовільна", "Погана"]
  },
  {
    id: 3,
    text: "Як часто ви відчуваєте себе виснаженим або без енергії?",
    options: ["Рідко або ніколи", "Іноді", "Досить часто", "Майже весь час"]
  },
  {
    id: 4,
    text: "Наскільки легко вам сконцентруватися на завданнях?",
    options: ["Дуже легко", "Легко", "Не завжди легко", "Важко"]
  },
  {
    id: 5,
    text: "Чи відчуваєте ви радість від діяльності, яка раніше приносила задоволення?",
    options: ["Так, повною мірою", "Здебільшого так", "Не так як раніше", "Майже ні"]
  },
  {
    id: 6,
    text: "Як би ви оцінили свою продуктивність на роботі або навчанні?",
    options: ["Відмінна", "Добра", "Задовільна", "Низька"]
  },
  {
    id: 7,
    text: "Наскільки задоволені ви своїми стосунками з близькими людьми?",
    options: ["Дуже задоволений", "Здебільшого задоволений", "Частково задоволений", "Не задоволений"]
  },
  {
    id: 8,
    text: "Як часто ви займаєтесь фізичними вправами або активним відпочинком?",
    options: ["Регулярно (3-5 разів на тиждень)", "Час від часу (1-2 рази на тиждень)", "Рідко", "Майже ніколи"]
  },
  {
    id: 9,
    text: "Наскільки ви задоволені своїм професійним розвитком?",
    options: ["Дуже задоволений", "Здебільшого задоволений", "Частково задоволений", "Не задоволений"]
  },
  {
    id: 10,
    text: "Як часто ви практикуєте техніки релаксації або медитації?",
    options: ["Регулярно", "Час від часу", "Рідко", "Ніколи"]
  }
];
