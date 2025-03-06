
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
  // Користувач повинен ввести свій API-ключ
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
      content: `Ви консультант з ментального здоров'я, який аналізує відповіді на тест. Створіть детальний аналіз поточного стану та бажаного стану людини у таких категоріях: емоційний, ментальний, кар'єрний, стосунки, фізичний. Формат відповіді має бути у JSON:`
    },
    {
      role: 'user',
      content: `Ось мої відповіді на тест ментального здоров'я (індекс варіанта починається з 0, де 0 - найкращий/позитивний варіант, а 3 - найгірший/негативний): ${JSON.stringify(answers)}`
    }
  ];

  try {
    const result = await callOpenAI({
      model: 'gpt-4o',
      messages,
      temperature: 0.7
    });

    return JSON.parse(result);
  } catch (error) {
    console.error('Помилка при генерації аналізу тесту:', error);
    throw error;
  }
};

export const generateActionPlan = async (currentState: any, desiredState: any) => {
  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: `Ви професійний коуч Вікторія, яка спеціалізується на створенні персоналізованих планів дій для клієнтів. На основі поточного та бажаного стану клієнта, створіть детальний план дій. План має містити: короткий огляд, обґрунтування (reasoning), орієнтовний термін та конкретні кроки з часовими рамками. Формат відповіді має бути у JSON.`
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

    return JSON.parse(result);
  } catch (error) {
    console.error('Помилка при генерації плану дій:', error);
    throw error;
  }
};
