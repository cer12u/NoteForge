import { useState } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { NoteEditor } from '@/components/NoteEditor';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FileText } from 'lucide-react';

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

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      title: 'ようこそ NoteMark へ',
      content: '<h1>NoteMark へようこそ</h1><p>これは Obsidian スタイルのマークダウンメモアプリケーションです。</p><h2>主な機能</h2><ul><li>リアルタイムマークダウンプレビュー</li><li>フォルダ管理</li><li>お気に入り機能</li><li>Today ボタンで日次ノート作成</li><li>テンプレート機能</li></ul><p>左側のサイドバーから新しいノートを作成したり、既存のノートを選択できます。</p>',
      folderId: null,
      isStarred: true,
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: '会議メモ',
      content: '<h2>プロジェクト会議</h2><p>本日の議題:</p><ul><li>進捗確認</li><li>次週のタスク</li></ul>',
      folderId: 'folder-1',
      isStarred: false,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '3',
      title: 'アイデアメモ',
      content: '<h1>新機能アイデア</h1><p>将来追加したい機能のリスト</p>',
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

  const handleUpdateNote = (content: string) => {
    if (!activeNoteId) return;
    setNotes(
      notes.map((n) =>
        n.id === activeNoteId
          ? { ...n, content, updatedAt: new Date() }
          : n
      )
    );
  };

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
      content: `<h1>${today}</h1><p></p>`,
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

  const style = {
    '--sidebar-width': '20rem',
    '--sidebar-width-icon': '4rem',
  };

  return (
    <SidebarProvider defaultOpen={true} style={style as React.CSSProperties}>
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
            <div className="flex items-center gap-2 min-w-0">
              {activeNote && (
                <h1 className="text-lg font-semibold truncate">{activeNote.title}</h1>
              )}
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
    </SidebarProvider>
  );
}
