import { useEffect, useState } from 'react';
import {
  getApiErrorMessage,
  getSafeFoodList,
  normalizeSafeFoodResponse,
  type FoodRecommendation,
} from '../api';

// 음식 알러지 필터는 비회원도 사용 (로그인 불필요)
function getFoodStatusMessage(error: unknown) {
  return `음식 목록을 불러오지 못했습니다. ${getApiErrorMessage(error)}`;
}

export function useSafeFoods(selectedAllergies: string[]) {
  const [foods, setFoods] = useState<FoodRecommendation[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadFoods() {
      setIsLoading(true);
      setStatusMessage('');

      try {
        const response = await getSafeFoodList(selectedAllergies);
        if (!active) return;

        setFoods(normalizeSafeFoodResponse(response, selectedAllergies));
      } catch (error) {
        if (!active) return;

        setFoods([]);
        setStatusMessage(getFoodStatusMessage(error));
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadFoods();

    return () => {
      active = false;
    };
  }, [selectedAllergies]);

  return {
    foods,
    statusMessage,
    isLoading,
  };
}
