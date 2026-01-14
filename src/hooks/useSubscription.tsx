import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionStatus {
  status: 'pending_activation' | 'trial' | 'expired' | 'pro';
  activatedAt: string | null;
  trialEndsAt: string | null;
  proExpiresAt: string | null;
  daysRemaining: number | null;
  isPro: boolean;
  isExpired: boolean;
  isTrial: boolean;
  isPendingActivation: boolean;
  canAccessFullContent: boolean;
  loading: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({
    status: 'pending_activation',
    activatedAt: null,
    trialEndsAt: null,
    proExpiresAt: null,
    daysRemaining: null,
    isPro: false,
    isExpired: false,
    isTrial: false,
    isPendingActivation: true,
    canAccessFullContent: false,
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscriptionStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { data, error } = await supabase.rpc('check_subscription_status');
      
      if (error) {
        console.error('Error checking subscription:', error);
        setSubscriptionStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      const result = data as {
        success: boolean;
        status?: string;
        activated_at?: string;
        trial_ends_at?: string;
        pro_expires_at?: string;
        days_remaining?: number;
      };

      if (result.success) {
        const status = (result.status || 'pending_activation') as SubscriptionStatus['status'];
        setSubscriptionStatus({
          status,
          activatedAt: result.activated_at || null,
          trialEndsAt: result.trial_ends_at || null,
          proExpiresAt: result.pro_expires_at || null,
          daysRemaining: result.days_remaining ?? null,
          isPro: status === 'pro',
          isExpired: status === 'expired',
          isTrial: status === 'trial',
          isPendingActivation: status === 'pending_activation',
          canAccessFullContent: status === 'trial' || status === 'pro',
          loading: false,
        });
      } else {
        setSubscriptionStatus(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setSubscriptionStatus(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  const activateTrial = useCallback(async () => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.rpc('activate_trial');
      
      if (error) {
        return { success: false, error: error.message };
      }

      const result = data as { success: boolean; error?: string; trial_ends_at?: string };
      
      if (result.success) {
        await checkSubscription();
        return { success: true, trialEndsAt: result.trial_ends_at };
      }
      
      return { success: false, error: result.error };
    } catch (err) {
      return { success: false, error: 'Failed to activate trial' };
    }
  }, [user, checkSubscription]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return {
    ...subscriptionStatus,
    activateTrial,
    refreshSubscription: checkSubscription,
  };
}
