import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { getApiErrorMessage, getMyAllergies, saveMyAllergies } from '../api';
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
import { ensureLoggedIn, isLoggedIn } from '../utils/requireLogin';
import { buildAllergyCard } from '../utils/cards';

type Props = NativeStackScreenProps<RootStackParamList, 'Food'>;

export default function FoodScreenAllergy({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const { foods, statusMessage, isLoading } = useSafeFoods(selectedAllergies);
  const [allergyMessage, setAllergyMessage] = useState('');
  const [isSavingAllergies, setIsSavingAllergies] = useState(false);

  // 회원이면 저장해 둔 내 알러지를 필터로 불러옴 (비회원은 매번 직접 선택)
  useEffect(() => {
    let active = true;
    void (async () => {
      if (!(await isLoggedIn())) return;
      try {
        const { allergies } = await getMyAllergies();
        if (active && allergies.length > 0) {
          setSelectedAllergies(allergies);
          setAllergyMessage('저장한 내 알러지를 불러왔어요');
        }
      } catch {
        // 불러오기 실패해도 직접 선택해서 쓸 수 있음
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const saveAllergies = async () => {
    if (isSavingAllergies || !(await ensureLoggedIn(navigation))) return;
    setIsSavingAllergies(true);
    try {
      await saveMyAllergies(selectedAllergies);
      setAllergyMessage(selectedAllergies.length > 0 ? '내 알러지로 저장했어요' : '저장한 알러지를 비웠어요');
    } catch (error) {
      setAllergyMessage(getApiErrorMessage(error));
    } finally {
      setIsSavingAllergies(false);
    }
  };

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

  const allergySummary =
    selectedAllergies.length > 0 ? `제외: ${selectedAllergies.join(' · ')}` : '제외 성분 없음';

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
        <View style={styles.saveRow}>
          <Pressable
            style={[styles.saveButton, isSavingAllergies ? styles.saveButtonDisabled : null]}
            onPress={saveAllergies}
            disabled={isSavingAllergies}
            accessibilityRole="button"
          >
            <Text style={styles.saveButtonText}>내 알러지로 저장</Text>
          </Pressable>
          {selectedAllergies.length > 0 ? (
            <Pressable
              style={[styles.saveButton, styles.cardButton]}
              onPress={() => navigation.navigate('ShowCard', buildAllergyCard(selectedAllergies))}
              accessibilityRole="button"
            >
              <Text style={styles.saveButtonText}>알러지 카드</Text>
            </Pressable>
          ) : null}
          {allergyMessage ? <Text style={styles.saveMessage}>{allergyMessage}</Text> : null}
        </View>
        <View style={styles.resultSummary}>
          <Text style={styles.resultCount}>추천 음식 {filteredFoods.length}개</Text>
          <Text style={styles.resultCondition}>{allergySummary}</Text>
        </View>
        {isLoading ? (
          <View style={styles.statusRow}>
            <ActivityIndicator color={COLORS.teal} />
            <Text style={styles.statusText}>불러오는 중이에요</Text>
          </View>
        ) : null}
        {statusMessage ? <Text style={styles.errorText}>{statusMessage}</Text> : null}
        <Text style={styles.disclaimer}>대표 레시피 기준 참고 정보예요. 식당마다 재료가 다를 수 있으니 알러지 카드로 꼭 확인하세요.</Text>
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
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  saveButton: {
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.teal,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  cardButton: {
    marginLeft: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: COLORS.teal,
    fontSize: 13,
    fontWeight: '800',
  },
  saveMessage: {
    flexShrink: 1,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 10,
  },
  resultSummary: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
  },
  resultCount: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  resultCondition: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
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
  disclaimer: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 8,
  },
  list: {
    padding: 20,
    paddingTop: 6,
    paddingBottom: 28,
  },
});
