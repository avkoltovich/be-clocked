interface AuthDto {
  email: string;
  password: string;
}

interface NewUser {
  password: string;
  email: string;
  name: string;
  surname: string;
  gender: Gender;
  dob: string;
  phone: string;
  city: string;
  team: string;
}

interface AuthenticatedUser {
  email: string;
  accessToken: string;
  id: number;
}

enum Gender {
  man = "MAN",
  woman = "WOMAN"
}
