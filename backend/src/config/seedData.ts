import Lesson from '../models/Lesson.js';
import { level5Lessons, level6Lessons, level7Lessons } from './levels5-7-data.js';
import { level8Lessons, level9Lessons, level10Lessons } from './levels8-10-data.js';

/**
 * CEFR Level Lessons - Levels 1-10
 * Level 1 (Pre-A1): 8 standard lessons
 * Level 2 (A1): 8 standard lessons
 * Level 3 (A1/A2): 8 standard lessons
 * Level 4 (A2): 8 standard lessons
 * Level 5 (A2/B1): 8 standard lessons
 * Level 6 (B1): 8 standard lessons
 * Level 7 (B1/B2): 8 standard lessons
 * Level 8 (B2): 8 standard lessons
 * Level 9 (B2/C1): 8 standard lessons
 * Level 10 (C1): 8 standard lessons
 * Each level: 5 exercises per lesson (40 exercises per level)
 */

// LEVEL 1 - Pre-A1 (Complete Beginner)
const level1Lessons = [
  {
    levelId: 1,
    lessonNumber: 1,
    title: 'The Alphabet (A to M)',
    description: 'Learn to recognize and name letters A through M of the English alphabet.',
    content: {
      introduction: 'The English alphabet consists of 26 letters. Learning these letters is the foundation for reading and writing English. This lesson covers the first half of the alphabet.',
      objectives: [
        'Recognize letters A through M',
        'Name each letter correctly with proper pronunciation',
        'Understand the order of letters in the alphabet',
      ],
      mainContent: 'The first 13 letters of the English alphabet are: A B C D E F G H I J K L M. Each letter has a unique name and sound.',
      summary: 'You have learned the first half of the English alphabet (A-M). You can now recognize and name these letters correctly.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What is the very first letter of the English alphabet?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswers: [0],
        explanation: 'A is the first letter of the English alphabet.',
      },
      {
        type: 'multiple-choice',
        question: 'Which letter comes immediately after "C"?',
        options: ['B', 'D', 'E', 'F'],
        correctAnswers: [1],
        explanation: 'D comes immediately after C in alphabetical order.',
      },
      {
        type: 'listening',
        question: 'Listen to the letter and select which one you hear:',
        audioPrompt: 'E',
        options: ['A', 'I', 'E', 'O'],
        correctAnswers: [2],
        explanation: 'The letter E makes the "Ehh" sound.',
      },
      {
        type: 'multiple-choice',
        question: 'Which sequence shows the correct order?',
        options: ['A C B', 'F G H', 'J L K', 'D F E'],
        correctAnswers: [1],
        explanation: 'F, G, H is the correct alphabetical order.',
      },
      {
        type: 'multiple-choice',
        question: 'Which letter comes between "G" and "I"?',
        options: ['E', 'H', 'J', 'F'],
        correctAnswers: [1],
        explanation: 'H comes between G and I in alphabetical order.',
      },
    ],
    audioContent: [
      { text: 'A', type: 'word', context: 'First letter pronunciation' },
      { text: 'M', type: 'word', context: 'Letter M pronunciation' },
    ],
  },
  {
    levelId: 1,
    lessonNumber: 2,
    title: 'The Alphabet (N to Z)',
    description: 'Learn to recognize and name letters N through Z of the English alphabet.',
    content: {
      introduction: 'The second half of the alphabet is equally important. Learning these letters (N-Z) completes your foundation in recognizing all English letters.',
      objectives: [
        'Recognize letters N through Z',
        'Name each letter correctly with proper pronunciation',
        'Complete knowledge of the full 26-letter alphabet',
      ],
      mainContent: 'The second half of the English alphabet is: N O P Q R S T U V W X Y Z. These letters complete the full alphabet.',
      summary: 'You have learned the second half of the English alphabet (N-Z). Combined with the first half, you now know all 26 letters.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Which letter comes immediately after "N"?',
        options: ['M', 'O', 'P', 'Q'],
        correctAnswers: [1],
        explanation: 'O comes immediately after N in alphabetical order.',
      },
      {
        type: 'multiple-choice',
        question: 'What is the last letter of the English alphabet?',
        options: ['X', 'Y', 'W', 'Z'],
        correctAnswers: [3],
        explanation: 'Z is the last letter of the English alphabet.',
      },
      {
        type: 'listening',
        question: 'Listen to the letter and select which one you hear:',
        audioPrompt: 'S',
        options: ['C', 'X', 'S', 'Z'],
        correctAnswers: [2],
        explanation: 'The letter S makes the "Ess" sound.',
      },
      {
        type: 'multiple-choice',
        question: 'Which letter comes between "Q" and "S"?',
        options: ['P', 'R', 'T', 'U'],
        correctAnswers: [1],
        explanation: 'R comes between Q and S in alphabetical order.',
      },
      {
        type: 'multiple-choice',
        question: 'Which sequence shows the correct order?',
        options: ['X Y Z', 'X Z Y', 'Z Y X', 'Y X Z'],
        correctAnswers: [0],
        explanation: 'X, Y, Z is the correct alphabetical order.',
      },
    ],
    audioContent: [
      { text: 'S', type: 'word', context: 'Letter S pronunciation' },
      { text: 'Z', type: 'word', context: 'Last letter pronunciation' },
    ],
  },
  {
    levelId: 1,
    lessonNumber: 3,
    title: 'Basic Greetings',
    description: 'Learn common greetings and everyday polite expressions.',
    content: {
      introduction: 'Greetings are the foundation of social interaction. Learning polite expressions will help you communicate respectfully in English.',
      objectives: [
        'Use common greetings appropriately',
        'Understand polite responses and expressions',
        'Apply greetings in different situations',
      ],
      mainContent: 'Common greetings: Hello, Hi, Goodbye, Good morning, Good afternoon, Good night. Polite expressions: Yes, No, Thank you, Please, You\'re welcome.',
      summary: 'You have learned basic greetings and polite expressions. You can now greet people and respond politely in English.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What is a friendly way to say "hello"?',
        options: ['Goodbye', 'Hi', 'No', 'Yes'],
        correctAnswers: [1],
        explanation: '"Hi" is a friendly way to say hello.',
      },
      {
        type: 'multiple-choice',
        question: 'What do you say when you leave?',
        options: ['Hello', 'Welcome', 'Goodbye', 'Please'],
        correctAnswers: [2],
        explanation: '"Goodbye" is what you say when you leave.',
      },
      {
        type: 'listening',
        question: 'Listen to the phrase and select what you hear:',
        audioPrompt: 'Good morning',
        options: ['Good night', 'Good morning', 'Hello', 'Goodbye'],
        correctAnswers: [1],
        explanation: 'You heard "Good morning", a greeting for the morning.',
      },
      {
        type: 'multiple-choice',
        question: 'What do you say when you go to sleep?',
        options: ['Good morning', 'Good afternoon', 'Good night', 'Hello'],
        correctAnswers: [2],
        explanation: '"Good night" is what you say when you go to sleep.',
      },
      {
        type: 'multiple-choice',
        question: 'How do you respond positively to a question?',
        options: ['No', 'Stop', 'Yes', 'Bye'],
        correctAnswers: [2],
        explanation: '"Yes" is used to answer a question positively.',
      },
    ],
    audioContent: [
      { text: 'Hello', type: 'word', context: 'Basic greeting' },
      { text: 'Good morning', type: 'phrase', context: 'Morning greeting' },
      { text: 'Goodbye', type: 'word', context: 'Farewell greeting' },
    ],
  },
  {
    levelId: 1,
    lessonNumber: 4,
    title: 'Numbers 1 to 5',
    description: 'Learn to count and read numbers from 1 to 5 in English.',
    content: {
      introduction: 'Numbers are essential in daily communication. You will learn to count from 1 to 5 and understand how they are pronounced.',
      objectives: [
        'Count from 1 to 5 in English',
        'Recognize written numbers 1-5',
        'Understand number pronunciation',
      ],
      mainContent: 'Numbers 1-5: One, Two, Three, Four, Five. These are the foundation for counting in English.',
      summary: 'You have learned to count from 1 to 5 in English. You can now read these numbers and use them in basic communication.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What is the first number?',
        options: ['2', '0', '1', '3'],
        correctAnswers: [2],
        explanation: 'The first number is 1 (one).',
      },
      {
        type: 'multiple-choice',
        question: 'How do you spell the number "2"?',
        options: ['Too', 'Two', 'Tow', 'Tu'],
        correctAnswers: [1],
        explanation: 'The correct spelling of the number 2 is "Two".',
      },
      {
        type: 'listening',
        question: 'Listen and select the number you hear:',
        audioPrompt: '3',
        options: ['1', '2', '3', '4'],
        correctAnswers: [2],
        explanation: 'You heard the number 3 (three).',
      },
      {
        type: 'multiple-choice',
        question: 'Which number is next after 4?',
        options: ['3', '5', '6', '2'],
        correctAnswers: [1],
        explanation: 'The number 5 comes after 4.',
      },
      {
        type: 'multiple-choice',
        question: 'Which word matches the number "4"?',
        options: ['Four', 'Five', 'One', 'Two'],
        correctAnswers: [0],
        explanation: '"Four" is the word for the number 4.',
      },
    ],
    audioContent: [
      { text: '1', type: 'word', context: 'Number one' },
      { text: '5', type: 'word', context: 'Number five' },
    ],
  },
  {
    levelId: 1,
    lessonNumber: 5,
    title: 'Numbers 6 to 10',
    description: 'Learn to count and read numbers from 6 to 10 in English.',
    content: {
      introduction: 'Continuing from 1-5, you will now learn numbers 6-10. These numbers are fundamental for counting and telling time.',
      objectives: [
        'Count from 6 to 10 in English',
        'Recognize written numbers 6-10',
        'Understand how to count from 1-10',
      ],
      mainContent: 'Numbers 6-10: Six, Seven, Eight, Nine, Ten. Combined with 1-5, you can now count to 10.',
      summary: 'You have learned to count from 6 to 10 in English. You can now count from 1 to 10 and use these numbers confidently.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What number comes right after 5?',
        options: ['4', '6', '7', '8'],
        correctAnswers: [1],
        explanation: 'The number 6 comes after 5.',
      },
      {
        type: 'multiple-choice',
        question: 'How do you spell the number "10"?',
        options: ['Tin', 'Ten', 'Tan', 'Ton'],
        correctAnswers: [1],
        explanation: 'The correct spelling of the number 10 is "Ten".',
      },
      {
        type: 'listening',
        question: 'Listen and select the number you hear:',
        audioPrompt: '8',
        options: ['7', '8', '9', '10'],
        correctAnswers: [1],
        explanation: 'You heard the number 8 (eight).',
      },
      {
        type: 'multiple-choice',
        question: 'Which sequence is in the correct order?',
        options: ['6, 8, 7, 9', '5, 6, 7, 8', '9, 8, 7, 6', '10, 9, 8, 7'],
        correctAnswers: [1],
        explanation: '5, 6, 7, 8 is in the correct counting order.',
      },
      {
        type: 'multiple-choice',
        question: 'What is the word for the number "7"?',
        options: ['Six', 'Eight', 'Seven', 'Nine'],
        correctAnswers: [2],
        explanation: '"Seven" is the word for the number 7.',
      },
    ],
    audioContent: [
      { text: '6', type: 'word', context: 'Number six' },
      { text: '10', type: 'word', context: 'Number ten' },
    ],
  },
  {
    levelId: 1,
    lessonNumber: 6,
    title: 'Basic Colors',
    description: 'Learn to recognize and name basic colors in English.',
    content: {
      introduction: 'Colors are everywhere in our daily life. Learning basic color names will help you describe things and communicate about the world around you.',
      objectives: [
        'Recognize and name basic colors',
        'Understand color pronunciation',
        'Use color words to describe objects',
      ],
      mainContent: 'Basic colors: Red, Yellow, Blue, Green, Black, White. These are the foundational colors used in everyday English communication.',
      summary: 'You have learned the names of basic colors. You can now identify and describe colors in English.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What color is an apple or a strawberry?',
        options: ['Blue', 'Red', 'Green', 'Yellow'],
        correctAnswers: [1],
        explanation: 'Apples and strawberries are typically red.',
      },
      {
        type: 'multiple-choice',
        question: 'What color is the sun?',
        options: ['Black', 'White', 'Yellow', 'Blue'],
        correctAnswers: [2],
        explanation: 'The sun is yellow.',
      },
      {
        type: 'listening',
        question: 'Listen and select the color you hear:',
        audioPrompt: 'Blue',
        options: ['Red', 'Green', 'Blue', 'Black'],
        correctAnswers: [2],
        explanation: 'You heard the color "Blue".',
      },
      {
        type: 'multiple-choice',
        question: 'Which color looks dark at night?',
        options: ['White', 'Pink', 'Black', 'Yellow'],
        correctAnswers: [2],
        explanation: 'Black is the dark color like the sky at night.',
      },
      {
        type: 'multiple-choice',
        question: 'How do you spell the color of grass?',
        options: ['Grene', 'Green', 'Grin', 'Gren'],
        correctAnswers: [1],
        explanation: 'The correct spelling is "Green".',
      },
    ],
    audioContent: [
      { text: 'Red', type: 'word', context: 'Color red' },
      { text: 'Blue', type: 'word', context: 'Color blue' },
      { text: 'Green', type: 'word', context: 'Color green' },
    ],
  },
  {
    levelId: 1,
    lessonNumber: 7,
    title: 'Simple Classroom Objects',
    description: 'Learn to name and identify common classroom objects.',
    content: {
      introduction: 'You spend much of your time in a classroom. Learning the names of classroom objects will help you communicate and understand your learning environment.',
      objectives: [
        'Identify common classroom objects',
        'Know the English names for everyday classroom items',
        'Use these words to describe and discuss classroom materials',
      ],
      mainContent: 'Common classroom objects: pen, book, paper, bag, chair, desk, board. These are items you use and see every day in class.',
      summary: 'You have learned to name common classroom objects. You can now identify and discuss items used in your learning environment.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What do you use to write on paper?',
        options: ['A book', 'A pen', 'A chair', 'A desk'],
        correctAnswers: [1],
        explanation: 'You use a pen to write on paper.',
      },
      {
        type: 'multiple-choice',
        question: 'What do you open to read?',
        options: ['A bag', 'A desk', 'A book', 'A pen'],
        correctAnswers: [2],
        explanation: 'You open a book to read.',
      },
      {
        type: 'listening',
        question: 'Listen and select the object you hear:',
        audioPrompt: 'Bag',
        options: ['Book', 'Pen', 'Chair', 'Bag'],
        correctAnswers: [3],
        explanation: 'You heard the word "Bag".',
      },
      {
        type: 'multiple-choice',
        question: 'Where do you sit in a classroom?',
        options: ['On a chair', 'On a pen', 'On a book', 'In a bag'],
        correctAnswers: [0],
        explanation: 'You sit on a chair in a classroom.',
      },
      {
        type: 'multiple-choice',
        question: 'What do you use to write on?',
        options: ['Paper', 'Chair', 'Bag', 'Water'],
        correctAnswers: [0],
        explanation: 'You write on paper.',
      },
    ],
    audioContent: [
      { text: 'book', type: 'word', context: 'Object for reading' },
      { text: 'pen', type: 'word', context: 'Writing instrument' },
      { text: 'chair', type: 'word', context: 'Seating object' },
    ],
  },
  {
    levelId: 1,
    lessonNumber: 8,
    title: 'Simple Pronouns (I, You, He, She)',
    description: 'Learn to use basic pronouns to refer to yourself and others.',
    content: {
      introduction: 'Pronouns are essential for communication. They help us refer to people without repeating names. This lesson covers the most basic pronouns.',
      objectives: [
        'Use first-person pronouns (I)',
        'Use second-person pronouns (You)',
        'Use third-person pronouns (He, She)',
      ],
      mainContent: 'Basic pronouns: I (myself), You (person I\'m talking to), He (a boy/man), She (a girl/woman). These pronouns form the foundation of all conversations.',
      summary: 'You have learned basic pronouns. You can now refer to yourself and others using correct English pronouns.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Which word do you use to talk about yourself?',
        options: ['You', 'He', 'I', 'She'],
        correctAnswers: [2],
        explanation: '"I" is the pronoun you use to talk about yourself.',
      },
      {
        type: 'multiple-choice',
        question: 'Which word do you use to talk about a boy?',
        options: ['She', 'I', 'You', 'He'],
        correctAnswers: [3],
        explanation: '"He" is the pronoun you use to talk about a boy.',
      },
      {
        type: 'listening',
        question: 'Listen to the word and select what you hear:',
        audioPrompt: 'She',
        options: ['He', 'She', 'I', 'You'],
        correctAnswers: [1],
        explanation: 'You heard the pronoun "She".',
      },
      {
        type: 'multiple-choice',
        question: 'Which word do you use to talk about a girl?',
        options: ['He', 'I', 'She', 'You'],
        correctAnswers: [2],
        explanation: '"She" is the pronoun you use to talk about a girl.',
      },
      {
        type: 'multiple-choice',
        question: 'Which word do you use when talking directly to another person?',
        options: ['I', 'He', 'You', 'She'],
        correctAnswers: [2],
        explanation: '"You" is the pronoun you use when talking directly to another person.',
      },
    ],
    audioContent: [
      { text: 'I', type: 'word', context: 'First-person pronoun' },
      { text: 'You', type: 'word', context: 'Second-person pronoun' },
      { text: 'She', type: 'word', context: 'Third-person feminine pronoun' },
    ],
  },
];

// LEVEL 2 - A1 (Elementary)
const level2Lessons = [
  {
    levelId: 2,
    lessonNumber: 1,
    title: 'Personal Information',
    description: 'Learn how to share and ask about personal information.',
    content: {
      introduction: 'Being able to share personal details about yourself is essential. In this lesson, you will learn how to introduce yourself, share your age, nationality, and job.',
      objectives: [
        'Answer questions about your origin and background',
        'State your age correctly',
        'Introduce yourself with your name',
        'Describe your profession or occupation',
      ],
      mainContent: 'Personal information includes: name, age, nationality, job. Key structures: "I am from [country]", "I am [age] years old", "My name is [name]", "I am a [job]".',
      summary: 'You can now share your personal information and ask others about theirs. This is fundamental for making connections and introducing yourself.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Where are you from?',
        options: ['I am from Spain', 'I am 20 years old', 'My name is John', 'I am fine'],
        correctAnswers: [0],
        explanation: '"I am from Spain" is a complete answer about nationality.',
      },
      {
        type: 'multiple-choice',
        question: 'How old are you?',
        options: ['I am fine', 'I am a student', 'I am 25 years old', 'I live in London'],
        correctAnswers: [2],
        explanation: '"I am 25 years old" correctly states age.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "My name _______ Sarah."',
        options: ['am', 'is', 'are', 'be'],
        correctAnswers: [1],
        explanation: '"is" is the correct verb for "My name is".',
      },
      {
        type: 'listening',
        question: 'What do you say when you meet someone for the first time?',
        audioPrompt: 'Nice to meet you',
        options: ['Goodbye', 'Thank you', 'Nice to meet you', 'Excuse me'],
        correctAnswers: [2],
        explanation: '"Nice to meet you" is the standard greeting when meeting someone new.',
      },
      {
        type: 'multiple-choice',
        question: 'What is your job?',
        options: ['I am a doctor', 'I am from Canada', 'I am married', 'I am happy'],
        correctAnswers: [0],
        explanation: '"I am a doctor" correctly describes a profession.',
      },
    ],
    audioContent: [
      { text: 'Spain', type: 'word', context: 'Country name' },
      { text: 'doctor', type: 'word', context: 'Job/profession' },
    ],
  },
  {
    levelId: 2,
    lessonNumber: 2,
    title: 'Family Members',
    description: 'Learn vocabulary for family relationships and relatives.',
    content: {
      introduction: 'Family is an important part of our lives. This lesson teaches you the English names for different family members and relationships.',
      objectives: [
        'Identify family relationships correctly',
        'Use proper family member vocabulary',
        'Describe family connections',
        'Understand relationships between family members',
      ],
      mainContent: 'Family members: mother, father, brother, sister, uncle, aunt, cousin, grandson. Key relationships: father\'s sister is aunt, mother\'s husband is father, uncle\'s son is cousin.',
      summary: 'You now understand family relationships and can describe your family members in English.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'My mother\'s husband is my _______.',
        options: ['brother', 'uncle', 'father', 'son'],
        correctAnswers: [2],
        explanation: 'Your mother\'s husband is your father.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "I have two _______."',
        options: ['sister', 'sisters', 'brother', 'mother'],
        correctAnswers: [1],
        explanation: '"sisters" is the plural form.',
      },
      {
        type: 'multiple-choice',
        question: 'Who is your uncle\'s son?',
        options: ['My brother', 'My cousin', 'My father', 'My grandfather'],
        correctAnswers: [1],
        explanation: 'Your uncle\'s son is your cousin.',
      },
      {
        type: 'multiple-choice',
        question: 'What is the opposite of "son"?',
        options: ['Daughter', 'Mother', 'Sister', 'Aunt'],
        correctAnswers: [0],
        explanation: '"Daughter" is the female equivalent of son.',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "This is _______ brother. His name is Paul."',
        audioPrompt: 'my',
        options: ['he', 'she', 'me', 'my'],
        correctAnswers: [3],
        explanation: '"my" is the possessive pronoun showing ownership.',
      },
    ],
    audioContent: [
      { text: 'mother', type: 'word', context: 'Family member' },
      { text: 'cousin', type: 'word', context: 'Relative' },
    ],
  },
  {
    levelId: 2,
    lessonNumber: 3,
    title: 'Everyday Objects',
    description: 'Learn names of common objects used in daily life.',
    content: {
      introduction: 'Daily life involves using many different objects. Knowing their English names helps you ask for them, describe them, and communicate about what you need.',
      objectives: [
        'Identify common everyday objects',
        'Know the purpose of various items',
        'Use object names in sentences',
        'Describe objects accurately',
      ],
      mainContent: 'Common objects: key, wallet, watch, smartphone, glasses, pen, book, bag. Key phrases: "What do you use to...?" and "Where do you keep...?".',
      summary: 'You can now name everyday objects and explain their purposes in English.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What do you use to open a locked door?',
        options: ['A key', 'A watch', 'A wallet', 'A window'],
        correctAnswers: [0],
        explanation: 'A key is used to open locked doors.',
      },
      {
        type: 'multiple-choice',
        question: 'Where do you usually keep your money and credit cards?',
        options: ['In a table', 'In a wallet', 'In a book', 'In a pen'],
        correctAnswers: [1],
        explanation: 'Money and cards are kept in a wallet.',
      },
      {
        type: 'listening',
        question: 'You use a _______ to call people and check the internet.',
        audioPrompt: 'smartphone',
        options: ['television', 'clock', 'smartphone', 'notebook'],
        correctAnswers: [2],
        explanation: 'A smartphone is used for calling and internet access.',
      },
      {
        type: 'multiple-choice',
        question: 'What tells you the time on your wrist?',
        options: ['A ring', 'A watch', 'A key', 'A phone'],
        correctAnswers: [1],
        explanation: 'A watch on your wrist tells the time.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "Where _______ my glasses?"',
        options: ['is', 'am', 'are', 'be'],
        correctAnswers: [2],
        explanation: '"are" is correct with plural "glasses".',
      },
    ],
    audioContent: [
      { text: 'key', type: 'word', context: 'Door opener' },
      { text: 'watch', type: 'word', context: 'Time-telling device' },
      { text: 'smartphone', type: 'word', context: 'Electronic device' },
    ],
  },
  {
    levelId: 2,
    lessonNumber: 4,
    title: 'Time and Days',
    description: 'Learn the days of the week and how to tell time.',
    content: {
      introduction: 'Understanding time is crucial for scheduling and planning. This lesson covers days of the week and basic time expressions.',
      objectives: [
        'Name all seven days of the week',
        'Understand weekdays and weekends',
        'Tell time using basic structures',
        'Use time expressions in context',
      ],
      mainContent: 'Days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday. Time expressions: "on Monday", "Tuesday", "half past eight", "quarter to eight".',
      summary: 'You can now identify days of the week and tell time in English.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Which day comes after Monday?',
        options: ['Wednesday', 'Sunday', 'Tuesday', 'Friday'],
        correctAnswers: [2],
        explanation: 'Tuesday comes immediately after Monday.',
      },
      {
        type: 'multiple-choice',
        question: 'How many days are in one week?',
        options: ['5', '7', '12', '30'],
        correctAnswers: [1],
        explanation: 'There are 7 days in one week.',
      },
      {
        type: 'listening',
        question: 'It is 8:30. How do you say this?',
        audioPrompt: 'Half past eight',
        options: ['Eight o\'clock', 'Half past eight', 'Quarter to eight', 'Eight thirty-five'],
        correctAnswers: [1],
        explanation: '8:30 is expressed as "half past eight".',
      },
      {
        type: 'multiple-choice',
        question: 'Which of these is a weekend day?',
        options: ['Thursday', 'Monday', 'Saturday', 'Tuesday'],
        correctAnswers: [2],
        explanation: 'Saturday is a weekend day.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "The English lesson is _______ Tuesday."',
        options: ['at', 'on', 'in', 'under'],
        correctAnswers: [1],
        explanation: '"on" is used with specific days: "on Tuesday".',
      },
    ],
    audioContent: [
      { text: 'Tuesday', type: 'word', context: 'Day of the week' },
      { text: 'Saturday', type: 'word', context: 'Weekend day' },
    ],
  },
  {
    levelId: 2,
    lessonNumber: 5,
    title: 'Food and Drink',
    description: 'Learn food and drink vocabulary and related expressions.',
    content: {
      introduction: 'Food and drink are essential parts of daily life. Learning these words helps you discuss meals, make orders, and describe your preferences.',
      objectives: [
        'Identify types of food and drinks',
        'Use appropriate eating utensils',
        'Express hunger and thirst',
        'Discuss food preferences',
      ],
      mainContent: 'Food categories: fruits (banana, apple), drinks (water, coffee, juice), meals: breakfast, lunch, dinner. Utensils: fork, knife, spoon, plate.',
      summary: 'You can now discuss food and drinks in English and order what you like.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Which of these is a fruit?',
        options: ['Bread', 'Banana', 'Milk', 'Meat'],
        correctAnswers: [1],
        explanation: 'Banana is a type of fruit.',
      },
      {
        type: 'multiple-choice',
        question: 'What do many people drink hot in the morning?',
        options: ['Coffee', 'Water', 'Juice', 'Ice'],
        correctAnswers: [0],
        explanation: 'Coffee is commonly drunk hot in the morning.',
      },
      {
        type: 'listening',
        question: 'Which word is a drink?',
        audioPrompt: 'Water',
        options: ['Rice', 'Chicken', 'Water', 'Cheese'],
        correctAnswers: [2],
        explanation: 'Water is a drink.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "I want a sandwich. I am _______."',
        options: ['thirsty', 'tired', 'hungry', 'happy'],
        correctAnswers: [2],
        explanation: 'Wanting food means you are hungry.',
      },
      {
        type: 'multiple-choice',
        question: 'Which of these do you use to eat soup?',
        options: ['A knife', 'A fork', 'A spoon', 'A plate'],
        correctAnswers: [2],
        explanation: 'A spoon is used to eat soup.',
      },
    ],
    audioContent: [
      { text: 'Banana', type: 'word', context: 'Fruit' },
      { text: 'Coffee', type: 'word', context: 'Drink' },
      { text: 'Water', type: 'word', context: 'Beverage' },
    ],
  },
  {
    levelId: 2,
    lessonNumber: 6,
    title: 'Daily Activities',
    description: 'Learn common verbs and activities for daily routines.',
    content: {
      introduction: 'Daily routines define our lives. This lesson teaches you verbs and activities that happen every day.',
      objectives: [
        'Name common daily activities',
        'Use action verbs correctly',
        'Describe daily routines',
        'Understand time-based activities',
      ],
      mainContent: 'Daily activities: sleep, eat, read, work, study, brush teeth, go to office. Action verbs: do, go, eat, sleep, read, brush, watch.',
      summary: 'You can now describe your daily activities and routines in English.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What do you do at night in your bed?',
        options: ['Cook', 'Sleep', 'Work', 'Study'],
        correctAnswers: [1],
        explanation: 'You sleep in bed at night.',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "Every morning, I _______ breakfast at 7 AM."',
        audioPrompt: 'eat',
        options: ['drink', 'do', 'go', 'eat'],
        correctAnswers: [3],
        explanation: '"eat" is the correct verb for eating breakfast.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "He _______ to the office by train."',
        options: ['go', 'goes', 'going', 'went'],
        correctAnswers: [1],
        explanation: 'Goes" (3rd person singular) is correct with "he".',
      },
      {
        type: 'multiple-choice',
        question: 'What do you do with a book?',
        options: ['Write', 'Read', 'Listen', 'Speak'],
        correctAnswers: [1],
        explanation: 'You read a book.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "I always _______ my teeth after eating."',
        options: ['watch', 'brush', 'clean', 'make'],
        correctAnswers: [1],
        explanation: '"brush" is the correct verb for dental hygiene.',
      },
    ],
    audioContent: [
      { text: 'Sleep', type: 'word', context: 'Night activity' },
      { text: 'eat', type: 'word', context: 'Daily activity' },
      { text: 'read', type: 'word', context: 'Activity' },
    ],
  },
  {
    levelId: 2,
    lessonNumber: 7,
    title: 'Simple Adjectives',
    description: 'Learn basic descriptive adjectives and their opposites.',
    content: {
      introduction: 'Adjectives describe nouns and help us express ourselves more clearly. This lesson focuses on common, easy-to-use descriptive words.',
      objectives: [
        'Use basic descriptive adjectives',
        'Understand opposites and contrasts',
        'Describe objects and situations',
        'Apply adjectives in sentences',
      ],
      mainContent: 'Basic adjectives: hot/cold, big/small, expensive/cheap, happy/sad, difficult/easy, old/new, good/bad.',
      summary: 'You can now use descriptive adjectives to describe people, places, and things.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What is the opposite of "hot"?',
        options: ['Cold', 'Warm', 'Big', 'New'],
        correctAnswers: [0],
        explanation: '"Cold" is the opposite of "hot".',
      },
      {
        type: 'multiple-choice',
        question: 'An elephant is large, but a mouse is _______.',
        options: ['tall', 'small', 'fast', 'heavy'],
        correctAnswers: [1],
        explanation: 'A mouse is small compared to an elephant.',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "This book is not cheap. It is _______."',
        audioPrompt: 'expensive',
        options: ['free', 'expensive', 'easy', 'old'],
        correctAnswers: [1],
        explanation: 'Not cheap means expensive.',
      },
      {
        type: 'multiple-choice',
        question: 'What is the opposite of "happy"?',
        options: ['Angry', 'Sad', 'Good', 'Beautiful'],
        correctAnswers: [1],
        explanation: '"Sad" is the opposite of "happy".',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "The exam was not difficult. It was very _______."',
        options: ['hard', 'slow', 'easy', 'young'],
        correctAnswers: [2],
        explanation: 'Not difficult means easy.',
      },
    ],
    audioContent: [
      { text: 'Cold', type: 'word', context: 'Temperature' },
      { text: 'Small', type: 'word', context: 'Size adjective' },
      { text: 'Expensive', type: 'word', context: 'Price adjective' },
    ],
  },
  {
    levelId: 2,
    lessonNumber: 8,
    title: 'Places in a Town',
    description: 'Learn names of common places and locations in a town.',
    content: {
      introduction: 'Towns and cities have many different places. Knowing their names helps you navigate, ask for directions, and understand where things are located.',
      objectives: [
        'Identify common town locations',
        'Know the purpose of each place',
        'Ask for directions to specific places',
        'Understand town geography',
      ],
      mainContent: 'Town places: supermarket, school, hospital, park, station, bank, restaurant, cinema, church. Key structures: "Where do you go to...?" and "Where is the...?".',
      summary: 'You can now name important places in a town and discuss them in English.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Where do you go to buy food and groceries?',
        options: ['The park', 'The supermarket', 'The hospital', 'The cinema'],
        correctAnswers: [1],
        explanation: 'A supermarket is where you buy food and groceries.',
      },
      {
        type: 'multiple-choice',
        question: 'Where do children go to learn?',
        options: ['A bank', 'A school', 'A restaurant', 'A hotel'],
        correctAnswers: [1],
        explanation: 'Children go to school to learn.',
      },
      {
        type: 'listening',
        question: 'You go to the _______ when you are very sick.',
        audioPrompt: 'hospital',
        options: ['park', 'shop', 'station', 'hospital'],
        correctAnswers: [3],
        explanation: 'You go to a hospital when very sick.',
      },
      {
        type: 'multiple-choice',
        question: 'Where can you sit on grass and see trees?',
        options: ['In a room', 'In a park', 'In a bank', 'In a kitchen'],
        correctAnswers: [1],
        explanation: 'A park is where you can sit on grass and see trees.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "I need to catch a train at the _______."',
        options: ['station', 'airport', 'market', 'library'],
        correctAnswers: [0],
        explanation: 'Trains depart from a station.',
      },
    ],
    audioContent: [
      { text: 'supermarket', type: 'word', context: 'Shopping place' },
      { text: 'school', type: 'word', context: 'Education place' },
      { text: 'hospital', type: 'word', context: 'Medical place' },
    ],
  },
];

// LEVEL 3 - A1/A2
const level3Lessons = [
  {
    levelId: 3,
    lessonNumber: 1,
    title: 'Free Time Activities',
    description: 'Learn vocabulary for hobbies and recreational activities.',
    content: {
      introduction: 'Free time is precious, and enjoying hobbies keeps us healthy and happy. This lesson teaches you how to talk about activities you enjoy.',
      objectives: [
        'Name common recreational activities',
        'Discuss frequency of activities',
        'Express preferences about hobbies',
        'Use gerunds (-ing forms) with hobbies',
      ],
      mainContent: 'Activities: tennis, photography, swimming, video games, cinema. Frequency: twice a month, weekly, daily. Verbs: play, enjoy, like, love with -ing form.',
      summary: 'You can now discuss your hobbies and free time activities in English.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What do you need if you want to play tennis?',
        options: ['A racket and a ball', 'A book and a pen', 'A bicycle and a helmet', 'A guitar and a piano'],
        correctAnswers: [0],
        explanation: 'Tennis requires a racket and a ball.',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "I really enjoy _______ photos of nature."',
        audioPrompt: 'taking',
        options: ['take', 'taking', 'took', 'taken'],
        correctAnswers: [1],
        explanation: '"taking" (gerund form) is correct after "enjoy".',
      },
      {
        type: 'multiple-choice',
        question: 'Which activity do you do in a swimming pool?',
        options: ['Running', 'Swimming', 'Reading', 'Cooking'],
        correctAnswers: [1],
        explanation: 'Swimming is done in a pool.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "He doesn\'t like playing video games. He thinks they are _______."',
        options: ['boring', 'exciting', 'fun', 'interesting'],
        correctAnswers: [0],
        explanation: '"boring" is a negative adjective meaning not interesting.',
      },
      {
        type: 'multiple-choice',
        question: 'How often do you go to the cinema?',
        options: ['Yes, I do', 'Twice a month', 'With my brother', 'Tomorrow afternoon'],
        correctAnswers: [1],
        explanation: '"Twice a month" answers the frequency question.',
      },
    ],
    audioContent: [
      { text: 'tennis', type: 'word', context: 'Sport activity' },
      { text: 'swimming', type: 'word', context: 'Water activity' },
      { text: 'cinema', type: 'word', context: 'Entertainment place' },
    ],
  },
  {
    levelId: 3,
    lessonNumber: 2,
    title: 'House and Rooms',
    description: 'Learn the names of rooms and locations within a house.',
    content: {
      introduction: 'A house consists of different rooms, each with its own purpose. This lesson helps you identify rooms and describe what happens in each.',
      objectives: [
        'Name different rooms in a house',
        'Know the purpose of each room',
        'Use prepositions for room locations',
        'Describe what you do in each room',
      ],
      mainContent: 'Rooms: kitchen, bedroom, bathroom, living room, dining room, garage. Furniture: sink, wardrobe, sofa, fridge, cooker, table, chair.',
      summary: 'You can now name rooms in a house and describe their purposes.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Where do you usually cook food in a house?',
        options: ['In the bedroom', 'In the bathroom', 'In the kitchen', 'In the garage'],
        correctAnswers: [2],
        explanation: 'Food is cooked in the kitchen.',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "The keys are _______ the kitchen table."',
        audioPrompt: 'on',
        options: ['in', 'on', 'underneath of', 'between'],
        correctAnswers: [1],
        explanation: 'Use "on" for items on top of a table.',
      },
      {
        type: 'multiple-choice',
        question: 'What do you use to wash your hands and face in the bathroom?',
        options: ['A sofa', 'A sink', 'A fridge', 'A wardrobe'],
        correctAnswers: [1],
        explanation: 'A sink is used for washing in the bathroom.',
      },
      {
        type: 'multiple-choice',
        question: 'Where do people keep their clothes?',
        options: ['In a wardrobe', 'In a cooker', 'In a mirror', 'In an armchair'],
        correctAnswers: [0],
        explanation: 'Clothes are kept in a wardrobe.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "There _______ three chairs in the dining room."',
        options: ['is', 'am', 'are', 'be'],
        correctAnswers: [2],
        explanation: '"are" is correct with plural "chairs".',
      },
    ],
    audioContent: [
      { text: 'kitchen', type: 'word', context: 'Room for cooking' },
      { text: 'bedroom', type: 'word', context: 'Room for sleeping' },
      { text: 'bathroom', type: 'word', context: 'Room for washing' },
    ],
  },
  {
    levelId: 3,
    lessonNumber: 3,
    title: 'Weather and Seasons',
    description: 'Learn weather vocabulary and the names of seasons.',
    content: {
      introduction: 'Weather affects our daily plans and activities. Understanding weather vocabulary helps you make plans and understand forecasts.',
      objectives: [
        'Name the four seasons',
        'Describe different weather conditions',
        'Use weather expressions correctly',
        'Plan activities based on weather',
      ],
      mainContent: 'Seasons: spring, summer, autumn, winter. Weather: sunny, cloudy, rainy, snowy, windy, foggy, clear, stormy.',
      summary: 'You can now describe weather conditions and identify seasons in English.',
    },
    exercises: [
      {
        type: 'listening',
        question: 'What do you take with you when it is raining?',
        audioPrompt: 'umbrella',
        options: ['An umbrella', 'Sunglasses', 'A swimsuit', 'A fan'],
        correctAnswers: [0],
        explanation: 'An umbrella protects you from rain.',
      },
      {
        type: 'multiple-choice',
        question: 'Which season is usually the coldest?',
        options: ['Summer', 'Spring', 'Autumn', 'Winter'],
        correctAnswers: [3],
        explanation: 'Winter is the coldest season.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "Look outside! The sun is shining and the sky is _______."',
        options: ['cloudy', 'clear', 'stormy', 'dark'],
        correctAnswers: [1],
        explanation: '"clear" describes a sky with no clouds.',
      },
      {
        type: 'multiple-choice',
        question: 'What is the weather like when you cannot see far because of a white cloud near the ground?',
        options: ['Sunny', 'Windy', 'Foggy', 'Dry'],
        correctAnswers: [2],
        explanation: 'Fog is a white cloud near the ground reducing visibility.',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "It is very _______ today. Hold onto your hat!"',
        audioPrompt: 'windy',
        options: ['hot', 'windy', 'quiet', 'wet'],
        correctAnswers: [1],
        explanation: '"windy" describes strong wind conditions.',
      },
    ],
    audioContent: [
      { text: 'winter', type: 'word', context: 'Cold season' },
      { text: 'umbrella', type: 'word', context: 'Rain protection' },
      { text: 'sunny', type: 'word', context: 'Weather condition' },
    ],
  },
  {
    levelId: 3,
    lessonNumber: 4,
    title: 'Past Events - Simple Past Basics',
    description: 'Learn basic past tense to talk about what you did.',
    content: {
      introduction: 'Talking about the past is essential for communication. This lesson introduces the simple past tense with regular and common irregular verbs.',
      objectives: [
        'Form basic simple past tense',
        'Use past tense with regular verbs',
        'Use common irregular past verbs',
        'Discuss past events and experiences',
      ],
      mainContent: 'Simple past forms: was/were, went, watched, finished, did. Key structures: "Yesterday I went...", "Last night I watched...", "Did you...?".',
      summary: 'You can now talk about past events using simple past tense.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "Yesterday, I _______ to the supermarket and bought some fruit."',
        options: ['go', 'went', 'going', 'goes'],
        correctAnswers: [1],
        explanation: '"went" is the past tense of "go".',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "They _______ at home last night. They went to a restaurant."',
        audioPrompt: 'were not',
        options: ['was not', 'were not', 'are not', 'did not'],
        correctAnswers: [1],
        explanation: '"were not" is correct with plural "they".',
      },
      {
        type: 'multiple-choice',
        question: 'What is the past tense of the verb "watch"?',
        options: ['Watchy', 'Watching', 'Watched', 'Wrote'],
        correctAnswers: [2],
        explanation: '"watched" is the regular past tense of "watch".',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "Did you _______ the English homework yesterday?"',
        options: ['finish', 'finished', 'finishing', 'finishes'],
        correctAnswers: [0],
        explanation: 'In past questions use base form after "Did".',
      },
      {
        type: 'multiple-choice',
        question: 'Where were you born?',
        options: ['I born in London', 'I was born in London', 'I am born in London', 'I were born in London'],
        correctAnswers: [1],
        explanation: '"was born" is the correct past passive structure.',
      },
    ],
    audioContent: [
      { text: 'yesterday', type: 'word', context: 'Past time reference' },
      { text: 'went', type: 'word', context: 'Past tense verb' },
      { text: 'watched', type: 'word', context: 'Past tense verb' },
    ],
  },
  {
    levelId: 3,
    lessonNumber: 5,
    title: 'Health and Body',
    description: 'Learn body parts and health-related vocabulary.',
    content: {
      introduction: 'Taking care of your health requires understanding body parts and common health issues. This lesson provides essential health vocabulary.',
      objectives: [
        'Name important body parts',
        'Describe common health problems',
        'Give health-related advice',
        'Understand health vocabulary',
      ],
      mainContent: 'Body parts: head, ears, eyes, nose, mouth, hands, feet, legs, arms, ankle. Health: headache, tired, rest, doctor, sick.',
      summary: 'You can now discuss body parts and health issues in English.',
    },
    exercises: [
      {
        type: 'listening',
        question: 'What part of your body do you use to listen to music?',
        audioPrompt: 'ears',
        options: ['Your eyes', 'Your nose', 'Your ears', 'Your mouth'],
        correctAnswers: [2],
        explanation: 'You use your ears to listen.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "I need to see a doctor because I have a bad _______."',
        options: ['headache', 'happy', 'haircut', 'holiday'],
        correctAnswers: [0],
        explanation: 'A headache is a common health issue requiring a doctor\'s attention.',
      },
      {
        type: 'multiple-choice',
        question: 'What should you do if you feel very tired?',
        options: ['Go to run', 'Get some rest', 'Eat spicy food', 'Watch a loud movie'],
        correctAnswers: [1],
        explanation: 'Rest is recommended when you feel tired.',
      },
      {
        type: 'listening',
        question: 'Which part of the body connects your foot to your leg?',
        audioPrompt: 'ankle',
        options: ['The elbow', 'The finger', 'The ankle', 'The shoulder'],
        correctAnswers: [2],
        explanation: 'The ankle connects the foot to the leg.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "You should wash your _______ before you eat."',
        options: ['teeth', 'hands', 'hair', 'ears'],
        correctAnswers: [1],
        explanation: 'Wash your hands before eating for hygiene.',
      },
    ],
    audioContent: [
      { text: 'head', type: 'word', context: 'Body part' },
      { text: 'ears', type: 'word', context: 'Body part' },
      { text: 'headache', type: 'word', context: 'Health issue' },
    ],
  },
  {
    levelId: 3,
    lessonNumber: 6,
    title: 'Clothes and Shopping',
    description: 'Learn clothing vocabulary and shopping-related expressions.',
    content: {
      introduction: 'Clothes are an essential part of daily life. This lesson teaches you how to talk about different types of clothing and go shopping.',
      objectives: [
        'Name different types of clothing',
        'Use shopping vocabulary',
        'Ask about prices and sizes',
        'Describe clothing accurately',
      ],
      mainContent: 'Clothing: boots, scarf, jacket, shirt, pants, dress, hat, gloves. Shopping: changing room, price, fit, size, try on.',
      summary: 'You can now discuss clothing and shop for clothes in English.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What do you wear on your feet when it is cold or raining outside?',
        options: ['T-shirts', 'Boots', 'Gloves', 'Hats'],
        correctAnswers: [1],
        explanation: 'Boots protect your feet in cold or wet weather.',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "Excuse me, how _______ is this blue jacket?"',
        audioPrompt: 'much',
        options: ['many', 'much', 'cost', 'price'],
        correctAnswers: [1],
        explanation: '"much" is used with uncountable nouns like "price".',
      },
      {
        type: 'multiple-choice',
        question: 'Where do you go to try on clothes before buying them?',
        options: ['The cash desk', 'The changing room', 'The supermarket', 'The window'],
        correctAnswers: [1],
        explanation: 'The changing room is where you try on clothes.',
      },
      {
        type: 'multiple-choice',
        question: 'What do you wear around your neck when it is freezing in winter?',
        options: ['A belt', 'A scarf', 'Socks', 'A ring'],
        correctAnswers: [1],
        explanation: 'A scarf keeps your neck warm.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "These shoes are too small. They don\'t _______ me."',
        options: ['suit', 'wear', 'look', 'fit'],
        correctAnswers: [3],
        explanation: '"fit" is the correct verb for shoe size.',
      },
    ],
    audioContent: [
      { text: 'boots', type: 'word', context: 'Footwear' },
      { text: 'scarf', type: 'word', context: 'Accessory' },
      { text: 'jacket', type: 'word', context: 'Clothing' },
    ],
  },
  {
    levelId: 3,
    lessonNumber: 7,
    title: 'Transport and Travel',
    description: 'Learn vocabulary related to transportation and travel.',
    content: {
      introduction: 'Getting around and traveling are important in modern life. This lesson teaches you how to discuss different modes of transport.',
      objectives: [
        'Name different types of transportation',
        'Understand travel vocabulary',
        'Ask for and give travel directions',
        'Discuss travel plans and logistics',
      ],
      mainContent: 'Transport: airplane, train, bus, car, bicycle, boat. Travel words: ticket, passenger, airport, station, platform, boarding pass.',
      summary: 'You can now discuss different ways to travel and make travel plans.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'How do you go across the ocean to another continent?',
        options: ['By bicycle', 'By train', 'By airplane', 'By walking'],
        correctAnswers: [2],
        explanation: 'You travel across oceans by airplane.',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "We need to buy a _______ before we get on the bus."',
        audioPrompt: 'ticket',
        options: ['passport', 'map', 'suitcase', 'ticket'],
        correctAnswers: [3],
        explanation: 'A ticket is required to travel on public transport.',
      },
      {
        type: 'multiple-choice',
        question: 'What do you call a person who travels on a bus or train but is not the driver?',
        options: ['A pilot', 'A passenger', 'A customer', 'A guest'],
        correctAnswers: [1],
        explanation: 'A passenger is someone traveling on public transport.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "Don\'t worry, you won\'t _______ the train. It leaves in one hour."',
        options: ['lose', 'miss', 'catch', 'drop'],
        correctAnswers: [1],
        explanation: '"miss" means to not catch/arrive in time.',
      },
      {
        type: 'listening',
        question: 'Where do airplanes land and take off?',
        audioPrompt: 'airport',
        options: ['At the station', 'At the port', 'At the airport', 'At the garage'],
        correctAnswers: [2],
        explanation: 'Airplanes operate at airports.',
      },
    ],
    audioContent: [
      { text: 'airplane', type: 'word', context: 'Aircraft' },
      { text: 'train', type: 'word', context: 'Rail transport' },
      { text: 'ticket', type: 'word', context: 'Travel document' },
    ],
  },
  {
    levelId: 3,
    lessonNumber: 8,
    title: 'Making Plans',
    description: 'Learn how to make and discuss future plans.',
    content: {
      introduction: 'Planning for the future is a common conversation topic. This lesson teaches you how to discuss and make plans in English.',
      objectives: [
        'Use future structures to describe plans',
        'Understand time expressions for future',
        'Make and discuss plans with others',
        'Use "going to" for near future',
      ],
      mainContent: 'Future structures: "I am going to...", "will", "is going to rain", "next week/month". Time: tomorrow, next week, soon, later.',
      summary: 'You can now make plans and discuss future activities in English.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "Tomorrow, I am going to _______ my grandparents."',
        options: ['visiting', 'visited', 'visits', 'visit'],
        correctAnswers: [3],
        explanation: 'After "going to" use the base form "visit".',
      },
      {
        type: 'listening',
        question: 'What are you doing this weekend?',
        audioPrompt: 'I am meeting my friends',
        options: ['I went to the park', 'I am meeting my friends', 'I am twenty years old', 'I like pizza'],
        correctAnswers: [1],
        explanation: '"I am meeting my friends" is a future plan.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "Look at those dark clouds! It _______ rain soon."',
        options: ['goes to', 'will to', 'shall', 'is going to'],
        correctAnswers: [3],
        explanation: '"is going to" is used for imminent future events.',
      },
      {
        type: 'multiple-choice',
        question: 'Which word indicates a plan for the future?',
        options: ['Yesterday', 'Last week', 'Next month', 'Ago'],
        correctAnswers: [2],
        explanation: '"Next month" refers to future time.',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "We are _______ a party next Saturday. Can you come?"',
        audioPrompt: 'having',
        options: ['had', 'have', 'has', 'having'],
        correctAnswers: [3],
        explanation: '"having" (gerund) is correct in this context.',
      },
    ],
    audioContent: [
      { text: 'tomorrow', type: 'word', context: 'Near future' },
      { text: 'grandparents', type: 'word', context: 'Family' },
      { text: 'party', type: 'word', context: 'Event' },
    ],
  },
];

// LEVEL 4 - A2 (Elementary+)
const level4Lessons = [
  {
    levelId: 4,
    lessonNumber: 1,
    title: 'Comparative Adjectives',
    description: 'Learn to compare two things using comparative adjectives.',
    content: {
      introduction: 'Comparing things is a common way to describe differences. This lesson teaches you how to use comparative adjectives to make comparisons.',
      objectives: [
        'Form comparative adjectives correctly',
        'Use "than" in comparisons',
        'Understand regular and irregular comparatives',
        'Make meaningful comparisons',
      ],
      mainContent: 'Comparative formation: -er (fast/faster, big/bigger), more + adjective (expensive/more expensive). Irregular: good/better, bad/worse.',
      summary: 'You can now compare two things using comparative adjectives correctly.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "My new phone is _______ than my old one."',
        options: ['fast', 'faster', 'more fast', 'fastest'],
        correctAnswers: [1],
        explanation: '"faster" is the comparative form of "fast".',
      },
      {
        type: 'listening',
        question: 'A Ferrari is _______ than a regular bicycle.',
        audioPrompt: 'more expensive',
        options: ['expensiveer', 'more expensive', 'most expensive', 'as expensive'],
        correctAnswers: [1],
        explanation: '"more expensive" is correct for 3+ syllable adjectives.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "The weather today is _______ than it was yesterday."',
        options: ['gooder', 'better', 'best', 'more good'],
        correctAnswers: [1],
        explanation: '"better" is the irregular comparative of "good".',
      },
      {
        type: 'multiple-choice',
        question: 'Canada is _______ than Spain.',
        options: ['bigger', 'more big', 'biggest', 'biger'],
        correctAnswers: [0],
        explanation: '"bigger" is correct (big + ger with double final consonant).',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "Learning English is _______ than I thought it would be."',
        audioPrompt: 'easier',
        options: ['easyer', 'more easy', 'easiest', 'easier'],
        correctAnswers: [3],
        explanation: '"easier" is correct (easy → easier, changing y to i).',
      },
    ],
    audioContent: [
      { text: 'faster', type: 'word', context: 'Comparative adjective' },
      { text: 'bigger', type: 'word', context: 'Comparative adjective' },
      { text: 'better', type: 'word', context: 'Irregular comparative' },
    ],
  },
  {
    levelId: 4,
    lessonNumber: 2,
    title: 'Experiences - Present Perfect Intro',
    description: 'Learn about experiences using present perfect tense.',
    content: {
      introduction: 'The present perfect tense describes experiences and things that happened at an indefinite time in the past. This is essential for talking about life experiences.',
      objectives: [
        'Form present perfect correctly',
        'Use "have" and "has" appropriately',
        'Describe life experiences',
        'Ask about past experiences with "Have you ever..."',
      ],
      mainContent: 'Present perfect: have/has + past participle. Examples: "I have eaten sushi", "She has been to Paris", "Have you seen a whale?".',
      summary: 'You can now discuss experiences using present perfect tense.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "Have you ever _______ sushi before?"',
        options: ['eat', 'ate', 'eaten', 'eating'],
        correctAnswers: [2],
        explanation: '"eaten" is the past participle of "eat".',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "I have _______ to Paris twice in my life."',
        audioPrompt: 'been',
        options: ['went', 'go', 'gone', 'been'],
        correctAnswers: [3],
        explanation: '"been" is the past participle of "be".',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "She _______ never seen a whale in the ocean."',
        options: ['have', 'has', 'is', 'did'],
        correctAnswers: [1],
        explanation: '"has" is correct with singular "she".',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "We have _______ this movie three times already."',
        options: ['watch', 'watched', 'watching', 'watches'],
        correctAnswers: [1],
        explanation: '"watched" is the past participle of "watch".',
      },
      {
        type: 'listening',
        question: 'Have you finished your homework yet?',
        audioPrompt: 'Yes, I have finished it',
        options: ['Yes, I did', 'Yes, I have finished it', 'Yes, I finished', 'No, I don\'t'],
        correctAnswers: [1],
        explanation: '"Yes, I have finished it" is the correct present perfect response.',
      },
    ],
    audioContent: [
      { text: 'eaten', type: 'word', context: 'Past participle' },
      { text: 'been', type: 'word', context: 'Past participle' },
      { text: 'Paris', type: 'word', context: 'City name' },
    ],
  },
  {
    levelId: 4,
    lessonNumber: 3,
    title: 'Work and Careers',
    description: 'Learn vocabulary related to jobs and work environments.',
    content: {
      introduction: 'Work is a major part of adult life. This lesson teaches you how to discuss different professions and work-related topics.',
      objectives: [
        'Name different professions',
        'Describe work environments',
        'Discuss job responsibilities',
        'Understand work-related vocabulary',
      ],
      mainContent: 'Jobs: architect, nurse, manager, chef, teacher, engineer, pilot. Work terms: salary, boss, office, hospital, restaurant, company.',
      summary: 'You can now discuss careers and jobs in English.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What do you call a person who designs houses and buildings?',
        options: ['A builder', 'An architect', 'A pilot', 'A journalist'],
        correctAnswers: [1],
        explanation: 'An architect designs buildings and structures.',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "She works in a hospital. She is a _______."',
        audioPrompt: 'nurse',
        options: ['teacher', 'lawyer', 'nurse', 'shop assistant'],
        correctAnswers: [2],
        explanation: 'A nurse works in a hospital.',
      },
      {
        type: 'multiple-choice',
        question: 'What do you call the person who is in charge of a department or company?',
        options: ['The client', 'The manager', 'The guest', 'The assistant'],
        correctAnswers: [1],
        explanation: 'A manager is in charge of a department or company.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "He works in a restaurant kitchen. He is a _______."',
        options: ['waiter', 'chef', 'cleaner', 'driver'],
        correctAnswers: [1],
        explanation: 'A chef works in a kitchen.',
      },
      {
        type: 'multiple-choice',
        question: 'What do you earn when you work a regular job?',
        options: ['A bill', 'A salary', 'A tax', 'A price'],
        correctAnswers: [1],
        explanation: 'A salary is money earned from regular work.',
      },
    ],
    audioContent: [
      { text: 'architect', type: 'word', context: 'Profession' },
      { text: 'nurse', type: 'word', context: 'Profession' },
      { text: 'manager', type: 'word', context: 'Work position' },
    ],
  },
  {
    levelId: 4,
    lessonNumber: 4,
    title: 'Modals of Ability and Obligation',
    description: 'Learn to use modal verbs for ability and obligation.',
    content: {
      introduction: 'Modal verbs express ability, possibility, obligation, and permission. This lesson focuses on expressing what you can do and what you must do.',
      objectives: [
        'Use "could" and "could not" for past ability',
        'Use "must" for strong obligation',
        'Use "should" for advice',
        'Use "could" for polite requests',
      ],
      mainContent: 'Modals: could/could not (past ability), must (obligation), should (advice), could (polite request). Examples: "I could swim", "You must wear seatbelt", "You should rest".',
      summary: 'You can now express ability and obligation using modal verbs.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "When I was five years old, I _______ swim, but now I can."',
        options: ['cannot', 'could not', 'should not', 'must not'],
        correctAnswers: [1],
        explanation: '"could not" expresses inability in the past.',
      },
      {
        type: 'listening',
        question: 'You _______ wear a seatbelt while driving a car. It is the law.',
        audioPrompt: 'must',
        options: ['should', 'can', 'might', 'must'],
        correctAnswers: [3],
        explanation: '"must" expresses legal obligation.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "If you feel sick, you _______ stay at home and rest."',
        options: ['must to', 'should', 'can to', 'could to'],
        correctAnswers: [1],
        explanation: '"should" gives advice/recommendation.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "Excuse me, _______ you help me carry this heavy bag?"',
        options: ['must', 'should', 'could', 'shall'],
        correctAnswers: [2],
        explanation: '"Could" is a polite way to make a request.',
      },
      {
        type: 'multiple-choice',
        question: 'You _______ smoke inside the hospital. It is strictly forbidden.',
        options: ['don\'t have to', 'must not', 'should not to', 'cannot to'],
        correctAnswers: [1],
        explanation: '"must not" expresses strong prohibition.',
      },
    ],
    audioContent: [
      { text: 'could', type: 'word', context: 'Modal verb' },
      { text: 'must', type: 'word', context: 'Modal verb' },
      { text: 'should', type: 'word', context: 'Modal verb' },
    ],
  },
  {
    levelId: 4,
    lessonNumber: 5,
    title: 'Technology and Media',
    description: 'Learn vocabulary related to computers, technology, and digital media.',
    content: {
      introduction: 'Technology is central to modern life. This lesson teaches you how to discuss computers, software, and digital activities.',
      objectives: [
        'Name computer components and peripherals',
        'Use technology-related vocabulary',
        'Describe digital actions',
        'Discuss internet and media safety',
      ],
      mainContent: 'Technology: download, delete, upload, keyboard, screen, mouse, password, email. Actions: save, share, connect, search, type, click.',
      summary: 'You can now discuss technology and digital media in English.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'What do you do when you save a file from the internet onto your computer?',
        options: ['Upload', 'Delete', 'Download', 'Install'],
        correctAnswers: [2],
        explanation: '"Download" means to save from internet to computer.',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "I accidentally _______ all my photos from my phone!"',
        audioPrompt: 'deleted',
        options: ['searched', 'shared', 'connected', 'deleted'],
        correctAnswers: [3],
        explanation: '"deleted" means removed/erased.',
      },
      {
        type: 'multiple-choice',
        question: 'What part of a computer or smartphone shows you the images and text?',
        options: ['The keyboard', 'The mouse', 'The screen', 'The speaker'],
        correctAnswers: [2],
        explanation: 'The screen displays images and text.',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "You need a strong _______ to log into your email safely."',
        audioPrompt: 'password',
        options: ['website', 'link', 'password', 'screen'],
        correctAnswers: [2],
        explanation: 'A password protects your account.',
      },
      {
        type: 'multiple-choice',
        question: 'What do you use to type text into a computer?',
        options: ['A monitor', 'A keyboard', 'A mouse', 'A webcam'],
        correctAnswers: [1],
        explanation: 'A keyboard is used for typing.',
      },
    ],
    audioContent: [
      { text: 'download', type: 'word', context: 'Tech action' },
      { text: 'keyboard', type: 'word', context: 'Computer part' },
      { text: 'password', type: 'word', context: 'Security' },
    ],
  },
  {
    levelId: 4,
    lessonNumber: 6,
    title: 'Life Events',
    description: 'Learn vocabulary for important life events and milestones.',
    content: {
      introduction: 'Life is marked by important events and changes. This lesson teaches you how to discuss milestones and life events.',
      objectives: [
        'Describe important life events',
        'Use past tense for life experiences',
        'Discuss life changes and decisions',
        'Share personal milestones',
      ],
      mainContent: 'Life events: graduated, got married, moved, grew up, got a job, had a baby. Time expressions: last summer, in 2018, when I was young, last year.',
      summary: 'You can now discuss important life events and personal milestones.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "My brother _______ from university last summer."',
        options: ['born', 'graduated', 'married', 'grew up'],
        correctAnswers: [1],
        explanation: '"graduated" means completed university.',
      },
      {
        type: 'listening',
        question: 'When did they get married?',
        audioPrompt: 'They got married in 2018',
        options: ['They are marrying in 2018', 'They marry in 2018', 'They have married in 2018', 'They got married in 2018'],
        correctAnswers: [3],
        explanation: '"They got married in 2018" is the correct past tense.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "We decided to _______ house because we needed more space."',
        options: ['change', 'leave', 'stay', 'move'],
        correctAnswers: [3],
        explanation: '"move" house means relocate to a new home.',
      },
      {
        type: 'listening',
        question: 'Where did you grow up?',
        audioPrompt: 'I grew up in a small town',
        options: ['I was grown up in a small town', 'I grow up in a small town', 'I am growing up in a small town', 'I grew up in a small town'],
        correctAnswers: [3],
        explanation: '"I grew up in a small town" is correct past tense.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "She got a new _______ as a software engineer last week."',
        options: ['career', 'work', 'office', 'job'],
        correctAnswers: [3],
        explanation: '"job" refers to an employment position.',
      },
    ],
    audioContent: [
      { text: 'graduated', type: 'word', context: 'Life event' },
      { text: 'married', type: 'word', context: 'Life event' },
      { text: 'moved', type: 'word', context: 'Life event' },
    ],
  },
  {
    levelId: 4,
    lessonNumber: 7,
    title: 'Superlative Adjectives',
    description: 'Learn to use superlative adjectives to describe the highest degree.',
    content: {
      introduction: 'Superlative adjectives describe the most extreme quality. This lesson teaches you how to use superlatives correctly.',
      objectives: [
        'Form superlative adjectives correctly',
        'Use "the" with superlatives',
        'Understand regular and irregular superlatives',
        'Make superlative statements',
      ],
      mainContent: 'Superlative formation: -est (fast/fastest, big/biggest), most + adjective (expensive/most expensive). Irregular: good/best, bad/worst.',
      summary: 'You can now use superlative adjectives to describe the highest degree of quality.',
    },
    exercises: [
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "Mount Everest is the _______ mountain in the world."',
        options: ['higher', 'highest', 'most high', 'highestly'],
        correctAnswers: [1],
        explanation: '"highest" is the superlative of "high".',
      },
      {
        type: 'listening',
        question: 'Which city is the _______ expensive city to live in?',
        audioPrompt: 'most',
        options: ['more', 'most', 'much', 'very'],
        correctAnswers: [1],
        explanation: '"most" is used with "expensive" for superlative.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "That was the _______ movie I have ever seen! It was terrible."',
        options: ['badest', 'worst', 'worse', 'most bad'],
        correctAnswers: [1],
        explanation: '"worst" is the irregular superlative of "bad".',
      },
      {
        type: 'multiple-choice',
        question: 'Who is the _______ person in your family?',
        options: ['taller', 'most tall', 'tallest', 'tallest city'],
        correctAnswers: [2],
        explanation: '"tallest" is the superlative of "tall".',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "This is the _______ comfortable sofa in the store."',
        audioPrompt: 'most',
        options: ['more', 'most', 'very', 'much'],
        correctAnswers: [1],
        explanation: '"most" is used with "comfortable" for superlative.',
      },
    ],
    audioContent: [
      { text: 'highest', type: 'word', context: 'Superlative adjective' },
      { text: 'worst', type: 'word', context: 'Irregular superlative' },
      { text: 'best', type: 'word', context: 'Irregular superlative' },
    ],
  },
  {
    levelId: 4,
    lessonNumber: 8,
    title: 'Appearance and Personality',
    description: 'Learn vocabulary to describe physical appearance and personality traits.',
    content: {
      introduction: 'Describing people is a common part of conversation. This lesson teaches you how to talk about physical features and character traits.',
      objectives: [
        'Describe physical appearance',
        'Use personality adjectives',
        'Use correct word order in descriptions',
        'Understand hair types and features',
      ],
      mainContent: 'Appearance: curly, straight, bald, tall, short, hair. Personality: generous, shy, funny, polite, rude, friendly, kind, honest.',
      summary: 'You can now describe people\'s appearance and personality traits in English.',
    },
    exercises: [
      {
        type: 'listening',
        question: 'What kind of hair does someone have if it forms loops and circles?',
        audioPrompt: 'Curly hair',
        options: ['Straight hair', 'Curly hair', 'Bald', 'Short hair'],
        correctAnswers: [1],
        explanation: 'Curly hair forms loops and circles.',
      },
      {
        type: 'multiple-choice',
        question: 'Complete the sentence: "He is very _______. He always shares his things with others."',
        options: ['selfish', 'generous', 'lazy', 'shy'],
        correctAnswers: [1],
        explanation: '"generous" means willing to share.',
      },
      {
        type: 'multiple-choice',
        question: 'What do you call someone who makes people laugh easily?',
        options: ['Serious', 'Funny', 'Polite', 'Quiet'],
        correctAnswers: [1],
        explanation: 'A funny person makes others laugh.',
      },
      {
        type: 'listening',
        question: 'Complete the sentence: "She is very _______ and gets nervous when talking to new people."',
        audioPrompt: 'shy',
        options: ['friendly', 'confident', 'talkative', 'shy'],
        correctAnswers: [3],
        explanation: '"shy" means nervous around new people.',
      },
      {
        type: 'multiple-choice',
        question: 'What is the opposite of the word "polite"?',
        options: ['Kind', 'Honest', 'Rude', 'Smart'],
        correctAnswers: [2],
        explanation: '"Rude" is the opposite of "polite".',
      },
    ],
    audioContent: [
      { text: 'curly', type: 'word', context: 'Hair type' },
      { text: 'generous', type: 'word', context: 'Personality trait' },
      { text: 'shy', type: 'word', context: 'Personality trait' },
    ],
  },
];

/**
 * Seeds lesson data into the database
 * Checks if lessons already exist for each level before inserting
 */
export async function seedLessons(): Promise<string> {
  try {
    // Check if lessons already exist for any level
    const level1Count = await Lesson.countDocuments({ levelId: 1 });
    const level2Count = await Lesson.countDocuments({ levelId: 2 });
    const level3Count = await Lesson.countDocuments({ levelId: 3 });
    const level4Count = await Lesson.countDocuments({ levelId: 4 });

    if (level1Count > 0 && level2Count > 0 && level3Count > 0 && level4Count > 0) {
      return `✅ All lesson levels already exist (Level 1: ${level1Count}, Level 2: ${level2Count}, Level 3: ${level3Count}, Level 4: ${level4Count})`;
    }

    // Check for levels 5-7
    const level5Count = await Lesson.countDocuments({ levelId: 5 });
    const level6Count = await Lesson.countDocuments({ levelId: 6 });
    const level7Count = await Lesson.countDocuments({ levelId: 7 });
    const level8Count = await Lesson.countDocuments({ levelId: 8 });
    const level9Count = await Lesson.countDocuments({ levelId: 9 });
    const level10Count = await Lesson.countDocuments({ levelId: 10 });

    if (level1Count > 0 && level2Count > 0 && level3Count > 0 && level4Count > 0 && 
        level5Count > 0 && level6Count > 0 && level7Count > 0 && 
        level8Count > 0 && level9Count > 0 && level10Count > 0) {
      return `✅ All lesson levels already exist (Level 1: ${level1Count}, Level 2: ${level2Count}, Level 3: ${level3Count}, Level 4: ${level4Count}, Level 5: ${level5Count}, Level 6: ${level6Count}, Level 7: ${level7Count}, Level 8: ${level8Count}, Level 9: ${level9Count}, Level 10: ${level10Count})`;
    }

    // Insert lessons for levels that don't exist
    const allLessons = [];
    
    if (level1Count === 0) {
      allLessons.push(...level1Lessons);
    }
    if (level2Count === 0) {
      allLessons.push(...level2Lessons);
    }
    if (level3Count === 0) {
      allLessons.push(...level3Lessons);
    }
    if (level4Count === 0) {
      allLessons.push(...level4Lessons);
    }
    if (level5Count === 0) {
      allLessons.push(...level5Lessons);
    }
    if (level6Count === 0) {
      allLessons.push(...level6Lessons);
    }
    if (level7Count === 0) {
      allLessons.push(...level7Lessons);
    }
    if (level8Count === 0) {
      allLessons.push(...level8Lessons);
    }
    if (level9Count === 0) {
      allLessons.push(...level9Lessons);
    }
    if (level10Count === 0) {
      allLessons.push(...level10Lessons);
    }

    if (allLessons.length > 0) {
      await Lesson.insertMany(allLessons);
      return `✅ Lessons seeded successfully (${allLessons.length} lessons added)`;
    }

    return `✅ All lessons already exist in database`;
  } catch (error) {
    throw new Error(`Failed to seed lessons: ${error}`, { cause: error });
  }
}

export { level1Lessons, level2Lessons, level3Lessons, level4Lessons };
