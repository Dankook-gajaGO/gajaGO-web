import Feather from '@expo/vector-icons/Feather';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { FestivalEventItem } from '../../data/festivalEvents';
import { COLORS, radius } from '../../theme';

interface EventListItemProps {
  event: FestivalEventItem;
  onPress: () => void;
}

export function EventListItem({ event, onPress }: EventListItemProps) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed ? styles.pressed : null]} onPress={onPress} accessibilityRole="button">
      <Image source={{ uri: event.image }} style={styles.image} />
      <View style={styles.body}>
        <Text style={[styles.tagText, { color: event.tagColor }]}>{event.tag}</Text>
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={13} color={COLORS.muted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Feather name="calendar" size={13} color={COLORS.muted} />
          <Text style={styles.metaText}>{event.date}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 116,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.line,
  },
  pressed: {
    backgroundColor: COLORS.card,
  },
  image: {
    width: 92,
    height: 92,
    borderRadius: radius.lg,
    backgroundColor: COLORS.card,
    marginRight: 14,
  },
  body: {
    flex: 1,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  metaText: {
    color: COLORS.muted,
    fontSize: 13,
    marginLeft: 5,
    flex: 1,
  },
});
