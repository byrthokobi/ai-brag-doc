import { cn } from '@/lib/utils';
import { type TextareaHTMLAttributes, forwardRef } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[100px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
