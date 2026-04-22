export interface IUserData {
  id?: string;
  name: string;
  email: string;
  birthday?: string | null;
  city: string;
  photo_url?: string;
  bio?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  role_id?: number;
  is_online?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}
