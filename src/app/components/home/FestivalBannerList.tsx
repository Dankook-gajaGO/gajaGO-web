import { ActivityIndicator, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { FestivalEventItem } from '../../data/festivalEvents';
import { COLORS, radius } from '../../theme';

interface FestivalBannerListProps {
  events: FestivalEventItem[];
  isLoading: boolean;
  onSelectEvent: (event: FestivalEventItem) => void;
}

export function FestivalBannerList({ events, isLoading, onSelectEvent }: FestivalBannerListProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.teal} />
          <Text style={styles.loadingText}>행사 데이터를 불러오는 중입니다.</Text>
        </View>
      ) : null}
      {!isLoading && events.length === 0 ? (
        <View style={styles.loading}>
          <Text style={styles.loadingText}>표시할 행사 데이터가 없습니다.</Text>
        </View>
      ) : null}
      {events.map((event) => (
        <Pressable key={event.id} style={styles.card} onPress={() => onSelectEvent(event)}>
          <ImageBackground
            source={{ uri: event.image }}
            style={styles.image}
            imageStyle={styles.imageStyle}
          >
            <View style={styles.scrim} />
            <View style={[styles.tag, { backgroundColor: event.tagColor }]}>
              <Text style={styles.tagText}>{event.tag}</Text>
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.title} numberOfLines={2}>
                {event.title}
              </Text>
              <Text style={styles.meta}>{event.date}</Text>
            </View>
          </ImageBackground>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingLeft: 20,
    paddingRight: 10,
    marginBottom: 24,
  },
  loading: {
    width: 310,
    height: 190,
    borderRadius: radius.xl,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    paddingHorizontal: 18,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },
  card: {
    width: 310,
    height: 190,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: COLORS.card,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: radius.xl,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  tag: {
    position: 'absolute',
    top: 14,
    left: 14,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
  textWrap: {
    padding: 16,
  },
  title: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '900',
  },
  meta: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 12,
    marginTop: 5,
  },
});
