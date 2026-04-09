// Supabase client config
// Remplace par tes vraies clés projet Supabase
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmZ3F6enVnZmNxd2l0YWRxZ3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2OTA5NjksImV4cCI6MjA5MTI2Njk2OX0.244shaPDNmP0YAglLe89cfh61qqvxZ-VUO0NWUdaFZ4';

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

export default _supabase;
