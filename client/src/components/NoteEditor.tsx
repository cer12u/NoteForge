import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  Undo,
  Redo,
  Eye,
  EyeOff
} from 'lucide-react';

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// 簡易的なHTML→Markdown変換
function htmlToMarkdown(html: string): string {
  let markdown = html;
  
  // 見出し
  markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n');
  markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n');
  markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n');
  
  // 太字
  markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
  markdown = markdown.replace(/<b>(.*?)<\/b>/g, '**$1**');
  
  // イタリック
  markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
  markdown = markdown.replace(/<i>(.*?)<\/i>/g, '*$1*');
  
  // 取り消し線
  markdown = markdown.replace(/<s>(.*?)<\/s>/g, '~~$1~~');
  
  // コード
  markdown = markdown.replace(/<code>(.*?)<\/code>/g, '`$1`');
  
  // リスト
  markdown = markdown.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, content) => {
    return content.replace(/<li>(.*?)<\/li>/g, '- $1\n');
  });
  markdown = markdown.replace(/<ol>([\s\S]*?)<\/ol>/g, (match, content) => {
    let index = 1;
    return content.replace(/<li>(.*?)<\/li>/g, () => `${index++}. ${RegExp.$1}\n`);
  });
  
  // 引用
  markdown = markdown.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, (match, content) => {
    return content.split('\n').map((line: string) => `> ${line}`).join('\n');
  });
  
  // 水平線
  markdown = markdown.replace(/<hr\s*\/?>/g, '---\n');
  
  // 段落
  markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n\n');
  
  // 改行
  markdown = markdown.replace(/<br\s*\/?>/g, '\n');
  
  // HTMLタグを削除
  markdown = markdown.replace(/<[^>]+>/g, '');
  
  // HTMLエンティティをデコード
  markdown = markdown.replace(/&nbsp;/g, ' ');
  markdown = markdown.replace(/&lt;/g, '<');
  markdown = markdown.replace(/&gt;/g, '>');
  markdown = markdown.replace(/&amp;/g, '&');
  
  return markdown.trim();
}

// 簡易的なMarkdown→HTML変換
function markdownToHtml(markdown: string): string {
  let html = markdown;
  
  // 見出し
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  
  // 太字
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // イタリック
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // 取り消し線
  html = html.replace(/~~(.*?)~~/g, '<s>$1</s>');
  
  // コード
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  
  // リスト
  html = html.replace(/^- (.*)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gm, '<ul>$1</ul>');
  
  // 段落（空行で区切る）
  html = html.split('\n\n').map(para => {
    if (!para.match(/^<[h|u|o|l]/)) {
      return `<p>${para}</p>`;
    }
    return para;
  }).join('');
  
  return html;
}

// コンテンツからタイトルを抽出
function extractTitle(html: string): string {
  // h1タグから抽出
  const h1Match = html.match(/<h1>(.*?)<\/h1>/);
  if (h1Match) return h1Match[1];
  
  // pタグの最初の行から抽出
  const pMatch = html.match(/<p>(.*?)<\/p>/);
  if (pMatch) return pMatch[1].substring(0, 50);
  
  return '無題';
}

export function NoteEditor({ content, onChange, placeholder = 'メモを入力...' }: NoteEditorProps) {
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [markdownContent, setMarkdownContent] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Highlight,
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      if (showMarkdown) {
        setMarkdownContent(htmlToMarkdown(html));
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-full p-8 leading-snug',
      },
    },
  });

  useEffect(() => {
    if (showMarkdown && editor) {
      setMarkdownContent(htmlToMarkdown(editor.getHTML()));
    }
  }, [showMarkdown, editor]);

  const handleMarkdownChange = (value: string) => {
    setMarkdownContent(value);
    const html = markdownToHtml(value);
    onChange(html);
    if (editor) {
      editor.commands.setContent(html);
    }
  };

  const toggleMarkdownView = () => {
    setShowMarkdown(!showMarkdown);
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-1 px-4 py-2 border-b bg-background shrink-0">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-accent' : ''}
          data-testid="button-bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-accent' : ''}
          data-testid="button-italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-accent' : ''}
          data-testid="button-strike"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'bg-accent' : ''}
          data-testid="button-code"
        >
          <Code className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
          data-testid="button-h1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
          data-testid="button-h2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
          data-testid="button-h3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-accent' : ''}
          data-testid="button-bullet-list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-accent' : ''}
          data-testid="button-ordered-list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-accent' : ''}
          data-testid="button-quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          data-testid="button-hr"
        >
          <Minus className="h-4 w-4" />
        </Button>
        
        <div className="flex-1" />
        
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          data-testid="button-undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          data-testid="button-redo"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          size="icon"
          variant="ghost"
          onClick={toggleMarkdownView}
          className={showMarkdown ? 'bg-accent' : ''}
          data-testid="button-toggle-markdown"
        >
          {showMarkdown ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto">
        {showMarkdown ? (
          <Textarea
            value={markdownContent}
            onChange={(e) => handleMarkdownChange(e.target.value)}
            className="h-full w-full resize-none border-0 p-8 font-mono text-sm leading-snug focus-visible:ring-0"
            placeholder={placeholder}
            data-testid="textarea-markdown"
          />
        ) : (
          <EditorContent editor={editor} className="[&_.ProseMirror]:leading-snug [&_.ProseMirror_p]:my-1 [&_.ProseMirror_h1]:mt-3 [&_.ProseMirror_h1]:mb-1.5 [&_.ProseMirror_h2]:mt-2.5 [&_.ProseMirror_h2]:mb-1 [&_.ProseMirror_h3]:mt-2 [&_.ProseMirror_h3]:mb-1 [&_.ProseMirror_ul]:my-1 [&_.ProseMirror_ol]:my-1 [&_.ProseMirror_li]:my-0" />
        )}
      </div>
    </div>
  );
}
