import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://supabase.com/dashboard/project/lpilurpfeynuyqnridgi';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwaWx1cnBmZXludXlxbnJpZGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NzgzMzQsImV4cCI6MjA5NjA1NDMzNH0.Y__tt_kekhKyHHrrAprXYG-ZFsinuRO0Mxl7b93AYHw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);