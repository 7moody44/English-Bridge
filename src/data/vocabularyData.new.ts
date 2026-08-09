export interface VocabWord {
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
  // BUSINESS WORDS (14 total)
  {
    word: "Resilient",
    pronunciation: "/rɪˈzɪl.i.ənt/",
    partOfSpeech: "adjective",
    definition: "Able to recover quickly from difficult conditions or setbacks.",
    example: "She proved remarkably resilient after losing her job, starting a new business within weeks.",
    synonyms: ["tough", "adaptable", "hardy"],
    category: "business",
    level: "B2",
  },
  {
    word: "Pragmatic",
    pronunciation: "/præɡˈmæt.ɪk/",
    partOfSpeech: "adjective",
    definition: "Dealing with things sensibly and realistically rather than ideally.",
    example: "We need a pragmatic approach to solve this budget crisis.",
    synonyms: ["practical", "realistic", "sensible"],
    category: "business",
    level: "B2",
  },
  {
    word: "Endeavour",
    pronunciation: "/ɪnˈdev.ər/",
    partOfSpeech: "noun / verb",
    definition: "An attempt to achieve a goal; to try hard to do or achieve something.",
    example: "Space exploration is humanity's greatest endeavour.",
    synonyms: ["effort", "attempt", "undertaking"],
    category: "business",
    level: "B1",
  },
  {
    word: "Scrutinize",
    pronunciation: "/ˈskruː.tɪ.naɪz/",
    partOfSpeech: "verb",
    definition: "To examine or inspect closely and thoroughly.",
    example: "Auditors will scrutinize every financial transaction.",
    synonyms: ["examine", "inspect", "analyse"],
    category: "business",
    level: "C1",
  },
  {
    word: "Consensus",
    pronunciation: "/kənˈsen.səs/",
    partOfSpeech: "noun",
