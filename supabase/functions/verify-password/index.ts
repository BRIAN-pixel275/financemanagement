import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    // Validate input
    if (!username || !password) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Missing credentials' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Only allow admin or viewer
    if (!['admin', 'viewer'].includes(username)) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Invalid username' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Connect to Supabase with service role (server side only)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch the hashed password for this username
    const key = username === 'admin' ? 'adminPass' : 'viewerPass';
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ ok: false, error: 'User not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Compare the plain password against the stored hash
    const match = await bcrypt.compare(password, data.value);

    return new Response(
      JSON.stringify({ ok: match, error: match ? null : 'Invalid password' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: match ? 200 : 401 }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});