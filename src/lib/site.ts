export const SITE_ORIGIN = "https://devforge.tools";
export const SITE_URL = `${SITE_ORIGIN}/`;

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
