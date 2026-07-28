export interface User {
  id: string;
  email: string;
  is_verified: boolean;
}

export interface AuthResult {
  access_token: string;
  token_type: string;
  user: User;
}

export interface MessageResponse {
  message: string;
}
