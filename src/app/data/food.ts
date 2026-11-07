export const foodAllergies = [
  '난류',
  '우유',
  '밀',
  '메밀',
  '견과류',
  '대두',
  '갑각류',
  '해산물',
  '돼지고기',
  '쇠고기',
  '닭고기',
];

// 식단·취향 필터: 재료 이름으로 거름 (서버 변경 없음). '할랄'·'비건' 인증이 아니라 재료 기준 참고용
const SPICY = ['고추장', '고춧가루', '굵은고춧가루', '고운고춧가루', '홍고추', '청고추', '풋고추', '실고추', '고추기름', '두반장'];
const ALCOHOL = ['청주', '맛술', '미림', '정종', '술', '레드와인'];
const PORK = ['돼지고기', '돼기고기', '햄', '베이컨', '순대', '돼지갈비', '다진돼지고기', '프랑크소시지', '비엔나소시지'];
const MEAT_SEAFOOD = [
  ...PORK,
  '쇠고기', '닭고기', '닭', '안심', '갈비', '양지머리', '다진쇠고기', '곱창', '사골', '도가니', '육수', '닭육수', '쇠고기육수', '쇠고기 육수',
  '닭봉', '채썬쇠고기', '장조림', '양', '소 잡뼈',
  '멸치', '어묵', '굴', '새우', '새우젓', '생새우', '잔새우', '꽃게', '오징어', '낙지', '바지락', '홍합', '조갯살', '명란', '아귀', '대구', '대구살',
  '고등어', '갈치', '전복', '장어', '참치', '참치통조림', '꽁치', '코다리', '미더덕', '까나리액젓', '젓국', '굴소스', '다시물', '청정원어장',
];

export const dietFilters = [
  { id: 'mild', label: '안 매운', exclude: SPICY },
  { id: 'noPorkAlcohol', label: '돼지고기·술 없음', exclude: [...PORK, ...ALCOHOL] },
  { id: 'noAlcohol', label: '술 재료 없음', exclude: ALCOHOL },
  { id: 'vegetarian', label: '채식', exclude: MEAT_SEAFOOD },
] as const;

export function passesDietFilters(ingredients: string[], selectedIds: string[]) {
  return dietFilters
    .filter((f) => selectedIds.includes(f.id))
    .every((f) => !ingredients.some((ing) => (f.exclude as readonly string[]).includes(ing)));
}
// self-check
if (passesDietFilters(['고추장', '밥'], ['mild']) || !passesDietFilters(['간장', '밥'], ['mild', 'vegetarian'])) {
  throw new Error('passesDietFilters self-check failed');
}
