/**
 * Reading Aloud Practice Passages - CEFR Levels Pre-A1 to C1
 * Each passage includes comprehension questions for practice
 */

export interface ReadingQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  level: string;
  category: string;
  duration: number; // in minutes
  passage: string;
  questions: ReadingQuestion[];
}

export const readingPassages: ReadingPassage[] = [
  // Pre-A1 Level
  {
    id: 'pre-a1-1',
    title: 'My Cat',
    level: 'Pre-A1',
    category: 'Daily Life',
    duration: 1,
    passage:
      'This is my cat. Her name is Luna. She is small and black. Luna is two years old. She likes to play with a ball. Luna sleeps on my bed. She is a good cat. I love Luna very much.',
    questions: [
      {
        id: '1',
        question: "What is the cat's name?",
        options: ['Bella', 'Luna', 'Mia', 'Lucy'],
        correctAnswer: 1,
        explanation: 'The passage states "Her name is Luna."',
      },
      {
        id: '2',
        question: 'What color is Luna?',
        options: ['White', 'Brown', 'Black', 'Gray'],
        correctAnswer: 2,
        explanation: 'The passage says "She is small and black."',
      },
      {
        id: '3',
        question: 'What does Luna like to play with?',
        options: ['A ball', 'A toy', 'A mouse', 'A string'],
        correctAnswer: 0,
        explanation: 'The text mentions "She likes to play with a ball."',
      },
      {
        id: '4',
        question: 'Where does Luna sleep?',
        options: ['On the floor', 'In a box', 'On the bed', 'Under the table'],
        correctAnswer: 2,
        explanation: 'The passage states "Luna sleeps on my bed."',
      },
    ],
  },

  // A1 Level
  {
    id: 'a1-1',
    title: 'My Daily Routine',
    level: 'A1',
    category: 'Daily Life',
    duration: 2,
    passage:
      'Every day, I wake up at seven o\'clock. First, I brush my teeth and wash my face. Then I eat breakfast with my family. I usually have toast and orange juice. After breakfast, I go to school by bus. School starts at eight thirty. I have lunch at school at twelve o\'clock. After school, I go home and do my homework. In the evening, I watch TV or read a book. I go to bed at ten o\'clock.',
    questions: [
      {
        id: '1',
        question: 'What time does the person wake up?',
        options: ['Six o\'clock', 'Seven o\'clock', 'Eight o\'clock', 'Nine o\'clock'],
        correctAnswer: 1,
        explanation: 'The passage begins with "Every day, I wake up at seven o\'clock."',
      },
      {
        id: '2',
        question: 'How does the person go to school?',
        options: ['By car', 'By bike', 'By bus', 'On foot'],
        correctAnswer: 2,
        explanation: 'The text states "I go to school by bus."',
      },
      {
        id: '3',
        question: 'What time does school start?',
        options: ['Seven thirty', 'Eight o\'clock', 'Eight thirty', 'Nine o\'clock'],
        correctAnswer: 2,
        explanation: 'The passage says "School starts at eight thirty."',
      },
      {
        id: '4',
        question: 'What does the person usually have for breakfast?',
        options: [
          'Cereal and milk',
          'Toast and orange juice',
          'Eggs and bacon',
          'Pancakes and coffee',
        ],
        correctAnswer: 1,
        explanation: 'The text mentions "I usually have toast and orange juice."',
      },
    ],
  },

  // A1-A2 Level
  {
    id: 'a1-a2-1',
    title: 'At the Market',
    level: 'A1-A2',
    category: 'Shopping',
    duration: 2,
    passage:
      'On Saturday morning, my mother and I go to the market near our house. The market is very big and crowded. There are many different shops selling fruit, vegetables, meat, and fish. My mother always buys fresh vegetables for the week. Today, she bought tomatoes, carrots, and lettuce. I helped her carry the shopping bags. We also went to the bakery and bought some fresh bread. The bread smells delicious! After shopping, we went to a small café and had hot chocolate. I really enjoy going to the market with my mother.',
    questions: [
      {
        id: '1',
        question: 'When do they go to the market?',
        options: ['Friday evening', 'Saturday morning', 'Sunday afternoon', 'Monday morning'],
        correctAnswer: 1,
        explanation: 'The first sentence states "On Saturday morning, my mother and I go to the market."',
      },
      {
        id: '2',
        question: 'What vegetables did the mother buy today?',
        options: [
          'Potatoes, onions, and peppers',
          'Tomatoes, carrots, and lettuce',
          'Cucumbers, beans, and corn',
          'Cabbage, spinach, and broccoli',
        ],
        correctAnswer: 1,
        explanation: 'The passage says "she bought tomatoes, carrots, and lettuce."',
      },
      {
        id: '3',
        question: 'What did they buy at the bakery?',
        options: ['Cakes', 'Cookies', 'Bread', 'Donuts'],
        correctAnswer: 2,
        explanation: 'The text mentions "We also went to the bakery and bought some fresh bread."',
      },
      {
        id: '4',
        question: 'What did they drink at the café?',
        options: ['Coffee', 'Tea', 'Hot chocolate', 'Juice'],
        correctAnswer: 2,
        explanation: 'The passage states "we went to a small café and had hot chocolate."',
      },
    ],
  },

  // A2 Level
  {
    id: 'a2-1',
    title: 'A School Trip',
    level: 'A2',
    category: 'Education',
    duration: 2,
    passage:
      'Last week, our class went on a school trip to the science museum. We left school early in the morning and took a coach to the city center. The journey took about an hour. When we arrived at the museum, a guide showed us around. We saw many interesting exhibits about space, animals, and technology. My favorite part was the planetarium, where we watched a film about the solar system. We learned that Jupiter is the largest planet and that Saturn has beautiful rings. After the tour, we had lunch in the museum café. Everyone had a great time and we learned a lot of new things. I would love to visit the museum again.',
    questions: [
      {
        id: '1',
        question: 'Where did the class go on their trip?',
        options: [
          'To a zoo',
          'To a science museum',
          'To an art gallery',
          'To a historical site',
        ],
        correctAnswer: 1,
        explanation: 'The first sentence says "our class went on a school trip to the science museum."',
      },
      {
        id: '2',
        question: 'How long did the journey take?',
        options: ['30 minutes', 'About an hour', 'Two hours', 'Three hours'],
        correctAnswer: 1,
        explanation: 'The passage states "The journey took about an hour."',
      },
      {
        id: '3',
        question: 'What was the writer\'s favorite part?',
        options: ['The space exhibit', 'The animal section', 'The planetarium', 'The technology area'],
        correctAnswer: 2,
        explanation: 'The text says "My favorite part was the planetarium."',
      },
      {
        id: '4',
        question: 'Which planet is the largest?',
        options: ['Saturn', 'Jupiter', 'Mars', 'Earth'],
        correctAnswer: 1,
        explanation: 'The passage mentions "We learned that Jupiter is the largest planet."',
      },
    ],
  },

  // A2-B1 Level
  {
    id: 'a2-b1-1',
    title: 'A Trip to the Mountains',
    level: 'A2-B1',
    category: 'Travel',
    duration: 2,
    passage:
      'Last summer, my friends and I decided to spend a weekend in the mountains. We left early on Saturday morning and drove for three hours to reach the small village where we had booked a cottage. The weather was perfect—sunny and warm, but not too hot. After unpacking our bags, we went for a long hike through the forest. The views from the mountain top were breathtaking. We could see valleys, lakes, and even some small villages in the distance. On Sunday, we went swimming in a beautiful mountain lake. The water was incredibly cold, but refreshing. In the evening, we made a campfire and cooked sausages. It was a wonderful weekend away from the city, and we all felt relaxed and happy when we returned home.',
    questions: [
      {
        id: '1',
        question: 'How long did it take to drive to the village?',
        options: ['One hour', 'Two hours', 'Three hours', 'Four hours'],
        correctAnswer: 2,
        explanation: 'The passage states "drove for three hours to reach the small village."',
      },
      {
        id: '2',
        question: 'What did they do on Saturday afternoon?',
        options: [
          'Went swimming',
          'Went for a hike',
          'Made a campfire',
          'Visited a village',
        ],
        correctAnswer: 1,
        explanation: 'The text says "After unpacking our bags, we went for a long hike through the forest."',
      },
      {
        id: '3',
        question: 'What was the water in the mountain lake like?',
        options: ['Warm and pleasant', 'Cold but refreshing', 'Dirty and unclear', 'Too shallow'],
        correctAnswer: 1,
        explanation: 'The passage describes the water as "incredibly cold, but refreshing."',
      },
      {
        id: '4',
        question: 'How did they feel when they returned home?',
        options: [
          'Tired and bored',
          'Sad and disappointed',
          'Relaxed and happy',
          'Excited and energetic',
        ],
        correctAnswer: 2,
        explanation: 'The final sentence states "we all felt relaxed and happy when we returned home."',
      },
    ],
  },

  // B1 Level
  {
    id: 'b1-1',
    title: 'The Power of Habit',
    level: 'B1',
    category: 'Science',
    duration: 4,
    passage:
      'Habits are powerful forces in our daily lives. Scientists estimate that nearly 40 percent of our daily actions are habitual — performed automatically without much conscious thought. The brain develops habits as a way to conserve mental energy. Once a behaviour becomes habitual, it is stored in a part of the brain called the basal ganglia, which operates on autopilot. Breaking a bad habit requires conscious effort and replacement. Research by Dr. Philippa Lally at University College London found that it takes an average of 66 days — not 21 as commonly believed — to form a new habit. Understanding how habits work gives us the power to reshape our behaviour.',
    questions: [
      {
        id: '1',
        question: 'What percentage of our daily actions are habitual?',
        options: ['About 20%', 'About 30%', 'About 40%', 'About 50%'],
        correctAnswer: 2,
        explanation: 'The passage states that "nearly 40 percent of our daily actions are habitual."',
      },
      {
        id: '2',
        question: 'Where are habitual behaviors stored in the brain?',
        options: [
          'The frontal cortex',
          'The basal ganglia',
          'The hippocampus',
          'The cerebellum',
        ],
        correctAnswer: 1,
        explanation:
          'The passage mentions that habits are "stored in a part of the brain called the basal ganglia."',
      },
      {
        id: '3',
        question: 'According to research, how many days does it take to form a new habit?',
        options: ['21 days', '30 days', '45 days', '66 days'],
        correctAnswer: 3,
        explanation:
          'The passage states that research found "it takes an average of 66 days — not 21 as commonly believed — to form a new habit."',
      },
      {
        id: '4',
        question: 'What is required to break a bad habit?',
        options: [
          'Just willpower',
          'Conscious effort and replacement',
          'Medical treatment',
          'Ignoring it completely',
        ],
        correctAnswer: 1,
        explanation:
          'The passage clearly states that "Breaking a bad habit requires conscious effort and replacement."',
      },
    ],
  },

  // B1 Level - Technology
  {
    id: 'b1-2',
    title: 'Social Media and Young People',
    level: 'B1',
    category: 'Technology',
    duration: 4,
    passage:
      'Social media has become an integral part of young people\'s lives. Platforms such as Instagram, TikTok, and Snapchat allow teenagers to connect with friends, share experiences, and express themselves creatively. However, experts warn about potential negative effects. Excessive social media use has been linked to anxiety, depression, and sleep problems. The constant comparison with others\' carefully curated posts can harm self-esteem. Cyberbullying is another serious concern. Despite these risks, social media also offers benefits. It helps young people develop digital literacy skills, stay informed about current events, and maintain long-distance friendships. The key is finding a healthy balance and using these platforms mindfully.',
    questions: [
      {
        id: '1',
        question: 'Which platforms are mentioned in the passage?',
        options: [
          'Facebook, Twitter, and LinkedIn',
          'Instagram, TikTok, and Snapchat',
          'YouTube, Reddit, and Discord',
          'WhatsApp, Telegram, and WeChat',
        ],
        correctAnswer: 1,
        explanation: 'The passage specifically mentions "Instagram, TikTok, and Snapchat."',
      },
      {
        id: '2',
        question: 'What health problems are linked to excessive social media use?',
        options: [
          'Headaches and eye strain',
          'Anxiety, depression, and sleep problems',
          'Back pain and poor posture',
          'Weight gain and diabetes',
        ],
        correctAnswer: 1,
        explanation:
          'The text states "Excessive social media use has been linked to anxiety, depression, and sleep problems."',
      },
      {
        id: '3',
        question: 'What can harm young people\'s self-esteem?',
        options: [
          'Having too many followers',
          'Posting too many photos',
          'Comparing themselves with others\' posts',
          'Using multiple platforms',
        ],
        correctAnswer: 2,
        explanation:
          'The passage mentions "The constant comparison with others\' carefully curated posts can harm self-esteem."',
      },
      {
        id: '4',
        question: 'According to the passage, what is important for social media use?',
        options: [
          'Using it as much as possible',
          'Avoiding it completely',
          'Finding a healthy balance',
          'Only using one platform',
        ],
        correctAnswer: 2,
        explanation: 'The conclusion states "The key is finding a healthy balance and using these platforms mindfully."',
      },
    ],
  },

  // B1-B2 Level
  {
    id: 'b1-b2-1',
    title: 'The Benefits of Learning a Second Language',
    level: 'B1-B2',
    category: 'Education',
    duration: 3,
    passage:
      'Learning a second language offers numerous cognitive and practical benefits. Research has shown that bilingual individuals often demonstrate enhanced problem-solving skills and improved multitasking abilities. When you learn a new language, you\'re essentially training your brain to recognize, negotiate meaning, and communicate in different language systems. This mental workout strengthens the brain\'s executive function and can even delay the onset of dementia. Beyond cognitive advantages, knowing multiple languages opens doors to new career opportunities in our increasingly globalized world. It allows for deeper cultural understanding and the ability to connect with people from different backgrounds. Furthermore, language learning enhances first language skills, as students gain a better understanding of grammar, vocabulary, and language structure. Whether you\'re learning for personal enrichment or professional development, the investment in language learning pays dividends throughout life.',
    questions: [
      {
        id: '1',
        question: 'What cognitive benefits do bilingual individuals often show?',
        options: [
          'Better memory only',
          'Enhanced problem-solving and multitasking',
          'Faster reading speed',
          'Improved handwriting',
        ],
        correctAnswer: 1,
        explanation:
          'The passage states "bilingual individuals often demonstrate enhanced problem-solving skills and improved multitasking abilities."',
      },
      {
        id: '2',
        question: 'According to the text, learning a language can delay what condition?',
        options: ['Blindness', 'Hearing loss', 'Dementia', 'Arthritis'],
        correctAnswer: 2,
        explanation: 'The passage mentions that language learning "can even delay the onset of dementia."',
      },
      {
        id: '3',
        question: 'What does knowing multiple languages allow in terms of career?',
        options: [
          'Automatic promotion',
          'Higher starting salary',
          'New career opportunities',
          'Shorter working hours',
        ],
        correctAnswer: 2,
        explanation:
          'The text states "knowing multiple languages opens doors to new career opportunities in our increasingly globalized world."',
      },
      {
        id: '4',
        question: 'How does learning a second language affect your first language skills?',
        options: [
          'It weakens them',
          'It has no effect',
          'It enhances them',
          'It replaces them',
        ],
        correctAnswer: 2,
        explanation:
          'The passage explains "language learning enhances first language skills, as students gain a better understanding of grammar, vocabulary, and language structure."',
      },
    ],
  },

  // B2 Level
  {
    id: 'b2-1',
    title: 'The Impact of Climate Change on Biodiversity',
    level: 'B2',
    category: 'Environment',
    duration: 4,
    passage:
      'Climate change poses one of the most significant threats to global biodiversity in the 21st century. Rising temperatures, changing precipitation patterns, and increasingly frequent extreme weather events are disrupting ecosystems worldwide. Many species are struggling to adapt to these rapid environmental changes, leading to shifts in geographical ranges, altered breeding patterns, and in some cases, extinction. Coral reefs, often called the "rainforests of the sea," are particularly vulnerable, with warming oceans causing widespread bleaching events. Similarly, polar regions are experiencing dramatic ice loss, threatening species like polar bears and Arctic seals that depend on sea ice for survival. However, conservation efforts offer hope. Protected areas, wildlife corridors, and restoration projects are helping species adapt to changing conditions. Additionally, reducing greenhouse gas emissions remains crucial to slowing the pace of climate change and giving ecosystems time to adjust. The challenge requires global cooperation and immediate action to preserve Earth\'s rich biological diversity for future generations.',
    questions: [
      {
        id: '1',
        question: 'What are coral reefs often called?',
        options: [
          'Gardens of the ocean',
          'Rainforests of the sea',
          'Underwater forests',
          'Marine jungles',
        ],
        correctAnswer: 1,
        explanation: 'The passage specifically refers to coral reefs as the "rainforests of the sea."',
      },
      {
        id: '2',
        question: 'What is causing widespread coral bleaching?',
        options: [
          'Ocean pollution',
          'Overfishing',
          'Warming oceans',
          'Underwater earthquakes',
        ],
        correctAnswer: 2,
        explanation: 'The text states "warming oceans causing widespread bleaching events."',
      },
      {
        id: '3',
        question: 'Which conservation efforts are mentioned as offering hope?',
        options: [
          'Protected areas, wildlife corridors, and restoration projects',
          'Building more zoos and aquariums',
          'Relocating all endangered species',
          'Creating artificial habitats only',
        ],
        correctAnswer: 0,
        explanation:
          'The passage lists "Protected areas, wildlife corridors, and restoration projects are helping species adapt."',
      },
      {
        id: '4',
        question: 'What remains crucial to slowing climate change according to the passage?',
        options: [
          'Planting more trees only',
          'Reducing greenhouse gas emissions',
          'Building seawalls',
          'Developing new technology only',
        ],
        correctAnswer: 1,
        explanation: 'The text emphasizes "reducing greenhouse gas emissions remains crucial to slowing the pace of climate change."',
      },
    ],
  },

  // B2-C1 Level
  {
    id: 'b2-c1-1',
    title: 'The Psychology of Decision Making',
    level: 'B2-C1',
    category: 'Psychology',
    duration: 5,
    passage:
      'Human decision-making is far more complex and less rational than we often assume. Behavioral economists and psychologists have identified numerous cognitive biases that systematically influence our choices. Confirmation bias, for instance, leads us to seek information that supports our existing beliefs while dismissing contradictory evidence. The availability heuristic causes us to overestimate the likelihood of events we can easily recall, often because they\'re dramatic or recent. Anchoring bias makes us rely too heavily on the first piece of information we encounter when making decisions. These mental shortcuts, or heuristics, evolved to help our ancestors make quick decisions in life-threatening situations. However, in modern contexts—particularly financial decisions, medical choices, or policy-making—they can lead to suboptimal outcomes. Understanding these biases is the first step toward making better decisions. Techniques such as seeking diverse perspectives, deliberately considering alternative hypotheses, and using structured decision-making frameworks can help counteract our cognitive limitations. While we may never achieve perfect rationality, awareness of these psychological patterns enables us to make more informed and deliberate choices.',
    questions: [
      {
        id: '1',
        question: 'What is confirmation bias?',
        options: [
          'Seeking information that supports existing beliefs',
          'Making decisions too quickly',
          'Trusting first impressions',
          'Following the majority opinion',
        ],
        correctAnswer: 0,
        explanation:
          'The passage defines confirmation bias as leading "us to seek information that supports our existing beliefs while dismissing contradictory evidence."',
      },
      {
        id: '2',
        question: 'According to the text, why did mental shortcuts evolve?',
        options: [
          'To make financial decisions',
          'To help ancestors make quick decisions in life-threatening situations',
          'To improve communication',
          'To enhance learning abilities',
        ],
        correctAnswer: 1,
        explanation:
          'The passage states "These mental shortcuts, or heuristics, evolved to help our ancestors make quick decisions in life-threatening situations."',
      },
      {
        id: '3',
        question: 'What does the availability heuristic cause us to do?',
        options: [
          'Forget important information',
          'Make decisions randomly',
          'Overestimate the likelihood of easily recalled events',
          'Underestimate all risks',
        ],
        correctAnswer: 2,
        explanation:
          'The text explains "The availability heuristic causes us to overestimate the likelihood of events we can easily recall."',
      },
      {
        id: '4',
        question: 'What is suggested as the first step toward better decision-making?',
        options: [
          'Ignoring all biases',
          'Making decisions faster',
          'Understanding cognitive biases',
          'Following expert advice only',
        ],
        correctAnswer: 2,
        explanation: 'The passage states "Understanding these biases is the first step toward making better decisions."',
      },
    ],
  },

  // C1 Level
  {
    id: 'c1-1',
    title: 'The Ethics of Artificial Intelligence',
    level: 'C1',
    category: 'Technology',
    duration: 5,
    passage:
      'As artificial intelligence systems become increasingly sophisticated and ubiquitous, society faces profound ethical questions about their development and deployment. One fundamental concern revolves around algorithmic bias: AI systems trained on historical data can perpetuate and amplify existing societal prejudices, leading to discriminatory outcomes in crucial domains such as employment, criminal justice, and healthcare. The "black box" problem—wherein even developers cannot fully explain how complex neural networks arrive at specific decisions—raises accountability issues. Who bears responsibility when an autonomous vehicle causes an accident or when a medical AI misdiagnoses a patient? Furthermore, the concentration of AI capabilities in the hands of a few tech giants raises concerns about power asymmetries and potential manipulation. Privacy represents another critical dimension, as AI systems require vast amounts of personal data to function effectively, potentially enabling unprecedented surveillance. Looking forward, the prospect of artificial general intelligence—AI systems matching or exceeding human cognitive abilities across all domains—presents existential questions about humanity\'s future role. Addressing these challenges requires interdisciplinary collaboration among technologists, ethicists, policymakers, and society at large. Establishing robust regulatory frameworks, promoting algorithmic transparency, ensuring diverse representation in AI development, and fostering public understanding of AI capabilities and limitations are essential steps toward beneficial AI that serves humanity\'s collective interests rather than narrow commercial or political agendas.',
    questions: [
      {
        id: '1',
        question: 'What is meant by the "black box" problem in AI?',
        options: [
          'AI systems are physically black',
          'AI systems store data in black boxes',
          'Developers cannot fully explain how neural networks make decisions',
          'AI systems refuse to share information',
        ],
        correctAnswer: 2,
        explanation:
          'The passage defines it as "even developers cannot fully explain how complex neural networks arrive at specific decisions."',
      },
      {
        id: '2',
        question: 'According to the text, what can AI systems trained on historical data do?',
        options: [
          'Eliminate all biases',
          'Create completely neutral outcomes',
          'Perpetuate and amplify existing societal prejudices',
          'Ignore historical patterns',
        ],
        correctAnswer: 2,
        explanation:
          'The passage states "AI systems trained on historical data can perpetuate and amplify existing societal prejudices."',
      },
      {
        id: '3',
        question: 'What does the passage say about the concentration of AI capabilities?',
        options: [
          'It has no significant impact',
          'It raises concerns about power asymmetries and manipulation',
          'It benefits everyone equally',
          'It should be encouraged',
        ],
        correctAnswer: 1,
        explanation:
          'The text mentions "concentration of AI capabilities in the hands of a few tech giants raises concerns about power asymmetries and potential manipulation."',
      },
      {
        id: '4',
        question: 'What does addressing AI challenges require according to the passage?',
        options: [
          'Only government regulation',
          'Just technical solutions',
          'Interdisciplinary collaboration among multiple groups',
          'Stopping all AI development',
        ],
        correctAnswer: 2,
        explanation:
          'The passage states "Addressing these challenges requires interdisciplinary collaboration among technologists, ethicists, policymakers, and society at large."',
      },
    ],
  },
];

export default readingPassages;
