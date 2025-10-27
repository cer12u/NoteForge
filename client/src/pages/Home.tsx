import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { NoteEditor } from '@/components/NoteEditor';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FileText, BookOpen } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  isStarred: boolean;
  updatedAt: Date;
}

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  isExpanded: boolean;
}

function HomeContent() {
  const { state } = useSidebar();
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'ようこそ NoteMark へ',
      content: '# NoteMark へようこそ\n\nこれは Obsidian スタイルのマークダウンメモアプリケーションです。\n\n## 主な機能\n\n- リアルタイムマークダウンプレビュー\n- フォルダ管理\n- お気に入り機能\n- Today ボタンで日次ノート作成\n- テンプレート機能\n\n左側のサイドバーから新しいノートを作成したり、既存のノートを選択できます。',
      folderId: null,
      isStarred: true,
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: '会議メモ',
      content: '## プロジェクト会議\n\n本日の議題:\n\n- 進捗確認\n- 次週のタスク',
      folderId: 'folder-1',
      isStarred: false,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '3',
      title: 'アイデアメモ',
      content: '# 新機能アイデア\n\n将来追加したい機能のリスト',
      folderId: null,
      isStarred: true,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ]);

  const [folders, setFolders] = useState<Folder[]>([
    { id: 'folder-1', name: 'プロジェクト', parentId: null, isExpanded: true },
    { id: 'folder-2', name: '個人', parentId: null, isExpanded: false },
  ]);

  const [activeNoteId, setActiveNoteId] = useState<string | null>('1');

  const activeNote = notes.find((n) => n.id === activeNoteId);

  const extractTitle = (markdown: string): string => {
    // h1から抽出（# で始まる行）
    const h1Match = markdown.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1].trim();
    
    // 最初の非空行から抽出
    const firstLine = markdown.split('\n').find(line => line.trim().length > 0);
    if (firstLine) {
      return firstLine.replace(/^#+\s*/, '').substring(0, 50) || '無題';
    }
    
    return '無題';
  };

  const handleUpdateNote = (content: string) => {
    if (!activeNoteId) return;
    const title = extractTitle(content);
    setNotes(
      notes.map((n) =>
        n.id === activeNoteId
          ? { ...n, content, title, updatedAt: new Date() }
          : n
      )
    );
  };

  // アクティブノートのタイトルを更新
  useEffect(() => {
    if (activeNote) {
      const title = extractTitle(activeNote.content);
      if (title !== activeNote.title) {
        setNotes(
          notes.map((n) =>
            n.id === activeNoteId
              ? { ...n, title }
              : n
          )
        );
      }
    }
  }, [activeNoteId]);

  const handleToggleStar = (noteId: string) => {
    setNotes(
      notes.map((n) =>
        n.id === noteId ? { ...n, isStarred: !n.isStarred } : n
      )
    );
  };

  const handleCreateNote = (folderId?: string) => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: '新規ノート',
      content: '',
      folderId: folderId || null,
      isStarred: false,
      updatedAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleCreateFolder = () => {
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name: '新規フォルダ',
      parentId: null,
      isExpanded: true,
    };
    setFolders([...folders, newFolder]);
  };

  const handleCreateTodayNote = () => {
    const today = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).replace(/\//g, '-');
    
    const existingNote = notes.find((n) => n.title === today);
    if (existingNote) {
      setActiveNoteId(existingNote.id);
      return;
    }

    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: today,
      content: `# ${today}\n\n`,
      folderId: null,
      isStarred: false,
      updatedAt: new Date(),
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleToggleFolder = (folderId: string) => {
    setFolders(
      folders.map((f) =>
        f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f
      )
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar
        notes={notes}
        folders={folders}
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onToggleStar={handleToggleStar}
        onCreateNote={handleCreateNote}
        onCreateFolder={handleCreateFolder}
        onCreateTodayNote={handleCreateTodayNote}
        onToggleFolder={handleToggleFolder}
      />
      
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between px-4 py-2 border-b bg-background shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {state === 'collapsed' && <SidebarTrigger data-testid="button-sidebar-toggle" />}
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">NoteMark</span>
            </div>
          </div>
          <ThemeToggle />
        </header>
        
        <main className="flex-1 min-h-0">
          {activeNote ? (
            <NoteEditor
              key={activeNote.id}
              content={activeNote.content}
              onChange={handleUpdateNote}
              placeholder="メモを入力してください..."
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>ノートを選択するか、新しいノートを作成してください</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  const style = {
    '--sidebar-width': '20rem',
    '--sidebar-width-icon': '4rem',
  };

  return (
    <SidebarProvider defaultOpen={true} style={style as React.CSSProperties}>
      <HomeContent />
    </SidebarProvider>
  );
}
