import { Recipe } from './recipe.model';

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  profilePicture?: string;
  recipes?: Recipe[];
  adminPrivileges?: boolean;
} 