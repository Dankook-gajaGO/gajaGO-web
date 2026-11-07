import { Linking } from 'react-native';

// 지도 앱 연결은 링크만 열어요 (API 호출·지도 라이브러리 없음 -> 앱이 무거워지지 않음)
// 한국에서는 구글 지도 도보 안내가 제한적이라 네이버·카카오도 함께 제공
type Place = { name: string; lat: number; lng: number };

// 앱이 있으면 앱으로, 없으면(열기 실패) 웹으로
async function openAppOrWeb(appUrl: string, webUrl: string) {
  try {
    await Linking.openURL(appUrl);
  } catch {
    await Linking.openURL(webUrl);
  }
}

export function openNaverRoute(from: Place, to: Place) {
  const q = (p: Place, prefix: 's' | 'd') =>
    `${prefix}lat=${p.lat}&${prefix}lng=${p.lng}&${prefix}name=${encodeURIComponent(p.name)}`;
  return openAppOrWeb(
    `nmap://route/public?${q(from, 's')}&${q(to, 'd')}&appname=com.gajago.app`,
    `https://map.naver.com/p/search/${encodeURIComponent(to.name)}`
  );
}

export function openKakaoRoute(from: Place, to: Place) {
  return openAppOrWeb(
    `kakaomap://route?sp=${from.lat},${from.lng}&ep=${to.lat},${to.lng}&by=PUBLICTRANSIT`,
    `https://map.kakao.com/link/to/${encodeURIComponent(to.name)},${to.lat},${to.lng}`
  );
}

export function openGooglePlace(place: Place) {
  return Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`);
}
