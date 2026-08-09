import re
from pathlib import Path
import json

def parse_grammar_course():
    root = Path(r"e:\CODING\englishwebsite\EnglishBridge")
    in_file = root / "English_Grammar_Complete_Course.txt"
    out_file = root / "src" / "data" / "grammarCourseData.ts"
    
    text = in_file.read_text(encoding='utf-8')
    
    categories = []
    
    # Split text into categories
    # Finding lines like "################################################################################"
    # "CATEGORY X: NAME"
    
    cat_blocks = re.split(r'################################################################################\nCATEGORY \d+:\s*(.*?)\n################################################################################', text)
    
    # cat_blocks[0] is table of contents and intro text
    # cat_blocks[1] is Category Name
    # cat_blocks[2] is the content for that category
    # ... and so on
    
    for i in range(1, len(cat_blocks), 2):
        cat_name = cat_blocks[i].strip()
        cat_content = cat_blocks[i+1]
        
        # Now split cat_content into lessons
        lesson_pattern = r'================================================================================\nLESSON \d+:\s*(.*?)\s*\[Level:\s*(.*?)\]\n================================================================================'
        lesson_splits = re.split(lesson_pattern, cat_content)
        
        lessons = []
        for j in range(1, len(lesson_splits), 3):
            lesson_title = lesson_splits[j].strip()
            lesson_level = lesson_splits[j+1].strip()
            lesson_body = lesson_splits[j+2]
            
            # Extract section: WHEN DO WE USE IT?
            usage_match = re.search(r'WHEN DO WE USE IT\?\n(.*?)\n\nSTRUCTURE:', lesson_body, re.DOTALL)
            usage = usage_match.group(1).strip() if usage_match else ""
            
            # Extract structure
            struct_match = re.search(r'STRUCTURE:\n(.*?)\n\nEXAMPLES:', lesson_body, re.DOTALL)
            structure = struct_match.group(1).strip() if struct_match else ""
            
            # Extract EXAMPLES
            ex_match = re.search(r'EXAMPLES:\n(.*?)\n\nKEY SIGNAL WORDS:', lesson_body, re.DOTALL)
            examples_raw = ex_match.group(1).strip() if ex_match else ""
            examples = [e.replace('* ', '').strip().replace('"', '') for e in examples_raw.split('\n') if e.strip() and e.strip().startswith('*')]
            
            # Extract questions
            q_match = re.search(r'PRACTICE QUESTIONS:\n\n(.*)', lesson_body, re.DOTALL)
            q_text = q_match.group(1).strip() if q_match else ""
            
            questions = []
            q_blocks = re.split(r'\n\n(?=\d+\.)', q_text)
            
            for qb in q_blocks:
                qb = qb.strip()
                if not qb: continue
                lines = qb.split('\n')
                question_text = re.sub(r'^\d+\.\s*', '', lines[0]).strip()
                opts = []
                correct = None
                for line in lines[1:]:
                    line = line.strip()
                    if not line: continue
                    opt_match = re.match(r'^[A-Z]\)\s*(.*)', line)
                    if opt_match:
                        opt_val = opt_match.group(1).strip()
                        if '[CORRECT]' in opt_val:
                            opt_val = opt_val.replace('[CORRECT]', '').strip()
                            correct = opt_val
                        opts.append(opt_val)
                
                questions.append({
                    "question": question_text,
                    "options": opts,
                    "correctAnswer": correct
                })
                
            lessons.append({
                "id": str(len(lessons) + 1 + (i*10)), 
                "title": lesson_title,
                "level": lesson_level,
                "usage": usage,
                "structure": structure,
                "examples": examples,
                "questions": questions
            })
            
        categories.append({
            "name": cat_name,
            "topics": lessons
        })
    
    ts_content = f"""// AUTO-GENERATED from English_Grammar_Complete_Course.txt

export interface Question {{
  question: string;
  options: string[];
  correctAnswer: string;
}}

export interface GrammarTopic {{
  id: string;
  title: string;
  level: string;
  usage: string;
  structure: string;
  examples: string[];
  questions: Question[];
}}

export interface GrammarCategory {{
  name: string;
  topics: GrammarTopic[];
}}

export const grammarCourse: GrammarCategory[] = {json.dumps(categories, indent=2)};
"""
    out_file.write_text(ts_content, encoding='utf-8')
    print(f"Parsed {len(categories)} categories and {sum(len(c['topics']) for c in categories)} lessons.")

if __name__ == "__main__":
    parse_grammar_course()
