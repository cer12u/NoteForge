import { Star, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NoteListItemProps {
  id: string;
  title: string;
  updatedAt: Date;
  isStarred: boolean;
  isActive: boolean;
  onSelect: () => void;
  onToggleStar: () => void;
}

export function NoteListItem({
  title,
  updatedAt,
  isStarred,
  isActive,
  onSelect,
  onToggleStar,
}: NoteListItemProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover-elevate',
        isActive && 'bg-accent'
      )}
      onClick={onSelect}
      data-testid={`note-item-${title}`}
    >
      <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{title}</div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          'h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity',
          isStarred && 'opacity-100'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleStar();
        }}
        data-testid={`button-star-${title}`}
      >
        <Star
          className={cn(
            'h-3 w-3',
            isStarred ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'
          )}
        />
      </Button>
    </div>
  );
}
