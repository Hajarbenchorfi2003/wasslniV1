'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building, Bus, Users, Map, Settings } from '@/components/svg';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SiteLogo } from '@/components/svg';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navigation = [
  { name: 'Établissements', href: '/admin/schools', icon: Building },
  { name: 'Bus', href: '/admin/buses', icon: Bus },
  { name: 'Chauffeurs', href: '/admin/drivers', icon: Users },
  { name: 'Itinéraires', href: '/admin/routes', icon: Map },
  { name: 'Paramètres', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const isDesktop = useMediaQuery('(min-width: 1280px)');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="main-sidebar pointer-events-none fixed start-0 top-0 z-[60] flex h-full xl:z-10 print:hidden">
        <div
          className={cn(
            'border-default-200 dark:border-default-300 pointer-events-auto relative z-20 flex h-full w-[72px] flex-col border-r border-dashed bg-card transition-all duration-300',
            {
              'ltr:-translate-x-full rtl:translate-x-full ltr:xl:translate-x-0 rtl:xl:translate-x-0':
                !collapsed,
              'translate-x-0': collapsed,
            }
          )}
        >
          <div className="pt-4">
            <Link href="/admin">
              <SiteLogo className="mx-auto text-primary h-8 w-8" />
            </Link>
          </div>
          <ScrollArea className="pt-6 grow">
            {navigation.map((item, i) => {
              const isActive = pathname === item.href;
              return (
                <div key={i} className="mb-3 last:mb-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            'h-12 w-12 mx-auto rounded-md transition-all duration-300 flex flex-col items-center justify-center cursor-pointer relative',
                            {
                              'bg-primary/10 text-primary': isActive,
                              'text-default-500 dark:text-default-400 hover:bg-primary/10 hover:text-primary':
                                !isActive,
                            }
                          )}
                        >
                          <item.icon className="w-8 h-8" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="capitalize">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            })}
          </ScrollArea>
        </div>

        <div
          className={cn(
            'border-default-200 pointer-events-auto relative z-10 flex flex-col h-full w-[228px] border-r bg-card transition-all duration-300',
            {
              'rtl:translate-x-[calc(100%_+_72px)] translate-x-[calc(-100%_-_72px)]':
                collapsed,
            }
          )}
        >
          <h2 className="text-lg bg-transparent z-50 font-semibold flex gap-4 items-center text-default-700 sticky top-0 py-4 px-4 capitalize">
            <span className="block">Admin Panel</span>
            {!isDesktop && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setCollapsed(true)}
                className="rounded-full h-8 w-8"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
          </h2>
          <ScrollArea className="h-[calc(100%-40px)] grow">
            <div className="px-4">
              <ul>
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name} className="mb-1.5 last:mb-0">
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                          {
                            'bg-primary/10 text-primary': isActive,
                            'text-default-500 dark:text-default-400 hover:bg-primary/10 hover:text-primary':
                              !isActive,
                          }
                        )}
                      >
                        <item.icon
                          className={cn('mr-3 h-6 w-6 flex-shrink-0', {
                            'text-primary': isActive,
                            'text-default-500 dark:text-default-400 group-hover:text-primary':
                              !isActive,
                          })}
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </ScrollArea>
        </div>
      </div>

      <div
        className={cn('content-wrapper transition-all duration-150', {
          'ltr:xl:ml-[248px] rtl:xl:mr-[248px]': !collapsed,
          'ltr:xl:ml-[72px] rtl:xl:mr-[72px]': collapsed,
        })}
      >
        <div className="md:pt-6 pb-[37px] pt-[15px] md:px-6 px-4 page-min-height">
          <main className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
} 