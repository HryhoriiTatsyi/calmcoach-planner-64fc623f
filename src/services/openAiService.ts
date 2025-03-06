
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequestOptions {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
}

export const callOpenAI = async (options: OpenAIRequestOptions) => {
  const apiKey = localStorage.getItem('openai_api_key');
  
  if (!apiKey) {
    throw new Error('API ключ OpenAI не знайдено. Будь ласка, введіть свій ключ у налаштуваннях.');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Помилка API OpenAI: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Помилка при виклику OpenAI API:', error);
    throw error;
  }
};

export const generateMentalHealthTest = async (answers: { [key: number]: number }) => {
  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: `Ви консультант з ментального здоров'я, який аналізує відповіді на тест. 
      Створіть детальний аналіз поточного стану та бажаного стану людини у таких категоріях: емоційний, ментальний, кар'єрний, стосунки, фізичний. 
      Відповідь має бути строго у форматі об'єкта JSON з наступними полями:
      {
        "currentState": {
          "emotional": "string",
          "mental": "string",
          "career": "string",
          "relationships": "string",
          "physical": "string"
        },
        "desiredState": {
          "emotional": "string",
          "mental": "string",
          "career": "string",
          "relationships": "string",
          "physical": "string"
        }
      }
      Не додавайте жодних пояснень або додаткового тексту поза JSON-структурою. Поверніть лише валідний JSON об'єкт.`
    },
    {
      role: 'user',
      content: `Ось мої відповіді на тест ментального здоров'я (індекс варіанта починається з 0, де 0 - найкращий/позитивний варіант, а 3 - найгірший/негативний): ${JSON.stringify(answers)}. 
      Проаналізуй відповіді та створи JSON з поточним станом та рекомендованим бажаним станом для покращення. 
      Бажаний стан має бути реалістичним покращенням поточного стану.`
    }
  ];

  try {
    const result = await callOpenAI({
      model: 'gpt-4o',
      messages,
      temperature: 0.7
    });

    try {
      // Додаємо додаткову обробку для видалення будь-яких додаткових символів навколо JSON
      const cleanedResult = result.trim().replace(/^```json/, '').replace(/```$/, '');
      return JSON.parse(cleanedResult);
    } catch (error) {
      console.error('Помилка парсингу JSON відповіді:', result);
      
      // Спроба знайти JSON в тексті за допомогою регулярного виразу
      try {
        const jsonMatch = result.match(/{[\s\S]*}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (innerError) {
        console.error('Не вдалося знайти JSON у відповіді:', innerError);
      }
      
      throw new Error('Помилка при обробці відповіді від AI. Будь ласка, спробуйте ще раз.');
    }
  } catch (error) {
    console.error('Помилка при генерації аналізу тесту:', error);
    throw error;
  }
};

export const generateActionPlan = async (currentState: any, desiredState: any) => {
  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: `Ви професійний коуч Вікторія, яка спеціалізується на створенні персоналізованих планів дій для клієнтів. 
      На основі поточного та бажаного стану клієнта, створіть детальний план дій. 
      План має бути наданий строго у форматі об'єкта JSON з наступними полями:
      {
        "summary": "string",
        "reasoning": "string",
        "timeframe": "string",
        "steps": [
          {
            "title": "string",
            "description": "string",
            "timeframe": "string"
          }
        ]
      }
      Не додавайте жодних пояснень або додаткового тексту поза JSON-структурою. Поверніть лише валідний JSON об'єкт.`
    },
    {
      role: 'user',
      content: `Мій поточний стан: ${JSON.stringify(currentState)}
      Мій бажаний стан: ${JSON.stringify(desiredState)}
      Будь ласка, створіть для мене персоналізований план дій.`
    }
  ];

  try {
    const result = await callOpenAI({
      model: 'gpt-4o',
      messages,
      temperature: 0.7,
      max_tokens: 2000
    });

    try {
      // Додаємо додаткову обробку для видалення будь-яких додаткових символів навколо JSON
      const cleanedResult = result.trim().replace(/^```json/, '').replace(/```$/, '');
      return JSON.parse(cleanedResult);
    } catch (error) {
      console.error('Помилка парсингу JSON відповіді:', result);
      
      // Спроба знайти JSON в тексті за допомогою регулярного виразу
      try {
        const jsonMatch = result.match(/{[\s\S]*}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (innerError) {
        console.error('Не вдалося знайти JSON у відповіді:', innerError);
      }
      
      throw new Error('Помилка при обробці відповіді від AI. Будь ласка, спробуйте ще раз.');
    }
  } catch (error) {
    console.error('Помилка при генерації плану дій:', error);
    throw error;
  }
};
