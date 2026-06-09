import { apiRequest } from './client';

type SafeFoodApiRecord = Record<string, unknown>;

type SafeFoodListResponse = SafeFoodApiRecord[] | Record<string, unknown>;

export interface FoodRecommendation {
  id: string;
  name: string;
  category: string;
  tags: string[];
  note: string;
}

interface CollectedFoodRecord {
  category?: string;
  item: SafeFoodApiRecord;
}

const LIST_KEYS = ['data', 'foods', 'foodList', 'safeFoodList', 'result', 'results', 'list'];
const NAME_KEYS = ['food_nm', 'foodNm', 'foodName', 'name', 'title'];
const CATEGORY_KEYS = ['ty_nm', 'typeNm', 'typeName', 'type', 'category'];
const NOTE_KEYS = ['ingredient_nm', 'ingredientNm', 'ingredients', 'ingredient', 'note', 'description'];
const ID_KEYS = ['food_id', 'foodId', 'id', 'contentId'];

function isRecord(value: unknown): value is SafeFoodApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(record: SafeFoodApiRecord, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value);
  }

  return fallback;
}

function toFoodRecord(value: unknown, category: string, index: number): SafeFoodApiRecord | null {
  if (isRecord(value)) return value;
  if (value === undefined || value === null || !String(value).trim()) return null;

  return {
    id: `${category}-${index}-${String(value)}`,
    name: String(value),
  };
}

function collectFromCategories(response: SafeFoodApiRecord): CollectedFoodRecord[] {
  const categories = response.categories;
  if (!Array.isArray(categories)) return [];

  return categories.flatMap((categoryValue, categoryIndex) => {
    if (!isRecord(categoryValue)) return [];

    const category = readText(categoryValue, CATEGORY_KEYS, `카테고리 ${categoryIndex + 1}`);
    const foodItems = categoryValue.foods ?? categoryValue.items ?? categoryValue.list ?? categoryValue.foodNames;

    if (!Array.isArray(foodItems)) return [{ category, item: categoryValue }];

    return foodItems
      .map((foodName, foodIndex) => toFoodRecord(foodName, category, foodIndex))
      .filter((item): item is SafeFoodApiRecord => item !== null)
      .map((item) => ({ category, item }));
  });
}

function collectFromList(value: unknown, category: string): CollectedFoodRecord[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => toFoodRecord(item, category, index))
    .filter((item): item is SafeFoodApiRecord => item !== null)
    .map((item) => ({ category, item }));
}

function collectFoodRecords(response: SafeFoodListResponse): CollectedFoodRecord[] {
  if (Array.isArray(response)) return collectFromList(response, 'food');
  if (!isRecord(response)) return [];

  const categoryRecords = collectFromCategories(response);
  if (categoryRecords.length > 0) return categoryRecords;

  for (const key of LIST_KEYS) {
    const records = collectFromList(response[key], key);
    if (records.length > 0) return records;
  }

  return Object.entries(response).flatMap(([category, value]) => {
    const records = collectFromList(value, category);
    if (records.length > 0) return records;

    return isRecord(value) ? [{ category, item: value }] : [];
  });
}

export function normalizeSafeFoodResponse(
  response: SafeFoodListResponse,
  _selectedAllergies: string[]
): FoodRecommendation[] {
  return collectFoodRecords(response).map(({ category, item }, index) => {
    const name = readText(item, NAME_KEYS, `추천 음식 ${index + 1}`);
    const foodCategory = readText(item, CATEGORY_KEYS, category ?? '추천 음식');
    const note = readText(item, NOTE_KEYS);

    return {
      id: readText(item, ID_KEYS, `${category ?? 'food'}-${index}-${name}`),
      name,
      category: foodCategory,
      tags: [foodCategory].filter(Boolean),
      note,
    };
  });
}

export function getSafeFoodList(selectedAllergies: string[]) {
  return apiRequest<SafeFoodListResponse>('/api/food/safeFoodList', {
    method: 'POST',
    body: { selectedAllergies },
  });
}
