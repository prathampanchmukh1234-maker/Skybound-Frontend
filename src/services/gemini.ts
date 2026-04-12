
const BASE_API_URL = import.meta.env.VITE_API_URL || '';

type IntentType = 'flight' | 'bus' | 'train' | 'hotel' | 'cab' | 'movie' | 'concert' | 'activity' | 'visa' | 'insurance';

type ConversationMemory = {
  serviceType: IntentType | '';
  destination: string;
  date: string;
  hasBookingIntent: boolean;
};

const intentMap: { keywords: string[]; type: IntentType; ack: string }[] = [
  { keywords: ['flight', 'plane'], type: 'flight', ack: 'I can help with flights.' },
  { keywords: ['bus'], type: 'bus', ack: 'I can help with buses.' },
  { keywords: ['train'], type: 'train', ack: 'I can help with trains.' },
  { keywords: ['hotel', 'stay'], type: 'hotel', ack: 'I can help with stays.' },
  { keywords: ['cab', 'taxi'], type: 'cab', ack: 'I can help with cabs.' },
  { keywords: ['movie', 'cinema'], type: 'movie', ack: 'I can help with movies.' },
  { keywords: ['concert', 'show'], type: 'concert', ack: 'I can help with concerts.' },
  { keywords: ['activity', 'things to do'], type: 'activity', ack: 'I can help with activities.' },
  { keywords: ['visa'], type: 'visa', ack: 'I can help with visa services.' },
  { keywords: ['insurance'], type: 'insurance', ack: 'I can help with insurance.' }
];

const destinations = ['goa', 'mumbai', 'delhi', 'pune', 'bangalore', 'dubai', 'singapore', 'london', 'paris', 'tokyo', 'shirdi'];
const bookingIntentKeywords = [
  'book', 'booking', 'find', 'search', 'show', 'need', 'want', 'looking for',
  'reserve', 'get me', 'take me', 'open', 'go to', 'navigate', 'trip'
];

const parseDateFromText = (text: string) => {
  const isoMatch = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  return isoMatch?.[1] || '';
};

const buildContextText = (query: string, history: {role: string, parts: {text: string}[]}[] = []) => {
  const historyText = history
    .flatMap((item) => item.parts.map((part) => part.text))
    .join(' ')
    .toLowerCase();

  return `${historyText} ${query.toLowerCase()}`.trim();
};

const hasAnyKeyword = (text: string, keywords: string[]) => keywords.some((keyword) => text.includes(keyword));

const isGreetingOnly = (text: string) => {
  const normalized = text.trim().toLowerCase();
  return [
    'hi',
    'hii',
    'hello',
    'hey',
    'yo',
    'namaste',
    'good morning',
    'good afternoon',
    'good evening'
  ].includes(normalized);
};

const getLastModelText = (history: {role: string, parts: {text: string}[]}[] = []) => {
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i].role === 'model') {
      return history[i].parts.map((part) => part.text).join(' ').toLowerCase();
    }
  }
  return '';
};

const isDestinationOnlyReply = (query: string, destinations: string[]) => {
  const normalized = query.trim().toLowerCase().replace(/[?.!,]/g, '');
  return destinations.includes(normalized);
};

const toLabel = (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

const getConversationMemory = (query: string, history: {role: string, parts: {text: string}[]}[] = []): ConversationMemory => {
  const texts = [
    ...history.flatMap((item) => item.parts.map((part) => part.text)),
    query
  ];

  let serviceType: IntentType | '' = '';
  let destination = '';
  let date = '';
  let hasBookingIntent = false;

  for (const rawText of texts) {
    const text = rawText.toLowerCase();

    const matchedIntent = intentMap.find((entry) => entry.keywords.some((keyword) => text.includes(keyword)));
    if (matchedIntent) {
      serviceType = matchedIntent.type;
    }

    const foundDestination = destinations.find((city) => text.includes(city));
    if (foundDestination) {
      destination = foundDestination;
    }

    const foundDate = parseDateFromText(text);
    if (foundDate) {
      date = foundDate;
    }

    if (hasAnyKeyword(text, bookingIntentKeywords)) {
      hasBookingIntent = true;
    }
  }

  return { serviceType, destination, date, hasBookingIntent };
};

const offlineNavigator = (query: string, history: {role: string, parts: {text: string}[]}[] = []) => {
  const text = buildContextText(query, history);
  const latestText = query.trim().toLowerCase();
  const today = new Date().toISOString().split('T')[0];
  const memory = getConversationMemory(query, history);
  const match = memory.serviceType ? intentMap.find((entry) => entry.type === memory.serviceType) : undefined;
  const destinationLabel = toLabel(memory.destination);
  const lastModelText = getLastModelText(history);
  const userJustSentDestination = isDestinationOnlyReply(query, destinations);

  if (isGreetingOnly(latestText)) {
    return 'Hi! I am SykBound AI. I can help with flights, hotels, trains, buses, cabs, movies, concerts, visas, insurance, and trip ideas. What would you like help with today?';
  }

  if (!match) {
    return 'I can chat normally and also help you plan or book flights, hotels, trains, buses, cabs, movies, concerts, visas, insurance, and activities. Tell me what you need, and I will help step by step.';
  }

  if (!memory.hasBookingIntent && !memory.date && !destinationLabel) {
    return `${match.ack} What would you like to do with ${match.type === 'hotel' ? 'stays' : `${match.type}s`} today? I can answer questions, help you compare options, or start a booking when you are ready.`;
  }

  if (destinationLabel && memory.date) {
    return `${match.ack} Opening options for ${destinationLabel}. 
COMMAND:NAVIGATE|type=${match.type}|to=${destinationLabel}|date=${memory.date}`;
  }

  if (!destinationLabel && memory.date && memory.hasBookingIntent) {
    return `${match.ack} I have your date as ${memory.date}. Which destination should I use?`;
  }

  if (destinationLabel) {
    if (userJustSentDestination && lastModelText.includes('date')) {
      return `${destinationLabel} sounds great. What date should I use for your ${match.type === 'hotel' ? 'stay' : match.type}? Send it in YYYY-MM-DD format, like ${today}.`;
    }

    if (memory.hasBookingIntent) {
      return `${match.ack} I have the destination as ${destinationLabel}. Tell me your travel date in YYYY-MM-DD format and I will take you to the right options.`;
    }

    return `${match.ack} You mentioned ${destinationLabel}. If you want me to start a search, send your travel date in YYYY-MM-DD format.`;
  }

  if (memory.hasBookingIntent) {
    if (latestText === 'yes' || latestText === 'ok' || latestText === 'okay' || latestText === 'sure') {
      return `${match.ack} Perfect. Share the destination and date in YYYY-MM-DD format, and I will continue from there.`;
    }

    if (memory.date && !destinationLabel) {
      return `${match.ack} I have the date as ${memory.date}. Now send the destination so I can continue.`;
    }

    if (!memory.date && destinationLabel) {
      return `${match.ack} I have ${destinationLabel}. Now send the date in YYYY-MM-DD format so I can continue.`;
    }

    if (!destinationLabel && !memory.date) {
      return `${match.ack} Tell me the destination and date you want in YYYY-MM-DD format, and I will help you search properly.`;
    }
  }

  return `${match.ack} Ask me for a destination and date whenever you want me to start searching.`;
};

// Use an exported function to handle travel assistance queries via Gemini
export const getTravelAssistance = async (query: string, history: {role: string, parts: {text: string}[]}[] = []) => {
  try {
    const response = await fetch(`${BASE_API_URL}/api/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        history
      })
    });

    if (!response.ok) {
      return offlineNavigator(query, history);
    }

    const data = await response.json();
    return typeof data?.text === 'string' && data.text.trim() ? data.text : offlineNavigator(query, history);
  } catch (error) {
    console.error('AI chat request failed:', error);
    return offlineNavigator(query, history);
  }
};
