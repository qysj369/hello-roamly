import { useMemo } from 'react';
import {
  resolveUserFacingError,
  type UserErrorContext,
  type UserFacingError,
} from '@/lib/errors/userFacingMessage';

export function useUserFacingError(
  error: unknown,
  context: UserErrorContext = 'default',
): UserFacingError | null {
  return useMemo(() => {
    if (!error) {
      return null;
    }
    return resolveUserFacingError(error, context);
  }, [error, context]);
}
