import { useCallback } from 'react';
import { ActivityIndicator, FlatList, Linking, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { FacilityItem } from '../api';
import { AppHeader } from '../components/common/AppHeader';
import { EmptyState } from '../components/common/EmptyState';
import { FacilityCard } from '../components/facilities/FacilityCard';
import { FacilityCategoryTabs } from '../components/facilities/FacilityCategoryTabs';
import { FacilityErrorNotice } from '../components/facilities/FacilityErrorNotice';
import { FacilitySummary } from '../components/facilities/FacilitySummary';
import { LocationFloatingButton } from '../components/facilities/LocationFloatingButton';
import { useNearbyFacilities } from '../hooks/useNearbyFacilities';
import type { RootStackParamList } from '../routes';
import { COLORS } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Facilities'>;

function buildGoogleMapsUrl(item: FacilityItem) {
  const query = encodeURIComponent(`${item.lat},${item.lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export default function FacilitiesScreen({ navigation }: Props) {
  const {
    coords,
    facilities,
    selectedCategory,
    isBusy,
    isLoadingInitial,
    isLoadingMore,
    errorMessage,
    requestCurrentLocation,
    selectCategory,
    loadMore,
  } = useNearbyFacilities();

  const openFacilityMap = useCallback((item: FacilityItem) => {
    void Linking.openURL(buildGoogleMapsUrl(item));
  }, []);

  const renderFacility = useCallback(
    ({ item }: { item: FacilityItem }) => <FacilityCard item={item} onPress={openFacilityMap} />,
    [openFacilityMap],
  );

  return (
    <View style={styles.screen}>
      <AppHeader title="편의시설" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <FacilitySummary isBusy={isBusy} />
        <FacilityCategoryTabs selectedCategory={selectedCategory} onSelect={selectCategory} />
        <FacilityErrorNotice message={errorMessage} />

        <FlatList
          data={facilities}
          style={styles.list}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderFacility}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          ListEmptyComponent={
            isLoadingInitial ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={COLORS.teal} />
              </View>
            ) : (
              <EmptyState
                title={coords ? '표시할 편의시설이 없습니다' : '현재 위치를 확인해주세요'}
                description={
                  coords
                    ? '반경 3km 안에서 선택한 카테고리의 편의시설을 찾지 못했습니다.'
                    : '오른쪽 아래 버튼을 누르면 주변 은행, ATM, 편의점, 화장실을 찾습니다.'
                }
                actionLabel="현재 위치 찾기"
                onAction={requestCurrentLocation}
              />
            )
          }
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={COLORS.teal} />
              </View>
            ) : null
          }
        />
      </View>

      <LocationFloatingButton isBusy={isBusy} onPress={requestCurrentLocation} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.screen,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 96,
  },
  list: {
    flex: 1,
  },
  loadingWrap: {
    paddingVertical: 56,
  },
  footerLoading: {
    paddingVertical: 18,
  },
});
