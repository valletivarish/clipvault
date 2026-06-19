'use client';

import { useState } from 'react';

export default function MarkdownEditor() {
  const [markdown, setMarkdown] = useState<string>(
    `# Welcome to Markdown Editor
## Try editing this text

This is a **bold** example and this is *italic* text.

You can also use \`inline code\` and [links](https://example.com).

- List item 1
- List item 2
- List item 3`
  );

  const renderMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split('\n');
    const result: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const level = Math.min(headingMatch[1].length, 6);
        const sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm', 'text-xs'];
        result.push(
          <div key={i} className={`${sizes[level - 1]} font-bold text-[#FAFAFA] mb-2`}>
            {renderInlineMarkdown(headingMatch[2])}
          </div>
        );
        i++;
        continue;
      }

      // Lists
      if (line.startsWith('- ')) {
        const listItems = [];
        while (i < lines.length && lines[i].startsWith('- ')) {
          listItems.push(
            <li key={i} className="text-[#A1A1AA]">
              {renderInlineMarkdown(lines[i].substring(2))}
            </li>
          );
          i++;
        }
        result.push(
          <ul key={`list-${result.length}`} className="list-disc list-inside mb-3 ml-2 space-y-1">
            {listItems}
          </ul>
        );
        continue;
      }

      // Empty lines
      if (line.trim() === '') {
        result.push(<div key={i} className="mb-2" />);
        i++;
        continue;
      }

      // Regular paragraphs
      result.push(
        <p key={i} className="text-[#A1A1AA] text-sm leading-relaxed mb-3">
          {renderInlineMarkdown(line)}
        </p>
      );
      i++;
    }

    return result;
  };

  const renderInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Pattern for bold, italic, code, and links
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const content = match[0];

      // Bold
      if (content.startsWith('**') && content.endsWith('**')) {
        parts.push(
          <strong key={`bold-${match.index}`} className="text-[#FAFAFA] font-semibold">
            {content.substring(2, content.length - 2)}
          </strong>
        );
      }
      // Italic
      else if (content.startsWith('*') && content.endsWith('*')) {
        parts.push(
          <em key={`italic-${match.index}`} className="text-[#FAFAFA] italic">
            {content.substring(1, content.length - 1)}
          </em>
        );
      }
      // Code
      else if (content.startsWith('`') && content.endsWith('`')) {
        parts.push(
          <code key={`code-${match.index}`} className="font-mono text-[#F97316] bg-[#222228] px-1 py-[2px] rounded text-[11px]">
            {content.substring(1, content.length - 1)}
          </code>
        );
      }
      // Links
      else if (content.includes('](')) {
        const linkMatch = content.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          parts.push(
            <a
              key={`link-${match.index}`}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F97316] underline hover:text-[#F97316]/80 transition-colors"
            >
              {linkMatch[1]}
            </a>
          );
        }
      }

      lastIndex = match.index + content.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-screen max-h-[600px]">
        {/* Markdown Input */}
        <div className="space-y-3 flex flex-col">
          <h3 className="text-sm font-semibold text-[#FAFAFA]">Markdown Input</h3>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="flex-1 text-sm font-mono bg-[#18181C] border border-white/10 rounded-lg p-3 text-[#FAFAFA] placeholder-[#52525B] focus:outline-none focus:border-[#F97316] resize-none"
            placeholder="Enter markdown here..."
          />
        </div>

        {/* HTML Preview */}
        <div className="space-y-3 flex flex-col">
          <h3 className="text-sm font-semibold text-[#FAFAFA]">Preview</h3>
          <div className="flex-1 bg-[#18181C] border border-white/10 rounded-lg p-4 overflow-y-auto prose-custom">
            {renderMarkdown(markdown)}
          </div>
        </div>
      </div>
    </div>
  );
}
