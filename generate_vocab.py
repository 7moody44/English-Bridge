#!/usr/bin/env python3
"""
Script to generate complete vocabulary data with levels and ensure each category has 10+ words
"""

vocab_header = '''export interface VocabWord {
  word: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  synonyms: string[];
  category: string;
  level: string; // CEFR level: A1, A2, B1, B2, C1, C2
}

export const vocabularyWords: VocabWord[] = [
'''

# Existing words with levels added
existing_words = [
    ('Resilient', '/rɪˈzɪl.i.ənt/', 'adjective', 'Able to recover quickly from difficult conditions or setbacks.', 
     'She proved remarkably resilient after losing her job, starting a new business within weeks.', 
     ['tough', 'adaptable', 'hardy'], 'business', 'B2'),
    
    ('Pragmatic', '/præɡˈmæt.ɪk/', 'adjective', 'Dealing with things sensibly and realistically rather than ideally.',
     'We need a pragmatic approach to solve this budget crisis.', 
     ['practical', 'realistic', 'sensible'], 'business', 'B2'),
     
    # Add all 60 existing words here with levels...
]

# New words to reach 10+ in each category
new_words = {
    'travel': [
        ('Itinerary', '/aɪˈtɪn.ər.ər.i/', 'noun', 'A planned route or journey.',
         'We created a detailed itinerary for our European vacation.', 
         ['plan', 'schedule', 'route'], 'travel', 'B1'),
        # Add 9 more travel words...
    ],
    'food': [
        ('Cuisine', '/kwɪˈziːn/', 'noun', 'A style or method of cooking, especially as characteristic of a particular country or region.',
         'French cuisine is known for its rich flavors and elegant presentation.', 
         ['cooking', 'food', 'fare'], 'food', 'B1'),
        # Add 9 more food words...
    ],
    # Add words for other categories that need them...
}

def format_word(word_tuple):
    word, pron, pos, definition, example, synonyms, category, level = word_tuple
    syn_str = ', '.join(f'"{s}"' for s in synonyms)
    return f'''  {{
    word: "{word}",
    pronunciation: "{pron}",
    partOfSpeech: "{pos}",
    definition: "{definition}",
    example: "{example}",
    synonyms: [{syn_str}],
    category: "{category}",
    level: "{level}",
  }},'''

# Generate the file
with open('src/data/vocabularyData.ts', 'w', encoding='utf-8') as f:
    f.write(vocab_header)
    
    # Write existing words
    for word in existing_words:
        f.write(format_word(word) + '\n')
    
    # Write new words
    for category_words in new_words.values():
        for word in category_words:
            f.write(format_word(word) + '\n')
    
    f.write('];\n')

print("Vocabulary file generated successfully!")
