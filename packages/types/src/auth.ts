export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IAuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}
