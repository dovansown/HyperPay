import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OTPInput } from '@/components/ui/OTPInput';
import { ShieldCheck, ArrowLeft, Mail, Lock, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch } from '@/store/hooks';
import { fetchCurrentUser } from '@/store/slices/authSlice';
import { toast } from 'sonner';

type VerificationType = 'email' | 'login' | '2fa';

type LocationState = {
  verification_id?: string;
  temp_token?: string;
  type?: VerificationType;
  email?: string;
};

export function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { t } = useLanguage();
  
  const state = (location.state as LocationState) || {};
  const verificationType: VerificationType = state.type || 'email';
  const verificationId = state.verification_id;
  const tempToken = state.temp_token;
  const email = state.email;

  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if no verification data
    if (!verificationId && !tempToken) {
      navigate('/login', { replace: true });
    }
  }, [verificationId, tempToken, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResend = async () => {
    setIsResending(true);
    try {
      // Resend code based on type
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
      
      if (verificationType === 'email') {
        // For email verification, call send-verification endpoint
        const token = localStorage.getItem('token');
        await fetch(`${apiUrl}/users/me/email/send-verification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
      }
      
      toast.success(t('auth.code_resent') || 'Verification code resent successfully');
      setTimer(30);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend code';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
      
      if (verificationType === '2fa') {
        // 2FA verification
        const res = await fetch(`${apiUrl}/auth/2fa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            temp_token: tempToken,
            code: otp,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error?.message || data.message || 'Verification failed');
        }

        const data = await res.json();
        const token = data.data?.token || data.token;
        
        if (token) {
          localStorage.setItem('token', token);
          await dispatch(fetchCurrentUser()).unwrap();
          toast.success(t('auth.verification_success') || 'Verification successful!');
          navigate('/dashboard', { replace: true });
        }
      } else {
        // Email or Login verification
        const res = await fetch(`${apiUrl}/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verification_id: verificationId,
            code: otp,
            type: verificationType,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error?.message || data.message || 'Verification failed');
        }

        const data = await res.json();
        const token = data.data?.token || data.token;
        
        if (token) {
          localStorage.setItem('token', token);
          await dispatch(fetchCurrentUser()).unwrap();
          toast.success(t('auth.verification_success') || 'Verification successful!');
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIcon = () => {
    switch (verificationType) {
      case 'email':
        return <Mail size={32} />;
      case 'login':
        return <Lock size={32} />;
      case '2fa':
        return <Smartphone size={32} />;
      default:
        return <ShieldCheck size={32} />;
    }
  };

  const getTitle = () => {
    switch (verificationType) {
      case 'email':
        return t('auth.verify_email_title') || 'Verify Your Email';
      case 'login':
        return t('auth.verify_login_title') || 'Verify Login';
      case '2fa':
        return t('auth.verify_2fa_title') || 'Two-Factor Authentication';
      default:
        return t('auth.verify_title');
    }
  };

  const getDescription = () => {
    switch (verificationType) {
      case 'email':
        return t('auth.verify_email_desc') || `We've sent a 6-digit code to ${email || 'your email'}. Please enter it below.`;
      case 'login':
        return t('auth.verify_login_desc') || `We detected a login from a new device. Please enter the 6-digit code sent to ${email || 'your email'}.`;
      case '2fa':
        return t('auth.verify_2fa_desc') || 'Enter the 6-digit code from your authenticator app.';
      default:
        return t('auth.verify_desc');
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
              {getIcon()}
            </div>
            <h1 className="text-[24px] font-bold text-dark mb-2">{getTitle()}</h1>
            <p className="text-gray text-[14px]">
              {getDescription()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <OTPInput 
              length={6}
              value={otp}
              onChange={setOtp}
              disabled={isSubmitting}
            />

            {verificationType !== '2fa' && (
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
            )}

            <Button 
              type="submit" 
              className="w-full py-4 rounded-xl text-[15px] font-bold" 
              disabled={otp.length !== 6 || isSubmitting}
            >
              {isSubmitting ? t('common.loading') : t('common.confirm')}
            </Button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 text-[13px] text-gray hover:text-dark transition-colors"
            >
              <ArrowLeft size={14} /> {t('auth.back_to_login') || 'Back to Login'}
            </button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
