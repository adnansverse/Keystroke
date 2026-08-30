import { PracticeMode } from '../types';

export const PRACTICE_MODES: PracticeMode[] = [
  { id: 'quick30', title: '30s Speed Sprint', desc: 'Short explosive typing burst to test maximum WPM limits.', category: 'speed' },
  { id: 'quick60', title: '60s Standard Test', desc: 'The benchmark standard 1-minute typing test.', category: 'speed' },
  { id: 'weakDrill', title: 'Weak Key Target Drill', desc: 'Custom generated text prioritizing your most error-prone keys.', category: 'special' },
  { id: 'codeJS', title: 'JavaScript Snippets', desc: 'Practice syntax brackets, functions, arrow statements, and loops.', category: 'code' },
  { id: 'codePy', title: 'Python Code', desc: 'Practice indents, lists, dictionary keys, and snake_case formatting.', category: 'code' },
  { id: 'codeHTML', title: 'HTML & CSS Tags', desc: 'Master angle brackets, class names, styles, and web elements.', category: 'code' },
  { id: 'quotes', title: 'Famous Quotes', desc: 'Inspiring quotes from literature, science, and philosophy.', category: 'prose' },
  { id: 'blind', title: 'Blind Typing Test', desc: 'Text is blurred while typing — forces 100% muscle memory confidence.', category: 'special' },
  { id: 'custom', title: 'Custom Text Input', desc: 'Paste your own text snippet or article to practice.', category: 'special' }
];

export const SAMPLE_QUOTES = [
  "Do or do not. There is no try.",
  "Simplicity is prerequisite for reliability.",
  "First, solve the problem. Then, write the code.",
  "The secret of getting ahead is getting started.",
  "Knowledge is power, but rhythm and consistency are key.",
  "Premature optimization is the root of all evil.",
  "Make it work, make it right, make it fast.",
  "Clean code always looks like it was written by someone who cares."
];

export const JS_SNIPPETS = [
  "const calculateWPM = (chars, timeSec) => Math.round((chars / 5) / (timeSec / 60));",
  "const filtered = items.filter(item => item.score > 90).map(x => x.name);",
  "async function fetchData(url) { const res = await fetch(url); return res.json(); }",
  "useEffect(() => { const handler = (e) => onKey(e.key); window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, []);"
];

export const PYTHON_SNIPPETS = [
  "def process_keystrokes(keys, accuracy):\n    if accuracy >= 95:\n        return 'Mastery'\n    return 'Practice'",
  "numbers = [x * 2 for x in range(10) if x % 2 == 0]\ntotal_sum = sum(numbers)",
  "class Typist:\n    def __init__(self, name, wpm=0):\n        self.name = name\n        self.wpm = wpm"
];

export const HTML_SNIPPETS = [
  '<div class="typing-academy" data-theme="dark"><h1 id="title">Keystroke</h1></div>',
  '<button class="keycap primary" onClick={() => start()}>Start Session</button>',
  '<section className="grid grid-cols-2 gap-4"><div className="panel">Active</div></section>'
];

export function generateWeakKeyText(weakKeys: string[]): string {
  if (!weakKeys.length) {
    return "Focus on keeping steady rhythm across all home row and top row keys.";
  }
  const cleanKeys = weakKeys.map(k => k.trim()).filter(Boolean);
  if (!cleanKeys.length) {
    return "Focus on keeping steady rhythm across all home row and top row keys.";
  }
  
  // Create targeted words featuring weak keys heavily
  const words: string[] = [];
  cleanKeys.forEach(k => {
    const lk = k.toLowerCase();
    words.push(`${lk}${lk}`, `${lk}a${lk}`, `the${lk}`, `${lk}or${lk}`, `in${lk}t`, `ex${lk}a`, `${lk}ing`);
  });
  
  return `Target drill for keys (${cleanKeys.join(', ')}): ` + words.slice(0, 14).join(' ') + ' ' + cleanKeys.join(' ').toLowerCase();
}
