import { API_BASE_URL } from './client';
import { formatKoreaDateKey } from '../utils/date';

async function getServerNow() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch(`${API_BASE_URL}/api/festival/festivalList?months=1&_=${Date.now()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    const dateHeader = response.headers.get('date');
    const serverDate = dateHeader ? new Date(dateHeader) : null;

    if (serverDate && !Number.isNaN(serverDate.getTime())) {
      return serverDate;
    }
  } catch {
    // Fall back to device time when the backend is not reachable or Date is hidden by the platform.
  } finally {
    clearTimeout(timer);
  }

  return new Date();
}

export async function getServerTodayKey() {
  return formatKoreaDateKey(await getServerNow());
}
