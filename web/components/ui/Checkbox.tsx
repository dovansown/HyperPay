import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onChange, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    return (
      <label className={cn("relative inline-flex items-center justify-center cursor-pointer group", className)}>
        <input
          type="checkbox"
          className="peer sr-only"
          onChange={handleChange}
          ref={ref}
          {...props}
        />
        <div className={cn(
          "w-[18px] h-[18px] rounded-[4px] border border-[#d1d1d1] bg-white transition-all flex items-center justify-center",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50",
          "peer-checked:bg-primary peer-checked:border-primary text-white",
          "group-hover:border-primary",
          "[&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100"
        )}>
          <Check size={12} strokeWidth={3} className="transition-opacity" />
        </div>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
