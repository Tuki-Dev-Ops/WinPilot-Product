const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Figma 샌드박스에는 `atob` 이 없다. 최신 API 의 `figma.base64Decode` 를 쓰고,
 * 없으면 직접 디코딩한다 (플러그인 API 버전에 따라 갈리므로).
 */
export function base64ToBytes(input: string): Uint8Array {
  const api = figma as unknown as { base64Decode?: (value: string) => Uint8Array };
  if (typeof api.base64Decode === 'function') return api.base64Decode(input);

  const clean = input.replace(/[^A-Za-z0-9+/]/g, '');
  const output = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let outIndex = 0;
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < clean.length; i += 1) {
    const value = ALPHABET.indexOf(clean.charAt(i));
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output[outIndex] = (buffer >> bits) & 0xff;
      outIndex += 1;
    }
  }

  return output.subarray(0, outIndex);
}
