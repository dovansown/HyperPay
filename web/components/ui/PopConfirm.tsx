import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { motion, AnimatePresence } from 'motion/react';

interface PopConfirmProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  children: React.ReactElement;
  okText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export function PopConfirm({ 
  title, 
  description, 
  onConfirm, 
  onCancel, 
  children, 
  okText = 'Xác nhận', 
  cancelText = 'Hủy',
  variant = 'danger'
}: PopConfirmProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm();
    setIsOpen(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel?.();
    setIsOpen(false);
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {React.cloneElement(children, {
        onClick: toggleOpen,
      } as Partial<React.ComponentPropsWithoutRef<'button'>>)}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-[320px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[#e8e8e8] p-6 relative"
            >
              <div className="flex flex-col items-center text-center mb-6">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center mb-4",
                  variant === 'danger' ? "bg-red-50 text-red-500" : "bg-primary/10 text-primary"
                )}>
                  <AlertCircle size={24} />
                </div>
                <h4 className="text-[18px] font-bold text-dark mb-2">{title}</h4>
                {description && <p className="text-[14px] text-gray leading-relaxed">{description}</p>}
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  variant={variant === 'danger' ? 'primary' : 'primary'} 
                  onClick={handleConfirm}
                  className={cn(
                    "w-full py-3 rounded-xl font-bold text-[14px]",
                    variant === 'danger' && "bg-red-500 hover:bg-red-600 border-red-500 hover:border-red-600 shadow-lg shadow-red-500/20"
                  )}
                >
                  {okText}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleCancel}
                  className="w-full py-3 rounded-xl font-bold text-[14px] text-gray hover:text-dark hover:bg-gray-50"
                >
                  {cancelText}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
