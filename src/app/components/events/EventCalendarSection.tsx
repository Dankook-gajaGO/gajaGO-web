import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FestivalEventItem } from '../../data/festivalEvents';
import { COLORS, radius } from '../../theme';
import { padDatePart, parseDateKey } from '../../utils/date';

interface EventCalendarSectionProps {
  events: FestivalEventItem[];
  visibleMonth: Date;
  onMoveMonth: (offset: number) => void;
  onSelectEvent: (event: FestivalEventItem) => void;
}

const weekLabels = ['일', '월', '화', '수', '목', '금', '토'];
const maxEventsPerDay = 3;

function formatMonthLabel(date: Date) {
  return `${date.getFullYear()}.${padDatePart(date.getMonth() + 1)}`;
}

function getDateKey(year: number, month: number, day: number) {
  return `${year}-${padDatePart(month + 1)}-${padDatePart(day)}`;
}

function getEventEndDate(event: FestivalEventItem) {
  return event.endDate || event.startDate;
}

function isEventVisibleOnDate(event: FestivalEventItem, date: string) {
  if (!event.startDate) return false;
  return event.startDate <= date && getEventEndDate(event) >= date;
}

function getMonthEventCount(events: FestivalEventItem[], year: number, month: number) {
  const start = getDateKey(year, month, 1);
  const end = getDateKey(year, month, new Date(year, month + 1, 0).getDate());

  return events.filter((event) => event.startDate <= end && getEventEndDate(event) >= start).length;
}

export function EventCalendarSection({
  events,
  visibleMonth,
  onMoveMonth,
  onSelectEvent,
}: EventCalendarSectionProps) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = Array.from({ length: firstDay }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  const monthEventCount = getMonthEventCount(events, year, month);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.monthText}>{formatMonthLabel(visibleMonth)}</Text>
          <Text style={styles.subText}>서울 행사 {monthEventCount}개</Text>
        </View>
        <View style={styles.monthControls}>
          <Pressable style={styles.monthButton} onPress={() => onMoveMonth(-1)}>
            <Feather name="chevron-left" size={20} color={COLORS.ink} />
          </Pressable>
          <Pressable style={styles.monthButton} onPress={() => onMoveMonth(1)}>
            <Feather name="chevron-right" size={20} color={COLORS.ink} />
          </Pressable>
        </View>
      </View>

      <View style={styles.weekRow}>
        {weekLabels.map((label, index) => (
          <Text
            key={label}
            style={[styles.weekLabel, index === 0 ? styles.sunday : index === 6 ? styles.saturday : null]}
          >
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, index) => {
          if (!day) return <View key={`empty-${index}`} style={styles.cell} />;

          const date = getDateKey(year, month, day);
          const dayEvents = events
            .filter((event) => isEventVisibleOnDate(event, date))
            .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title));
          const hiddenCount = Math.max(0, dayEvents.length - maxEventsPerDay);

          return (
            <View key={date} style={styles.cell}>
              <Text style={[styles.dayText, parseDateKey(date).getDay() === 0 ? styles.sunday : null]}>
                {day}
              </Text>
              <View style={styles.eventList}>
                {dayEvents.slice(0, maxEventsPerDay).map((event) => (
                  <Pressable key={event.id} style={styles.eventPill} onPress={() => onSelectEvent(event)}>
                    <View style={[styles.eventDot, { backgroundColor: event.tagColor }]} />
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                  </Pressable>
                ))}
                {hiddenCount > 0 ? <Text style={styles.moreText}>외 {hiddenCount}개</Text> : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthText: {
    color: COLORS.ink,
    fontSize: 28,
    fontWeight: '900',
  },
  subText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  monthControls: {
    flexDirection: 'row',
    gap: 8,
  },
  monthButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: COLORS.ink,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingVertical: 8,
  },
  weekLabel: {
    width: `${100 / 7}%`,
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  sunday: {
    color: COLORS.red,
  },
  saturday: {
    color: COLORS.blue,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    minHeight: 126,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  dayText: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  eventList: {
    gap: 5,
  },
  eventPill: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  eventTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  moreText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
  },
});
