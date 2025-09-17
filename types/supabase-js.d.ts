declare module "@supabase/supabase-js" {
  export type SupabaseClient = {
    auth: Record<string, unknown>;
    from: (table: string) => any;
  };
  export function createClient(
    url: string,
    key: string,
    options?: Record<string, unknown>,
  ): SupabaseClient;
}
