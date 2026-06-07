import { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../components/common/AppHeader';
import type { RootStackParamList } from '../routes';
import { COLORS, radius, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Emergency'>;

const phrases = [
  { en: 'Please call the police.', ko: '경찰에 전화해 주세요.' },
  { en: 'I need a hospital.', ko: '병원이 필요해요.' },
  { en: 'I lost my passport.', ko: '여권을 잃어버렸어요.' },
  { en: 'I do not speak Korean well.', ko: '한국어를 잘 못해요.' },
];

export default function EmergencyScreen({ navigation }: Props) {
  const [phrasesOpen, setPhrasesOpen] = useState(false);

  const call = (number: string) => {
    void Linking.openURL(`tel:${number}`);
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="긴급 상황" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.alertCard}>
          <Feather name="alert-triangle" size={26} color={COLORS.red} />
          <Text style={styles.alertTitle}>한국 긴급 연락처</Text>
          <Text style={styles.alertText}>
            긴급 통화 버튼을 누르면 바로 전화 앱으로 연결됩니다. 자세한 안내는 관광 기관의 공식 정보를 확인하세요.
          </Text>
        </View>

        <View style={styles.callGrid}>
          <CallButton label="경찰" number="112" color={COLORS.red} onPress={() => call('112')} />
          <CallButton label="소방/구급" number="119" color={COLORS.orange} onPress={() => call('119')} />
          <CallButton label="관광 안내" number="1330" color={COLORS.teal} onPress={() => call('1330')} />
        </View>

        <View style={[styles.embassyCard, shadow.card]}>
          <Text style={styles.sectionTitle}>대사관 정보</Text>
          <InfoRow icon="map-pin" text="국가별 대사관 연락처는 외교부 또는 해당 대사관 공식 사이트에서 확인하세요." />
          <InfoRow icon="globe" text="여권 분실, 긴급 보호, 통역 지원은 공식 연락처를 통해 문의하세요." />
        </View>

        <Pressable style={styles.phraseButton} onPress={() => setPhrasesOpen(true)}>
          <Feather name="message-circle" size={18} color={COLORS.white} />
          <Text style={styles.phraseButtonText}>긴급 문장 보기</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={phrasesOpen} transparent animationType="slide" onRequestClose={() => setPhrasesOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>긴급 문장</Text>
              <Pressable style={styles.closeButton} onPress={() => setPhrasesOpen(false)}>
                <Feather name="x" size={20} color={COLORS.ink} />
              </Pressable>
            </View>
            {phrases.map((phrase) => (
              <View key={phrase.en} style={styles.phraseRow}>
                <Text style={styles.phraseEn}>{phrase.en}</Text>
                <Text style={styles.phraseKo}>{phrase.ko}</Text>
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function CallButton({
  label,
  number,
  color,
  onPress,
}: {
  label: string;
  number: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.callButton, { borderColor: `${color}40` }]} onPress={onPress}>
      <Text style={[styles.callNumber, { color }]}>{number}</Text>
      <Text style={styles.callLabel}>{label}</Text>
    </Pressable>
  );
}

function InfoRow({ icon, text }: { icon: 'map-pin' | 'globe'; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Feather name={icon} size={17} color={COLORS.teal} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.screen,
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  alertCard: {
    borderRadius: radius.xl,
    backgroundColor: '#FFF0F0',
    padding: 18,
    alignItems: 'center',
  },
  alertTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
  },
  alertText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
  },
  callGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  callButton: {
    width: '48%',
    minHeight: 96,
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '2%',
    marginBottom: 10,
  },
  callNumber: {
    fontSize: 26,
    fontWeight: '900',
  },
  callLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  embassyCard: {
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    marginLeft: 8,
  },
  phraseButton: {
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  phraseButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    color: COLORS.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phraseRow: {
    borderRadius: radius.md,
    backgroundColor: COLORS.card,
    padding: 14,
    marginTop: 10,
  },
  phraseEn: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  phraseKo: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 5,
  },
});
