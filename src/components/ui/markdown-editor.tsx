'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import rehypeSanitize from 'rehype-sanitize';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const { theme } = useTheme();

  return (
    <div data-color-mode={theme === 'dark' ? 'dark' : 'light'}>
      <MDEditor
        value={value}
        onChange={onChange}
        height={400}
        previewOptions={{
          rehypePlugins: [[rehypeSanitize]],
        }}
        className="[&_.w-md-editor-toolbar]:bg-transparent [&_.w-md-editor-content]:bg-transparent [&_.w-md-editor-input]:bg-transparent"
      />
    </div>
  );
}
