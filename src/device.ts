import type { DeviceInfo } from './types';

interface GeoResponse {
  city?: string;
  country?: string;
}

async function getCityAndCountryFromIP(
  ipAddr: string,
): Promise<{ city: string; country: string }> {
  const response = await fetch(
    `https://get.geojs.io/v1/ip/geo/${ipAddr}.json`,
  );
  if (!response.ok) {
    throw new Error(`Geo lookup failed: ${response.status}`);
  }
  const data = (await response.json()) as GeoResponse;
  return { city: data.city ?? '', country: data.country ?? '' };
}

async function getIPLocation(ipAddr: string): Promise<string> {
  try {
    const { city, country } = await getCityAndCountryFromIP(ipAddr);
    if (!city && !country) {
      return 'Unknown Location';
    }
    if (!city && country) {
      return country;
    }
    return `${city}, ${country}`;
  } catch {
    return 'Unknown Location';
  }
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    'Unknown IP'
  );
}

export async function getLoginDeviceInfo(
  request: Request,
): Promise<DeviceInfo> {
  const ipAddr = getClientIp(request);
  const location = await getIPLocation(ipAddr);
  const deviceDetails =
    request.headers.get('User-Agent') ?? 'Unknown Device';

  return { ipAddr, deviceDetails, location };
}
