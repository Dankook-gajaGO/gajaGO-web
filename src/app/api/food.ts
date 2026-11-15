import { apiRequest } from './client';

interface SafeFoodItem {
  foodId: number;
  foodName: string;
  category: string;
  ingredients: string[];
}

interface SafeFoodListResponse {
  categories: Array<{ category: string; foods: SafeFoodItem[] }>;
}

export interface FoodRecommendation {
  id: string;
  name: string;
  category: string;
  tags: string[];
  note: string;
}

export function normalizeSafeFoodResponse(response: SafeFoodListResponse): FoodRecommendation[] {
  return (response.categories ?? []).flatMap(({ category, foods }) =>
    (foods ?? []).map((food) => ({
      id: String(food.foodId),
      name: food.foodName,
      category,
      tags: [category],
      note: food.ingredients.join(', '),
    }))
  );
}

export function getSafeFoodList(selectedAllergies: string[]) {
  return apiRequest<SafeFoodListResponse>('/api/food/safeFoodList', {
    method: 'POST',
    body: { selectedAllergies },
    auth: false, // 비회원도 사용
  });
}
