import { useState } from 'react';
import { NoteListItem } from '../NoteListItem';

export default function NoteListItemExample() {
  const [starred, setStarred] = useState(false);
  const [active, setActive] = useState(false);

  return (
    <div className="p-4 bg-background w-80">
      <NoteListItem
        id="1"
        title="サンプルノート"
        updatedAt={new Date(Date.now() - 1000 * 60 * 30)}
        isStarred={starred}
        isActive={active}
        onSelect={() => {
          setActive(!active);
          console.log('Note selected');
        }}
        onToggleStar={() => {
          setStarred(!starred);
          console.log('Star toggled');
        }}
      />
    </div>
  );
}
