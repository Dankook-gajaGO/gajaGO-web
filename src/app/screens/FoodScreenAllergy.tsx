import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../components/common/AppHeader';
import { EmptyState } from '../components/common/EmptyState';
import { SearchField } from '../components/common/SearchField';
import { AllergyFilterGrid } from '../components/food/AllergyFilterGrid';
import { FoodCard } from '../components/food/FoodCard';
import { foodAllergies } from '../data/food';
import { useSafeFoods } from '../hooks/useSafeFoods';
import type { RootStackParamList } from '../routes';
import { COLORS } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Food'>;

export default function FoodScreenAllergy({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const { foods, statusMessage, isLoading } = useSafeFoods(selectedAllergies);

  const filteredFoods = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return foods;

    return foods.filter((food) =>
      `${food.name} ${food.category} ${food.tags.join(' ')} ${food.note}`.toLowerCase().includes(term)
    );
  }, [foods, query]);

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((items) =>
      items.includes(allergy) ? items.filter((item) => item !== allergy) : [...items, allergy]
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="음식 알레르기" onBack={() => navigation.goBack()} />
      <View style={styles.topContent}>
        <SearchField value={query} onChange={setQuery} placeholder="음식 또는 분류 검색" />
        <Text style={styles.filterTitle}>피해야 하는 성분</Text>
        <AllergyFilterGrid
          allergies={foodAllergies}
          selectedAllergies={selectedAllergies}
          onToggle={toggleAllergy}
        />
        {isLoading ? (
          <View style={styles.statusRow}>
            <ActivityIndicator color={COLORS.teal} />
            <Text style={styles.statusText}>음식 목록을 불러오는 중입니다.</Text>
          </View>
        ) : null}
        {statusMessage ? <Text style={styles.errorText}>{statusMessage}</Text> : null}
      </View>

      <FlatList
        data={filteredFoods}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <FoodCard item={item} />}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              title="추천 음식이 없습니다"
              description="다른 알레르기 조건을 선택하거나 잠시 후 다시 시도해주세요."
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.screen,
  },
  topContent: {
    padding: 20,
    paddingBottom: 6,
  },
  filterTitle: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 16,
    marginBottom: 10,
  },
  statusRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    color: COLORS.muted,
    fontSize: 12,
    marginLeft: 8,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  list: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
});
