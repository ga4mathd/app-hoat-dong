import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const generateSessionId = () => {
  return 'xxxx-xxxx-xxxx-xxxx'.replace(/x/g, () => 
    Math.floor(Math.random() * 16).toString(16)
  );
};

const SESSION_KEY = 'app_session_id';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds

export const useSessionTracking = () => {
  const location = useLocation();
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastPathRef = useRef<string>('');
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Get or create session ID
  const getSessionId = useCallback(() => {
    if (sessionIdRef.current) return sessionIdRef.current;
    
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    sessionIdRef.current = sessionId;
    return sessionId;
  }, []);

  // Record page view
  const recordPageView = useCallback(async (pagePath: string) => {
    const sessionId = getSessionId();
    
    try {
      await supabase.from('page_views').insert({
        user_id: user?.id || null,
        page_path: pagePath,
        session_id: sessionId,
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error recording page view:', error);
    }
  }, [user?.id, getSessionId]);

  // Create or update session
  const createSession = useCallback(async () => {
    const sessionId = getSessionId();
    
    try {
      // Try to insert new session (will fail silently if exists due to unique constraint)
      const { error } = await supabase.from('user_sessions').insert({
        user_id: user?.id || null,
        session_id: sessionId,
        started_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      });

      // If session already exists, just update it
      if (error && error.code === '23505') {
        await updateSessionActivity();
      }
    } catch (error) {
      console.error('Error creating session:', error);
    }
  }, [user?.id, getSessionId]);

  // Update session activity (heartbeat)
  const updateSessionActivity = useCallback(async () => {
    const sessionId = getSessionId();
    
    try {
      await supabase.from('user_sessions')
        .update({ 
          last_activity_at: new Date().toISOString(),
          user_id: user?.id || null
        })
        .eq('session_id', sessionId);
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }, [user?.id, getSessionId]);

  // End session
  const endSession = useCallback(async () => {
    const sessionId = getSessionId();
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    try {
      await supabase.from('user_sessions')
        .update({ 
          ended_at: new Date().toISOString(),
          duration_seconds: duration
        })
        .eq('session_id', sessionId);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [getSessionId]);

  // Initialize session on mount
  useEffect(() => {
    createSession();
    
    // Set up heartbeat
    heartbeatRef.current = setInterval(() => {
      updateSessionActivity();
    }, HEARTBEAT_INTERVAL);

    // Handle page unload
    const handleBeforeUnload = () => {
      endSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        endSession();
      } else if (document.visibilityState === 'visible') {
        createSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [createSession, updateSessionActivity, endSession]);

  // Track page views on route change
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Only record if path actually changed
    if (currentPath !== lastPathRef.current) {
      lastPathRef.current = currentPath;
      recordPageView(currentPath);
    }
  }, [location.pathname, recordPageView]);

  return { sessionId: sessionIdRef.current };
};
