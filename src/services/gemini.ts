
import { GoogleGenAI } from "@google/genai";

const offlineNavigator = (query: string) => {
  const text = query.toLowerCase();
  const today = new Date().toISOString().split('T')[0];

  const intentMap = [
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

  const match = intentMap.find((entry) => entry.keywords.some((keyword) => text.includes(keyword)));
  const destinations = ['goa', 'mumbai', 'delhi', 'pune', 'bangalore', 'dubai', 'singapore', 'london', 'paris', 'tokyo', 'shirdi'];
  const foundDestination = destinations.find((city) => text.includes(city));
  const destinationLabel = foundDestination ? foundDestination.charAt(0).toUpperCase() + foundDestination.slice(1) : '';

  if (match && destinationLabel) {
    return `${match.ack} Opening options for ${destinationLabel}. 
COMMAND:NAVIGATE|type=${match.type}|to=${destinationLabel}|date=${today}`;
  }

  if (match) {
    return `${match.ack} Opening that section now.
COMMAND:NAVIGATE|type=${match.type}`;
  }

  return "I can help with flights, hotels, buses, trains, cabs, movies, concerts, visa services, and insurance. Tell me the service plus destination you want.";
};

// Use an exported function to handle travel assistance queries via Gemini
export const getTravelAssistance = async (query: string, history: {role: string, parts: {text: string}[]}[] = []) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey || apiKey.includes('placeholder')) {
    console.warn("Gemini API key is missing or invalid.");
    return offlineNavigator(query);
  }

  const ai = new GoogleGenAI({ apiKey });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction: `You are "SykBound AI", the elite travel & entertainment concierge. 
        Today is April 7, 2026.

        Your goal is to help users book:
        1. TRAVEL: Flights, Buses, Trains, Cabs, Hotels.
        2. ENTERTAINMENT: Movies (current Indian theatrical releases), Concerts (Lollapalooza, Arijit Singh, etc.), Activities.
        3. SERVICES: Visa assistance, Travel Insurance, Gift Cards.

        GUIDELINES:
        - Be conversational, premium, and helpful. Use a mix of English and Hindi/Hinglish where appropriate.
        - ALWAYS ask for the travel/event DATE first before navigating.
        - Once you have the necessary details (Destination/Event + Date), confirm with the user and then emit a navigation command.
        - COMMAND FORMAT: To navigate the app, you MUST include a single line at the end of your response in this EXACT format:
          COMMAND:NAVIGATE|type=[flight/bus/train/hotel/movie/concert/activity/visa/insurance]|to=[Destination]|date=[YYYY-MM-DD]
        
        - If you don't have a specific destination or date yet, you can just navigate to the service page:
          COMMAND:NAVIGATE|type=[flight/bus/train/hotel/movie/concert/activity/visa/insurance]

        Example 1: "Sure! I can help you book a flight to Goa for 2026-04-20. Redirecting you to our flight search now...
        COMMAND:NAVIGATE|type=flight|to=Goa|date=2026-04-20"

        Example 2: "I'll take you to our Visa assistance page where you can start your application.
        COMMAND:NAVIGATE|type=visa"

        Response length: Keep it under 3 sentences.`,
        temperature: 0.8,
        topP: 0.95
      }
    });
    clearTimeout(timeoutId);
    // The response.text property directly returns the extracted string output.
    return response.text || offlineNavigator(query);
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      return offlineNavigator(query);
    }
    console.error("Gemini Error:", error);
    return offlineNavigator(query);
  }
};
