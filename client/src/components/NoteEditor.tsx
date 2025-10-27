import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { marked } from 'marked';
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
  EyeOff,
  FileEdit
} from 'lucide-react';

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

type ViewMode = 'edit' | 'preview' | 'hybrid';

// markedの設定
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function NoteEditor({ content, onChange, placeholder = 'メモを入力...' }: NoteEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('hybrid');
  const [markdown, setMarkdown] = useState(content);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setMarkdown(content);
  }, [content]);

  const handleChange = (value: string) => {
    setMarkdown(value);
    onChange(value);
  };

  const updateCursorPosition = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      setCursorPosition(textarea.selectionStart);
    }
  };

  const getCurrentLineNumber = (text: string, cursorPos: number): number => {
    const textBeforeCursor = text.substring(0, cursorPos);
    return textBeforeCursor.split('\n').length - 1;
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
      updateCursorPosition();
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
      updateCursorPosition();
    }, 0);
  };

  const cycleViewMode = () => {
    if (viewMode === 'edit') {
      setViewMode('hybrid');
    } else if (viewMode === 'hybrid') {
      setViewMode('preview');
    } else {
      setViewMode('edit');
    }
  };

  // ハイブリッドビュー（Obsidianスタイル）のレンダリング
  const renderHybridView = () => {
    const lines = markdown.split('\n');
    const currentLineNumber = getCurrentLineNumber(markdown, cursorPosition);
    
    return (
      <div className="relative h-full w-full overflow-auto">
        {/* 装飾されたコンテンツ（背景層） */}
        <div
          className="absolute inset-0 p-8 font-mono text-sm leading-relaxed overflow-auto pointer-events-none"
        >
          {lines.map((line, index) => {
            const isCursorLine = index === currentLineNumber;
            
            return (
              <div 
                key={index}
                className={`min-h-[1.5rem] ${isCursorLine ? 'bg-accent/20 px-2 -mx-2' : ''}`}
              >
                {isCursorLine ? (
                  // カーソル行はMarkdownソースを表示（透明にして見えないようにする）
                  <span className="text-transparent whitespace-pre-wrap select-none">{line || '\u00A0'}</span>
                ) : (
                  // 他の行はmarkedでHTMLに変換して表示
                  <div 
                    className="prose prose-sm dark:prose-invert inline-block w-full"
                    dangerouslySetInnerHTML={{ 
                      __html: line.trim() ? marked.parseInline(line) : '\u00A0'
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        {/* 実際の入力を受け付けるテキストエリア（前景層） */}
        <textarea
          ref={textareaRef}
          value={markdown}
          onChange={(e) => handleChange(e.target.value)}
          onKeyUp={updateCursorPosition}
          onClick={updateCursorPosition}
          onSelect={updateCursorPosition}
          className="relative w-full h-full p-8 font-mono text-sm leading-relaxed resize-none border-0 bg-transparent focus-visible:ring-0 focus:outline-none"
          style={{ 
            color: 'transparent',
            caretColor: 'var(--foreground)',
          }}
          placeholder={placeholder}
          data-testid="textarea-markdown-hybrid"
        />
      </div>
    );
  };

  const getViewModeIcon = () => {
    switch (viewMode) {
      case 'edit':
        return <EyeOff className="h-4 w-4" />;
      case 'hybrid':
        return <FileEdit className="h-4 w-4" />;
      case 'preview':
        return <Eye className="h-4 w-4" />;
    }
  };

  const getViewModeTitle = () => {
    switch (viewMode) {
      case 'edit':
        return '編集モード（装飾OFF）';
      case 'hybrid':
        return 'ハイブリッドモード（カーソル行のみMarkdown）';
      case 'preview':
        return 'プレビューモード（装飾ON）';
    }
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
          onClick={cycleViewMode}
          className={viewMode !== 'edit' ? 'bg-accent' : ''}
          data-testid="button-toggle-view-mode"
          title={getViewModeTitle()}
        >
          {getViewModeIcon()}
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'preview' ? (
          // 完全プレビューモード（装飾ON）
          <div 
            className="prose prose-sm max-w-none p-8 leading-relaxed dark:prose-invert overflow-auto h-full cursor-text"
            onClick={() => setViewMode('hybrid')}
            data-testid="preview-container"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </div>
        ) : viewMode === 'hybrid' ? (
          // ハイブリッドモード（Obsidianスタイル）
          renderHybridView()
        ) : (
          // 編集モード（装飾OFF - Markdownソース表示）
          <div className="h-full overflow-auto">
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => handleChange(e.target.value)}
              onKeyUp={updateCursorPosition}
              onClick={updateCursorPosition}
              onSelect={updateCursorPosition}
              className="h-full w-full resize-none border-0 p-8 font-mono text-sm leading-relaxed focus-visible:ring-0 bg-background"
              placeholder={placeholder}
              data-testid="textarea-markdown"
            />
          </div>
        )}
      </div>
    </div>
  );
}
