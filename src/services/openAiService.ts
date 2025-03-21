
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

// Функція для отримання ключа OpenAI
const getOpenAiKey = (): string => {
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  const localKey = localStorage.getItem('openai_api_key');
  
  if (!envKey && !localKey) {
    throw new Error('API ключ не знайдено. Будь ласка, додай VITE_OPENAI_API_KEY в .env файл або введи ключ у відповідному полі.');
  }
  
  return envKey || localKey as string;
};

// Функція для отримання ключа Suno
const getSunoKey = (): string => {
  const envKey = import.meta.env.VITE_SUNO_API_KEY;
  const localKey = localStorage.getItem('suno_api_key');
  
  if (!envKey && !localKey) {
    throw new Error('API ключ Suno не знайдено. Будь ласка, додай VITE_SUNO_API_KEY в .env файл або введи ключ у відповідному полі.');
  }
  
  return envKey || localKey as string;
};

// Функція для генерації персоналізованого плану дій
export const generateActionPlan = async (
  currentState: CurrentStateData,
  desiredState: DesiredStateData,
  userInfo: UserInfo
): Promise<GeneratedPlan> => {
  try {
    const apiKey = getOpenAiKey();
    
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    const prompt = `
      Створи дружній, неформальний і мотивуючий план дій для ${userInfo.name} (вік: ${userInfo.age}, стать: ${userInfo.gender}), 
      враховуючи поточний стан та бажане майбутнє. Звертайся до людини напряму, використовуючи ДРУГУ особу (ти, твій, тобі).
      
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
      
      Відповідь повинна бути структурована у такому форматі:
      
      РЕЗЮМЕ: Короткий опис загального плану (один абзац). Використовуй дружні, позитивні формулювання.
      
      ОБҐРУНТУВАННЯ: Обґрунтування запропонованого підходу (один абзац). Простою мовою, без складних термінів.
      
      ЧАСОВІ РАМКИ: Загальний часовий діапазон для досягнення всіх цілей.
      
      КРОКИ: (список з 5-7 кроків)
      1. Назва кроку - Детальний опис кроку (2-3 речення) із конкретними прикладами та практичними вправами. Уникай складних термінів та наукових посилань. Часові рамки: (коли цей крок має бути завершений)
      
      Зроби кожен крок конкретним та практичним, з точними прикладами. Використовуй просту, зрозумілу мову без посилань на дослідження. Пиши мотивуюче, наче звертаєшся до друга.
      
      Відповідь має бути українською мовою у форматі JSON:
      {
        "summary": "текст резюме",
        "reasoning": "текст обґрунтування",
        "timeframe": "загальні часові рамки",
        "steps": [
          {
            "title": "назва кроку 1",
            "description": "розгорнутий опис кроку 1 з прикладами",
            "timeframe": "часові рамки кроку 1"
          },
          ...і так далі для кожного кроку
        ]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { "role": "system", "content": "Ти - дружній, підбадьорливий коуч з особистого розвитку. Твоя мова проста, позитивна і мотивуюча. Уникаєш складних термінів і надмірних наукових посилань. Ти завжди звертаєшся до людини напряму, використовуючи другу особу (ти, твій) замість третьої. Твій стиль неформальний, ніби розмовляєш з другом." },
        { "role": "user", "content": prompt }
      ],
      response_format: { type: "json_object" }
    });

    const planText = completion.choices[0]?.message?.content;
    
    if (!planText) {
      throw new Error('Не вдалося згенерувати план. Спробуй ще раз або звернись до підтримки.');
    }
    
    try {
      const plan = JSON.parse(planText);
      return plan as GeneratedPlan;
    } catch (parseError) {
      console.error('Помилка при парсингу JSON:', parseError);
      throw new Error('Отримано неправильний формат відповіді від API. Спробуй ще раз.');
    }
    
  } catch (error: any) {
    if (error.code === 'insufficient_quota') {
      throw new Error('Недостатньо коштів на рахунку API. Будь ласка, поповни свій баланс або використай інший API ключ.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Недійсний API ключ. Будь ласка, перевір свій ключ та спробуй знову.');
    } else if (error.response?.status === 429) {
      throw new Error('Забагато запитів до API. Будь ласка, зачекай та спробуй знову пізніше.');
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
    const apiKey = getOpenAiKey();
    
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    const prompt = `
      Напиши життєрадісну, енергійну мотиваційну пісню для ${userInfo.name} (вік: ${userInfo.age}, стать: ${userInfo.gender}) 
      у стилі поп-рок (поєднання популярної музики з елементами рок-звучання).
      
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
      
      Пісня повинна бути:
      - У стилі поп-рок з енергійними ритмами
      - Життєрадісною та оптимістичною
      - З яскравими образами та метафорами
      - З мотивуючим приспівом, який легко запам'ятовується
      - Персоналізованою під історію та прагнення людини
      
      Структура пісні:
      - Куплет 1: Опис поточного стану та викликів.
      - Куплет 2: Відображення бажаного стану та мрій.
      - Приспів: Мотиваційний, енергійний заклик до дії та віри в себе.
      - Міст: Підтримка та надія на краще майбутнє.
      - Куплет 3: Конкретні кроки та дії для досягнення цілей.
      - Приспів: (повторення)
      
      Відповідь має бути структурована у наступному форматі JSON:
      {
        "title": "Назва пісні",
        "lyrics": "Текст пісні (куплети, приспів, міст)"
      }
      
      Зроби пісню оптимістичною, динамічною, яскравою, з потужною енергетикою поп-року.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { "role": "system", "content": "Ти - талановитий автор пісень в стилі поп-рок, який створює енергійні, життєрадісні та мотивуючі тексти. Твої пісні мають чіткий ритм, запам'ятовуються, надихають і дають заряд позитивної енергії." },
        { "role": "user", "content": prompt }
      ],
      response_format: { type: "json_object" }
    });

    const songText = completion.choices[0]?.message?.content;
    
    if (!songText) {
      throw new Error('Не вдалося згенерувати пісню. Спробуй ще раз або звернись до підтримки.');
    }
    
    try {
      const song = JSON.parse(songText);
      return song as { title: string; lyrics: string };
    } catch (parseError) {
      console.error('Помилка при парсингу JSON:', parseError);
      throw new Error('Отримано неправильний формат відповіді від API. Спробуй ще раз.');
    }
    
  } catch (error: any) {
    console.error('Помилка при генерації пісні:', error);
    
    if (error.code === 'insufficient_quota') {
      throw new Error('Недостатньо коштів на рахунку API. Будь ласка, поповни свій баланс або використай інший API ключ.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Недійсний API ключ. Будь ласка, перевір свій ключ та спробуй знову.');
    } else if (error.response?.status === 429) {
      throw new Error('Забагато запитів до API. Будь ласка, зачекай та спробуй знову пізніше.');
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
    const apiKey = getOpenAiKey();
    
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
      різних сфер життя. Використовуй пряме звертання до людини (у другій особі - ти, твій, тобі).
      
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
      відповіді користувача та його особисті дані. Використовуй просту, позитивну мову.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          "role": "system", 
          "content": "Ти - дружній психолог, який аналізує результати тестів і надає персоналізовані описи станів людини. Ти завжди звертаєшся до людини напряму, використовуючи другу особу (ти, твій, тобі). Твої описи конкретні, чіткі, без зайвої науковості. Ти використовуєш просту, зрозумілу мову, що сприймається як дружня підтримка." 
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
      throw new Error('Не вдалося згенерувати результати. Спробуй ще раз або звернись до підтримки.');
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
      throw new Error('Отримано неправильний формат відповіді від API. Спробуй ще раз.');
    }
    
  } catch (error: any) {
    if (error.code === 'insufficient_quota') {
      throw new Error('Недостатньо коштів на рахунку API. Будь ласка, поповни свій баланс або використай інший API ключ.');
    } else if (error.code === 'invalid_api_key') {
      throw new Error('Недійсний API ключ. Будь ласка, перевір свій ключ та спробуй знову.');
    } else if (error.response?.status === 429) {
      throw new Error('Забагато запитів до API. Будь ласка, зачекай та спробуй знову пізніше.');
    } else {
      throw error;
    }
  }
};

// Список питань для тесту ментального здоров'я
const mentalHealthQuestions = [
  {
    id: 1,
    text: "Як часто ти відчуваєш стрес або тривогу?",
    options: ["Рідко або ніколи", "Іноді", "Досить часто", "Майже весь час"]
  },
  {
    id: 2,
    text: "Як би ти оцінив(ла) якість свого сну?",
    options: ["Відмінна", "Добра", "Задовільна", "Погана"]
  },
  {
    id: 3,
    text: "Як часто ти відчуваєш себе виснаженим або без енергії?",
    options: ["Рідко або ніколи", "Іноді", "Досить часто", "Майже весь час"]
  },
  {
    id: 4,
    text: "Наскільки легко тобі сконцентруватися на завданнях?",
    options: ["Дуже легко", "Легко", "Не завжди легко", "Важко"]
  },
  {
    id: 5,
    text: "Чи відчуваєш ти радість від діяльності, яка раніше приносила задоволення?",
    options: ["Так, повною мірою", "Здебільшого так", "Не так як раніше", "Майже ні"]
  },
  {
    id: 6,
    text: "Як би ти оцінив(ла) свою продуктивність на роботі або навчанні?",
    options: ["Відмінна", "Добра", "Задовільна", "Низька"]
  },
  {
    id: 7,
    text: "Наскільки ти задоволений(а) своїми стосунками з близькими людьми?",
    options: ["Дуже задоволений(а)", "Здебільшого задоволений(а)", "Частково задоволений(а)", "Не задоволений(а)"]
  },
  {
    id: 8,
    text: "Як часто ти займаєшся фізичними вправами або активним відпочинком?",
    options: ["Регулярно (3-5 разів на тиждень)", "Час від часу (1-2 рази на тиждень)", "Рідко", "Майже ніколи"]
  },
  {
    id: 9,
    text: "Наскільки ти задоволений(а) своїм професійним розвитком?",
    options: ["Дуже задоволений(а)", "Здебільшого задоволений(а)", "Частково задоволений(а)", "Не задоволений(а)"]
  },
  {
    id: 10,
    text: "Як часто ти практикуєш техніки релаксації або медитації?",
    options: ["Регулярно", "Час від часу", "Рідко", "Ніколи"]
  }
];
