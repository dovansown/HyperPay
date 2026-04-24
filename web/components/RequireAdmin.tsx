import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppSelector } from '@/store/hooks';

interface RequireAdminProps {
  children: React.ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Không render gì nếu user không phải ADMIN
  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}
