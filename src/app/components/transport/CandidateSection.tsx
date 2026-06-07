import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { PlaceCandidate } from '../../api';
import { COLORS, radius } from '../../theme';

interface CandidateSectionProps {
  title: string;
  candidates: PlaceCandidate[];
  selected: PlaceCandidate | null;
  onSelect: (candidate: PlaceCandidate) => void;
}

export function CandidateSection({
  title,
  candidates,
  selected,
  onSelect,
}: CandidateSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {candidates.map((candidate) => {
        const active = selected?.name === candidate.name && selected?.address === candidate.address;

        return (
          <Pressable
            key={`${candidate.name}-${candidate.lat}-${candidate.lng}`}
            style={[styles.card, active ? styles.activeCard : null]}
            onPress={() => onSelect(candidate)}
          >
            <Text style={[styles.name, active ? styles.activeText : null]}>{candidate.name}</Text>
            <Text style={[styles.address, active ? styles.activeText : null]}>
              {candidate.address}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 18,
  },
  title: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
  },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    padding: 12,
    marginBottom: 8,
  },
  activeCard: {
    borderColor: COLORS.teal,
    backgroundColor: COLORS.teal,
  },
  name: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  address: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  activeText: {
    color: COLORS.white,
  },
});
