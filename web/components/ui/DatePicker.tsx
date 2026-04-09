import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './Button';

interface DatePickerProps {
  date?: Date;
  onChange?: (date: Date) => void;
}

export function DatePicker({ date, onChange }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(date || new Date('2024-05-16')); // Default to the mockup date
  const [viewDate, setViewDate] = useState<Date>(date || new Date('2024-05-16'));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleSelectDate = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
    onChange?.(newDate);
    setIsOpen(false);
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e8e8e8] rounded-xl text-[13px] font-medium text-dark hover:bg-gray-50 transition-colors"
      >
        <CalendarIcon size={14} className="text-gray" /> {formatDate(selectedDate)}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-[320px] bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[#e8e8e8] p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <button onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors text-gray hover:text-dark">
                  <ChevronLeft size={20} />
                </button>
                <div className="text-[16px] font-bold text-dark">
                  {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <button onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl transition-colors text-gray hover:text-dark">
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-[12px] font-bold text-gray/50 py-1 uppercase tracking-wider">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-6">
                {blanks.map(b => <div key={`blank-${b}`} className="p-1" />)}
                {days.map(day => {
                  const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === viewDate.getMonth() && selectedDate.getFullYear() === viewDate.getFullYear();
                  const isToday = new Date().getDate() === day && new Date().getMonth() === viewDate.getMonth() && new Date().getFullYear() === viewDate.getFullYear();
                  
                  return (
                    <button
                      key={day}
                      onClick={() => handleSelectDate(day)}
                      className={cn(
                        "w-9 h-9 flex items-center justify-center rounded-xl text-[14px] transition-all mx-auto font-medium",
                        isSelected ? "bg-primary text-white font-bold shadow-lg shadow-primary/30 scale-110" : 
                        isToday ? "bg-primary/10 text-primary font-bold hover:bg-primary/20" : 
                        "text-dark hover:bg-gray-50 hover:scale-105"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <Button 
                variant="ghost" 
                onClick={() => setIsOpen(false)}
                className="w-full py-3 rounded-xl font-bold text-[14px] text-gray hover:text-dark hover:bg-gray-50"
              >
                Đóng
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
