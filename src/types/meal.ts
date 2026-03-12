export interface Meal {
  id: string;
  name: string;
  type: MealType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string; // ISO
}

export type MealType = 'cafe' | 'almoco' | 'lanche' | 'janta' | 'outro';

export const MEAL_TYPES: { value: MealType; label: string; icon: string }[] = [
  { value: 'cafe', label: 'Café da manhã', icon: '☕' },
  { value: 'almoco', label: 'Almoço', icon: '🍽️' },
  { value: 'lanche', label: 'Lanche', icon: '🍎' },
  { value: 'janta', label: 'Jantar', icon: '🥗' },
  { value: 'outro', label: 'Outro', icon: '🍴' },
];

export const MACRO_COLORS = {
  protein: 'hsl(200, 80%, 55%)',
  carbs: 'hsl(45, 90%, 55%)',
  fat: 'hsl(12, 90%, 60%)',
};
