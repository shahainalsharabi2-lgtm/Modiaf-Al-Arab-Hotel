/** شعار الفندق الافتراضي (Hotel Premio) */
export const DEFAULT_HOTEL_LOGO_ASSET = 'assets/branding/hotel-premio-logo.png';

export function resolveHotelImageSrc(dataUrl: string | null | undefined): string {
  const trimmed = (dataUrl ?? '').trim();
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }
  return DEFAULT_HOTEL_LOGO_ASSET;
}
