import { useEffect, useState } from 'react';
import {
  ApiError,
  getApiErrorMessage,
  getSafeFoodList,
  hydrateAuthToken,
  normalizeSafeFoodResponse,
  type FoodRecommendation,
} from '../api';

function getFoodStatusMessage(error: unknown) {
  if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
    return '로그인 인증이 없거나 만료되어 음식 데이터를 불러오지 못했습니다. 다시 로그인해주세요.';
  }

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

      const token = await hydrateAuthToken();
      if (!active) return;

      if (!token) {
        setFoods([]);
        setStatusMessage('로그인해야 음식 정보를 확인할 수 있습니다.');
        setIsLoading(false);
        return;
      }

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
