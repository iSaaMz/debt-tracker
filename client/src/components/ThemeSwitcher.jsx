import { Monitor, Moon, Sun, Heart, Palette } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useTheme } from './ThemeProvider';

const themes = [
  {
    name: 'Light',
    value: 'light',
    icon: Sun,
    description: 'Mode clair classique'
  },
  {
    name: 'Dark', 
    value: 'dark',
    icon: Moon,
    description: 'Mode sombre classique'
  },
  {
    name: 'Nanou Mode',
    value: 'nanou',
    icon: Heart,
    description: 'Rouge, violet, rose'
  },
  {
    name: 'Amina Mode',
    value: 'amina', 
    icon: Palette,
    description: 'Rose, bleu, violet pastel'
  }
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  
  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3">
          <CurrentIcon className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden md:inline text-xs sm:text-sm">{currentTheme.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`cursor-pointer gap-2 ${theme === themeOption.value ? 'bg-accent' : ''}`}
            >
              <Icon className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{themeOption.name}</span>
                <span className="text-xs text-muted-foreground">{themeOption.description}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}