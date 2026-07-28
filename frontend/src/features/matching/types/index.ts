export interface PublicProfile {
  user_id: string;
  display_name: string | null;
  age: number | null;
  gender: string | null;
  prefecture: string | null;
  occupation: string | null;
  height_cm: number | null;
  body_type: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export interface LikeResult {
  matched: boolean;
  match_id: string | null;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  image_url: string | null;
  is_mine: boolean;
  created_at: string;
}

export interface Match {
  match_id: string;
  user: PublicProfile;
  last_message: Message | null;
  unread_count: number;
  created_at: string;
}
