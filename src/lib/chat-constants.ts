import type { ChatCharacter } from "@/types/database";

// ============================================
// Destinations
// ============================================

export interface Destination {
  id: string;
  name: string;
  nameZh: string;
  flag: string;
  description: string;
}

export const DESTINATIONS: Destination[] = [
  { id: "tokyo", name: "Tokyo", nameZh: "东京", flag: "🇯🇵", description: "Experience Japanese culture" },
  { id: "bangkok", name: "Bangkok", nameZh: "曼谷", flag: "🇹🇭", description: "Street food paradise" },
  { id: "paris", name: "Paris", nameZh: "巴黎", flag: "🇫🇷", description: "City of light and romance" },
  { id: "new_york", name: "New York", nameZh: "纽约", flag: "🇺🇸", description: "The city that never sleeps" },
  { id: "london", name: "London", nameZh: "伦敦", flag: "🇬🇧", description: "Historic and modern" },
  { id: "sydney", name: "Sydney", nameZh: "悉尼", flag: "🇦🇺", description: "Beaches and adventure" },
  { id: "seoul", name: "Seoul", nameZh: "首尔", flag: "🇰🇷", description: "K-culture and street vibes" },
  { id: "singapore", name: "Singapore", nameZh: "新加坡", flag: "🇸🇬", description: "Garden city melting pot" },
];

// ============================================
// Scenarios
// ============================================

export interface Scenario {
  id: string;
  name: string;
  nameZh: string;
  icon: string;
  description: string;
  suggestedTopics: string[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "airport",
    name: "Airport & Immigration",
    nameZh: "机场通关",
    icon: "✈️",
    description: "Navigate check-in, security, and immigration",
    suggestedTopics: ["boarding pass", "customs declaration", "baggage claim", "gate change"],
  },
  {
    id: "hotel",
    name: "Hotel Check-in",
    nameZh: "酒店入住",
    icon: "🏨",
    description: "Book and check into your hotel",
    suggestedTopics: ["reservation", "room upgrade", "amenities", "late checkout"],
  },
  {
    id: "restaurant",
    name: "Restaurant & Café",
    nameZh: "餐厅点餐",
    icon: "🍽️",
    description: "Order food and enjoy local cuisine",
    suggestedTopics: ["menu", "dietary restrictions", "recommendation", "bill splitting"],
  },
  {
    id: "shopping",
    name: "Shopping & Markets",
    nameZh: "购物逛街",
    icon: "🛍️",
    description: "Shop at stores and local markets",
    suggestedTopics: ["price", "try on", "souvenir", "tax refund"],
  },
  {
    id: "sightseeing",
    name: "Sightseeing Tour",
    nameZh: "景点游览",
    icon: "🗺️",
    description: "Explore famous attractions with a local",
    suggestedTopics: ["ticket", "guided tour", "photo spot", "opening hours"],
  },
  {
    id: "social",
    name: "Making Friends",
    nameZh: "社交聊天",
    icon: "💬",
    description: "Meet new people at a café or bar",
    suggestedTopics: ["self-introduction", "hobbies", "travel plans", "local tips"],
  },
];

// ============================================
// Characters
// ============================================

export const CHARACTERS: ChatCharacter[] = [
  {
    id: "sophia",
    name: "Sophia",
    avatar: "👩‍🦰",
    personality: "Cheerful, curious, loves sharing travel stories",
    speaking_style: "Casual and friendly, uses simple expressions, encourages learners",
    background: "A 25-year-old travel blogger from California who has visited 30+ countries",
  },
  {
    id: "emma",
    name: "Emma",
    avatar: "👩‍🎓",
    personality: "Witty, patient, enjoys teaching cultural differences",
    speaking_style: "Clear and articulate, gently corrects mistakes, uses British expressions",
    background: "A 28-year-old English teacher from London who loves helping people learn",
  },
  {
    id: "mia",
    name: "Mia",
    avatar: "🧑‍🎤",
    personality: "Adventurous, laid-back, enthusiastic about food and nature",
    speaking_style: "Relaxed Australian English, uses slang occasionally with explanations",
    background: "A 23-year-old backpacker from Sydney working remotely as a designer",
  },
];

export function getCharacter(id: string): ChatCharacter | undefined {
  return CHARACTERS.find((c) => c.id === id);
}

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
