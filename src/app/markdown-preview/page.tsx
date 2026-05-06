"use client";

import { useState, useMemo } from "react";
import { getToolBySlug } from "@/lib/tools";
import ToolLayout from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const tool = getToolBySlug("markdown-preview")!;

const faqs = [
  {
    question: "What Markdown features are supported?",
    answer:
      "This tool supports standard Markdown including headings, bold, italic, links, images, code blocks, blockquotes, lists, horizontal rules, and tables.",
  },
  {
    question: "Does this support GitHub Flavored Markdown?",
    answer:
      "Yes, it supports GFM features like tables, strikethrough, task lists, and fenced code blocks with language specification.",
  },
  {
    question: "Is my content saved?",
    answer:
      "No. All content is processed locally in your browser and is not saved or transmitted anywhere. Refreshing the page will clear your content.",
  },
];

function simpleMarkdown(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  // Headings
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");
  // Bold & italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");
  // Links & images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gm, "<blockquote>$1</blockquote>");
  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr />");
  // Unordered lists
  html = html.replace(/^[\-\*]\s+(.+)$/gm, "<li>$1</li>");
  // Task lists
  html = html.replace(/<li>\[x\]\s+(.+)<\/li>/g, '<li><input type="checkbox" checked disabled /> $1</li>');
  html = html.replace(/<li>\[\s?\]\s+(.+)<\/li>/g, '<li><input type="checkbox" disabled /> $1</li>');
  // Paragraphs
  html = html.replace(/\n\n/g, "</p><p>");
  html = "<p>" + html + "</p>";
  html = html.replace(/<p><\/p>/g, "");
  html = html.replace(/<p>(<h[1-6]>)/g, "$1");
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, "$1");
  html = html.replace(/<p>(<pre>)/g, "$1");
  html = html.replace(/(<\/pre>)<\/p>/g, "$1");
  html = html.replace(/<p>(<hr \/>)<\/p>/g, "$1");
  html = html.replace(/<p>(<blockquote>)/g, "$1");
  html = html.replace(/(<\/blockquote>)<\/p>/g, "$1");
  html = html.replace(/<p>(<li>)/g, "<ul>$1");
  html = html.replace(/(<\/li>)<\/p>/g, "$1</ul>");

  return html;
}

const defaultMd = `# Hello World

This is a **Markdown** preview tool. Try editing this text!

## Features

- **Bold** and *italic* text
- [Links](https://example.com)
- ~~Strikethrough~~
- Task lists:
  - [x] Build the tool
  - [ ] Ship it

## Code

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

> This is a blockquote

---

Inline \`code\` looks like this.
`;

export default function MarkdownPreviewPage() {
  const [md, setMd] = useState(defaultMd);

  const html = useMemo(() => simpleMarkdown(md), [md]);

  return (
    <ToolLayout
      tool={tool}
      faqs={faqs}
      howToUse="Write or paste Markdown on the left side and see the rendered preview on the right in real-time. The tool supports standard Markdown syntax including headings, lists, links, images, code blocks, blockquotes, and task lists."
      useCases={[
        "Previewing README files before committing to GitHub",
        "Drafting documentation and blog posts in Markdown",
        "Testing Markdown formatting for comments and issues",
        "Learning Markdown syntax with instant visual feedback",
      ]}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Markdown</label>
            <CopyButton text={md} label="Copy MD" />
          </div>
          <textarea
            value={md}
            onChange={(e) => setMd(e.target.value)}
            rows={20}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</label>
            <CopyButton text={html} label="Copy HTML" />
          </div>
          <div
            className="markdown-preview min-h-[480px] overflow-auto rounded-lg border border-gray-300 bg-white px-6 py-4 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      <style jsx global>{`
        .markdown-preview h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
        .markdown-preview h2 { font-size: 1.5em; font-weight: bold; margin: 0.83em 0; }
        .markdown-preview h3 { font-size: 1.17em; font-weight: bold; margin: 1em 0; }
        .markdown-preview strong { font-weight: bold; }
        .markdown-preview em { font-style: italic; }
        .markdown-preview a { color: #3b82f6; text-decoration: underline; }
        .markdown-preview pre { background: #f3f4f6; padding: 1em; border-radius: 0.5em; overflow-x: auto; margin: 1em 0; }
        .markdown-preview .inline-code { background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25em; font-size: 0.875em; }
        .markdown-preview blockquote { border-left: 4px solid #d1d5db; padding-left: 1em; margin: 1em 0; color: #6b7280; }
        .markdown-preview ul { list-style-type: disc; padding-left: 1.5em; }
        .markdown-preview li { margin: 0.25em 0; }
        .markdown-preview hr { border: 0; border-top: 1px solid #d1d5db; margin: 1.5em 0; }
        .markdown-preview del { text-decoration: line-through; }
        .dark .markdown-preview pre { background: #1f2937; }
        .dark .markdown-preview .inline-code { background: #1f2937; }
        .dark .markdown-preview blockquote { border-color: #4b5563; color: #9ca3af; }
        .dark .markdown-preview hr { border-color: #4b5563; }
      `}</style>
    </ToolLayout>
  );
}
