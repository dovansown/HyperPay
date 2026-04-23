import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function OTPInput({ 
  length = 6, 
  value, 
  onChange, 
  disabled = false,
  className 
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Convert value string to array of digits
  const getDigits = () => {
    const valueStr = value || '';
    const arr = valueStr.split('').slice(0, length);
    while (arr.length < length) {
      arr.push('');
    }
    return arr;
  };
  
  const digits = getDigits();

  const handleChange = (index: number, inputValue: string) => {
    if (disabled) return;
    
    // Only allow digits
    if (inputValue && !/^\d$/.test(inputValue)) return;
    
    const newDigits = [...digits];
    newDigits[index] = inputValue;
    const newValue = newDigits.join('');
    onChange(newValue);

    // Auto-focus next input when digit is entered
    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (disabled) return;
    
    // Handle backspace - focus previous input if current is empty
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    // Handle left arrow - focus previous input
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle right arrow - focus next input
    else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      onChange(pastedData);
      // Focus the next empty input or the last one
      const nextEmptyIndex = pastedData.length < length ? pastedData.length : length - 1;
      inputRefs.current[nextEmptyIndex]?.focus();
    }
  };

  return (
    <div className={cn("flex justify-between gap-2 sm:gap-3", className)}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "flex-1 h-12 sm:h-14 w-0 text-center text-[18px] sm:text-[20px] font-bold text-dark bg-gray-50 border border-[#e8e8e8] rounded-xl outline-none transition-all",
            disabled 
              ? "opacity-50 cursor-not-allowed" 
              : "focus:border-primary focus:bg-white"
          )}
        />
      ))}
    </div>
  );
}
