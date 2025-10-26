import { ThemeToggle } from '../ThemeToggle';
import { ThemeProvider } from '@/hooks/use-theme';

export default function ThemeToggleExample() {
  return (
    <ThemeProvider>
      <div className="p-4 flex items-center gap-4">
        <span className="text-sm">テーマ切り替え:</span>
        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}
