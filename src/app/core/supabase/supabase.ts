import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { environment } from '../../../environments/environment';

export const supabase = createClient<Database>(
  environment.supabaseUrl,
  environment.supabaseKey
);
