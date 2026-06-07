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
    <Pressable style={styles.row} onPress={onPress}>
      <Image source={{ uri: event.image }} style={styles.image} />
      <View style={styles.body}>
        <View style={[styles.tag, { backgroundColor: event.tagColor }]}>
          <Text style={styles.tagText}>{event.tag}</Text>
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: COLORS.card,
    marginRight: 14,
  },
  body: {
    flex: 1,
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '900',
  },
  title: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  metaText: {
    color: COLORS.muted,
    fontSize: 12,
    marginLeft: 5,
    flex: 1,
  },
});
