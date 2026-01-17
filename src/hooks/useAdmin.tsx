// This hook is deprecated. Use useRole instead.
// Keeping for backward compatibility
import { useRole } from './useRole';

export const useAdmin = () => {
  const { isAdmin, loading } = useRole();
  return { isAdmin, loading };
};
