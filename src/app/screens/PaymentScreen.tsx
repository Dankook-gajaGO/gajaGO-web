import { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../components/common/AppHeader';
import type { RootStackParamList } from '../routes';
import { COLORS, radius, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;
type Tab = 'cards' | 'transit' | 'find' | 'tips';
type FeatherName = React.ComponentProps<typeof Feather>['name'];

interface InfoCard {
  title: string;
  text: string;
  icon: FeatherName;
}

interface LinkCard {
  title: string;
  text: string;
  icon: FeatherName;
  url: string;
}

const tabs: Array<{ id: Tab; label: string }> = [
  { id: 'cards', label: '카드' },
  { id: 'transit', label: '교통' },
  { id: 'find', label: '찾기' },
  { id: 'tips', label: '팁' },
];

const paymentCards: InfoCard[] = [
  {
    title: '신용/체크카드',
    text: '대형 매장, 호텔, 카페, 편의점에서는 해외 Visa, Mastercard, JCB, Amex 계열 카드를 대체로 사용할 수 있습니다.',
    icon: 'credit-card',
  },
  {
    title: '현금',
    text: '전통시장, 노점, 일부 소형 식당, 교통카드 충전처럼 현금이 필요한 상황이 있을 수 있어 소액 원화를 준비하세요.',
    icon: 'dollar-sign',
  },
  {
    title: '모바일 결제',
    text: '일부 국내 간편결제는 한국 계정, 휴대폰 본인 인증, 국내 카드가 필요할 수 있습니다. 현장 결제 수단을 함께 준비하세요.',
    icon: 'smartphone',
  },
  {
    title: '선불 여행카드',
    text: 'WOWPASS, NAMANE 같은 외국인 여행자용 선불카드는 충전 후 결제, 잔액 확인, 일부 교통 기능을 함께 사용할 수 있습니다.',
    icon: 'briefcase',
  },
];

const transitCards: InfoCard[] = [
  {
    title: '티머니 카드',
    text: '지하철, 버스, 택시, 편의점에서 사용할 수 있는 대표 교통카드입니다. 편의점이나 역사에서 구매/충전할 수 있습니다.',
    icon: 'credit-card',
  },
  {
    title: '1회용 교통카드',
    text: '지하철만 이용할 때는 역사 내 발매기에서 1회용 교통카드를 구매할 수 있습니다. 보증금 환급을 잊지 마세요.',
    icon: 'square',
  },
  {
    title: '공항철도 AREX',
    text: '공항과 서울 주요 지하철 노선을 연결합니다. 일반열차와 직통열차의 결제 방식이 다를 수 있어 현장 안내를 확인하세요.',
    icon: 'navigation',
  },
  {
    title: '교통카드 충전',
    text: '일부 충전기는 현금 충전만 지원할 수 있습니다. 편의점에서는 직원에게 교통카드 충전을 요청할 수 있습니다.',
    icon: 'plus-circle',
  },
];

const tipCards: InfoCard[] = [
  {
    title: '카드 최소 금액 확인',
    text: '작은 매장은 현금을 선호하거나 카드 최소 결제 금액이 있을 수 있습니다.',
    icon: 'alert-circle',
  },
  {
    title: '영수증 보관',
    text: '영수증은 환불, 분실물 문의, 결제 내역 확인에 필요할 수 있습니다.',
    icon: 'file-text',
  },
  {
    title: '결제 실패 시 대처',
    text: 'IC칩을 다시 삽입하거나 다른 카드를 사용하세요. 해외 결제 차단 여부도 카드사 앱에서 확인하면 좋습니다.',
    icon: 'refresh-ccw',
  },
  {
    title: '키오스크 결제',
    text: '일부 키오스크는 해외 카드 승인이 실패할 수 있습니다. 직원 호출, 카운터 결제, 다른 카드 사용을 시도하세요.',
    icon: 'monitor',
  },
];

const placeGuideCards: InfoCard[] = [
  {
    title: '편의점',
    text: '카드, 현금, 교통카드 결제가 비교적 잘 됩니다. 교통카드 충전도 요청할 수 있습니다.',
    icon: 'shopping-bag',
  },
  {
    title: '전통시장/노점',
    text: '카드가 되더라도 현금을 선호하는 곳이 많습니다. 소액권을 준비하면 이동이 편합니다.',
    icon: 'shopping-cart',
  },
  {
    title: '택시',
    text: '대부분 카드 결제가 가능하지만, 상황에 따라 교통카드나 현금을 보조 수단으로 준비하면 좋습니다.',
    icon: 'truck',
  },
];

const checklistCards: InfoCard[] = [
  {
    title: '출국 전',
    text: '해외 결제 허용, 카드 한도, 해외 원화결제 차단 설정을 확인하세요.',
    icon: 'check-square',
  },
  {
    title: '입국 직후',
    text: '소액 현금, 교통카드, 예비 카드를 준비하면 첫 이동과 편의점 결제가 안정적입니다.',
    icon: 'map-pin',
  },
];

const mapSearchCards: LinkCard[] = [
  {
    title: '근처 Global ATM',
    text: '해외 카드 인출이 가능한 ATM을 Google Maps에서 찾습니다.',
    icon: 'map-pin',
    url: buildGoogleMapSearchUrl('Global ATM near me'),
  },
  {
    title: '근처 환전소',
    text: '공항 밖 환전소나 은행 환전 창구를 찾을 때 사용하세요.',
    icon: 'dollar-sign',
    url: buildGoogleMapSearchUrl('currency exchange near me'),
  },
  {
    title: 'Tmoney 충전 편의점',
    text: '교통카드 충전이 가능한 편의점을 찾습니다.',
    icon: 'plus-circle',
    url: buildGoogleMapSearchUrl('Tmoney recharge convenience store Korea'),
  },
  {
    title: 'WOWPASS 키오스크',
    text: 'WOWPASS 카드 발급/충전 키오스크 위치를 찾습니다.',
    icon: 'credit-card',
    url: buildGoogleMapSearchUrl('WOWPASS kiosk Korea'),
  },
  {
    title: 'NAMANE 키오스크',
    text: 'NAMANE 카드 발급/충전 키오스크 위치를 찾습니다.',
    icon: 'briefcase',
    url: buildGoogleMapSearchUrl('NAMANE kiosk Korea'),
  },
];

const officialLinkCards: LinkCard[] = [
  {
    title: 'WOWPASS 공식 사이트',
    text: '외국인 여행자용 선불카드, 환전, 교통 기능 정보를 확인합니다.',
    icon: 'external-link',
    url: 'https://www.wowpass.io/?lang=en_US',
  },
  {
    title: 'NAMANE 공식 사이트',
    text: '선불카드 발급, 충전, 결제/교통 사용 정보를 확인합니다.',
    icon: 'external-link',
    url: 'https://en.namanecard.com/',
  },
  {
    title: 'Tmoney 안내',
    text: 'Korea Tour Card Tmoney 사용과 충전 정보를 확인합니다.',
    icon: 'external-link',
    url: 'https://tmoney.co.kr/aeb/common/common/frontFileDownload.dev?fileNm=Tmoney.pdf',
  },
];

function buildGoogleMapSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function openExternalUrl(url: string) {
  void Linking.openURL(url);
}

function PaymentInfoCard({ item }: { item: InfoCard }) {
  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.cardIcon}>
        <Feather name={item.icon} size={20} color={COLORS.teal} />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardBody}>{item.text}</Text>
      </View>
    </View>
  );
}

function PaymentLinkCard({ item }: { item: LinkCard }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, styles.linkCard, shadow.card, pressed && styles.cardPressed]}
      onPress={() => openExternalUrl(item.url)}
      accessibilityRole="link"
      accessibilityLabel={`${item.title} 열기`}
    >
      <View style={styles.cardIcon}>
        <Feather name={item.icon} size={20} color={COLORS.teal} />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardBody}>{item.text}</Text>
      </View>
      <Feather name="chevron-right" size={22} color={COLORS.muted} />
    </Pressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export default function PaymentScreen({ navigation }: Props) {
  const [tab, setTab] = useState<Tab>('cards');

  return (
    <View style={styles.screen}>
      <AppHeader title="결제 정보" onBack={() => navigation.goBack()} />
      <View style={styles.tabs}>
        {tabs.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.tab, tab === item.id ? styles.activeTab : null]}
            onPress={() => setTab(item.id)}
          >
            <Text style={[styles.tabText, tab === item.id ? styles.activeTabText : null]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.notice}>
          <Feather name="info" size={20} color={COLORS.teal} />
          <Text style={styles.noticeText}>
            한국 여행 중에는 해외 카드, 소액 현금, 교통카드를 함께 준비하면 결제 실패 상황을 줄일 수 있습니다.
          </Text>
        </View>

        {tab === 'cards' ? (
          <>
            {paymentCards.map((card) => (
              <PaymentInfoCard key={card.title} item={card} />
            ))}
          </>
        ) : null}

        {tab === 'transit' ? (
          <>
            {transitCards.map((card) => (
              <PaymentInfoCard key={card.title} item={card} />
            ))}
          </>
        ) : null}

        {tab === 'find' ? (
          <>
            <SectionTitle title="지도에서 찾기" />
            {mapSearchCards.map((card) => (
              <PaymentLinkCard key={card.title} item={card} />
            ))}

            <SectionTitle title="공식 안내" />
            {officialLinkCards.map((card) => (
              <PaymentLinkCard key={card.title} item={card} />
            ))}
          </>
        ) : null}

        {tab === 'tips' ? (
          <>
            <SectionTitle title="결제 팁" />
            {tipCards.map((card) => (
              <PaymentInfoCard key={card.title} item={card} />
            ))}

            <SectionTitle title="장소별 가이드" />
            {placeGuideCards.map((card) => (
              <PaymentInfoCard key={card.title} item={card} />
            ))}

            <SectionTitle title="여행 전 체크리스트" />
            {checklistCards.map((card) => (
              <PaymentInfoCard key={card.title} item={card} />
            ))}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.screen,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.teal,
  },
  tabText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  activeTabText: {
    color: COLORS.teal,
  },
  content: {
    padding: 20,
    paddingBottom: 30,
  },
  notice: {
    borderRadius: radius.lg,
    backgroundColor: '#E5F7F7',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  noticeText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
    marginLeft: 10,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 10,
    marginBottom: 10,
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  linkCard: {
    alignItems: 'center',
  },
  cardPressed: {
    opacity: 0.86,
  },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: '#E5F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  cardBody: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
});
