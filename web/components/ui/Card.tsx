import React from 'react';
import { cn } from '@/lib/utils';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-[20px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)]', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';
