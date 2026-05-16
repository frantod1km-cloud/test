export interface JwtPayload {
  sub: string; // user id
  org: string | null; // organization id (null if switching)
  roles: string[];
  super: boolean; // is platform admin
  iat: number;
  exp: number;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  organizationName: string;
  organizationType: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface MeResponse {
  id: string;
  email: string;
  name: string;
  isPlatformAdmin: boolean;
  memberships: {
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    role: string;
    status: string;
  }[];
}
