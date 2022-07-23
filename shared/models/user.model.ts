interface AuthDto {
  username: string;
  password: string;
}

interface AuthenticatedUser {
  username: string;
  accessToken: string;
  id: number;
}
