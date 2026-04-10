import { Link } from 'react-router-dom';
import { LogOut, Moon, Sun, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/projects" className="flex items-center gap-2 text-lg font-bold text-[hsl(var(--foreground))]">
          <LayoutDashboard className="h-5 w-5 text-[hsl(var(--primary))]" />
          TaskFlow
        </Link>

        <div className="flex items-center gap-4">
          {/* BONUS: Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-md p-2 hover:bg-[hsl(var(--accent))]"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <span className="hidden text-sm text-[hsl(var(--muted-foreground))] sm:block">
            {user?.name}
          </span>

          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-md px-3 py-2 text-sm hover:bg-[hsl(var(--accent))]"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
