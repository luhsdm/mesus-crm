import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vllaourmslfczbqlpnrz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbGFvdXJtc2xmY3picWxwbnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzQ0MzMsImV4cCI6MjA4MzI1MDQzM30.nlwNZgLE8t40OvkL6mR__6Huy4eNdf9JZOkoHkij2o8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);