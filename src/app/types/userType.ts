export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface IReview {
  eventId:string;
  rating: number;
  comment: string
}

export type UserRole = 'ADMIN' | 'HOST' | 'USER';

export interface IVerifiedUser {
  id: string;
  email:string;
  role: UserRole;
  iat:number;
  exp:number
}