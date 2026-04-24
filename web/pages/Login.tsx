import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuthError, fetchCurrentUser, loginThunk } from '@/store/slices/authSlice';
import { toast } from 'sonner';

export function Login() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const status = useAppSelector((s) => s.auth.status);
  const error = useAppSelector((s) => s.auth.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isSubmitting = status === 'loading';

  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    try {
      const result = await dispatch(loginThunk({ email: email.trim(), password })).unwrap();
      
      // Check if needs email verification
      if (result.needs_email_verify && result.verification_id) {
        toast.info(t('auth.verify_email_required') || 'Please verify your email to continue');
        navigate('/verify-otp', { 
          replace: true, 
          state: { 
            verification_id: result.verification_id,
            type: 'email',
            email: email.trim()
          } 
        });
        return;
      }
      
      // Check if needs 2FA
      if (result.needs_2fa && result.temp_token) {
        navigate('/verify-otp', {
          replace: true,
          state: {
            temp_token: result.temp_token,
            type: '2fa',
            email: email.trim()
          }
        });
        return;
      }

      // Check if needs login verification (new device)
      if (result.needs_login_verify && result.verification_id) {
        toast.info(t('auth.verify_login_required') || 'Please verify this login from a new device');
        navigate('/verify-otp', {
          replace: true,
          state: {
            verification_id: result.verification_id,
            type: 'login',
            email: email.trim()
          }
        });
        return;
      }
      
      // Normal login - go to dashboard
      await dispatch(fetchCurrentUser()).unwrap();
      toast.success(t('auth.login_success') || 'Login successful!');
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.login_failed') || 'Login failed';
      toast.error(errorMessage);
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
        <h1 className="text-2xl font-bold text-dark mb-2 text-center">{t('auth.login_title')}</h1>
        <p className="text-gray text-center mb-8 text-sm">{t('auth.login_subtitle')}</p>
        
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
          <div>
            <div className="flex justify-between items-center mb-2 ml-2 mr-2">
              <label className="block text-sm font-medium text-dark">{t('auth.password')}</label>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">{t('auth.forgot_password')}</Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              className="bg-gray-50 border border-gray-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          
          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : t('nav.login')}
          </Button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray">
          {t('auth.no_account')} <Link to="/register" className="text-primary font-semibold hover:underline">{t('nav.signup')}</Link>
        </div>
      </Card>
    </div>
  );
}
