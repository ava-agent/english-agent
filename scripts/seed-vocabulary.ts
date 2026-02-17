/**
 * Seed Vocabulary Script
 *
 * Generates initial vocabulary corpus for the English Learning Assistant.
 * Run with: npx tsx scripts/seed-vocabulary.ts
 *
 * This script seeds the Supabase vocabulary table with travel and software
 * engineering English vocabulary. It uses a predefined set of words with
 * example sentences and dialogues.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface VocabItem {
  word: string;
  pronunciation: string;
  definition: string;
  definition_zh: string;
  category: "travel" | "software";
  subcategory: string;
  difficulty_tier: number;
  example_sentences: { en: string; zh: string; context: string }[];
  contextual_dialogue: {
    scenario: string;
    lines: { speaker: string; text: string }[];
  };
  is_phrase: boolean;
  tags: string[];
  source: "seed";
}

// ============================================
// Travel English Vocabulary
// ============================================

const travelVocabulary: VocabItem[] = [
  // --- Airport ---
  {
    word: "boarding pass",
    pronunciation: "/ˈbɔːrdɪŋ pæs/",
    definition:
      "A document that gives a passenger permission to board an airplane for a particular flight.",
    definition_zh: "登机牌",
    category: "travel",
    subcategory: "airport",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "Please have your boarding pass ready before you reach the gate.",
        zh: "请在到达登机口之前准备好登机牌。",
        context: "at the airport gate",
      },
      {
        en: "You can download your boarding pass to your phone.",
        zh: "你可以把登机牌下载到手机上。",
        context: "online check-in",
      },
      {
        en: "I lost my boarding pass, can you reprint it for me?",
        zh: "我的登机牌丢了，能帮我重新打印一张吗？",
        context: "at the service counter",
      },
    ],
    contextual_dialogue: {
      scenario: "At the airport check-in counter",
      lines: [
        { speaker: "Staff", text: "Good morning! May I see your passport?" },
        { speaker: "You", text: "Sure, here you go." },
        {
          speaker: "Staff",
          text: "Here is your boarding pass. Your gate is B12.",
        },
        { speaker: "You", text: "Thank you. What time does boarding start?" },
        { speaker: "Staff", text: "Boarding begins at 2:30 PM." },
      ],
    },
    is_phrase: true,
    tags: ["airport", "essential"],
    source: "seed",
  },
  {
    word: "check in",
    pronunciation: "/tʃek ɪn/",
    definition:
      "To register at a hotel, airport, or other establishment upon arrival.",
    definition_zh: "办理登记/入住手续",
    category: "travel",
    subcategory: "airport",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "We need to check in at least two hours before the flight.",
        zh: "我们需要在航班起飞前至少两小时办理登机手续。",
        context: "at the airport",
      },
      {
        en: "You can check in online to save time.",
        zh: "你可以在线办理登机手续以节省时间。",
        context: "travel tip",
      },
      {
        en: "What time can I check in to the hotel?",
        zh: "我几点可以办理酒店入住？",
        context: "at a hotel",
      },
    ],
    contextual_dialogue: {
      scenario: "Arriving at a hotel",
      lines: [
        { speaker: "You", text: "Hi, I'd like to check in, please." },
        {
          speaker: "Receptionist",
          text: "Of course! May I have your name?",
        },
        { speaker: "You", text: "It's under Zhang Wei." },
        {
          speaker: "Receptionist",
          text: "I found your reservation. Here's your room key.",
        },
      ],
    },
    is_phrase: true,
    tags: ["airport", "hotel", "essential"],
    source: "seed",
  },
  {
    word: "departure",
    pronunciation: "/dɪˈpɑːrtʃər/",
    definition:
      "The act of leaving, especially to start a journey; the scheduled time of leaving.",
    definition_zh: "出发，离开；出发时间",
    category: "travel",
    subcategory: "airport",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "The departure time has been changed to 4:00 PM.",
        zh: "出发时间已更改为下午4点。",
        context: "flight schedule",
      },
      {
        en: "Please go to the departure lounge after security.",
        zh: "过完安检后请前往候机大厅。",
        context: "at the airport",
      },
      {
        en: "Our departure was delayed due to bad weather.",
        zh: "由于天气恶劣，我们的出发被延迟了。",
        context: "travel experience",
      },
    ],
    contextual_dialogue: {
      scenario: "Checking the departure board",
      lines: [
        {
          speaker: "You",
          text: "Excuse me, where is the departure board?",
        },
        {
          speaker: "Staff",
          text: "It's right over there, next to Gate A.",
        },
        {
          speaker: "You",
          text: "I see my flight is delayed. Is there a new departure time?",
        },
        {
          speaker: "Staff",
          text: "Yes, the new departure time is 6:30 PM.",
        },
      ],
    },
    is_phrase: false,
    tags: ["airport", "essential"],
    source: "seed",
  },
  {
    word: "luggage",
    pronunciation: "/ˈlʌɡɪdʒ/",
    definition:
      "Bags, suitcases, and other containers used for carrying personal belongings when traveling.",
    definition_zh: "行李",
    category: "travel",
    subcategory: "airport",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "How many pieces of luggage are you checking?",
        zh: "你要托运几件行李？",
        context: "at check-in",
      },
      {
        en: "My luggage didn't arrive on the carousel.",
        zh: "我的行李没有在传送带上出现。",
        context: "baggage claim",
      },
      {
        en: "There's a weight limit of 23 kilos per piece of luggage.",
        zh: "每件行李限重23公斤。",
        context: "airline policy",
      },
    ],
    contextual_dialogue: {
      scenario: "At baggage claim",
      lines: [
        {
          speaker: "You",
          text: "Excuse me, my luggage hasn't come out yet.",
        },
        {
          speaker: "Staff",
          text: "Which flight were you on?",
        },
        { speaker: "You", text: "Flight CA123 from Beijing." },
        {
          speaker: "Staff",
          text: "Let me check. Can you describe your luggage?",
        },
        {
          speaker: "You",
          text: "It's a large black suitcase with a red tag.",
        },
      ],
    },
    is_phrase: false,
    tags: ["airport", "essential"],
    source: "seed",
  },
  {
    word: "customs",
    pronunciation: "/ˈkʌstəmz/",
    definition:
      "The government department that collects taxes on goods imported into a country and checks for prohibited items.",
    definition_zh: "海关",
    category: "travel",
    subcategory: "airport",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "You need to go through customs after picking up your luggage.",
        zh: "取完行李后你需要过海关。",
        context: "arrival procedure",
      },
      {
        en: "Do you have anything to declare at customs?",
        zh: "你在海关有什么需要申报的吗？",
        context: "customs inspection",
      },
      {
        en: "The customs officer asked to see my passport.",
        zh: "海关人员要求看我的护照。",
        context: "customs process",
      },
    ],
    contextual_dialogue: {
      scenario: "Going through customs",
      lines: [
        { speaker: "Officer", text: "Do you have anything to declare?" },
        {
          speaker: "You",
          text: "No, I don't have anything to declare.",
        },
        {
          speaker: "Officer",
          text: "What is the purpose of your visit?",
        },
        { speaker: "You", text: "I'm here for vacation." },
        { speaker: "Officer", text: "How long will you be staying?" },
        { speaker: "You", text: "About ten days." },
      ],
    },
    is_phrase: false,
    tags: ["airport", "essential"],
    source: "seed",
  },
  // --- Restaurant ---
  {
    word: "reservation",
    pronunciation: "/ˌrezərˈveɪʃn/",
    definition:
      "An arrangement to have a table, room, or seat kept for you at a restaurant, hotel, or on a plane.",
    definition_zh: "预订",
    category: "travel",
    subcategory: "restaurant",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "I'd like to make a reservation for two at 7 PM.",
        zh: "我想预订晚上7点两个人的位子。",
        context: "calling a restaurant",
      },
      {
        en: "Do you have a reservation under the name Zhang?",
        zh: "请问有张先生的预订吗？",
        context: "arriving at restaurant",
      },
      {
        en: "We don't have a reservation. Is there a table available?",
        zh: "我们没有预订。请问有空桌吗？",
        context: "walk-in dining",
      },
    ],
    contextual_dialogue: {
      scenario: "Making a restaurant reservation by phone",
      lines: [
        { speaker: "Staff", text: "Good evening, how can I help you?" },
        {
          speaker: "You",
          text: "I'd like to make a reservation for tonight.",
        },
        { speaker: "Staff", text: "For how many people?" },
        {
          speaker: "You",
          text: "Two people, around 7 o'clock if possible.",
        },
        {
          speaker: "Staff",
          text: "We have a table available at 7:15. Would that work?",
        },
        { speaker: "You", text: "That's perfect, thank you." },
      ],
    },
    is_phrase: false,
    tags: ["restaurant", "essential"],
    source: "seed",
  },
  {
    word: "appetizer",
    pronunciation: "/ˈæpɪtaɪzər/",
    definition:
      "A small dish of food served before the main course to stimulate appetite.",
    definition_zh: "开胃菜，前菜",
    category: "travel",
    subcategory: "restaurant",
    difficulty_tier: 2,
    example_sentences: [
      {
        en: "Would you like to start with an appetizer?",
        zh: "您想先来个开胃菜吗？",
        context: "ordering at restaurant",
      },
      {
        en: "The bruschetta is a great appetizer here.",
        zh: "这里的意式烤面包片是很棒的开胃菜。",
        context: "restaurant recommendation",
      },
      {
        en: "We'll share an appetizer and each get a main course.",
        zh: "我们分享一份开胃菜，然后各点一份主菜。",
        context: "ordering strategy",
      },
    ],
    contextual_dialogue: {
      scenario: "Ordering food at a restaurant",
      lines: [
        {
          speaker: "Waiter",
          text: "Are you ready to order?",
        },
        {
          speaker: "You",
          text: "Yes, we'd like the soup as an appetizer.",
        },
        { speaker: "Waiter", text: "And for your main course?" },
        {
          speaker: "You",
          text: "I'll have the grilled salmon, please.",
        },
      ],
    },
    is_phrase: false,
    tags: ["restaurant", "food"],
    source: "seed",
  },
  {
    word: "the bill",
    pronunciation: "/ðə bɪl/",
    definition:
      "A statement of money owed for goods or services, especially in a restaurant.",
    definition_zh: "账单",
    category: "travel",
    subcategory: "restaurant",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "Could we have the bill, please?",
        zh: "请给我们账单好吗？",
        context: "at a restaurant",
      },
      {
        en: "Is service charge included in the bill?",
        zh: "账单里包含服务费吗？",
        context: "checking the bill",
      },
      {
        en: "Let me get the bill. It's my treat tonight.",
        zh: "让我来结账。今晚我请客。",
        context: "paying at restaurant",
      },
    ],
    contextual_dialogue: {
      scenario: "Asking for the bill at a restaurant",
      lines: [
        { speaker: "You", text: "Excuse me, could we have the bill?" },
        { speaker: "Waiter", text: "Of course. Would you like to pay together or separately?" },
        { speaker: "You", text: "Together, please. Can I pay by card?" },
        { speaker: "Waiter", text: "Yes, we accept all major cards." },
      ],
    },
    is_phrase: true,
    tags: ["restaurant", "essential"],
    source: "seed",
  },
  // --- Hotel ---
  {
    word: "room service",
    pronunciation: "/ruːm ˈsɜːrvɪs/",
    definition:
      "A hotel service that delivers food, drinks, or other items directly to a guest's room.",
    definition_zh: "客房服务",
    category: "travel",
    subcategory: "hotel",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "I'd like to order room service for breakfast.",
        zh: "我想订客房早餐服务。",
        context: "at a hotel",
      },
      {
        en: "Room service is available 24 hours a day.",
        zh: "客房服务全天24小时可用。",
        context: "hotel amenity",
      },
      {
        en: "The room service menu is on the desk in your room.",
        zh: "客房服务菜单在你房间的桌子上。",
        context: "hotel check-in",
      },
    ],
    contextual_dialogue: {
      scenario: "Ordering room service at a hotel",
      lines: [
        { speaker: "Staff", text: "Room service, how can I help you?" },
        {
          speaker: "You",
          text: "I'd like to order breakfast to my room, please.",
        },
        { speaker: "Staff", text: "What would you like?" },
        {
          speaker: "You",
          text: "A coffee and a continental breakfast, please.",
        },
        {
          speaker: "Staff",
          text: "That will be delivered in about 20 minutes.",
        },
      ],
    },
    is_phrase: true,
    tags: ["hotel", "essential"],
    source: "seed",
  },
  // --- Transportation ---
  {
    word: "one-way ticket",
    pronunciation: "/wʌn weɪ ˈtɪkɪt/",
    definition: "A ticket for travel to a destination but not back again.",
    definition_zh: "单程票",
    category: "travel",
    subcategory: "transportation",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "I'd like a one-way ticket to London, please.",
        zh: "请给我一张去伦敦的单程票。",
        context: "at a train station",
      },
      {
        en: "A one-way ticket is cheaper than a round trip.",
        zh: "单程票比往返票便宜。",
        context: "comparing prices",
      },
      {
        en: "Do you want a one-way ticket or a return?",
        zh: "你要单程票还是往返票？",
        context: "buying tickets",
      },
    ],
    contextual_dialogue: {
      scenario: "Buying a train ticket",
      lines: [
        {
          speaker: "You",
          text: "One-way ticket to downtown, please.",
        },
        { speaker: "Cashier", text: "That'll be $5.50." },
        { speaker: "You", text: "Which platform should I go to?" },
        { speaker: "Cashier", text: "Platform 3, the train leaves in 10 minutes." },
      ],
    },
    is_phrase: true,
    tags: ["transportation", "essential"],
    source: "seed",
  },
  // --- Directions ---
  {
    word: "intersection",
    pronunciation: "/ˌɪntərˈsekʃn/",
    definition: "A point where two or more roads cross each other.",
    definition_zh: "十字路口，交叉路口",
    category: "travel",
    subcategory: "directions",
    difficulty_tier: 2,
    example_sentences: [
      {
        en: "Turn left at the next intersection.",
        zh: "在下一个路口左转。",
        context: "giving directions",
      },
      {
        en: "The restaurant is just past the intersection.",
        zh: "餐厅就在过了路口的地方。",
        context: "location description",
      },
      {
        en: "Be careful at this intersection, it's very busy.",
        zh: "在这个路口要小心，车很多。",
        context: "traffic warning",
      },
    ],
    contextual_dialogue: {
      scenario: "Asking for directions",
      lines: [
        {
          speaker: "You",
          text: "Excuse me, how do I get to the museum?",
        },
        {
          speaker: "Local",
          text: "Go straight and turn right at the second intersection.",
        },
        { speaker: "You", text: "Is it far from here?" },
        { speaker: "Local", text: "About a 10-minute walk." },
      ],
    },
    is_phrase: false,
    tags: ["directions"],
    source: "seed",
  },
  // --- Shopping ---
  {
    word: "try on",
    pronunciation: "/traɪ ɒn/",
    definition: "To put on a piece of clothing to see if it fits or looks good.",
    definition_zh: "试穿",
    category: "travel",
    subcategory: "shopping",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "Can I try on this jacket in a medium?",
        zh: "我能试穿这件中号的夹克吗？",
        context: "clothing store",
      },
      {
        en: "The fitting room is over there if you want to try it on.",
        zh: "如果你想试穿，试衣间在那边。",
        context: "shopping assistance",
      },
      {
        en: "I tried on three pairs of shoes before finding the right one.",
        zh: "我试穿了三双鞋才找到合适的。",
        context: "shopping experience",
      },
    ],
    contextual_dialogue: {
      scenario: "Shopping for clothes",
      lines: [
        { speaker: "You", text: "Excuse me, can I try on this shirt?" },
        {
          speaker: "Staff",
          text: "Of course! The fitting rooms are in the back.",
        },
        {
          speaker: "You",
          text: "Do you have this in a smaller size?",
        },
        {
          speaker: "Staff",
          text: "Let me check... Yes, here's a small.",
        },
      ],
    },
    is_phrase: true,
    tags: ["shopping", "essential"],
    source: "seed",
  },
  // --- Emergency ---
  {
    word: "pharmacy",
    pronunciation: "/ˈfɑːrməsi/",
    definition: "A store where medicinal drugs are sold or prepared.",
    definition_zh: "药店，药房",
    category: "travel",
    subcategory: "emergency",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "Is there a pharmacy nearby?",
        zh: "附近有药店吗？",
        context: "asking for help",
      },
      {
        en: "I need to go to the pharmacy to buy some cold medicine.",
        zh: "我需要去药店买点感冒药。",
        context: "feeling sick",
      },
      {
        en: "The pharmacy closes at 9 PM.",
        zh: "药店晚上9点关门。",
        context: "store hours",
      },
    ],
    contextual_dialogue: {
      scenario: "Looking for a pharmacy",
      lines: [
        {
          speaker: "You",
          text: "Excuse me, where is the nearest pharmacy?",
        },
        {
          speaker: "Local",
          text: "There's one on the next block, next to the supermarket.",
        },
        { speaker: "You", text: "Is it open now?" },
        { speaker: "Local", text: "Yes, it should be open until 10 PM." },
      ],
    },
    is_phrase: false,
    tags: ["emergency", "essential"],
    source: "seed",
  },
  // --- Sightseeing ---
  {
    word: "guided tour",
    pronunciation: "/ˈɡaɪdɪd tʊr/",
    definition:
      "A tour of a place led by a guide who provides commentary and information.",
    definition_zh: "导游解说的游览",
    category: "travel",
    subcategory: "sightseeing",
    difficulty_tier: 2,
    example_sentences: [
      {
        en: "We signed up for a guided tour of the old city.",
        zh: "我们报名参加了老城区的导游团。",
        context: "sightseeing plan",
      },
      {
        en: "The guided tour lasts about two hours.",
        zh: "导游游览大约持续两个小时。",
        context: "tour information",
      },
      {
        en: "Is the guided tour available in English?",
        zh: "有英文的导游游览吗？",
        context: "tourist inquiry",
      },
    ],
    contextual_dialogue: {
      scenario: "At a tourist information center",
      lines: [
        {
          speaker: "You",
          text: "Do you offer guided tours of the city?",
        },
        {
          speaker: "Staff",
          text: "Yes, we have tours at 10 AM and 2 PM daily.",
        },
        { speaker: "You", text: "How much is the tour?" },
        { speaker: "Staff", text: "It's $25 per person, including entrance fees." },
      ],
    },
    is_phrase: true,
    tags: ["sightseeing"],
    source: "seed",
  },
];

// ============================================
// Software Engineering English Vocabulary
// ============================================

const softwareVocabulary: VocabItem[] = [
  // --- Technical Core ---
  {
    word: "refactor",
    pronunciation: "/riːˈfæktər/",
    definition:
      "To restructure existing code without changing its external behavior, typically to improve readability, reduce complexity, or improve performance.",
    definition_zh: "重构（代码）",
    category: "software",
    subcategory: "technical",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "We should refactor this function before adding new features.",
        zh: "在添加新功能之前我们应该重构这个函数。",
        context: "code review",
      },
      {
        en: "I spent the morning refactoring the authentication module.",
        zh: "我花了一上午时间重构认证模块。",
        context: "daily standup",
      },
      {
        en: "The code works but it needs refactoring for better maintainability.",
        zh: "代码能用但需要重构以提升可维护性。",
        context: "tech debt discussion",
      },
    ],
    contextual_dialogue: {
      scenario: "During a code review",
      lines: [
        {
          speaker: "Reviewer",
          text: "This function is getting pretty long. Should we refactor it?",
        },
        {
          speaker: "Developer",
          text: "Good point. I can extract the validation logic into a separate function.",
        },
        {
          speaker: "Reviewer",
          text: "That would make it much easier to test too.",
        },
        {
          speaker: "Developer",
          text: "I'll refactor it in this PR and add unit tests.",
        },
      ],
    },
    is_phrase: false,
    tags: ["technical", "essential"],
    source: "seed",
  },
  {
    word: "deploy",
    pronunciation: "/dɪˈplɔɪ/",
    definition:
      "To make a software application available for use, typically by moving it to a production server or environment.",
    definition_zh: "部署",
    category: "software",
    subcategory: "technical",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "We'll deploy the new version after the QA team signs off.",
        zh: "QA团队确认后我们就部署新版本。",
        context: "release planning",
      },
      {
        en: "The deploy failed because of a missing environment variable.",
        zh: "部署失败了，因为缺少一个环境变量。",
        context: "debugging deployment",
      },
      {
        en: "We deploy to production every two weeks.",
        zh: "我们每两周部署一次到生产环境。",
        context: "team process",
      },
    ],
    contextual_dialogue: {
      scenario: "Discussing a release plan",
      lines: [
        { speaker: "Lead", text: "Are we ready to deploy to production?" },
        {
          speaker: "Dev",
          text: "All tests are passing. We can deploy after lunch.",
        },
        {
          speaker: "Lead",
          text: "Make sure to monitor the dashboards after the deploy.",
        },
        { speaker: "Dev", text: "Will do. I'll keep an eye on the error rate." },
      ],
    },
    is_phrase: false,
    tags: ["technical", "essential"],
    source: "seed",
  },
  {
    word: "endpoint",
    pronunciation: "/ˈendpɔɪnt/",
    definition:
      "A specific URL in an API that an application can make requests to in order to perform operations.",
    definition_zh: "接口端点，API端点",
    category: "software",
    subcategory: "technical",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "The GET /users endpoint returns a list of all users.",
        zh: "GET /users 端点返回所有用户的列表。",
        context: "API documentation",
      },
      {
        en: "We need to add a new endpoint for password reset.",
        zh: "我们需要添加一个新的密码重置端点。",
        context: "feature development",
      },
      {
        en: "This endpoint requires authentication.",
        zh: "这个端点需要身份验证。",
        context: "API design",
      },
    ],
    contextual_dialogue: {
      scenario: "Discussing API design",
      lines: [
        {
          speaker: "Frontend",
          text: "What endpoint should I call to get user data?",
        },
        { speaker: "Backend", text: "Use GET /api/v1/users/:id." },
        { speaker: "Frontend", text: "Does it need an auth token?" },
        {
          speaker: "Backend",
          text: "Yes, pass the JWT in the Authorization header.",
        },
      ],
    },
    is_phrase: false,
    tags: ["technical", "api"],
    source: "seed",
  },
  // --- Code Review ---
  {
    word: "pull request",
    pronunciation: "/pʊl rɪˈkwest/",
    definition:
      "A request to merge code changes from one branch into another, allowing team members to review the code before merging.",
    definition_zh: "拉取请求（代码合并请求）",
    category: "software",
    subcategory: "code_review",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "I've opened a pull request for the login feature.",
        zh: "我已经为登录功能提交了一个PR。",
        context: "team chat",
      },
      {
        en: "Could you review my pull request when you have time?",
        zh: "你有时间的时候能帮我审查一下PR吗？",
        context: "asking for review",
      },
      {
        en: "The pull request has two approvals, it's ready to merge.",
        zh: "这个PR已经有两个批准了，可以合并了。",
        context: "merge discussion",
      },
    ],
    contextual_dialogue: {
      scenario: "Asking for a code review on Slack",
      lines: [
        {
          speaker: "You",
          text: "Hey, I just opened a pull request for the search feature. Mind taking a look?",
        },
        {
          speaker: "Colleague",
          text: "Sure, I'll review it this afternoon.",
        },
        {
          speaker: "You",
          text: "Thanks! It's a small change, shouldn't take long.",
        },
        {
          speaker: "Colleague",
          text: "LGTM, I'll approve it after one minor suggestion.",
        },
      ],
    },
    is_phrase: true,
    tags: ["code_review", "essential", "git"],
    source: "seed",
  },
  {
    word: "LGTM",
    pronunciation: "/el dʒiː tiː em/",
    definition:
      "Abbreviation for 'Looks Good To Me', commonly used in code reviews to indicate approval.",
    definition_zh: "看起来不错（代码审查中的批准用语）",
    category: "software",
    subcategory: "code_review",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "The changes look clean. LGTM!",
        zh: "改动看起来很干净。LGTM！",
        context: "code review comment",
      },
      {
        en: "After fixing the typo, LGTM — feel free to merge.",
        zh: "修复了那个拼写错误后，LGTM——可以合并了。",
        context: "review approval",
      },
      {
        en: "Two reviewers said LGTM, so I merged the PR.",
        zh: "两个审查者都说了LGTM，所以我合并了PR。",
        context: "team update",
      },
    ],
    contextual_dialogue: {
      scenario: "Code review feedback",
      lines: [
        {
          speaker: "Reviewer",
          text: "I reviewed the changes. LGTM overall, just one nit.",
        },
        { speaker: "Developer", text: "What's the nit?" },
        {
          speaker: "Reviewer",
          text: "The variable name 'x' could be more descriptive.",
        },
        {
          speaker: "Developer",
          text: "Good catch, I'll rename it to 'userCount'.",
        },
      ],
    },
    is_phrase: true,
    tags: ["code_review", "slang"],
    source: "seed",
  },
  // --- Meeting ---
  {
    word: "stand-up",
    pronunciation: "/ˈstænd ʌp/",
    definition:
      "A short daily team meeting where each member briefly shares what they did, what they'll do, and any blockers.",
    definition_zh: "站会（每日简短团队会议）",
    category: "software",
    subcategory: "meeting",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "Let's discuss this after the stand-up.",
        zh: "我们站会后再讨论这个。",
        context: "team communication",
      },
      {
        en: "In today's stand-up, I mentioned the database issue.",
        zh: "在今天的站会上，我提到了数据库问题。",
        context: "daily standup",
      },
      {
        en: "Our stand-up is at 10 AM every day.",
        zh: "我们的站会是每天上午10点。",
        context: "team schedule",
      },
    ],
    contextual_dialogue: {
      scenario: "During a daily stand-up",
      lines: [
        { speaker: "Scrum Master", text: "Who wants to go first?" },
        {
          speaker: "Developer",
          text: "I'll go. Yesterday I finished the user profile page. Today I'll work on the settings page. No blockers.",
        },
        {
          speaker: "Scrum Master",
          text: "Great. Anyone have any blockers they need help with?",
        },
        {
          speaker: "Another Dev",
          text: "I'm blocked on the API integration — waiting for the backend team.",
        },
      ],
    },
    is_phrase: true,
    tags: ["meeting", "agile", "essential"],
    source: "seed",
  },
  {
    word: "blocker",
    pronunciation: "/ˈblɒkər/",
    definition:
      "An issue or obstacle that prevents progress on a task or project.",
    definition_zh: "阻碍因素，障碍",
    category: "software",
    subcategory: "meeting",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "The missing API documentation is a blocker for the frontend team.",
        zh: "缺少API文档是前端团队的阻碍因素。",
        context: "standup meeting",
      },
      {
        en: "Do you have any blockers I can help with?",
        zh: "你有什么需要我帮忙解决的障碍吗？",
        context: "1-on-1 meeting",
      },
      {
        en: "This bug is a blocker for the release.",
        zh: "这个bug是发布的阻碍。",
        context: "release planning",
      },
    ],
    contextual_dialogue: {
      scenario: "Discussing blockers in a meeting",
      lines: [
        {
          speaker: "Manager",
          text: "Are there any blockers for the sprint goal?",
        },
        {
          speaker: "Dev",
          text: "Yes, we're blocked on the payment API integration.",
        },
        {
          speaker: "Manager",
          text: "What do you need to unblock it?",
        },
        {
          speaker: "Dev",
          text: "We need the API credentials from the payment provider.",
        },
      ],
    },
    is_phrase: false,
    tags: ["meeting", "agile", "essential"],
    source: "seed",
  },
  // --- Slack/Email ---
  {
    word: "heads up",
    pronunciation: "/hedz ʌp/",
    definition:
      "An advance warning or notification about something that is going to happen.",
    definition_zh: "提前通知，预先告知",
    category: "software",
    subcategory: "communication",
    difficulty_tier: 1,
    example_sentences: [
      {
        en: "Just a heads up — the staging server will be down for maintenance tonight.",
        zh: "提前通知一下——测试服务器今晚要停机维护。",
        context: "team Slack channel",
      },
      {
        en: "Thanks for the heads up about the meeting time change.",
        zh: "谢谢你提前告知会议时间变更。",
        context: "Slack message",
      },
      {
        en: "I wanted to give you a heads up that the deadline has moved.",
        zh: "我想提前告诉你截止日期变了。",
        context: "email",
      },
    ],
    contextual_dialogue: {
      scenario: "Slack team channel",
      lines: [
        {
          speaker: "DevOps",
          text: "Heads up everyone — we'll be migrating the database this Saturday.",
        },
        {
          speaker: "Dev",
          text: "Thanks for the heads up. Will there be any downtime?",
        },
        {
          speaker: "DevOps",
          text: "About 30 minutes, between 2-3 AM.",
        },
        {
          speaker: "Dev",
          text: "Got it, I'll make sure to wrap up any pending work before then.",
        },
      ],
    },
    is_phrase: true,
    tags: ["communication", "essential", "informal"],
    source: "seed",
  },
  // --- Project Management ---
  {
    word: "scope creep",
    pronunciation: "/skoʊp kriːp/",
    definition:
      "The gradual, uncontrolled expansion of a project's requirements beyond its original goals.",
    definition_zh: "范围蔓延（项目需求不受控制地扩展）",
    category: "software",
    subcategory: "project_management",
    difficulty_tier: 2,
    example_sentences: [
      {
        en: "We need to be careful about scope creep on this project.",
        zh: "我们需要注意这个项目的范围蔓延。",
        context: "project planning",
      },
      {
        en: "The feature kept growing due to scope creep, and we missed the deadline.",
        zh: "由于范围蔓延，功能不断增长，我们错过了截止日期。",
        context: "retrospective",
      },
      {
        en: "To avoid scope creep, let's define clear acceptance criteria.",
        zh: "为了避免范围蔓延，让我们定义清晰的验收标准。",
        context: "sprint planning",
      },
    ],
    contextual_dialogue: {
      scenario: "Sprint retrospective",
      lines: [
        {
          speaker: "PM",
          text: "Why did we miss the sprint goal this time?",
        },
        {
          speaker: "Dev",
          text: "I think we had some scope creep on the search feature.",
        },
        {
          speaker: "PM",
          text: "What extra requirements were added?",
        },
        {
          speaker: "Dev",
          text: "The stakeholder asked for advanced filters mid-sprint, which wasn't in the original plan.",
        },
      ],
    },
    is_phrase: true,
    tags: ["project_management", "agile"],
    source: "seed",
  },
  // --- Technical Documentation ---
  {
    word: "deprecated",
    pronunciation: "/ˈdeprəkeɪtɪd/",
    definition:
      "Software or a feature that is still available but no longer recommended for use, typically because a better alternative exists.",
    definition_zh: "已弃用的，已过时的",
    category: "software",
    subcategory: "documentation",
    difficulty_tier: 2,
    example_sentences: [
      {
        en: "This API endpoint is deprecated and will be removed in v3.",
        zh: "这个API端点已弃用，将在v3中移除。",
        context: "API documentation",
      },
      {
        en: "We should migrate away from the deprecated library.",
        zh: "我们应该从已弃用的库迁移走。",
        context: "tech debt review",
      },
      {
        en: "The deprecated function still works, but use the new one instead.",
        zh: "已弃用的函数仍然能用，但请改用新的。",
        context: "code comment",
      },
    ],
    contextual_dialogue: {
      scenario: "Discussing tech debt",
      lines: [
        {
          speaker: "Senior Dev",
          text: "We're still using the deprecated authentication library.",
        },
        {
          speaker: "Junior Dev",
          text: "What should we migrate to?",
        },
        {
          speaker: "Senior Dev",
          text: "The new Auth v2 library. It has better security and performance.",
        },
        {
          speaker: "Junior Dev",
          text: "I'll create a ticket to track the migration.",
        },
      ],
    },
    is_phrase: false,
    tags: ["documentation", "technical"],
    source: "seed",
  },
];

async function seed() {
  const allVocabulary = [...travelVocabulary, ...softwareVocabulary];

  console.log(`Seeding ${allVocabulary.length} vocabulary items...`);

  // Insert in batches of 50
  const batchSize = 50;
  for (let i = 0; i < allVocabulary.length; i += batchSize) {
    const batch = allVocabulary.slice(i, i + batchSize);
    const { error } = await supabase.from("vocabulary").insert(batch);

    if (error) {
      console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
    } else {
      console.log(
        `Inserted batch ${i / batchSize + 1} (${batch.length} items)`
      );
    }
  }

  // Verify
  const { count } = await supabase
    .from("vocabulary")
    .select("*", { count: "exact", head: true });
  console.log(`\nTotal vocabulary items in database: ${count}`);

  // Show breakdown
  const { data: categories } = await supabase
    .from("vocabulary")
    .select("category");
  if (categories) {
    const travel = categories.filter((c) => c.category === "travel").length;
    const software = categories.filter(
      (c) => c.category === "software"
    ).length;
    console.log(`Travel: ${travel}, Software: ${software}`);
  }
}

seed().catch(console.error);
