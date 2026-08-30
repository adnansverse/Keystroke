import React, { useState } from 'react';
import { X, FileText } from 'lucide-react';

interface CustomTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartCustom: (text: string, title: string) => void;
}

export const CustomTextModal: React.FC<CustomTextModalProps> = ({
  isOpen,
  onClose,
  onStartCustom
}) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('Custom Drill');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onStartCustom(text.trim(), title.trim() || 'Custom Drill');
    onClose();
  };

  const sampleSnippets = [
    { title: 'Philosophy of Speed', snippet: 'Speed without direction is just organized chaos. Accuracy forms the solid ground upon which speed naturally accelerates.' },
    { title: 'React Hook Snippet', snippet: 'const [count, setCount] = useState(0);\nuseEffect(() => {\n  document.title = `Count: ${count}`;\n}, [count]);' },
    { title: 'Markdown Syntax', snippet: '# Markdown Heading\n\n- Bullet point alpha\n- Bullet point beta\n\n`const x = 42;`' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="panel bg-[var(--bg-elev)] border border-[var(--panel-border)] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--panel-border)]">
          <div className="flex items-center gap-2">
            <FileText className="text-[var(--accent)]" size={20} />
            <h2 className="text-lg font-bold text-[var(--text)] display-font">Custom Text Practice</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-dim)] hover:bg-[var(--panel)] hover:text-[var(--text)] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider font-mono mb-1.5">
              Title / Source
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Notes, Article Excerpt, Code Snippet"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-dim)] uppercase tracking-wider font-mono mb-1.5">
              Practice Text
            </label>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type any custom text you want to practice..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--panel)] border border-[var(--panel-border)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-mono resize-none leading-relaxed"
              required
            />
          </div>

          <div>
            <div className="text-xs text-[var(--text-dim)] font-mono mb-1.5">Quick Presets:</div>
            <div className="flex flex-wrap gap-2">
              {sampleSnippets.map((s, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setTitle(s.title);
                    setText(s.snippet);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[var(--panel)] hover:bg-[var(--panel-2)] border border-[var(--panel-border)] text-xs text-[var(--text-dim)] hover:text-[var(--text)] font-mono cursor-pointer"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--panel-border)]">
            <button
              type="button"
              onClick={onClose}
              className="keycap ghost px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="keycap primary px-5 py-2 text-xs font-semibold"
            >
              Start Practice →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
