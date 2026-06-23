import { cn } from '@/lib/utils';
import { type LabelHTMLAttributes, forwardRef } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-sm font-medium leading-none text-zinc-800', className)}
    {...props}
  />
));
Label.displayName = 'Label';
