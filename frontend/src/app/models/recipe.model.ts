export interface Nutrients {
  calories: number;
  proteins?: number;
  carbohydrates?: number;
  fats?: number;
  vitamins?: string;
  minerals?: string;
}

export interface Recipe {
  id: number;
  name?: string;
  recipeName?: string;
  description?: string;
  ingredients?: Ingredient[];
  preparationSteps?: PreparationStep[];
  prepTime?: number;
  time?: number;
  amount?: number;
  score?: number;
  rating?: number;
  comments_count?: number;
  diet_plan_count?: number;
  comments?: Comment[];
  recipePicture?: string;
  image?: string;
  cuisines?: any[];
  nutrients?: any;
  created_at?: string;
  recipe_date?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    profilePicture?: string;
  };
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  date?: string;
  rating?: number;
  user: {
    id: number;
    username: string;
    profilePicture?: string;
  };
}

export interface Ingredient {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  optional: boolean;
}

export interface PreparationStep {
  id?: number;
  order: number;
  description: string;
  time?: number;
  tip?: string;
}

export const AVAILABLE_UNITS = [
  { value: 'g', label: 'gram' },
  { value: 'kg', label: 'kilogram' },
  { value: 'ml', label: 'mililitr' },
  { value: 'l', label: 'litr' },
  { value: 'szt', label: 'sztuka' },
  { value: 'łyżka', label: 'łyżka' },
  { value: 'łyżeczka', label: 'łyżeczka' },
  { value: 'szklanka', label: 'szklanka' },
  { value: 'szczypta', label: 'szczypta' }
]; 