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

// 軽量Markdownトークナイザー（インライン装飾のみ）
interface Token {
  type: 'text' | 'bold' | 'italic' | 'code' | 'strikethrough';
  text: string;
  start: number;
  end: number;
}

function tokenizeLine(line: string): { tokens: Token[]; isHeading: boolean; isList: boolean } {
  const tokens: Token[] = [];
  let pos = 0;
  let isHeading = false;
  let isList = false;
  
  // 見出し記号を保持
  const headingMatch = line.match(/^(#{1,6})\s/);
  if (headingMatch) {
    isHeading = true;
    tokens.push({ type: 'text', text: headingMatch[0], start: 0, end: headingMatch[0].length });
    pos = headingMatch[0].length;
  }
  
  // リスト記号を保持
  const listMatch = line.match(/^(\s*[-*+]|\s*\d+\.)\s/);
  if (listMatch && !headingMatch) {
    isList = true;
    tokens.push({ type: 'text', text: listMatch[0], start: 0, end: listMatch[0].length });
    pos = listMatch[0].length;
  }
  
  const remaining = line.slice(pos);
  if (!remaining) {
    return { tokens: tokens.length > 0 ? tokens : [{ type: 'text', text: line || '\u00A0', start: 0, end: line.length }], isHeading, isList };
  }
  
  // インライン装飾のパターンをパース
  const parts: Array<{ text: string; type: Token['type']; start: number }> = [];
  let currentPos = 0;
  
  // 正規表現でインライン要素を検出
  const inlineRegex = /(\*\*(.+?)\*\*|__(.+?)__|(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)|(?<!_)_(?!_)(.+?)(?<!_)_(?!_)|`(.+?)`|~~(.+?)~~)/g;
  let match;
  
  while ((match = inlineRegex.exec(remaining)) !== null) {
    const matchStart = match.index;
    const matchText = match[0];
    
    // 前のテキスト
    if (matchStart > currentPos) {
      parts.push({
        text: remaining.slice(currentPos, matchStart),
        type: 'text',
        start: pos + currentPos
      });
    }
    
    // マッチした装飾の種類を判定
    let type: Token['type'] = 'text';
    if (matchText.startsWith('**') || matchText.startsWith('__')) {
      type = 'bold';
    } else if (matchText.startsWith('~~')) {
      type = 'strikethrough';
    } else if (matchText.startsWith('`')) {
      type = 'code';
    } else if (matchText.startsWith('*') || matchText.startsWith('_')) {
      type = 'italic';
    }
    
    parts.push({
      text: matchText,
      type: type,
      start: pos + matchStart
    });
    
    currentPos = matchStart + matchText.length;
  }
  
  // 残りのテキスト
  if (currentPos < remaining.length) {
    parts.push({
      text: remaining.slice(currentPos),
      type: 'text',
      start: pos + currentPos
    });
  }
  
  // トークンに変換
  for (const part of parts) {
    tokens.push({
      type: part.type,
      text: part.text,
      start: part.start,
      end: part.start + part.text.length
    });
  }
  
  return { tokens: tokens.length > 0 ? tokens : [{ type: 'text', text: line || '\u00A0', start: 0, end: line.length }], isHeading, isList };
}

// トークンをレンダリング（装飾記号を透明化）
function renderTokens(tokens: Token[], isHeading: boolean, isList: boolean): JSX.Element[] {
  return tokens.map((token, i) => {
    // 見出し用のスタイリング
    if (isHeading) {
      if (i === 0) {
        // 見出し記号（# ## ###）は控えめに
        return <span key={i} className="text-muted-foreground">{token.text}</span>;
      } else {
        // 見出し本文は目立つように
        return <span key={i} className="text-primary font-bold">{token.text}</span>;
      }
    }
    
    // リスト用のスタイリング（記号のみ）
    if (isList && i === 0) {
      return <span key={i} className="text-muted-foreground">{token.text}</span>;
    }
    
    // インライン装飾
    if (token.type === 'bold') {
      // **text** -> 記号を透明化、textを太字で表示
      const match = token.text.match(/^(\*\*|__)(.+?)(\*\*|__)$/);
      if (match) {
        return (
          <span key={i}>
            <span className="opacity-0">{match[1]}</span>
            <span className="font-bold">{match[2]}</span>
            <span className="opacity-0">{match[3]}</span>
          </span>
        );
      }
    } else if (token.type === 'italic') {
      // *text* -> 記号を透明化、textを斜体で表示
      const match = token.text.match(/^(\*|_)(.+?)(\*|_)$/);
      if (match) {
        return (
          <span key={i}>
            <span className="opacity-0">{match[1]}</span>
            <span className="italic">{match[2]}</span>
            <span className="opacity-0">{match[3]}</span>
          </span>
        );
      }
    } else if (token.type === 'code') {
      // `text` -> 記号を透明化、textを背景色付きで表示
      const match = token.text.match(/^`(.+?)`$/);
      if (match) {
        return (
          <span key={i}>
            <span className="opacity-0">`</span>
            <span className="bg-muted px-1 rounded">{match[1]}</span>
            <span className="opacity-0">`</span>
          </span>
        );
      }
    } else if (token.type === 'strikethrough') {
      // ~~text~~ -> 記号を透明化、textを打消し線で表示
      const match = token.text.match(/^~~(.+?)~~$/);
      if (match) {
        return (
          <span key={i}>
            <span className="opacity-0">~~</span>
            <span className="line-through opacity-70">{match[1]}</span>
            <span className="opacity-0">~~</span>
          </span>
        );
      }
    }
    
    // 通常のテキスト
    return <span key={i}>{token.text}</span>;
  });
}

export function NoteEditor({ content, onChange, placeholder = 'メモを入力...' }: NoteEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('hybrid');
  const [markdown, setMarkdown] = useState(content);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (backgroundRef.current && e.currentTarget) {
      backgroundRef.current.scrollTop = e.currentTarget.scrollTop;
      backgroundRef.current.scrollLeft = e.currentTarget.scrollLeft;
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
      <div className="relative h-full w-full overflow-hidden">
        {/* 装飾されたコンテンツ（背景層） - 等幅フォントで同じ行の高さを維持 */}
        <div ref={backgroundRef} className="absolute inset-0 overflow-auto pointer-events-none">
          <pre className="p-8 font-mono text-sm leading-relaxed whitespace-pre-wrap m-0">
            {lines.map((line, index) => {
              const isCursorLine = index === currentLineNumber;
              
              return (
                <div 
                  key={`bg-${index}`}
                  className={`min-h-[1.5rem] ${isCursorLine ? 'bg-accent/20 px-2 -mx-2 rounded' : ''}`}
                >
                  {isCursorLine ? (
                    // カーソル行はMarkdown原文を表示
                    <span className="text-foreground">{line || '\u00A0'}</span>
                  ) : (
                    // 他の行はトークン化して装飾表示（等幅フォント維持）
                    <span className="text-foreground">
                      {(() => {
                        const { tokens, isHeading, isList } = tokenizeLine(line);
                        return renderTokens(tokens, isHeading, isList);
                      })()}
                    </span>
                  )}
                </div>
              );
            })}
          </pre>
        </div>
        
        {/* 実際の入力を受け付けるテキストエリア（前景層） */}
        <div className="absolute inset-0 overflow-auto" onScroll={handleScroll}>
          <textarea
            ref={textareaRef}
            value={markdown}
            onChange={(e) => handleChange(e.target.value)}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onSelect={updateCursorPosition}
            className="w-full min-h-full p-8 font-mono text-sm leading-relaxed resize-none border-0 bg-transparent focus-visible:ring-0 focus:outline-none"
            style={{ 
              color: 'transparent',
              caretColor: 'var(--foreground)',
            }}
            placeholder={placeholder}
            data-testid="textarea-markdown-hybrid"
          />
        </div>
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
            className="prose prose-sm max-w-none p-8 leading-relaxed dark:prose-invert overflow-auto h-full"
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
