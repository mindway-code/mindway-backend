import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tpoczqeajbetvmqxheqv.supabase.co'; // seu projeto
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwb2N6cWVhamJldHZtcXhoZXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNjU5MDUsImV4cCI6MjA3NTk0MTkwNX0.tNdT3KHL-wAx4vC-PP7c_KTwrfpfgCPEG9qphiyXmU8'; // sua key

export const supabase = createClient(supabaseUrl, supabaseKey);


