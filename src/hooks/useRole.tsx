import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'expert' | 'user';

interface RoleState {
  isAdmin: boolean;
  isExpert: boolean;
  hasContentAccess: boolean; // admin OR expert
  role: AppRole;
  loading: boolean;
}

export const useRole = (): RoleState => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isExpert, setIsExpert] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoles = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsExpert(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error checking roles:', error);
          setIsAdmin(false);
          setIsExpert(false);
        } else {
          const roles = data?.map(r => r.role) || [];
          setIsAdmin(roles.includes('admin'));
          setIsExpert(roles.includes('expert'));
        }
      } catch (error) {
        console.error('Error checking roles:', error);
        setIsAdmin(false);
        setIsExpert(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkRoles();
    }
  }, [user, authLoading]);

  const role: AppRole = isAdmin ? 'admin' : isExpert ? 'expert' : 'user';
  const hasContentAccess = isAdmin || isExpert;

  return { 
    isAdmin, 
    isExpert, 
    hasContentAccess,
    role,
    loading: loading || authLoading 
  };
};
