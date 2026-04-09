import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';
import { Popover } from '@/components/ui/Popover';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <Popover
      trigger={
        <button className="p-2 text-gray hover:text-dark hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-2">
          <Globe size={20} />
          <span className="text-[13px] font-bold uppercase hidden sm:inline">{language}</span>
        </button>
      }
      align="right"
      contentClassName="w-32"
    >
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setLanguage('en')}
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
            language === 'en' ? "bg-primary/10 text-primary" : "text-gray hover:bg-gray-50 hover:text-dark"
          )}
        >
          English
          {language === 'en' && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
        </button>
        <button
          onClick={() => setLanguage('vi')}
          className={cn(
            "flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
            language === 'vi' ? "bg-primary/10 text-primary" : "text-gray hover:bg-gray-50 hover:text-dark"
          )}
        >
          Tiếng Việt
          {language === 'vi' && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
        </button>
      </div>
    </Popover>
  );
}
