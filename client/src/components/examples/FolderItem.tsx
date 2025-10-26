import { useState } from 'react';
import { FolderItem } from '../FolderItem';
import { NoteListItem } from '../NoteListItem';

export default function FolderItemExample() {
  const [expanded, setExpanded] = useState(true);
  const [starred, setStarred] = useState(false);

  return (
    <div className="p-4 bg-background w-80">
      <FolderItem
        id="1"
        name="プロジェクト"
        noteCount={3}
        level={0}
        isExpanded={expanded}
        onToggle={() => setExpanded(!expanded)}
        onRename={() => console.log('Rename folder')}
        onDelete={() => console.log('Delete folder')}
      >
        <div className="space-y-1">
          <NoteListItem
            id="note-1"
            title="会議メモ"
            updatedAt={new Date()}
            isStarred={starred}
            isActive={false}
            onSelect={() => console.log('Note selected')}
            onToggleStar={() => setStarred(!starred)}
          />
        </div>
      </FolderItem>
    </div>
  );
}
