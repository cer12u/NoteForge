import { useState } from 'react';
import { AppSidebar } from '../AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AppSidebarExample() {
  const [notes, setNotes] = useState([
    {
      id: '1',
      title: 'プロジェクト企画書',
      content: '',
      folderId: 'folder-1',
      isStarred: true,
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: '2',
      title: '会議メモ 2024-10-26',
      content: '',
      folderId: null,
      isStarred: false,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '3',
      title: 'アイデアメモ',
      content: '',
      folderId: null,
      isStarred: true,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ]);

  const [folders, setFolders] = useState([
    { id: 'folder-1', name: 'プロジェクト', parentId: null, isExpanded: true },
    { id: 'folder-2', name: '個人', parentId: null, isExpanded: false },
  ]);

  const [activeNoteId, setActiveNoteId] = useState<string | null>('1');

  return (
    <SidebarProvider>
      <div className="h-screen">
        <AppSidebar
          notes={notes}
          folders={folders}
          activeNoteId={activeNoteId}
          onSelectNote={(id) => {
            setActiveNoteId(id);
            console.log('Selected note:', id);
          }}
          onToggleStar={(id) => {
            setNotes(notes.map(n => n.id === id ? { ...n, isStarred: !n.isStarred } : n));
            console.log('Toggled star:', id);
          }}
          onCreateNote={() => console.log('Create note')}
          onCreateFolder={() => console.log('Create folder')}
          onCreateTodayNote={() => console.log('Create today note')}
          onToggleFolder={(id) => {
            setFolders(folders.map(f => f.id === id ? { ...f, isExpanded: !f.isExpanded } : f));
          }}
        />
      </div>
    </SidebarProvider>
  );
}
