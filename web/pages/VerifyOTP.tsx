import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';

export function VerifyOTP() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    setIsResending(true);
    setTimeout(() => {
      setTimer(30);
      setIsResending(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 6) {
      // Mock verification
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-section-bg flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 md:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-[24px] font-bold text-dark mb-2">{t('auth.verify_title')}</h1>
            <p className="text-gray text-[14px]">
              {t('auth.verify_desc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="flex-1 h-12 sm:h-14 w-0 text-center text-[18px] sm:text-[20px] font-bold text-dark bg-gray-50 border border-[#e8e8e8] rounded-xl outline-none focus:border-primary focus:bg-white transition-all"
                />
              ))}
            </div>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-[13px] text-gray">
                  {t('auth.resend_after')} <span className="text-primary font-bold">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-[13px] text-primary font-bold hover:underline disabled:opacity-50"
                >
                  {isResending ? t('common.loading') : t('auth.resend')}
                </button>
              )}
            </div>

            <Button type="submit" className="w-full py-4 rounded-xl text-[15px] font-bold" disabled={otp.some(d => !d)}>
              {t('common.confirm')}
            </Button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="w-full flex items-center justify-center gap-2 text-[13px] text-gray hover:text-dark transition-colors"
            >
              <ArrowLeft size={14} /> {t('auth.back_to_register')}
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
