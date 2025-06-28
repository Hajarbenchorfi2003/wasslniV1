'use client';

import { Inter } from 'next/font/google';
import { useThemeStore } from '@/store';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';
import { ReactToaster } from '@/components/ui/toaster';
import { Toaster } from 'react-hot-toast';
import { SonnToaster } from '@/components/ui/sonner';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

const Providers = ({ children }) => {
  const { theme, radius } = useThemeStore();
  const pathname = usePathname();

  const isHomePage = pathname === '/';

  const bodyClass = cn(
    'dash-tail-app',
    inter.className,
    !isHomePage && `theme-${theme}`
  );

  const style = !isHomePage
    ? {
        '--radius': `${radius}rem`,
      }
    : undefined;

  return (
    <body className={bodyClass} style={style}>
      <ThemeProvider attribute="class" enableSystem={false} defaultTheme="light">
        <div className="h-full">
          {children}
          <ReactToaster />
        </div>
        <Toaster />
        <SonnToaster />
      </ThemeProvider>
    </body>
  );
};

export default Providers;
