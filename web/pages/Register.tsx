import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearAuthError, fetchCurrentUser, registerThunk } from '@/store/slices/authSlice';
import { toast } from 'sonner';

export function Register() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const status = useAppSelector((s) => s.auth.status);
  const token = useAppSelector((s) => s.auth.token);
  const error = useAppSelector((s) => s.auth.error);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isSubmitting = status === 'loading';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAuthError());
    try {
      const result = await dispatch(registerThunk({ fullName: fullName.trim(), email: email.trim(), password })).unwrap();
      
      // Backend returns verification_id if email needs verification
      if (result.verification_id) {
        toast.success(t('auth.register_success') || 'Registration successful! Please verify your email.');
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
      
      // If already verified or no verification needed, go to dashboard
      if (token) {
        await dispatch(fetchCurrentUser()).unwrap();
        toast.success(t('auth.register_success') || 'Registration successful!');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.register_failed') || 'Registration failed';
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
        <h1 className="text-2xl font-bold text-dark mb-2 text-center">{t('auth.register_title')}</h1>
        <p className="text-gray text-center mb-8 text-sm">{t('auth.register_subtitle')}</p>
        
        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-dark mb-2 ml-2">{t('auth.full_name')}</label>
            <Input
              type="text"
              placeholder="John Doe"
              className="bg-gray-50 border border-gray-200"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
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
            <label className="block text-sm font-medium text-dark mb-2 ml-2">{t('auth.password')}</label>
            <Input
              type="password"
              placeholder="••••••••"
              className="bg-gray-50 border border-gray-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          
          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : t('nav.signup')}
          </Button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray">
          {t('auth.have_account')} <Link to="/login" className="text-primary font-semibold hover:underline">{t('nav.login')}</Link>
        </div>
      </Card>
    </div>
  );
}
