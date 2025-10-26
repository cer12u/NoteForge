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
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes === 0 ? 'たった今' : `${minutes}分前`;
      }
      return `${hours}時間前`;
    }
    if (days === 1) return '昨日';
    if (days < 7) return `${days}日前`;
    
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover-elevate',
        isActive && 'bg-accent'
      )}
      onClick={onSelect}
      data-testid={`note-item-${title}`}
    >
      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        <div className="text-xs text-muted-foreground">{formatDate(updatedAt)}</div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        className={cn(
          'h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
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
