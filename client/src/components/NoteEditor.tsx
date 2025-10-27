import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Eye,
  EyeOff
} from 'lucide-react';

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function NoteEditor({ content, onChange, placeholder = 'メモを入力...' }: NoteEditorProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [markdown, setMarkdown] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMarkdown(content);
  }, [content]);

  const handleChange = (value: string) => {
    setMarkdown(value);
    onChange(value);
  };

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdown.substring(start, end);
    const newText = markdown.substring(0, start) + before + selectedText + after + markdown.substring(end);
    
    handleChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertHeading = (level: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = markdown.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = markdown.indexOf('\n', start);
    const currentLine = markdown.substring(lineStart, lineEnd === -1 ? markdown.length : lineEnd);
    
    const hashPrefix = '#'.repeat(level) + ' ';
    const existingHashMatch = currentLine.match(/^#+\s/);
    
    let newLine: string;
    if (existingHashMatch) {
      newLine = currentLine.replace(/^#+\s/, hashPrefix);
    } else {
      newLine = hashPrefix + currentLine;
    }
    
    const newText = markdown.substring(0, lineStart) + newLine + markdown.substring(lineEnd === -1 ? markdown.length : lineEnd);
    handleChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(lineStart + newLine.length, lineStart + newLine.length);
    }, 0);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-background shrink-0">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => insertMarkdown('**', '**')}
          data-testid="button-bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => insertMarkdown('*', '*')}
          data-testid="button-italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => insertMarkdown('~~', '~~')}
          data-testid="button-strike"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => insertMarkdown('`', '`')}
          data-testid="button-code"
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => insertHeading(1)}
          data-testid="button-h1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => insertHeading(2)}
          data-testid="button-h2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => insertHeading(3)}
          data-testid="button-h3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => insertMarkdown('\n- ')}
          data-testid="button-bullet-list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => insertMarkdown('\n1. ')}
          data-testid="button-ordered-list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => insertMarkdown('\n> ')}
          data-testid="button-quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => insertMarkdown('\n\n---\n\n')}
          data-testid="button-hr"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="flex-1" />

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setShowPreview(!showPreview)}
          className={showPreview ? 'bg-accent' : ''}
          data-testid="button-toggle-preview"
        >
          {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto">
        {showPreview ? (
          <div className="prose prose-sm max-w-none p-8 leading-snug dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={markdown}
            onChange={(e) => handleChange(e.target.value)}
            className="h-full w-full resize-none border-0 p-8 font-mono text-sm leading-snug focus-visible:ring-0"
            placeholder={placeholder}
            data-testid="textarea-markdown"
          />
        )}
      </div>
    </div>
  );
}
