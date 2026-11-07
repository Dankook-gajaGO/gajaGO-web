// 직원·택시 기사에게 보여줄 한국어 카드 문구 (영어는 사용자가 내용을 이해하도록 함께 표시)
export type ShowCard = { title: string; korean: string; english: string };

const ALLERGY_EN: Record<string, string> = {
  난류: 'eggs',
  우유: 'milk / dairy',
  밀: 'wheat',
  메밀: 'buckwheat',
  견과류: 'nuts',
  대두: 'soybeans',
  갑각류: 'shellfish (shrimp, crab)',
  해산물: 'fish / seafood',
  돼지고기: 'pork',
  쇠고기: 'beef',
  닭고기: 'chicken',
};

// 직원이 재료를 떠올리기 쉽도록 대표 재료를 함께 적음
const ALLERGY_EXAMPLES: Record<string, string> = {
  난류: '계란',
  우유: '우유, 버터, 치즈',
  밀: '밀가루, 간장, 고추장',
  메밀: '메밀면, 냉면',
  견과류: '땅콩, 잣, 호두',
  대두: '콩, 두부, 간장, 된장',
  갑각류: '새우, 게, 새우젓',
  해산물: '생선, 멸치, 굴, 오징어, 액젓',
  돼지고기: '돼지고기, 햄, 베이컨',
  쇠고기: '소고기, 사골 육수',
  닭고기: '닭고기, 닭 육수',
};

export function buildAllergyCard(allergies: string[]): ShowCard {
  const lines = allergies.map((a) => `· ${a} (${ALLERGY_EXAMPLES[a] ?? a})`).join('\n');
  return {
    title: '알러지 카드',
    korean: `저는 아래 음식에 알러지가 있어요.\n\n${lines}\n\n이 재료가 들어간 음식은 먹을 수 없어요.\n음식에 들어가는지 확인해 주세요. 감사합니다.`,
    english: `I am allergic to: ${allergies.map((a) => ALLERGY_EN[a] ?? a).join(', ')}. Please check that my food does not contain them.`,
  };
}

export function buildTaxiCard(name: string, address?: string): ShowCard {
  return {
    title: '택시 카드',
    korean: `여기로 가 주세요.\n\n${name}${address ? `\n${address}` : ''}`,
    english: 'Please take me to this place.',
  };
}

export const HELP_CARD: ShowCard = {
  title: '도움 요청 카드',
  korean: '도와주세요.\n저는 한국어를 잘 못해요.\n\n관광통역안내전화 1330에\n전화해 주실 수 있나요?',
  english: 'Please help me. I do not speak Korean well. Could you call the tourist helpline 1330 for me?',
};

const assert = (ok: boolean, msg: string) => {
  if (!ok) throw new Error(msg);
};
// self-check: 알러지 이름이 앱 필터(data/food.ts)와 같아야 영어·예시가 붙음
assert(Object.keys(ALLERGY_EN).length === 11 && Object.keys(ALLERGY_EXAMPLES).length === 11, 'allergy card names out of sync');
