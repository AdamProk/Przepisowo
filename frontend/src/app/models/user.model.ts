import { Recipe } from './recipe.model';

export interface User {
  id: number;
  username: string;
  email: string;
  profilePicture: string;
  recipes: Recipe[];
  adminPrivileges: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Use this interface when you need a full user profile
export interface UserProfile extends User {
  recipes: Recipe[];
  profilePicture: string;
  totalRecipes?: number;
  averageRating?: number;
} 