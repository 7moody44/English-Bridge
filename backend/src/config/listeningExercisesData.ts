/**
 * Listening Practice Exercises - CEFR Levels Pre-A1 to C1
 *
 * Each exercise is a short audio passage (rendered with the browser's
 * Speech Synthesis API) followed by multiple-choice comprehension questions.
 *
 * The `speechRate` field slows the voice down for lower levels so beginners
 * can follow along, and speeds it up toward native pace for C1.
 *
 * This is the source of truth — the frontend fetches these via the API so the
 * content can change without redeploying the client.
 */

export interface ListeningQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ListeningExercise {
  id: string;
  title: string;
  level: string;        // CEFR band, e.g. "Pre-A1"
  levelNumber: number;  // sequential number shown on the card ("Level 1")
  category: string;     // e.g. "Daily Life"
  icon: string;         // short emoji used in the exercise card
  description: string;  // one-line summary shown in the list
  duration: number;     // estimated minutes
  speechRate: number;   // TTS playback rate (slower for lower levels)
  audioText: string;    // the passage that gets read aloud
  questions: ListeningQuestion[];
}

export const listeningExercises: ListeningExercise[] = [
  // ---------------- Pre-A1 ----------------
  {
    id: 'pre-a1-listening-1',
    title: 'Everyday Greetings',
    level: 'Pre-A1',
    levelNumber: 1,
    category: 'Conversation',
    icon: '👋',
    description: 'Listen to a simple introduction.',
    duration: 2,
    speechRate: 0.7,
    audioText:
      'Hello! My name is Sarah. Nice to meet you. How are you today? I am fine, thank you. What is your name?',
    questions: [
      {
        id: '1',
        question: "What is the speaker's name?",
        options: ['Mary', 'Sarah', 'Emma', 'Lisa'],
        correctAnswer: 1,
        explanation: 'The speaker says "My name is Sarah."',
      },
      {
        id: '2',
        question: 'What does Sarah say after introducing herself?',
        options: ['Goodbye', 'See you later', 'Nice to meet you', 'Thank you'],
        correctAnswer: 2,
        explanation: 'She says "Nice to meet you" right after her name.',
      },
      {
        id: '3',
        question: 'How is Sarah feeling?',
        options: ['Sad', 'Tired', 'Fine', 'Angry'],
        correctAnswer: 2,
        explanation: 'She says "I am fine, thank you."',
      },
      {
        id: '4',
        question: 'What question does Sarah ask at the end?',
        options: ['Where are you from?', 'What is your name?', 'How old are you?', 'What do you do?'],
        correctAnswer: 1,
        explanation: 'She ends with "What is your name?"',
      },
    ],
  },
  {
    id: 'pre-a1-listening-2',
    title: 'My Family',
    level: 'Pre-A1',
    levelNumber: 2,
    category: 'Family',
    icon: '👨‍👩‍👧',
    description: 'Listen to someone talk about their family.',
    duration: 2,
    speechRate: 0.7,
    audioText:
      'This is my family. My mother is Anna. My father is Tom. I have one sister. Her name is Mia. She is five years old. I love my family.',
    questions: [
      {
        id: '1',
        question: "What is the mother's name?",
        options: ['Anna', 'Amy', 'Alice', 'Ann'],
        correctAnswer: 0,
        explanation: 'The speaker says "My mother is Anna."',
      },
      {
        id: '2',
        question: 'How many sisters does the speaker have?',
        options: ['Two', 'Three', 'One', 'None'],
        correctAnswer: 2,
        explanation: 'The speaker says "I have one sister."',
      },
      {
        id: '3',
        question: "What is the sister's name?",
        options: ['Mia', 'May', 'Meg', 'Molly'],
        correctAnswer: 0,
        explanation: 'The speaker says "Her name is Mia."',
      },
      {
        id: '4',
        question: 'How old is the sister?',
        options: ['Three', 'Four', 'Five', 'Six'],
        correctAnswer: 2,
        explanation: 'The speaker says "She is five years old."',
      },
    ],
  },

  // ---------------- A1 ----------------
  {
    id: 'a1-listening-1',
    title: 'At the Restaurant',
    level: 'A1',
    levelNumber: 3,
    category: 'Daily Life',
    icon: '🍽️',
    description: 'Listen to a conversation at a restaurant.',
    duration: 3,
    speechRate: 0.75,
    audioText:
      'Good evening. Welcome to the restaurant. Are you ready to order? I would like the chicken, please. And a glass of water. Of course. Your food will be ready in ten minutes. Thank you very much.',
    questions: [
      {
        id: '1',
        question: 'What does the customer order?',
        options: ['The fish', 'The chicken', 'The pasta', 'The salad'],
        correctAnswer: 1,
        explanation: 'The customer says "I would like the chicken, please."',
      },
      {
        id: '2',
        question: 'What does the customer want to drink?',
        options: ['Juice', 'Coffee', 'Water', 'Tea'],
        correctAnswer: 2,
        explanation: 'The customer asks for "a glass of water."',
      },
      {
        id: '3',
        question: 'When will the food be ready?',
        options: ['In five minutes', 'In ten minutes', 'In twenty minutes', 'Right away'],
        correctAnswer: 1,
        explanation: 'The waiter says "Your food will be ready in ten minutes."',
      },
      {
        id: '4',
        question: 'Where does this conversation take place?',
        options: ['At a school', 'At a restaurant', 'At a hospital', 'At a shop'],
        correctAnswer: 1,
        explanation: 'The waiter says "Welcome to the restaurant."',
      },
    ],
  },
  {
    id: 'a1-listening-2',
    title: 'My Daily Routine',
    level: 'A1',
    levelNumber: 4,
    category: 'Lifestyle',
    icon: '⏰',
    description: 'Listen to someone describe their day.',
    duration: 3,
    speechRate: 0.75,
    audioText:
      'I wake up at seven o\'clock every morning. I have breakfast with my family. Then I go to work by bus. I start work at nine. In the evening, I cook dinner and watch television. I go to bed at eleven.',
    questions: [
      {
        id: '1',
        question: 'What time does the speaker wake up?',
        options: ['Six o\'clock', 'Seven o\'clock', 'Eight o\'clock', 'Nine o\'clock'],
        correctAnswer: 1,
        explanation: 'The speaker says "I wake up at seven o\'clock."',
      },
      {
        id: '2',
        question: 'How does the speaker go to work?',
        options: ['By car', 'By train', 'By bus', 'On foot'],
        correctAnswer: 2,
        explanation: 'The speaker says "I go to work by bus."',
      },
      {
        id: '3',
        question: 'What time does work start?',
        options: ['At eight', 'At nine', 'At ten', 'At eleven'],
        correctAnswer: 1,
        explanation: 'The speaker says "I start work at nine."',
      },
      {
        id: '4',
        question: 'What does the speaker do in the evening?',
        options: ['Goes to the gym', 'Cooks dinner and watches TV', 'Reads a book', 'Visits friends'],
        correctAnswer: 1,
        explanation: 'The speaker says "I cook dinner and watch television."',
      },
    ],
  },

  // ---------------- A2 ----------------
  {
    id: 'a2-listening-1',
    title: 'Phone Conversation',
    level: 'A2',
    levelNumber: 5,
    category: 'Communication',
    icon: '📞',
    description: 'Listen to a phone call between friends.',
    duration: 4,
    speechRate: 0.8,
    audioText:
      'Hi Tom, it\'s Emma. Do you want to go to the cinema on Saturday? There is a new comedy film. That sounds great. What time does it start? It starts at half past seven. Let\'s meet at the cinema at seven. Okay, see you there!',
    questions: [
      {
        id: '1',
        question: 'Who is calling Tom?',
        options: ['Emma', 'Anna', 'Ella', 'Emily'],
        correctAnswer: 0,
        explanation: 'The caller says "Hi Tom, it\'s Emma."',
      },
      {
        id: '2',
        question: 'What do they plan to watch?',
        options: ['A horror film', 'A comedy film', 'A documentary', 'A drama'],
        correctAnswer: 1,
        explanation: 'Emma says "There is a new comedy film."',
      },
      {
        id: '3',
        question: 'What time does the film start?',
        options: ['At seven', 'At half past seven', 'At eight', 'At half past eight'],
        correctAnswer: 1,
        explanation: 'Emma says "It starts at half past seven."',
      },
      {
        id: '4',
        question: 'Where will they meet?',
        options: ['At a café', 'At the cinema', 'At home', 'At the park'],
        correctAnswer: 1,
        explanation: 'They agree to "meet at the cinema at seven."',
      },
    ],
  },
  {
    id: 'a2-listening-2',
    title: 'A Weekend Trip',
    level: 'A2',
    levelNumber: 6,
    category: 'Travel',
    icon: '🚆',
    description: 'Listen to someone talk about a short trip.',
    duration: 4,
    speechRate: 0.8,
    audioText:
      'Last weekend, I went to the beach with my friends. We travelled by train. The journey took two hours. The weather was sunny and warm. We swam in the sea and ate fish for lunch. It was a wonderful day.',
    questions: [
      {
        id: '1',
        question: 'Where did the speaker go last weekend?',
        options: ['To the mountains', 'To the beach', 'To the city', 'To the countryside'],
        correctAnswer: 1,
        explanation: 'The speaker says "I went to the beach with my friends."',
      },
      {
        id: '2',
        question: 'How did they travel?',
        options: ['By car', 'By bus', 'By train', 'By plane'],
        correctAnswer: 2,
        explanation: 'The speaker says "We travelled by train."',
      },
      {
        id: '3',
        question: 'How long was the journey?',
        options: ['One hour', 'Two hours', 'Three hours', 'Four hours'],
        correctAnswer: 1,
        explanation: 'The speaker says "The journey took two hours."',
      },
      {
        id: '4',
        question: 'What did they eat for lunch?',
        options: ['Chicken', 'Fish', 'Pasta', 'Sandwiches'],
        correctAnswer: 1,
        explanation: 'The speaker says "We... ate fish for lunch."',
      },
    ],
  },

  // ---------------- B1 ----------------
  {
    id: 'b1-listening-1',
    title: 'A Job Interview',
    level: 'B1',
    levelNumber: 7,
    category: 'Work',
    icon: '💼',
    description: 'Listen to part of a job interview.',
    duration: 5,
    speechRate: 0.85,
    audioText:
      'Good morning. Thank you for coming in today. Can you tell me about yourself? Certainly. I have worked in customer service for five years. I enjoy helping people solve problems. Why do you want this job? I want to develop my skills and take on more responsibility. That is exactly what we are looking for. When could you start? I could start in two weeks.',
    questions: [
      {
        id: '1',
        question: 'How long has the candidate worked in customer service?',
        options: ['Two years', 'Three years', 'Five years', 'Ten years'],
        correctAnswer: 2,
        explanation: 'The candidate says "I have worked in customer service for five years."',
      },
      {
        id: '2',
        question: 'What does the candidate enjoy doing?',
        options: ['Making sales', 'Helping people solve problems', 'Managing teams', 'Writing reports'],
        correctAnswer: 1,
        explanation: 'The candidate says "I enjoy helping people solve problems."',
      },
      {
        id: '3',
        question: 'Why does the candidate want the job?',
        options: ['For a higher salary', 'To work from home', 'To develop skills and take on responsibility', 'To travel more'],
        correctAnswer: 2,
        explanation: 'The candidate wants to "develop my skills and take on more responsibility."',
      },
      {
        id: '4',
        question: 'When could the candidate start?',
        options: ['Immediately', 'In one week', 'In two weeks', 'Next month'],
        correctAnswer: 2,
        explanation: 'The candidate says "I could start in two weeks."',
      },
    ],
  },
  {
    id: 'b1-listening-2',
    title: 'Healthy Living',
    level: 'B1',
    levelNumber: 8,
    category: 'Health',
    icon: '🥗',
    description: 'Listen to advice about staying healthy.',
    duration: 5,
    speechRate: 0.85,
    audioText:
      'Living a healthy life is not difficult. First, try to eat plenty of fruit and vegetables every day. Second, exercise regularly, even a thirty minute walk helps. Third, drink lots of water and avoid sugary drinks. Finally, make sure you get enough sleep. Most adults need around eight hours a night. Small changes can make a big difference to how you feel.',
    questions: [
      {
        id: '1',
        question: 'What should you eat plenty of every day?',
        options: ['Meat and bread', 'Fruit and vegetables', 'Cheese and eggs', 'Rice and pasta'],
        correctAnswer: 1,
        explanation: 'The speaker says "eat plenty of fruit and vegetables every day."',
      },
      {
        id: '2',
        question: 'How long should a daily walk be?',
        options: ['Ten minutes', 'Twenty minutes', 'Thirty minutes', 'Sixty minutes'],
        correctAnswer: 2,
        explanation: 'The speaker mentions "a thirty minute walk helps."',
      },
      {
        id: '3',
        question: 'What kind of drinks should you avoid?',
        options: ['Water', 'Fruit juice', 'Sugary drinks', 'Tea'],
        correctAnswer: 2,
        explanation: 'The speaker says "avoid sugary drinks."',
      },
      {
        id: '4',
        question: 'How much sleep do most adults need?',
        options: ['Six hours', 'Seven hours', 'Around eight hours', 'Ten hours'],
        correctAnswer: 2,
        explanation: 'The speaker says "Most adults need around eight hours a night."',
      },
    ],
  },

  // ---------------- B2 ----------------
  {
    id: 'b2-listening-1',
    title: 'The Future of Work',
    level: 'B2',
    levelNumber: 9,
    category: 'Society',
    icon: '🏢',
    description: 'Listen to a talk about how work is changing.',
    duration: 6,
    speechRate: 0.9,
    audioText:
      'The way we work is changing rapidly. Many companies now allow their employees to work from home at least part of the week. This flexibility can improve work-life balance, but it also blurs the line between professional and personal time. Some experts argue that remote work reduces productivity, while others claim it actually increases it. What is clear is that the traditional nine-to-five office model is no longer the only option. In the future, we can expect a hybrid approach to become the norm, combining the benefits of both home and office working.',
    questions: [
      {
        id: '1',
        question: 'What are many companies now allowing?',
        options: ['Longer holidays', 'Part-time home working', 'Earlier retirement', 'Unlimited leave'],
        correctAnswer: 1,
        explanation: 'Companies "allow their employees to work from home at least part of the week."',
      },
      {
        id: '2',
        question: 'What is one downside of flexibility mentioned?',
        options: ['Lower pay', 'Blurred work-life boundaries', 'Fewer jobs', 'Less teamwork'],
        correctAnswer: 1,
        explanation: 'Flexibility "blurs the line between professional and personal time."',
      },
      {
        id: '3',
        question: 'What do experts disagree about?',
        options: ['Office costs', 'Whether remote work affects productivity', 'Hiring practices', 'Working hours'],
        correctAnswer: 1,
        explanation: 'Some say remote work reduces productivity, others say it increases it.',
      },
      {
        id: '4',
        question: 'What is expected to become the norm?',
        options: ['Full remote work', 'A hybrid approach', 'The nine-to-five model', 'Shorter weeks'],
        correctAnswer: 1,
        explanation: 'The speaker expects "a hybrid approach to become the norm."',
      },
    ],
  },
  {
    id: 'b2-listening-2',
    title: 'Climate and Cities',
    level: 'B2',
    levelNumber: 10,
    category: 'Environment',
    icon: '🌍',
    description: 'Listen to a report on cities and climate change.',
    duration: 6,
    speechRate: 0.9,
    audioText:
      'Cities around the world are taking action against climate change. Many are investing heavily in public transport to reduce the number of cars on the road. Others are planting more trees and creating green spaces to cool down urban areas during heat waves. Some cities have even introduced low emission zones, where the most polluting vehicles must pay a charge to enter. Although these measures are expensive, supporters argue that the long-term benefits, including cleaner air and better public health, far outweigh the costs.',
    questions: [
      {
        id: '1',
        question: 'Why are cities investing in public transport?',
        options: ['To create jobs', 'To reduce the number of cars', 'To earn money', 'To build roads'],
        correctAnswer: 1,
        explanation: 'Cities invest in public transport "to reduce the number of cars on the road."',
      },
      {
        id: '2',
        question: 'Why are cities planting more trees?',
        options: ['To beautify parks', 'To cool urban areas in heat waves', 'To grow food', 'To attract tourists'],
        correctAnswer: 1,
        explanation: 'Trees and green spaces "cool down urban areas during heat waves."',
      },
      {
        id: '3',
        question: 'What happens in a low emission zone?',
        options: ['All cars are banned', 'Polluting vehicles pay a charge', 'Only buses are allowed', 'Driving is free'],
        correctAnswer: 1,
        explanation: 'In these zones "the most polluting vehicles must pay a charge to enter."',
      },
      {
        id: '4',
        question: 'What do supporters say about the costs?',
        options: ['They are too high', 'Benefits outweigh the costs', 'They should be avoided', 'Citizens should pay'],
        correctAnswer: 1,
        explanation: 'Supporters argue "the long-term benefits... far outweigh the costs."',
      },
    ],
  },

  // ---------------- C1 ----------------
  {
    id: 'c1-listening-1',
    title: 'The Science of Memory',
    level: 'C1',
    levelNumber: 11,
    category: 'Science',
    icon: '🧠',
    description: 'Listen to an academic talk on how memory works.',
    duration: 8,
    speechRate: 1.0,
    audioText:
      'Memory is far more complex than most people realise. Rather than functioning like a recording device, the brain actively reconstructs memories each time we recall them, which means they can be subtly altered in the process. Researchers distinguish between short-term and long-term memory, each relying on different neural mechanisms. Sleep plays a crucial role in consolidating what we have learned, transferring information from temporary storage to more permanent structures. This is why students who revise before bed often perform better than those who cram through the night. Understanding these processes has profound implications for education, suggesting that spaced repetition is considerably more effective than massed practice.',
    questions: [
      {
        id: '1',
        question: 'How does the speaker describe the brain\'s memory function?',
        options: ['Like a recording device', 'As an active reconstruction', 'As a fixed archive', 'Like a computer hard drive'],
        correctAnswer: 1,
        explanation: 'The brain "actively reconstructs memories each time we recall them."',
      },
      {
        id: '2',
        question: 'What role does sleep play?',
        options: ['It erases old memories', 'It consolidates learning', 'It slows the brain', 'It prevents dreaming'],
        correctAnswer: 1,
        explanation: 'Sleep is "crucial... in consolidating what we have learned."',
      },
      {
        id: '3',
        question: 'Why do students who revise before bed do better?',
        options: ['They sleep longer', 'Information transfers to permanent storage', 'They feel less stressed', 'They study more hours'],
        correctAnswer: 1,
        explanation: 'Sleep transfers information "from temporary storage to more permanent structures."',
      },
      {
        id: '4',
        question: 'What learning technique is said to be most effective?',
        options: ['Cramming', 'Massed practice', 'Spaced repetition', 'All-night study'],
        correctAnswer: 2,
        explanation: 'The speaker says "spaced repetition is considerably more effective than massed practice."',
      },
    ],
  },
  {
    id: 'c1-listening-2',
    title: 'Language and Identity',
    level: 'C1',
    levelNumber: 12,
    category: 'Culture',
    icon: '🗣️',
    description: 'Listen to a discussion on language and culture.',
    duration: 8,
    speechRate: 1.0,
    audioText:
      'Language is not merely a tool for communication; it is deeply intertwined with who we are. The words we use, the accents we carry, and the idioms we favour all signal aspects of our identity and belonging. When a language disappears, a unique way of interpreting the world vanishes with it, which is why linguists place such importance on documenting endangered languages. Moreover, people who speak more than one language often report feeling slightly different in each, as though each language unlocks a distinct facet of their personality. Far from being a neutral medium, then, language shapes thought, culture, and the very way we experience reality.',
    questions: [
      {
        id: '1',
        question: 'How does the speaker view language?',
        options: ['As a neutral tool', 'As intertwined with identity', 'As a simple code', 'As a barrier'],
        correctAnswer: 1,
        explanation: 'Language "is deeply intertwined with who we are."',
      },
      {
        id: '2',
        question: 'Why do linguists document endangered languages?',
        options: ['For profit', 'Because a worldview vanishes with them', 'To teach them in schools', 'To simplify grammar'],
        correctAnswer: 1,
        explanation: 'When a language dies "a unique way of interpreting the world vanishes with it."',
      },
      {
        id: '3',
        question: 'What do multilingual people often report?',
        options: ['Feeling the same in all languages', 'Feeling different in each language', 'Forgetting their first language', 'Preferring one accent'],
        correctAnswer: 1,
        explanation: 'They report "feeling slightly different in each" language.',
      },
      {
        id: '4',
        question: 'What is the speaker\'s overall conclusion?',
        options: ['Language is a neutral medium', 'Language shapes thought and reality', 'Language is declining', 'Accents are unimportant'],
        correctAnswer: 1,
        explanation: 'Language "shapes thought, culture, and the very way we experience reality."',
      },
    ],
  },
];
