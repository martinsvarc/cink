'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Crown, 
  Zap, 
  DollarSign, 
  Settings,
  Command,
  ChevronDown,
  UserCheck,
  Minus,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth-context';

// Restructured navigation with strategic groups - REMOVED OPERATORS
const navigationGroups = [
  {
    name: 'Strategic Overview',
    items: [
      { name: 'CMD Center', href: '/dashboard', icon: Command, group: 'strategic' },
      { name: 'Analytics', href: '/charts', icon: BarChart3, group: 'strategic' },
      { name: 'Cashflow', href: '/cashflow', icon: DollarSign, group: 'strategic' },
    ]
  },
  {
    name: 'Setter Tools',
    items: [
      { name: 'Stream', href: '/stream', icon: Zap, group: 'setter' },
      { name: 'Clients', href: '/clients', icon: UserCheck, group: 'setter' },
      { name: 'Models', href: '/models', icon: Crown, group: 'setter' },
    ]
  },
  {
    name: 'Back Office',
    items: [
      { name: 'Admin', href: '/admin', icon: Settings, group: 'backoffice' },
    ]
  }
];

// Flatten for easy lookup
const allNavItems = navigationGroups.flatMap(group => group.items);

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate refresh action
    setTimeout(() => {
      setIsRefreshing(false);
      // In a real app, this would trigger data refresh
      window.location.reload();
    }, 1000);
  };

  // Get group-specific styling
  const getGroupStyling = (group: string, isActive: boolean) => {
    if (!isActive) {
      return 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)]';
    }

    switch (group) {
      case 'strategic':
        return 'bg-gradient-to-r from-[rgba(var(--neon-orchid),0.2)] to-[rgba(var(--crimson),0.2)] text-[rgb(var(--neon-orchid))] border border-[rgba(var(--neon-orchid),0.3)]';
      case 'setter':
        return 'bg-gradient-to-r from-[rgba(var(--sunset-gold),0.2)] to-[rgba(var(--neon-orchid),0.2)] text-[rgb(var(--sunset-gold))] border border-[rgba(var(--sunset-gold),0.3)]';
      case 'backoffice':
        return 'bg-gradient-to-r from-[rgba(var(--velvet-gray),0.3)] to-[rgba(var(--smoke),0.3)] text-[rgb(var(--foreground))] border border-[rgba(var(--velvet-gray),0.5)]';
      default:
        return 'bg-gradient-to-r from-[rgba(var(--neon-orchid),0.2)] to-[rgba(var(--crimson),0.2)] text-[rgb(var(--neon-orchid))] border border-[rgba(var(--neon-orchid),0.3)]';
    }
  };

  // Separator component
  const Separator = ({ label }: { label: string }) => (
    <div className="flex items-center space-x-2 px-2">
      <div className="w-px h-6 bg-[rgba(var(--neon-orchid),0.3)]"></div>
    </div>
  );

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out',
      isVisible ? 'translate-y-0' : '-translate-y-full'
    )}>
      <div className="nav-blur">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[rgb(var(--neon-orchid))] to-[rgb(var(--crimson))] flex items-center justify-center">
                  <Command className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gradient-primary">PINK™</span>
                  <span className="text-xs text-[rgb(var(--muted-foreground))] -mt-1">Seductive Empire</span>
                </div>
              </div>
            </div>

            {/* Navigation Links - Restructured with Groups */}
            <div className="hidden md:flex items-center space-x-1">
              {/* Group 1: Strategic Overview */}
              {navigationGroups[0].items.map((item) => {
                const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      getGroupStyling(item.group, isActive)
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Separator 1 */}
              <Separator label="Setter Tools" />

              {/* Group 2: Setter Tools */}
              {navigationGroups[1].items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      getGroupStyling(item.group, isActive)
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Separator 2 */}
              <Separator label="Back Office" />

              {/* Group 3: Back Office */}
              {navigationGroups[2].items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      getGroupStyling(item.group, isActive)
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-lg text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.5)] transition-all duration-200 disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={cn(
                  "w-5 h-5 transition-transform duration-500",
                  isRefreshing && "animate-spin"
                )} />
              </button>
              
              {/* LIVE Indicator */}
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[rgba(var(--neon-orchid),0.1)] to-[rgba(var(--sunset-gold),0.1)] border border-[rgba(var(--neon-orchid),0.2)]">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-[rgb(var(--foreground))]">LIVE</span>
              </div>

              {/* User Profile */}
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-[rgba(var(--velvet-gray),0.3)] transition-all duration-200"
                >
                  <Avatar className="w-8 h-8 border-2 border-[rgba(var(--neon-orchid),0.3)]">
                    <AvatarImage src={user?.avatarUrl || ''} alt={user?.name || user?.username || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                      {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : user?.username?.slice(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {/* User Menu Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[rgba(var(--charcoal),0.95)] border border-[rgba(var(--neon-orchid),0.2)] backdrop-blur-sm shadow-xl z-50 animate-in fade-in-50 slide-in-from-top-5 duration-200">
                    <div className="p-3 border-b border-[rgba(var(--neon-orchid),0.1)]">
                      <div className="font-medium text-[rgb(var(--foreground))]">{user?.name || user?.username || 'User'}</div>
                      <div className="text-xs text-[rgb(var(--muted-foreground))]">{user?.role || 'User'}</div>
                    </div>
                    <div className="p-2">
                      <Link 
                        href="/admin" 
                        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-all duration-200 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--velvet-gray),0.3)]"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button 
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-all duration-200 text-red-400 hover:text-red-300 hover:bg-[rgba(var(--velvet-gray),0.3)]"
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await logout();
                          router.push('/auth');
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}