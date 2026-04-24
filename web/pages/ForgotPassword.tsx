import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuthError, forgotPasswordThunk } from '@/store/slices/authSlice';

export function ForgotPassword() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);
  const error = useAppSelector((s) => s.auth.error);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const isSubmitting = status === 'loading';

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSent(false);
    dispatch(clearAuthError());
    try {
      await dispatch(forgotPasswordThunk({ email: email.trim() })).unwrap();
      setSent(true);
    } catch {
      // error is in store
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center items-center p-4 font-sans relative">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-gray hover:text-dark font-medium transition-colors">
        <ArrowLeft size={20} /> {t('common.back')}
      </Link>
      
      <Link to="/" className="text-[24px] font-bold text-dark mb-8">
        <span className="text-primary">M</span>oneta
      </Link>
      <Card className="w-full max-w-[440px] p-10">
        <h1 className="text-2xl font-bold text-dark mb-2 text-center">{t('auth.forgot_password')}</h1>
        <p className="text-gray text-center mb-8 text-sm">{t('auth.forgot_password_desc') || "Enter your email address and we'll send you instructions to reset your password."}</p>
        
        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-dark mb-2 ml-2">{t('auth.email')}</label>
            <Input
              type="email"
              placeholder="hello@example.com"
              className="bg-gray-50 border border-gray-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          
          {sent && (
            <div className="text-sm text-primary bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
              {t('auth.send_reset_link') || 'Send Reset Link'}: OK
            </div>
          )}

          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : (t('auth.send_reset_link') || 'Send Reset Link')}
          </Button>
        </form>
        
        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray hover:text-dark font-medium transition-colors">
            <ArrowLeft size={16} /> {t('auth.back_to_login') || 'Back to Login'}
          </Link>
        </div>
      </Card>
    </div>
  );
}
