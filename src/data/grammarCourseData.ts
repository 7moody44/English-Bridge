// AUTO-GENERATED from English_Grammar_Complete_Course.txt

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface GrammarTopic {
  id: string;
  title: string;
  level: string;
  usage: string;
  structure: string;
  examples: string[];
  questions: Question[];
}

export interface GrammarCategory {
  name: string;
  topics: GrammarTopic[];
}

export const grammarCourse: GrammarCategory[] = [
  {
    "name": "TENSES",
    "topics": [
      {
        "id": "11",
        "title": "Simple Present",
        "level": "A1",
        "usage": "The Simple Present describes habits, facts, general truths, routines, and repeated actions.",
        "structure": "Subject + base verb (+ s/es for he/she/it)",
        "examples": [
          "I play football every Saturday.",
          "She works in a hospital.",
          "Water boils at 100 degrees Celsius."
        ],
        "questions": [
          {
            "question": "She ___ to work by bus every day.",
            "options": [
              "go",
              "goes",
              "going",
              "is go"
            ],
            "correctAnswer": "goes"
          },
          {
            "question": "They ___ live in London.",
            "options": [
              "doesn't",
              "don't",
              "aren't",
              "not"
            ],
            "correctAnswer": "don't"
          },
          {
            "question": "___ he play the guitar?",
            "options": [
              "Do",
              "Is",
              "Does",
              "Are"
            ],
            "correctAnswer": "Does"
          },
          {
            "question": "The sun ___ in the east.",
            "options": [
              "rise",
              "rises",
              "rising",
              "is rise"
            ],
            "correctAnswer": "rises"
          },
          {
            "question": "We usually ___ dinner at 7 PM.",
            "options": [
              "eats",
              "ate",
              "eat",
              "eating"
            ],
            "correctAnswer": "eat"
          }
        ]
      },
      {
        "id": "12",
        "title": "Simple Past",
        "level": "A1",
        "usage": "The Simple Past describes completed actions that happened at a specific, finished time in the past.",
        "structure": "Subject + past verb (verb + -ed / irregular form)",
        "examples": [
          "They visited London last year.",
          "He bought a new car yesterday.",
          "We watched a movie last night."
        ],
        "questions": [
          {
            "question": "I ___ an old friend at the supermarket yesterday.",
            "options": [
              "meet",
              "met",
              "meeted",
              "meeting"
            ],
            "correctAnswer": "met"
          },
          {
            "question": "She ___ not attend the meeting last Friday.",
            "options": [
              "does",
              "was",
              "did",
              "has"
            ],
            "correctAnswer": "did"
          },
          {
            "question": "What time ___ you get home last night?",
            "options": [
              "did",
              "do",
              "were",
              "had"
            ],
            "correctAnswer": "did"
          },
          {
            "question": "They ___ a great movie two days ago.",
            "options": [
              "watch",
              "watched",
              "watches",
              "watching"
            ],
            "correctAnswer": "watched"
          },
          {
            "question": "He ___ buy the tickets because he forgot his wallet.",
            "options": [
              "doesn't",
              "didn't",
              "wasn't",
              "hasn't"
            ],
            "correctAnswer": "didn't"
          }
        ]
      },
      {
        "id": "13",
        "title": "Present Continuous",
        "level": "A2",
        "usage": "The Present Continuous describes actions happening right now at the moment of speaking, or temporary ongoing situations.",
        "structure": "Subject + am / is / are + verb-ing",
        "examples": [
          "Look! It is raining outside.",
          "I am studying for my exam this week.",
          "She is speaking on the phone right now."
        ],
        "questions": [
          {
            "question": "Listen! Somebody ___ the piano upstairs.",
            "options": [
              "plays",
              "is playing",
              "played",
              "play"
            ],
            "correctAnswer": "is playing"
          },
          {
            "question": "What ___ you doing at the moment?",
            "options": [
              "do",
              "are",
              "is",
              "did"
            ],
            "correctAnswer": "are"
          },
          {
            "question": "I ___ working today because it is my day off.",
            "options": [
              "am not",
              "don't",
              "not",
              "isn't"
            ],
            "correctAnswer": "am not"
          },
          {
            "question": "They are currently ___ a new bridge across the river.",
            "options": [
              "build",
              "builds",
              "building",
              "built"
            ],
            "correctAnswer": "building"
          },
          {
            "question": "Why ___ she wearing a heavy coat in summer?",
            "options": [
              "does",
              "is",
              "are",
              "do"
            ],
            "correctAnswer": "is"
          }
        ]
      },
      {
        "id": "14",
        "title": "Past Continuous",
        "level": "A2",
        "usage": "The Past Continuous describes actions that were in progress at a specific moment in the past, or a background scene interrupted by a shorter action.",
        "structure": "Subject + was / were + verb-ing",
        "examples": [
          "I was reading a book at 8 PM yesterday.",
          "They were playing tennis when it started to rain.",
          "While she was cooking, he was setting the table."
        ],
        "questions": [
          {
            "question": "I ___ showering when the phone rang.",
            "options": [
              "am",
              "was",
              "were",
              "did"
            ],
            "correctAnswer": "was"
          },
          {
            "question": "What were you ___ at 10 PM last night?",
            "options": [
              "do",
              "did",
              "doing",
              "done"
            ],
            "correctAnswer": "doing"
          },
          {
            "question": "They ___ listening to the teacher while she was explaining.",
            "options": [
              "wasn't",
              "weren't",
              "didn't",
              "aren't"
            ],
            "correctAnswer": "weren't"
          },
          {
            "question": "While we ___ walking home, we saw a deer.",
            "options": [
              "are",
              "were",
              "was",
              "did"
            ],
            "correctAnswer": "were"
          },
          {
            "question": "Was she ___ a red dress at the party?",
            "options": [
              "wear",
              "wears",
              "wearing",
              "wore"
            ],
            "correctAnswer": "wearing"
          }
        ]
      },
      {
        "id": "15",
        "title": "Future Simple - Will & Going To",
        "level": "A2",
        "usage": "Use WILL for spontaneous decisions, promises, and future predictions. Use GOING TO for pre-planned intentions and evidence-based predictions.",
        "structure": "Subject + will + base verb  OR  Subject + am/is/are + going to + base verb",
        "examples": [
          "I will help you carry those heavy bags. (Instant decision)",
          "Look at those dark clouds! It is going to rain. (Evidence)",
          "We are going to visit our grandparents this weekend. (Plan)"
        ],
        "questions": [
          {
            "question": "\"I forgot my wallet!\" \u2014 \"Don't worry, I ___ pay for you.\"",
            "options": [
              "am going to",
              "will",
              "am pay",
              "shall to"
            ],
            "correctAnswer": "will"
          },
          {
            "question": "Look at the traffic! We are ___ to be late.",
            "options": [
              "go",
              "going",
              "will",
              "gone"
            ],
            "correctAnswer": "going"
          },
          {
            "question": "I promise I ___ forget to call you.",
            "options": [
              "won't",
              "am not",
              "don't",
              "not will"
            ],
            "correctAnswer": "won't"
          },
          {
            "question": "What are your plans for summer? \u2014 We ___ travel to Spain.",
            "options": [
              "will to",
              "are going to",
              "going to",
              "will going"
            ],
            "correctAnswer": "are going to"
          },
          {
            "question": "I think cars ___ fly in the distant future.",
            "options": [
              "are going",
              "will",
              "going to",
              "are fly"
            ],
            "correctAnswer": "will"
          }
        ]
      },
      {
        "id": "16",
        "title": "Present Perfect",
        "level": "B1",
        "usage": "Connects past actions to the present. Used for life experiences, recent actions with present results, or unfinished time periods.",
        "structure": "Subject + have / has + past participle (V3)",
        "examples": [
          "I have lived in London for five years.",
          "She has already finished her homework.",
          "Have you ever eaten octopus?"
        ],
        "questions": [
          {
            "question": "I ___ never seen such a beautiful sunset before.",
            "options": [
              "am",
              "did",
              "have",
              "was"
            ],
            "correctAnswer": "have"
          },
          {
            "question": "She has lived in this apartment ___ 2018.",
            "options": [
              "for",
              "since",
              "in",
              "during"
            ],
            "correctAnswer": "since"
          },
          {
            "question": "Have you finished reading the report ___?",
            "options": [
              "already",
              "just",
              "yet",
              "ever"
            ],
            "correctAnswer": "yet"
          },
          {
            "question": "He has ___ left the office; his chair is still warm.",
            "options": [
              "yet",
              "just",
              "ever",
              "since"
            ],
            "correctAnswer": "just"
          },
          {
            "question": "They haven't ___ their decision yet.",
            "options": [
              "make",
              "making",
              "made",
              "makes"
            ],
            "correctAnswer": "made"
          }
        ]
      },
      {
        "id": "17",
        "title": "Past Perfect",
        "level": "B1",
        "usage": "Describes an action that was completed BEFORE another action or time in the past. (The \"past of the past\").",
        "structure": "Subject + had + past participle (V3)",
        "examples": [
          "When I arrived at the station, the train had already left.",
          "She was hungry because she hadn't eaten all day.",
          "After they had finished dinner, they went for a walk."
        ],
        "questions": [
          {
            "question": "By the time the police arrived, the burglar ___ escaped.",
            "options": [
              "has",
              "had",
              "was",
              "did"
            ],
            "correctAnswer": "had"
          },
          {
            "question": "She failed the test because she ___ not studied enough.",
            "options": [
              "has",
              "was",
              "had",
              "did"
            ],
            "correctAnswer": "had"
          },
          {
            "question": "Had you ever ___ a horse before yesterday?",
            "options": [
              "ride",
              "rode",
              "ridden",
              "riding"
            ],
            "correctAnswer": "ridden"
          },
          {
            "question": "I realized I ___ forgotten my passport when I reached the airport.",
            "options": [
              "have",
              "had",
              "am",
              "was"
            ],
            "correctAnswer": "had"
          },
          {
            "question": "They went to bed after they ___ watched the news.",
            "options": [
              "have",
              "had",
              "were",
              "did"
            ],
            "correctAnswer": "had"
          }
        ]
      },
      {
        "id": "18",
        "title": "Present Perfect Continuous",
        "level": "B2",
        "usage": "Describes an action that started in the past and is still continuing now, or an action that recently stopped but has clear visible results in the present.",
        "structure": "Subject + have / has + been + verb-ing",
        "examples": [
          "I have been studying English for three hours.",
          "She is breathless because she has been running.",
          "How long have you been living here?"
        ],
        "questions": [
          {
            "question": "You look tired. ___ you been working out?",
            "options": [
              "Do",
              "Are",
              "Have",
              "Were"
            ],
            "correctAnswer": "Have"
          },
          {
            "question": "It has been ___ heavily all morning.",
            "options": [
              "rain",
              "rained",
              "raining",
              "rains"
            ],
            "correctAnswer": "raining"
          },
          {
            "question": "How long have you been ___ for the bus?",
            "options": [
              "wait",
              "waited",
              "waiting",
              "waits"
            ],
            "correctAnswer": "waiting"
          },
          {
            "question": "She has been working at this firm ___ six months.",
            "options": [
              "since",
              "for",
              "during",
              "from"
            ],
            "correctAnswer": "for"
          },
          {
            "question": "My hands are dirty because I have been ___ the car.",
            "options": [
              "repaired",
              "repairing",
              "repair",
              "repairs"
            ],
            "correctAnswer": "repairing"
          }
        ]
      },
      {
        "id": "19",
        "title": "Future Continuous & Future Perfect",
        "level": "B2",
        "usage": "Future Continuous: action in progress at a specific future moment.\nFuture Perfect: action completed before a specific future deadline.",
        "structure": "Future Continuous: Subject + will be + verb-ing\nFuture Perfect: Subject + will have + past participle (V3)",
        "examples": [
          "This time tomorrow, I will be flying to Tokyo.",
          "By 2030, scientists will have discovered new treatments.",
          "Don't call at 8 PM; we will be having dinner."
        ],
        "questions": [
          {
            "question": "This time next week, I ___ lying on a sunny beach.",
            "options": [
              "will",
              "will be",
              "will have",
              "am lying"
            ],
            "correctAnswer": "will be"
          },
          {
            "question": "By the end of this month, she ___ completed her degree.",
            "options": [
              "will",
              "will be",
              "will have",
              "has"
            ],
            "correctAnswer": "will have"
          },
          {
            "question": "Don't visit at 3 PM tomorrow. I ___ an exam.",
            "options": [
              "will write",
              "will be writing",
              "will have written",
              "write"
            ],
            "correctAnswer": "will be writing"
          },
          {
            "question": "By 2030, electric vehicles ___ replaced gasoline cars in many cities.",
            "options": [
              "will be",
              "will have",
              "have",
              "are"
            ],
            "correctAnswer": "will have"
          },
          {
            "question": "Will you ___ finished the project before the manager arrives?",
            "options": [
              "be",
              "have",
              "had",
              "having"
            ],
            "correctAnswer": "have"
          }
        ]
      }
    ]
  },
  {
    "name": "MODAL VERBS",
    "topics": [
      {
        "id": "31",
        "title": "Can & Could",
        "level": "A1",
        "usage": "Use CAN for present ability, informal requests, and permission. Use COULD for past ability and polite/formal requests.",
        "structure": "Subject + can / could + base verb",
        "examples": [
          "I can speak three languages. (Present ability)",
          "Could you open the window, please? (Polite request)",
          "When I was young, I could run very fast. (Past ability)"
        ],
        "questions": [
          {
            "question": "She ___ speak fluent Spanish when she was ten years old.",
            "options": [
              "can",
              "could",
              "must",
              "should"
            ],
            "correctAnswer": "could"
          },
          {
            "question": "Excuse me, ___ you tell me where the station is?",
            "options": [
              "could",
              "can to",
              "could to",
              "may to"
            ],
            "correctAnswer": "could"
          },
          {
            "question": "I am sorry, but I ___ come to your party tonight.",
            "options": [
              "couldn't",
              "can't",
              "mustn't",
              "not can"
            ],
            "correctAnswer": "can't"
          },
          {
            "question": "Look! He ___ lift that heavy box easily.",
            "options": [
              "can",
              "could",
              "is can",
              "can to"
            ],
            "correctAnswer": "can"
          },
          {
            "question": "When we were children, we ___ play outside until dark.",
            "options": [
              "can",
              "could",
              "might",
              "should"
            ],
            "correctAnswer": "could"
          }
        ]
      },
      {
        "id": "32",
        "title": "May & Might",
        "level": "A2",
        "usage": "Use MAY and MIGHT to express possibility in the present or future. MAY is slightly more probable or used for formal permission.",
        "structure": "Subject + may / might + base verb",
        "examples": [
          "Take an umbrella. It might rain later. (Possibility)",
          "May I leave the room, please? (Formal permission)",
          "We may go to Paris next summer, but we haven't decided."
        ],
        "questions": [
          {
            "question": "I am not sure, but it ___ snow tonight.",
            "options": [
              "must",
              "might",
              "can",
              "should"
            ],
            "correctAnswer": "might"
          },
          {
            "question": "___ I use your bathroom, please?",
            "options": [
              "May",
              "Might",
              "Will",
              "Would"
            ],
            "correctAnswer": "May"
          },
          {
            "question": "She ___ not come to school tomorrow because she feels sick.",
            "options": [
              "may",
              "must",
              "could to",
              "would"
            ],
            "correctAnswer": "may"
          },
          {
            "question": "Where is Alex? \u2014 I'm not sure, he ___ be in his office.",
            "options": [
              "must",
              "might",
              "should",
              "will"
            ],
            "correctAnswer": "might"
          },
          {
            "question": "We ___ go to the cinema later if we finish our work early.",
            "options": [
              "may",
              "must to",
              "should to",
              "will to"
            ],
            "correctAnswer": "may"
          }
        ]
      },
      {
        "id": "33",
        "title": "Must & Have To",
        "level": "A2",
        "usage": "MUST expresses internal obligation or strong personal belief. HAVE TO expresses external rules, laws, or necessity.",
        "structure": "Subject + must + base verb  OR  Subject + have to / has to + base verb",
        "examples": [
          "You must wear a seatbelt while driving. (Rule/Law)",
          "I must study harder for my next test. (Personal obligation)",
          "She has to wear a uniform at work. (External rule)"
        ],
        "questions": [
          {
            "question": "Drivers ___ stop at a red light. It's the law.",
            "options": [
              "must",
              "may",
              "might",
              "should"
            ],
            "correctAnswer": "must"
          },
          {
            "question": "You ___ bring an umbrella. It's not going to rain.",
            "options": [
              "mustn't",
              "don't have to",
              "couldn't",
              "may not"
            ],
            "correctAnswer": "don't have to"
          },
          {
            "question": "She ___ get up early on Sundays because she doesn't work.",
            "options": [
              "doesn't have to",
              "mustn't",
              "couldn't",
              "hasn't to"
            ],
            "correctAnswer": "doesn't have to"
          },
          {
            "question": "You ___ touch that wire! It is extremely dangerous.",
            "options": [
              "don't have to",
              "mustn't",
              "couldn't",
              "may not"
            ],
            "correctAnswer": "mustn't"
          },
          {
            "question": "He ___ wear glasses for reading because his eyesight is poor.",
            "options": [
              "has to",
              "have to",
              "must to",
              "is must"
            ],
            "correctAnswer": "has to"
          }
        ]
      },
      {
        "id": "34",
        "title": "Should & Ought To",
        "level": "B1",
        "usage": "Use SHOULD and OUGHT TO to give advice, recommendations, opinions, or express expectations.",
        "structure": "Subject + should + base verb  OR  Subject + ought to + base verb",
        "examples": [
          "You should drink more water every day. (Advice)",
          "You ought to apologize to her for being late. (Recommendation)",
          "The train should arrive in five minutes. (Expectation)"
        ],
        "questions": [
          {
            "question": "If you feel sick, you ___ see a doctor.",
            "options": [
              "should",
              "must to",
              "ought",
              "would"
            ],
            "correctAnswer": "should"
          },
          {
            "question": "You ___ spend so much time playing video games.",
            "options": [
              "shouldn't",
              "ought not",
              "wouldn't",
              "mustn't to"
            ],
            "correctAnswer": "shouldn't"
          },
          {
            "question": "You ___ to double-check your answers before submitting the test.",
            "options": [
              "should",
              "ought",
              "must",
              "had better"
            ],
            "correctAnswer": "ought"
          },
          {
            "question": "What time ___ we meet tomorrow morning?",
            "options": [
              "should",
              "ought",
              "must to",
              "would"
            ],
            "correctAnswer": "should"
          },
          {
            "question": "He ___ be at home by now; he left an hour ago.",
            "options": [
              "should",
              "ought",
              "must to",
              "would"
            ],
            "correctAnswer": "should"
          }
        ]
      },
      {
        "id": "35",
        "title": "Will & Would",
        "level": "B1",
        "usage": "WILL expresses future certainty, promises, and offers. WOULD expresses hypothetical situations, polite offers, and past habits.",
        "structure": "Subject + will / would + base verb",
        "examples": [
          "I will call you as soon as I arrive. (Promise)",
          "Would you like a cup of tea? (Polite offer)",
          "If I had time, I would travel more. (Hypothetical)",
          "When we lived by the sea, we would walk on the beach every morning. (Past habit)"
        ],
        "questions": [
          {
            "question": "___ you like another cup of coffee?",
            "options": [
              "Will",
              "Would",
              "Could to",
              "Should"
            ],
            "correctAnswer": "Would"
          },
          {
            "question": "Don't worry, I ___ help you with your luggage.",
            "options": [
              "will",
              "would",
              "am",
              "should to"
            ],
            "correctAnswer": "will"
          },
          {
            "question": "If I won the lottery, I ___ buy a big house.",
            "options": [
              "will",
              "would",
              "must",
              "shall"
            ],
            "correctAnswer": "would"
          },
          {
            "question": "When my grandfather was young, he ___ sit on the porch for hours.",
            "options": [
              "will",
              "would",
              "should to",
              "must"
            ],
            "correctAnswer": "would"
          },
          {
            "question": "She said that she ___ call me yesterday, but she forgot.",
            "options": [
              "will",
              "would",
              "can",
              "may"
            ],
            "correctAnswer": "would"
          }
        ]
      },
      {
        "id": "36",
        "title": "Modals of Deduction - Present & Past",
        "level": "B2",
        "usage": "Expresses logical conclusions based on evidence.\nPresent Deduction: MUST (certain yes), CAN'T (certain no), MIGHT/COULD (possible).\nPast Deduction: MUST HAVE + V3, CAN'T HAVE + V3, MIGHT HAVE + V3.",
        "structure": "Present: Subject + must / can't / might + base verb\nPast: Subject + must / can't / might + have + past participle (V3)",
        "examples": [
          "He has three sports cars. He must be very rich. (Present)",
          "She's not answering her phone. She might be driving. (Present)",
          "The street is wet. It must have rained last night. (Past)",
          "You can't have seen John yesterday; he is in Australia! (Past)"
        ],
        "questions": [
          {
            "question": "You haven't eaten all day! You ___ be starving.",
            "options": [
              "must",
              "can't",
              "should",
              "might"
            ],
            "correctAnswer": "must"
          },
          {
            "question": "Look at his coat! He ___ have spent a fortune on it.",
            "options": [
              "must",
              "can't",
              "should",
              "would"
            ],
            "correctAnswer": "must"
          },
          {
            "question": "She ___ have stolen the money; she wasn't even in the building.",
            "options": [
              "must",
              "can't",
              "might",
              "should"
            ],
            "correctAnswer": "can't"
          },
          {
            "question": "Where is my key? \u2014 You ___ have left it in the restaurant.",
            "options": [
              "must to",
              "might",
              "can't",
              "should"
            ],
            "correctAnswer": "might"
          },
          {
            "question": "You ___ be serious! That story sounds completely impossible.",
            "options": [
              "can't",
              "must",
              "should",
              "might"
            ],
            "correctAnswer": "can't"
          }
        ]
      },
      {
        "id": "37",
        "title": "Advanced Modal Structures",
        "level": "C1",
        "usage": "Expresses complex modal nuances including past regret (SHOULD HAVE + V3), necessity (NEEDN'T HAVE vs. DIDN'T NEED TO), and formal obligation (WAS/WERE TO HAVE + V3).",
        "structure": "Should have + V3 / Needn't have + V3 / Was to have + V3",
        "examples": [
          "I should have studied harder for the exam. (Regret)",
          "You needn't have cooked dinner; I had already eaten. (Action done, but unnecessary)",
          "The summit meeting was to have taken place in Geneva. (Unfulfilled plan)"
        ],
        "questions": [
          {
            "question": "I ___ spent so much money on these shoes. I barely wear them!",
            "options": [
              "shouldn't have",
              "needn't",
              "can't have",
              "wouldn't"
            ],
            "correctAnswer": "shouldn't have"
          },
          {
            "question": "You ___ bought milk! We already had three bottles in the fridge.",
            "options": [
              "didn't need",
              "needn't have",
              "mustn't have",
              "shouldn't"
            ],
            "correctAnswer": "needn't have"
          },
          {
            "question": "The president was ___ delivered a speech, but he fell ill.",
            "options": [
              "to have",
              "should have",
              "must have",
              "to be"
            ],
            "correctAnswer": "to have"
          },
          {
            "question": "You ___ told me you were coming! I would have made lunch.",
            "options": [
              "should have",
              "must have",
              "can't have",
              "would have"
            ],
            "correctAnswer": "should have"
          },
          {
            "question": "We didn't need to hurry because the train was delayed. (Did we hurry?)",
            "options": [
              "No, we didn't hurry.",
              "Yes, we hurried unnecessarily.",
              "Yes, we missed the train.",
              "No, we missed it."
            ],
            "correctAnswer": "No, we didn't hurry."
          }
        ]
      }
    ]
  },
  {
    "name": "PASSIVE VOICE",
    "topics": [
      {
        "id": "51",
        "title": "Present & Past Simple Passive",
        "level": "A2",
        "usage": "Used when the action or the receiver of the action is more important than who performed it.",
        "structure": "Present Simple Passive: Subject + am / is / are + past participle (V3)\nPast Simple Passive: Subject + was / were + past participle (V3)",
        "examples": [
          "English is spoken all over the world.",
          "This castle was built in 1540.",
          "Millions of emails are sent every day."
        ],
        "questions": [
          {
            "question": "Coffee ___ in Brazil and exported worldwide.",
            "options": [
              "grows",
              "is grown",
              "grew",
              "is grow"
            ],
            "correctAnswer": "is grown"
          },
          {
            "question": "The Mona Lisa ___ painted by Leonardo da Vinci.",
            "options": [
              "is",
              "was",
              "were",
              "has"
            ],
            "correctAnswer": "was"
          },
          {
            "question": "Thousands of cars ___ produced in this factory every month.",
            "options": [
              "are",
              "is",
              "were",
              "have"
            ],
            "correctAnswer": "are"
          },
          {
            "question": "My bicycle ___ stolen yesterday evening.",
            "options": [
              "is",
              "was",
              "were",
              "has been"
            ],
            "correctAnswer": "was"
          },
          {
            "question": "Paper ___ made from wood pulp.",
            "options": [
              "is",
              "are",
              "was",
              "were"
            ],
            "correctAnswer": "is"
          }
        ]
      },
      {
        "id": "52",
        "title": "Continuous Passive",
        "level": "B1",
        "usage": "Describes actions that are currently being performed upon the subject right now or at a specific continuous moment in the past.",
        "structure": "Present Continuous Passive: Subject + am / is / are + being + V3\nPast Continuous Passive: Subject + was / were + being + V3",
        "examples": [
          "My car is being repaired at the garage right now.",
          "The house was being painted when we visited.",
          "The bridge is being inspected by engineers."
        ],
        "questions": [
          {
            "question": "Don't enter that room! It is ___ cleaned right now.",
            "options": [
              "being",
              "been",
              "be",
              "is"
            ],
            "correctAnswer": "being"
          },
          {
            "question": "The dinner was ___ cooked when the power went out.",
            "options": [
              "being",
              "been",
              "be",
              "was"
            ],
            "correctAnswer": "being"
          },
          {
            "question": "A new highway is currently ___ constructed near the airport.",
            "options": [
              "be",
              "being",
              "been",
              "build"
            ],
            "correctAnswer": "being"
          },
          {
            "question": "The problem is ___ discussed by the committee at the moment.",
            "options": [
              "being",
              "been",
              "be",
              "was"
            ],
            "correctAnswer": "being"
          },
          {
            "question": "When I walked into the office, the files were ___ shredded.",
            "options": [
              "being",
              "been",
              "be",
              "are"
            ],
            "correctAnswer": "being"
          }
        ]
      },
      {
        "id": "53",
        "title": "Perfect Passive",
        "level": "B1",
        "usage": "Used when a passive action has been completed before the present moment (Present Perfect) or before another past event (Past Perfect).",
        "structure": "Present Perfect Passive: Subject + have / has + been + V3\nPast Perfect Passive: Subject + had + been + V3",
        "examples": [
          "All the tickets have been sold.",
          "The report has been completed by the manager.",
          "The house had been destroyed before the firefighters arrived."
        ],
        "questions": [
          {
            "question": "The new contract has already ___ signed by both parties.",
            "options": [
              "being",
              "been",
              "be",
              "is"
            ],
            "correctAnswer": "been"
          },
          {
            "question": "All the flight tickets had ___ sold out before I checked online.",
            "options": [
              "being",
              "been",
              "be",
              "were"
            ],
            "correctAnswer": "been"
          },
          {
            "question": "Has the mail ___ delivered yet?",
            "options": [
              "being",
              "been",
              "be",
              "was"
            ],
            "correctAnswer": "been"
          },
          {
            "question": "The stolen artwork has recently ___ recovered by police.",
            "options": [
              "being",
              "been",
              "be",
              "was"
            ],
            "correctAnswer": "been"
          },
          {
            "question": "By 10 AM, all the tasks had ___ finished.",
            "options": [
              "being",
              "been",
              "be",
              "were"
            ],
            "correctAnswer": "been"
          }
        ]
      },
      {
        "id": "54",
        "title": "Passive with Modals",
        "level": "B2",
        "usage": "Combines modal verbs (can, must, should, might) with passive structures to express necessity, possibility, or permission regarding a passive subject.",
        "structure": "Present Modal Passive: Subject + modal verb + be + past participle (V3)\nPast Modal Passive: Subject + modal verb + have been + past participle (V3)",
        "examples": [
          "This assignment must be handed in by Friday.",
          "Seatbelts should be worn at all times.",
          "The package might have been sent to the wrong address."
        ],
        "questions": [
          {
            "question": "Mobile phones must ___ turned off during the exam.",
            "options": [
              "be",
              "been",
              "being",
              "to be"
            ],
            "correctAnswer": "be"
          },
          {
            "question": "The lost keys could ___ been dropped anywhere in the park.",
            "options": [
              "be",
              "have",
              "had",
              "having"
            ],
            "correctAnswer": "have"
          },
          {
            "question": "These rules should ___ explained to all new employees.",
            "options": [
              "be",
              "been",
              "being",
              "to be"
            ],
            "correctAnswer": "be"
          },
          {
            "question": "This door can ___ opened with a standard key.",
            "options": [
              "be",
              "been",
              "being",
              "is"
            ],
            "correctAnswer": "be"
          },
          {
            "question": "The letter might have ___ delivered to the wrong house.",
            "options": [
              "be",
              "been",
              "being",
              "was"
            ],
            "correctAnswer": "been"
          }
        ]
      },
      {
        "id": "55",
        "title": "Advanced Passive Structures",
        "level": "C1",
        "usage": "Expresses formal reporting, rumor, belief, or distance (Impersonal Passive) using structures like \"It is said that...\" or \"He is thought to be...\".",
        "structure": "It + is/was + V3 (said/thought/believed) + that + clause  OR\nSubject + is/was + V3 (said/thought/believed) + to + base verb / to have + V3",
        "examples": [
          "It is believed that the company is facing bankruptcy.",
          "He is thought to have left the country under a false passport.",
          "The painting is reported to be worth millions."
        ],
        "questions": [
          {
            "question": "The CEO is reported ___ resigned yesterday morning.",
            "options": [
              "to have",
              "to",
              "having",
              "that he"
            ],
            "correctAnswer": "to have"
          },
          {
            "question": "It is believed ___ the ancient manuscript was written in Egypt.",
            "options": [
              "that",
              "to",
              "which",
              "what"
            ],
            "correctAnswer": "that"
          },
          {
            "question": "The suspect is thought to ___ hiding in the countryside.",
            "options": [
              "be",
              "been",
              "being",
              "have"
            ],
            "correctAnswer": "be"
          },
          {
            "question": "She is considered to ___ the finest violinist of her generation.",
            "options": [
              "be",
              "been",
              "being",
              "is"
            ],
            "correctAnswer": "be"
          },
          {
            "question": "It was alleged that the politician ___ accepted bribes.",
            "options": [
              "had",
              "has",
              "was",
              "having"
            ],
            "correctAnswer": "had"
          }
        ]
      }
    ]
  },
  {
    "name": "CONDITIONALS",
    "topics": [
      {
        "id": "71",
        "title": "Zero Conditional",
        "level": "A2",
        "usage": "Describes general truths, scientific facts, habits, and rules where one event ALWAYS causes another.",
        "structure": "If / When + Simple Present, Simple Present",
        "examples": [
          "If you heat ice, it melts.",
          "If you mix blue and yellow, you get green.",
          "When I eat shellfish, I get allergic."
        ],
        "questions": [
          {
            "question": "If you freeze water, it ___ into ice.",
            "options": [
              "turns",
              "turned",
              "will turn",
              "would turn"
            ],
            "correctAnswer": "turns"
          },
          {
            "question": "When the sun goes down, it ___ dark.",
            "options": [
              "gets",
              "got",
              "will get",
              "would get"
            ],
            "correctAnswer": "gets"
          },
          {
            "question": "If you press this button, the machine ___.",
            "options": [
              "starts",
              "started",
              "will start",
              "would start"
            ],
            "correctAnswer": "starts"
          },
          {
            "question": "Plants die if they ___ get enough sunlight and water.",
            "options": [
              "don't",
              "won't",
              "didn't",
              "wouldn't"
            ],
            "correctAnswer": "don't"
          },
          {
            "question": "If I eat late at night, I ___ sleep well.",
            "options": [
              "don't",
              "won't",
              "didn't",
              "wouldn't"
            ],
            "correctAnswer": "don't"
          }
        ]
      },
      {
        "id": "72",
        "title": "First Conditional",
        "level": "A2",
        "usage": "Describes real and possible future situations and their probable results.",
        "structure": "If + Simple Present, Subject + will + base verb",
        "examples": [
          "If it rains tomorrow, we will stay at home.",
          "You will pass the exam if you study hard.",
          "If she leaves now, she will catch the train."
        ],
        "questions": [
          {
            "question": "If it ___ tomorrow, we will cancel the picnic.",
            "options": [
              "rains",
              "rain",
              "will rain",
              "rained"
            ],
            "correctAnswer": "rains"
          },
          {
            "question": "You will fail the exam if you ___ study.",
            "options": [
              "don't",
              "won't",
              "didn't",
              "aren't"
            ],
            "correctAnswer": "don't"
          },
          {
            "question": "If she arrives early, we ___ go to the restaurant together.",
            "options": [
              "will",
              "would",
              "did",
              "had"
            ],
            "correctAnswer": "will"
          },
          {
            "question": "What will you do if you ___ get the job?",
            "options": [
              "don't",
              "won't",
              "didn't",
              "not"
            ],
            "correctAnswer": "don't"
          },
          {
            "question": "I will call you as soon as I ___ at the hotel.",
            "options": [
              "arrive",
              "will arrive",
              "arrived",
              "am arriving"
            ],
            "correctAnswer": "arrive"
          }
        ]
      },
      {
        "id": "73",
        "title": "Second Conditional",
        "level": "B1",
        "usage": "Describes hypothetical, unreal, or unlikely situations in the present or future, and their imaginary outcomes.",
        "structure": "If + Simple Past, Subject + would + base verb",
        "examples": [
          "If I won the lottery, I would buy an island.",
          "If I were you, I would take the job.",
          "She would travel more if she had more free time."
        ],
        "questions": [
          {
            "question": "If I ___ a million dollars, I would buy a luxury yacht.",
            "options": [
              "had",
              "have",
              "would have",
              "will have"
            ],
            "correctAnswer": "had"
          },
          {
            "question": "If I ___ you, I would apologize immediately.",
            "options": [
              "were",
              "am",
              "was to",
              "have been"
            ],
            "correctAnswer": "were"
          },
          {
            "question": "She ___ buy that dress if it weren't so expensive.",
            "options": [
              "would",
              "will",
              "can",
              "shall"
            ],
            "correctAnswer": "would"
          },
          {
            "question": "What would you do if you ___ a bear in the woods?",
            "options": [
              "saw",
              "see",
              "will see",
              "would see"
            ],
            "correctAnswer": "saw"
          },
          {
            "question": "If he lived closer to the city, he ___ commute by bike.",
            "options": [
              "would",
              "will",
              "can",
              "shall"
            ],
            "correctAnswer": "would"
          }
        ]
      },
      {
        "id": "74",
        "title": "Third Conditional",
        "level": "B2",
        "usage": "Describes imaginary past situations that DID NOT happen, expressing regrets, relief, or past reflection.",
        "structure": "If + Past Perfect (had + V3), Subject + would have + past participle (V3)",
        "examples": [
          "If I had studied harder, I would have passed the exam.",
          "She wouldn't have missed her flight if she had set an alarm.",
          "If we had taken the map, we wouldn't have gotten lost."
        ],
        "questions": [
          {
            "question": "If I had known you were in hospital, I ___ visited you.",
            "options": [
              "would have",
              "would",
              "will have",
              "had"
            ],
            "correctAnswer": "would have"
          },
          {
            "question": "She wouldn't have missed her train if she ___ earlier.",
            "options": [
              "had woken",
              "woke",
              "has woken",
              "would wake"
            ],
            "correctAnswer": "had woken"
          },
          {
            "question": "If we ___ the map, we wouldn't have gotten lost.",
            "options": [
              "had checked",
              "checked",
              "would check",
              "have checked"
            ],
            "correctAnswer": "had checked"
          },
          {
            "question": "I ___ the test if I hadn't studied so hard.",
            "options": [
              "would have failed",
              "failed",
              "would fail",
              "had failed"
            ],
            "correctAnswer": "would have failed"
          },
          {
            "question": "If he had driven more carefully, he ___ had the accident.",
            "options": [
              "wouldn't have",
              "didn't have",
              "wouldn't",
              "hadn't"
            ],
            "correctAnswer": "wouldn't have"
          }
        ]
      },
      {
        "id": "75",
        "title": "Mixed Conditionals",
        "level": "C1",
        "usage": "Connects an imaginary past action to a present outcome (Past cause -> Present result), OR an ongoing present condition to a past outcome (Present state -> Past result).",
        "structure": "Type 1: If + Past Perfect (had + V3), Subject + would + base verb (now)\nType 2: If + Simple Past (were/did), Subject + would have + V3 (past)",
        "examples": [
          "If I had taken that job in Paris, I would be fluent in French now. (Past condition -> Present result)",
          "If she weren't so afraid of flying, she would have traveled with us last week. (Present trait -> Past action)"
        ],
        "questions": [
          {
            "question": "If I had accepted that job offer, I ___ living in Tokyo right now.",
            "options": [
              "would be",
              "would have been",
              "will be",
              "am"
            ],
            "correctAnswer": "would be"
          },
          {
            "question": "If she ___ so stubborn, she would have listened to your advice yesterday.",
            "options": [
              "weren't",
              "hadn't been",
              "isn't",
              "won't be"
            ],
            "correctAnswer": "weren't"
          },
          {
            "question": "I wouldn't feel so exhausted today if I ___ to bed earlier last night.",
            "options": [
              "had gone",
              "went",
              "go",
              "would go"
            ],
            "correctAnswer": "had gone"
          },
          {
            "question": "If he were a better driver, he ___ crashed the car into the tree last week.",
            "options": [
              "wouldn't have",
              "wouldn't",
              "didn't",
              "hadn't"
            ],
            "correctAnswer": "wouldn't have"
          },
          {
            "question": "If we had bought those shares years ago, we ___ rich today.",
            "options": [
              "would be",
              "would have been",
              "will be",
              "are"
            ],
            "correctAnswer": "would be"
          }
        ]
      }
    ]
  },
  {
    "name": "PREPOSITIONS",
    "topics": [
      {
        "id": "91",
        "title": "Prepositions of Time - In, On, At",
        "level": "A1",
        "usage": "AT: specific times, clock times, holidays without \"day\" (at 5 PM, at midnight, at Christmas).\nON: specific days, dates, day parts (on Monday, on May 5th, on Friday morning).\nIN: months, years, seasons, centuries, long periods (in July, in 2022, in summer).",
        "structure": "Preposition + Time phrase",
        "examples": [
          "The train leaves at 8:30 AM.",
          "My birthday is on October 12th.",
          "We go skiing in winter."
        ],
        "questions": [
          {
            "question": "The English class starts ___ 9 o'clock.",
            "options": [
              "at",
              "on",
              "in",
              "to"
            ],
            "correctAnswer": "at"
          },
          {
            "question": "I was born ___ July 15th, 1998.",
            "options": [
              "on",
              "in",
              "at",
              "by"
            ],
            "correctAnswer": "on"
          },
          {
            "question": "We always go on vacation ___ summer.",
            "options": [
              "in",
              "on",
              "at",
              "to"
            ],
            "correctAnswer": "in"
          },
          {
            "question": "What do you usually do ___ Christmas Day?",
            "options": [
              "on",
              "in",
              "at",
              "for"
            ],
            "correctAnswer": "on"
          },
          {
            "question": "The concert took place ___ 2019.",
            "options": [
              "in",
              "on",
              "at",
              "by"
            ],
            "correctAnswer": "in"
          }
        ]
      },
      {
        "id": "92",
        "title": "Prepositions of Place",
        "level": "A1",
        "usage": "Describes where someone or something is located relative to another object.",
        "structure": "Preposition + Noun phrase",
        "examples": [
          "The book is on the table.",
          "She sits next to her best friend.",
          "The keys are inside my bag.",
          "The painting hangs above the fireplace."
        ],
        "questions": [
          {
            "question": "The cat is sleeping ___ the sofa cushion.",
            "options": [
              "on",
              "in",
              "at",
              "between"
            ],
            "correctAnswer": "on"
          },
          {
            "question": "The coffee shop is directly ___ the pharmacy and the bank.",
            "options": [
              "between",
              "among",
              "next",
              "behind"
            ],
            "correctAnswer": "between"
          },
          {
            "question": "He hid the gift ___ the bed where no one could see it.",
            "options": [
              "under",
              "on",
              "over",
              "between"
            ],
            "correctAnswer": "under"
          },
          {
            "question": "There is a large clock hanging ___ the whiteboard.",
            "options": [
              "above",
              "in",
              "at",
              "under"
            ],
            "correctAnswer": "above"
          },
          {
            "question": "Stand ___ front of the camera and smile!",
            "options": [
              "in",
              "on",
              "at",
              "by"
            ],
            "correctAnswer": "in"
          }
        ]
      },
      {
        "id": "93",
        "title": "Prepositions of Movement",
        "level": "A2",
        "usage": "Shows movement from one place to another.",
        "structure": "Verb of movement + Preposition + Destination/Direction",
        "examples": [
          "He walked into the room quietly.",
          "The cat jumped onto the table.",
          "They drove through the long tunnel.",
          "She ran across the street."
        ],
        "questions": [
          {
            "question": "The train went ___ the dark mountain tunnel.",
            "options": [
              "through",
              "across",
              "onto",
              "into of"
            ],
            "correctAnswer": "through"
          },
          {
            "question": "She walked ___ the street to get to the grocery store.",
            "options": [
              "across",
              "into",
              "through",
              "onto"
            ],
            "correctAnswer": "across"
          },
          {
            "question": "The dog ran ___ the garden towards its owner.",
            "options": [
              "along",
              "into",
              "off",
              "onto"
            ],
            "correctAnswer": "along"
          },
          {
            "question": "He jumped ___ the swimming pool with his clothes on.",
            "options": [
              "into",
              "onto",
              "across",
              "through"
            ],
            "correctAnswer": "into"
          },
          {
            "question": "Please step ___ the vehicle carefully.",
            "options": [
              "out of",
              "through",
              "across",
              "along"
            ],
            "correctAnswer": "out of"
          }
        ]
      },
      {
        "id": "94",
        "title": "Dependent Prepositions - Adjectives & Verbs",
        "level": "B1",
        "usage": "Certain verbs and adjectives MUST be followed by specific prepositions.",
        "structure": "Adjective/Verb + specific preposition",
        "examples": [
          "She is interested in modern art. (Adjective + in)",
          "He depends on his parents for support. (Verb + on)",
          "I am terrible at swimming. (Adjective + at)",
          "They succeeded in winning the championship. (Verb + in)"
        ],
        "questions": [
          {
            "question": "She is very good ___ playing chess.",
            "options": [
              "at",
              "in",
              "on",
              "with"
            ],
            "correctAnswer": "at"
          },
          {
            "question": "My parents are so proud ___ my sister's achievements.",
            "options": [
              "of",
              "for",
              "about",
              "with"
            ],
            "correctAnswer": "of"
          },
          {
            "question": "He apologized ___ his late arrival.",
            "options": [
              "for",
              "about",
              "of",
              "to"
            ],
            "correctAnswer": "for"
          },
          {
            "question": "Success depends ___ hard work and perseverance.",
            "options": [
              "on",
              "in",
              "at",
              "with"
            ],
            "correctAnswer": "on"
          },
          {
            "question": "France is famous ___ its wine and cuisine.",
            "options": [
              "for",
              "with",
              "about",
              "of"
            ],
            "correctAnswer": "for"
          }
        ]
      },
      {
        "id": "95",
        "title": "Advanced Prepositional Phrases",
        "level": "B2",
        "usage": "Fixed multi-word prepositional combinations used in academic and professional English.",
        "structure": "Preposition + Noun/Phrase (+ Preposition)",
        "examples": [
          "In spite of the rain, the match continued.",
          "The event was canceled due to unforeseen circumstances.",
          "On behalf of the company, I welcome you.",
          "By means of modern technology, we can communicate instantly."
        ],
        "questions": [
          {
            "question": "___ spite of the bad weather, we went hiking.",
            "options": [
              "In",
              "On",
              "At",
              "By"
            ],
            "correctAnswer": "In"
          },
          {
            "question": "The flight was delayed ___ to heavy fog.",
            "options": [
              "due",
              "because",
              "owing",
              "thanks"
            ],
            "correctAnswer": "due"
          },
          {
            "question": "On ___ of the entire team, I would like to thank you.",
            "options": [
              "behalf",
              "account",
              "regard",
              "terms"
            ],
            "correctAnswer": "behalf"
          },
          {
            "question": "In ___ of performance, this computer is the best on the market.",
            "options": [
              "terms",
              "regard",
              "view",
              "place"
            ],
            "correctAnswer": "terms"
          },
          {
            "question": "With ___ to your email, I am writing to confirm our meeting.",
            "options": [
              "regard",
              "relation",
              "respect",
              "account"
            ],
            "correctAnswer": "regard"
          }
        ]
      }
    ]
  },
  {
    "name": "ARTICLES",
    "topics": [
      {
        "id": "111",
        "title": "A & An - Indefinite Articles",
        "level": "A1",
        "usage": "Use A before singular countable nouns starting with a consonant SOUND. Use AN before singular countable nouns starting with a vowel SOUND (a, e, i, o, u).",
        "structure": "A + consonant sound noun | AN + vowel sound noun",
        "examples": [
          "I saw a dog in the park.",
          "She bought an apple for lunch.",
          "He is an honest man. (silent 'h' sound = vowel sound)",
          "She goes to a university. ('u' sound = consonant 'y' sound)"
        ],
        "questions": [
          {
            "question": "I bought ___ new smartphone yesterday.",
            "options": [
              "a",
              "an",
              "the",
              "(no article)"
            ],
            "correctAnswer": "a"
          },
          {
            "question": "She ate ___ orange for breakfast.",
            "options": [
              "an",
              "a",
              "the",
              "(no article)"
            ],
            "correctAnswer": "an"
          },
          {
            "question": "He has been waiting for ___ hour.",
            "options": [
              "an",
              "a",
              "the",
              "(no article)"
            ],
            "correctAnswer": "an"
          },
          {
            "question": "My brother wants to study at ___ university in European Union.",
            "options": [
              "a",
              "an",
              "the",
              "(no article)"
            ],
            "correctAnswer": "a"
          },
          {
            "question": "Is there ___ bank near here?",
            "options": [
              "a",
              "an",
              "the",
              "(no article)"
            ],
            "correctAnswer": "a"
          }
        ]
      },
      {
        "id": "112",
        "title": "The - Definite Article",
        "level": "A1",
        "usage": "Use THE when referring to a specific person, place, or thing that both the speaker and listener already know about, or when there is only one in existence.",
        "structure": "THE + noun (singular, plural, or uncountable)",
        "examples": [
          "Close the door, please. (the specific door)",
          "The sun rises in the east. (unique object)",
          "This is the best movie I have ever seen. (superlatives)"
        ],
        "questions": [
          {
            "question": "Look at ___ moon tonight! It is so bright.",
            "options": [
              "the",
              "a",
              "an",
              "(no article)"
            ],
            "correctAnswer": "the"
          },
          {
            "question": "Can you pass me ___ salt, please?",
            "options": [
              "the",
              "a",
              "an",
              "(no article)"
            ],
            "correctAnswer": "the"
          },
          {
            "question": "He is ___ tallest student in our class.",
            "options": [
              "the",
              "a",
              "an",
              "(no article)"
            ],
            "correctAnswer": "the"
          },
          {
            "question": "I bought a shirt and a jacket. ___ shirt is blue.",
            "options": [
              "The",
              "A",
              "An",
              "(no article)"
            ],
            "correctAnswer": "The"
          },
          {
            "question": "She lives near ___ Pacific Ocean.",
            "options": [
              "the",
              "a",
              "an",
              "(no article)"
            ],
            "correctAnswer": "the"
          }
        ]
      },
      {
        "id": "113",
        "title": "Zero Article - No Article",
        "level": "A2",
        "usage": "Do NOT use articles when speaking in general about plural nouns, uncountable nouns, proper names, languages, sports, meals, or countries (unless plural/kingdom).",
        "structure": "(No Article) + plural noun / uncountable noun / proper name",
        "examples": [
          "I love music and art. (Uncountable / general)",
          "Dogs are loyal animals. (Plural general)",
          "She speaks fluent French. (Languages)",
          "We play tennis on Saturdays. (Sports)"
        ],
        "questions": [
          {
            "question": "___ water is essential for human life.",
            "options": [
              "(no article)",
              "The",
              "A",
              "An"
            ],
            "correctAnswer": "(no article)"
          },
          {
            "question": "I love playing ___ basketball after school.",
            "options": [
              "(no article)",
              "the",
              "a",
              "an"
            ],
            "correctAnswer": "(no article)"
          },
          {
            "question": "She is learning to speak ___ Japanese.",
            "options": [
              "(no article)",
              "the",
              "a",
              "an"
            ],
            "correctAnswer": "(no article)"
          },
          {
            "question": "___ elephants are the largest land mammals.",
            "options": [
              "(no article)",
              "The",
              "A",
              "An"
            ],
            "correctAnswer": "(no article)"
          },
          {
            "question": "What time do you usually eat ___ breakfast?",
            "options": [
              "(no article)",
              "the",
              "a",
              "an"
            ],
            "correctAnswer": "(no article)"
          }
        ]
      },
      {
        "id": "114",
        "title": "Advanced Article Usage & Exceptions",
        "level": "B2",
        "usage": "Covers complex exceptions: geographical names (mountain ranges vs individual peaks, rivers vs lakes), institutions (go to hospital vs go to THE hospital), and abstract concepts.",
        "structure": "The + mountain ranges/seas/rivers/plural countries\nNo article + individual peaks/lakes/continents/streets",
        "examples": [
          "The Himalayas vs Mount Everest",
          "The Nile vs Lake Victoria",
          "He went to prison. (as a prisoner) vs He went to the prison. (as a visitor)"
        ],
        "questions": [
          {
            "question": "My uncle works at ___ Mount Everest base camp.",
            "options": [
              "(no article)",
              "the",
              "a",
              "an"
            ],
            "correctAnswer": "(no article)"
          },
          {
            "question": "The ship sailed across ___ Atlantic Ocean.",
            "options": [
              "the",
              "(no article)",
              "a",
              "an"
            ],
            "correctAnswer": "the"
          },
          {
            "question": "He was sent to ___ prison for five years after the trial.",
            "options": [
              "(no article)",
              "the",
              "a",
              "an"
            ],
            "correctAnswer": "(no article)"
          },
          {
            "question": "She visited ___ Netherlands last summer.",
            "options": [
              "the",
              "(no article)",
              "a",
              "an"
            ],
            "correctAnswer": "the"
          },
          {
            "question": "They went on a cruise along ___ Amazon River.",
            "options": [
              "the",
              "(no article)",
              "a",
              "an"
            ],
            "correctAnswer": "the"
          }
        ]
      }
    ]
  },
  {
    "name": "PHRASAL VERBS",
    "topics": [
      {
        "id": "131",
        "title": "Everyday Phrasal Verbs",
        "level": "A2",
        "usage": "Phrasal verbs combine a verb with a particle (preposition/adverb) to create a completely new meaning. Common daily actions use phrasal verbs.",
        "structure": "Verb + Preposition/Adverb",
        "examples": [
          "Wake up! (Stop sleeping)",
          "Turn on the light. (Start power)",
          "Give up smoking. (Stop habit)",
          "Look for my keys. (Search)"
        ],
        "questions": [
          {
            "question": "I usually ___ up at 7 AM every morning.",
            "options": [
              "wake",
              "turn",
              "get",
              "look"
            ],
            "correctAnswer": "wake"
          },
          {
            "question": "Don't forget to ___ off the TV before you go to bed.",
            "options": [
              "turn",
              "give",
              "wake",
              "look"
            ],
            "correctAnswer": "turn"
          },
          {
            "question": "She is looking ___ her lost cat in the neighborhood.",
            "options": [
              "for",
              "at",
              "after",
              "on"
            ],
            "correctAnswer": "for"
          },
          {
            "question": "Never ___ up on your dreams! Keep trying.",
            "options": [
              "give",
              "take",
              "put",
              "break"
            ],
            "correctAnswer": "give"
          },
          {
            "question": "Please ___ up your toys off the floor.",
            "options": [
              "pick",
              "turn",
              "look",
              "give"
            ],
            "correctAnswer": "pick"
          }
        ]
      },
      {
        "id": "132",
        "title": "Separable & Inseparable Phrasal Verbs",
        "level": "B1",
        "usage": "Separable phrasal verbs allow the object to be placed between the verb and particle. If the object is a pronoun (it/them), it MUST go in the middle. Inseparable verbs keep the particle right after the verb.",
        "structure": "Separable: Turn [the TV] off  OR  Turn off [the TV]  ->  Turn [it] off\nInseparable: Look after [the children] -> Look after [them]",
        "examples": [
          "Put on your jacket -> Put your jacket on -> Put it on",
          "I ran into my teacher yesterday. (Inseparable)"
        ],
        "questions": [
          {
            "question": "Here is your jacket. Put ___!",
            "options": [
              "it on",
              "on it",
              "it off",
              "off it"
            ],
            "correctAnswer": "it on"
          },
          {
            "question": "Could you look ___ my dog while I'm on holiday?",
            "options": [
              "after",
              "for",
              "into",
              "over"
            ],
            "correctAnswer": "after"
          },
          {
            "question": "I need to look ___ this new word in the dictionary.",
            "options": [
              "up",
              "out",
              "for",
              "on"
            ],
            "correctAnswer": "up"
          },
          {
            "question": "Turn the music ___! It's way too loud.",
            "options": [
              "down",
              "up",
              "off to",
              "over"
            ],
            "correctAnswer": "down"
          },
          {
            "question": "He ran ___ an old friend at the shopping mall yesterday.",
            "options": [
              "into",
              "over",
              "through",
              "across of"
            ],
            "correctAnswer": "into"
          }
        ]
      },
      {
        "id": "133",
        "title": "Travel & Work Phrasal Verbs",
        "level": "B1",
        "usage": "Specific phrasal verbs used in professional work contexts and travel/transportation.",
        "structure": "Verb + particle (work & travel context)",
        "examples": [
          "The plane took off on time. (Leave ground)",
          "Check in at the reception desk. (Register)",
          "Fill in this application form. (Complete document)",
          "Call off the meeting. (Cancel)"
        ],
        "questions": [
          {
            "question": "What time does the flight take ___?",
            "options": [
              "off",
              "on",
              "up",
              "out"
            ],
            "correctAnswer": "off"
          },
          {
            "question": "Please ___ in this form with your name and address.",
            "options": [
              "fill",
              "take",
              "check",
              "call"
            ],
            "correctAnswer": "fill"
          },
          {
            "question": "Due to bad weather, they decided to call ___ the concert.",
            "options": [
              "off",
              "away",
              "down",
              "out"
            ],
            "correctAnswer": "off"
          },
          {
            "question": "Passengers must check ___ two hours before departure.",
            "options": [
              "in",
              "on",
              "up",
              "off"
            ],
            "correctAnswer": "in"
          },
          {
            "question": "We need to set ___ early tomorrow morning to beat the traffic.",
            "options": [
              "off",
              "out of",
              "up",
              "away"
            ],
            "correctAnswer": "off"
          }
        ]
      },
      {
        "id": "134",
        "title": "Three-Part Phrasal Verbs",
        "level": "B2",
        "usage": "Phrasal verbs that consist of a verb + two particles/prepositions. These are ALWAYS inseparable.",
        "structure": "Verb + particle 1 + particle 2 + object",
        "examples": [
          "I'm looking forward to meeting you.",
          "I can't put up with this noise anymore.",
          "He came up with a brilliant idea.",
          "She ran out of coffee this morning."
        ],
        "questions": [
          {
            "question": "I am really looking forward ___ meeting your family.",
            "options": [
              "to",
              "for",
              "at",
              "on"
            ],
            "correctAnswer": "to"
          },
          {
            "question": "We have completely run out ___ milk; I'll buy some more.",
            "options": [
              "of",
              "with",
              "off",
              "from"
            ],
            "correctAnswer": "of"
          },
          {
            "question": "I cannot put up ___ your rude behavior any longer!",
            "options": [
              "with",
              "to",
              "for",
              "about"
            ],
            "correctAnswer": "with"
          },
          {
            "question": "She came up ___ a creative solution to the problem.",
            "options": [
              "with",
              "to",
              "on",
              "about"
            ],
            "correctAnswer": "with"
          },
          {
            "question": "Do you get along ___ your neighbors?",
            "options": [
              "with",
              "to",
              "for",
              "on"
            ],
            "correctAnswer": "with"
          }
        ]
      },
      {
        "id": "135",
        "title": "Advanced Idiomatic Phrasal Verbs",
        "level": "C1",
        "usage": "High-level idiomatic phrasal verbs used in formal writing, advanced conversation, and literature.",
        "structure": "Verb + particle (advanced idiomatic meaning)",
        "examples": [
          "The company was taken over by a international conglomerate. (Aquire)",
          "He tried to brush up on his French before visiting Paris. (Refurbish knowledge)",
          "The rain finally tapered off in the evening. (Gradually decrease)",
          "Her enthusiasm rubbed off on everyone in the room. (Influence)"
        ],
        "questions": [
          {
            "question": "I need to brush ___ on my Spanish before my trip to Madrid.",
            "options": [
              "up",
              "off",
              "down",
              "away"
            ],
            "correctAnswer": "up"
          },
          {
            "question": "A foreign firm has offered to take ___ the struggling business.",
            "options": [
              "over",
              "up",
              "off",
              "in"
            ],
            "correctAnswer": "over"
          },
          {
            "question": "Her optimistic attitude quickly rubbed ___ on her teammates.",
            "options": [
              "off",
              "on",
              "down",
              "through"
            ],
            "correctAnswer": "off"
          },
          {
            "question": "The manager tried to gloss ___ the serious accounting errors.",
            "options": [
              "over",
              "under",
              "off",
              "away"
            ],
            "correctAnswer": "over"
          },
          {
            "question": "The heavy storm began to taper ___ towards midnight.",
            "options": [
              "off",
              "down",
              "away",
              "out"
            ],
            "correctAnswer": "off"
          }
        ]
      }
    ]
  }
];
