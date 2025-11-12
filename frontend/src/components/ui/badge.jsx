import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold leading-none transition-colors whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-slate-900 text-white',
        secondary: 'border-transparent bg-slate-100 text-slate-900',
        success: 'border-transparent bg-emerald-100 text-emerald-700',
        warning: 'border-transparent bg-amber-100 text-amber-700',
        outline: 'text-slate-700 border-slate-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Badge = React.forwardRef(({ className, variant, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
));
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
