'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type Props = {
  href: string;
  children: React.ReactNode;
};

export function NavLink({ href, children }: Props) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        'text-sm transition-colors',
        active ? 'font-medium text-zinc-900' : 'text-zinc-500 hover:text-zinc-900',
      )}
    >
      {children}
    </Link>
  );
}
