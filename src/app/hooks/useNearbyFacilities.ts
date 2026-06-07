import { useCallback, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import {
  facilityCategories,
  getApiErrorMessage,
  getNearbyFacilities,
  type FacilityCategory,
  type FacilityItem,
} from '../api';

export type FacilityCoords = {
  lat: number;
  lng: number;
};

export const INITIAL_FACILITY_SIZE = 10;
export const LOAD_MORE_FACILITY_SIZE = 5;
export const FACILITY_RADIUS_KM = 3;
export const facilityCategoryTabs = ['전체', ...facilityCategories] as const;

export type FacilityCategoryTab = (typeof facilityCategoryTabs)[number];

function getCategoriesForTab(tab: FacilityCategoryTab): FacilityCategory[] {
  return tab === '전체' ? [...facilityCategories] : [tab];
}

export function useNearbyFacilities() {
  const [coords, setCoords] = useState<FacilityCoords | null>(null);
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FacilityCategoryTab>('전체');
  const [hasMore, setHasMore] = useState(false);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const activeCategories = useMemo(() => getCategoriesForTab(selectedCategory), [selectedCategory]);
  const isBusy = isResolvingLocation || isLoadingInitial;

  const loadFacilities = useCallback(
    async ({
      location,
      categories,
      nextOffset,
      size,
      replace,
    }: {
      location: FacilityCoords;
      categories: FacilityCategory[];
      nextOffset: number;
      size: number;
      replace: boolean;
    }) => {
      if (replace) {
        setIsLoadingInitial(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        setErrorMessage('');
        const response = await getNearbyFacilities({
          lat: location.lat,
          lng: location.lng,
          radius: FACILITY_RADIUS_KM,
          offset: nextOffset,
          size,
          categories,
        });

        setFacilities((prev) => (replace ? response.items : [...prev, ...response.items]));
        setHasMore(response.hasMore);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error));
        if (replace) {
          setFacilities([]);
          setHasMore(false);
        }
      } finally {
        if (replace) {
          setIsLoadingInitial(false);
        } else {
          setIsLoadingMore(false);
        }
      }
    },
    [],
  );

  const requestCurrentLocation = useCallback(async () => {
    setIsResolvingLocation(true);
    setErrorMessage('');

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setErrorMessage('현재 위치 권한을 허용해야 주변 편의시설을 조회할 수 있습니다.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const nextCoords = {
        lat: currentLocation.coords.latitude,
        lng: currentLocation.coords.longitude,
      };

      setCoords(nextCoords);
      await loadFacilities({
        location: nextCoords,
        categories: activeCategories,
        nextOffset: 0,
        size: INITIAL_FACILITY_SIZE,
        replace: true,
      });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsResolvingLocation(false);
    }
  }, [activeCategories, loadFacilities]);

  const selectCategory = useCallback(
    (tab: FacilityCategoryTab) => {
      setSelectedCategory(tab);
      if (!coords) return;

      void loadFacilities({
        location: coords,
        categories: getCategoriesForTab(tab),
        nextOffset: 0,
        size: INITIAL_FACILITY_SIZE,
        replace: true,
      });
    },
    [coords, loadFacilities],
  );

  const loadMore = useCallback(() => {
    if (!coords || !hasMore || isLoadingMore || isLoadingInitial) return;

    void loadFacilities({
      location: coords,
      categories: activeCategories,
      nextOffset: facilities.length,
      size: LOAD_MORE_FACILITY_SIZE,
      replace: false,
    });
  }, [activeCategories, coords, facilities.length, hasMore, isLoadingInitial, isLoadingMore, loadFacilities]);

  return {
    coords,
    facilities,
    selectedCategory,
    hasMore,
    isBusy,
    isLoadingInitial,
    isLoadingMore,
    errorMessage,
    requestCurrentLocation,
    selectCategory,
    loadMore,
  };
}
