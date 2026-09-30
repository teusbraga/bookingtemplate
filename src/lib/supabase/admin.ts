import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Service Role Client — bypass RLS.
 * USO EXCLUSIVO em Route Handlers da API e webhooks.
 * NUNCA use em Server Components ou Client Components.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin client');
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      cookies: {
        getAll() { return []; },
        setAll() {},
      },
    }
  );
}
