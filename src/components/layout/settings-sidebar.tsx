'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
  personalSettingsItems,
  settingsItems,
} from '@/lib/settings-navigation';

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium">Personal Settings</h3>
        <div className="mt-2 space-y-1">
          {personalSettingsItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                pathname === item.href
                  ? 'bg-muted hover:bg-muted'
                  : 'hover:bg-transparent hover:underline',
                'justify-start w-full'
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium">System Configuration</h3>
        <div className="mt-2 space-y-1">
          {settingsItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                pathname === item.href
                  ? 'bg-muted hover:bg-muted'
                  : 'hover:bg-transparent hover:underline',
                'justify-start w-full'
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
