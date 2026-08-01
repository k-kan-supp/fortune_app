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
  /** 自分との相性（0〜100）。どちらかの生年月日が未登録なら null。 */
  compatibility: number | null;
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
  read: boolean;
  created_at: string;
}

export interface Match {
  match_id: string;
  user: PublicProfile;
  last_message: Message | null;
  unread_count: number;
  created_at: string;
}

/** 四柱推命の相性（内訳のコードは i18n で表示名に解決する）。 */
export interface CompatibilityFacet {
  code: string;
  value: number;
}

/** 判断の根拠を二人分重ねて見せるレーダー。値は構成比（%）。 */
export interface CompatibilityChart {
  key: string;
  axes: string[];
  you: number[];
  them: number[];
  max_value: number;
  /** 判断の決め手になった軸コード。 */
  highlight: string[];
}

export interface Compatibility {
  score: number;
  facets: CompatibilityFacet[];
  notes: string[];
  charts: CompatibilityChart[];
}
