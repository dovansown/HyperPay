import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useLanguage } from '@/context/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <nav className="bg-white py-4 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden p-2 -ml-2 text-gray hover:text-dark"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/" className="text-[20px] font-bold text-dark">
            <span className="text-primary">M</span>oneta
          </Link>
        </div>
        <ul className="hidden md:flex items-center gap-8">
          <li><Link to="/" className="text-[#4a4a4a] text-[15px] font-medium hover:text-primary transition-colors">{t('nav.home')}</Link></li>
          <li><Link to="/features" className="text-[#4a4a4a] text-[15px] font-medium hover:text-primary transition-colors">{t('nav.features')}</Link></li>
          <li><Link to="/pricing" className="text-[#4a4a4a] text-[15px] font-medium hover:text-primary transition-colors">{t('nav.pricing')}</Link></li>
          <li><Link to="/docs" className="text-[#4a4a4a] text-[15px] font-medium hover:text-primary transition-colors">{t('nav.docs')}</Link></li>
          <li><Link to="/blog" className="text-[#4a4a4a] text-[15px] font-medium hover:text-primary transition-colors">{t('nav.blog')}</Link></li>
        </ul>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <Link to="/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-[#4a4a4a] font-medium">{t('nav.login')}</Button>
          </Link>
          <Link to="/register">
            <Button size="sm">{t('nav.signup')}</Button>
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-[#e8e8e8] bg-white overflow-hidden absolute top-full left-0 w-full shadow-lg"
          >
            <ul className="flex flex-col p-4 gap-2">
              <li><Link to="/" className="block px-4 py-3 rounded-xl text-[15px] font-bold text-dark hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.home')}</Link></li>
              <li><Link to="/features" className="block px-4 py-3 rounded-xl text-[15px] font-bold text-dark hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.features')}</Link></li>
              <li><Link to="/pricing" className="block px-4 py-3 rounded-xl text-[15px] font-bold text-dark hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.pricing')}</Link></li>
              <li><Link to="/docs" className="block px-4 py-3 rounded-xl text-[15px] font-bold text-dark hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.docs')}</Link></li>
              <li><Link to="/blog" className="block px-4 py-3 rounded-xl text-[15px] font-bold text-dark hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.blog')}</Link></li>
              <li className="pt-2 border-t border-[#e8e8e8] mt-2">
                <Link to="/login" className="block px-4 py-3 rounded-xl text-[15px] font-bold text-primary hover:bg-primary/5" onClick={() => setIsMobileMenuOpen(false)}>{t('nav.login')}</Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
