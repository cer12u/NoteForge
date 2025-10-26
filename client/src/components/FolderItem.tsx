import { useState } from 'react';
import { ChevronRight, Folder, FolderOpen, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface FolderItemProps {
  id: string;
  name: string;
  noteCount: number;
  level: number;
  isExpanded?: boolean;
  onToggle?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
}

export function FolderItem({
  name,
  noteCount,
  level,
  isExpanded = false,
  onToggle,
  onRename,
  onDelete,
  children,
}: FolderItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer hover-elevate',
          showMenu && 'bg-accent'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        data-testid={`folder-${name}`}
      >
        <Button
          size="icon"
          variant="ghost"
          className="h-4 w-4 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggle?.();
          }}
          data-testid={`button-toggle-${name}`}
        >
          <ChevronRight
            className={cn(
              'h-3 w-3 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        </Button>
        
        <div className="flex items-center gap-2 flex-1 min-w-0" onClick={onToggle}>
          {isExpanded ? (
            <FolderOpen className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          ) : (
            <Folder className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          )}
          <span className="text-sm truncate">{name}</span>
          <span className="text-xs text-muted-foreground ml-auto">{noteCount}</span>
        </div>

        <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5 opacity-0 group-hover:opacity-100"
              data-testid={`button-menu-${name}`}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRename} data-testid="menu-rename">
              名前を変更
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive"
              data-testid="menu-delete"
            >
              削除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {isExpanded && children && (
        <div className="mt-0.5">{children}</div>
      )}
    </div>
  );
}
