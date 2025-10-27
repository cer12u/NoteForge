import { useState } from 'react';
import { Calendar, Plus, Search, Star, FileText, FolderPlus, File, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { NoteListItem } from './NoteListItem';
import { FolderItem } from './FolderItem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface AppSidebarProps {
  notes: Note[];
  folders: Folder[];
  activeNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onToggleStar: (noteId: string) => void;
  onCreateNote: (folderId?: string) => void;
  onCreateFolder: () => void;
  onCreateTodayNote: () => void;
  onToggleFolder: (folderId: string) => void;
}

export function AppSidebar({
  notes,
  folders,
  activeNoteId,
  onSelectNote,
  onToggleStar,
  onCreateNote,
  onCreateFolder,
  onCreateTodayNote,
  onToggleFolder,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [starredExpanded, setStarredExpanded] = useState(true);
  const [allNotesExpanded, setAllNotesExpanded] = useState(true);

  const filteredNotes = notes.filter((note) => {
    return note.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const starredNotes = filteredNotes.filter((note) => note.isStarred);
  const regularNotes = filteredNotes.filter((note) => !note.isStarred);

  const renderNotesInFolder = (folderId: string | null, level: number = 0) => {
    const folderNotes = filteredNotes.filter((note) => note.folderId === folderId);
    const subFolders = folders.filter((folder) => folder.parentId === folderId);

    return (
      <>
        {subFolders.map((folder) => {
          const noteCount = notes.filter((n) => n.folderId === folder.id).length;
          return (
            <FolderItem
              key={folder.id}
              id={folder.id}
              name={folder.name}
              noteCount={noteCount}
              level={level}
              isExpanded={folder.isExpanded}
              onToggle={() => onToggleFolder(folder.id)}
              onRename={() => console.log('Rename folder', folder.id)}
              onDelete={() => console.log('Delete folder', folder.id)}
            >
              {folder.isExpanded && renderNotesInFolder(folder.id, level + 1)}
            </FolderItem>
          );
        })}
        {folderNotes.map((note) => (
          <div key={note.id} style={{ paddingLeft: `${level * 12}px` }}>
            <NoteListItem
              id={note.id}
              title={note.title}
              updatedAt={note.updatedAt}
              isStarred={note.isStarred}
              isActive={note.id === activeNoteId}
              onSelect={() => onSelectNote(note.id)}
              onToggleStar={() => onToggleStar(note.id)}
            />
          </div>
        ))}
      </>
    );
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant="outline"
            className="flex-1 justify-start gap-2"
            onClick={onCreateTodayNote}
            data-testid="button-today"
          >
            <Calendar className="h-4 w-4" />
            <span>Today</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" data-testid="button-new">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onCreateNote()} data-testid="menu-new-note">
                <FileText className="h-4 w-4 mr-2" />
                新規ノート
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCreateFolder} data-testid="menu-new-folder">
                <FolderPlus className="h-4 w-4 mr-2" />
                新規フォルダ
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('New template')} data-testid="menu-new-template">
                <File className="h-4 w-4 mr-2" />
                新規テンプレート
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {state === 'expanded' && <SidebarTrigger data-testid="button-sidebar-toggle-menu" />}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="ノートを検索..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <div className="px-2">
                {starredNotes.length > 0 && (
                  <>
                    <div 
                      className="flex items-center gap-1 px-2 py-2 text-xs font-medium text-muted-foreground cursor-pointer hover-elevate rounded-md"
                      onClick={() => setStarredExpanded(!starredExpanded)}
                      data-testid="section-starred"
                    >
                      <ChevronRight className={`h-3 w-3 transition-transform ${starredExpanded ? 'rotate-90' : ''}`} />
                      <Star className="h-3 w-3" />
                      お気に入り
                    </div>
                    {starredExpanded && starredNotes.map((note) => (
                      <NoteListItem
                        key={note.id}
                        id={note.id}
                        title={note.title}
                        updatedAt={note.updatedAt}
                        isStarred={note.isStarred}
                        isActive={note.id === activeNoteId}
                        onSelect={() => onSelectNote(note.id)}
                        onToggleStar={() => onToggleStar(note.id)}
                      />
                    ))}
                    <Separator className="my-2" />
                  </>
                )}
                <div 
                  className="flex items-center gap-1 px-2 py-2 text-xs font-medium text-muted-foreground cursor-pointer hover-elevate rounded-md"
                  onClick={() => setAllNotesExpanded(!allNotesExpanded)}
                  data-testid="section-all-notes"
                >
                  <ChevronRight className={`h-3 w-3 transition-transform ${allNotesExpanded ? 'rotate-90' : ''}`} />
                  すべてのノート
                </div>
                {allNotesExpanded && renderNotesInFolder(null)}
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
