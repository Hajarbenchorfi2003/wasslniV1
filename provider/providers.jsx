'use client';

import { Inter } from 'next/font/google';
import { useThemeStore } from '@/store';
import { ThemeProvider } from 'next-themes';
import { cn } from '@/lib/utils';
import { ReactToaster } from '@/components/ui/toaster';
import { Toaster } from 'react-hot-toast';
import { SonnToaster } from '@/components/ui/sonner';
import { useMounted } from '@/hooks/use-mounted';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

const Providers = ({ children }) => {
  const { theme, radius } = useThemeStore();
  const mounted = useMounted();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Marquer comme hydraté après un court délai pour s'assurer que le store est prêt
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Utiliser le thème par défaut pendant l'hydratation
  const currentTheme = mounted && isHydrated ? theme : 'yellow';
  const currentRadius = mounted && isHydrated ? radius : 0.5;

  const bodyClass = cn(
    'wasslni',
    inter.className,
    `theme-${currentTheme}`
  );

  const style = {
    '--radius': `${currentRadius}rem`,
  };

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
