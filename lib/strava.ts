export type StravaLinkStatus =
  | "valid"
  | "share-link"
  | "invalid";

/**
 * Menerima beberapa bentuk input:
 *
 * 1. https://www.strava.com/activities/123456789
 * 2. www.strava.com/activities/123456789
 * 3. strava.com/activities/123456789
 * 4. https://strava.app.link/xxxxx
 * 5. Check out my run on Strava: https://strava.app.link/xxxxx
 *
 * Output dinormalisasi menjadi URL yang bersih sebelum disimpan.
 */
export function normalizeStravaInput(
  input: string
) {
  let value =
    input.trim();

  if (!value) {
    return "";
  }

  /*
   * Jika user paste kalimat share dari aplikasi Strava,
   * ambil URL Strava yang ada di dalam kalimat tersebut.
   */
  const embeddedUrl =
    value.match(
      /https?:\/\/(?:www\.)?strava\.com\/activities\/[^\s]+|https?:\/\/strava\.app\.link\/[^\s]+/i
    );

  if (embeddedUrl) {
    value =
      embeddedUrl[0];
  }

  /*
   * Akomodasi penulisan manual tanpa protocol.
   */
  if (
    /^strava\.com\//i.test(
      value
    )
  ) {
    value =
      `https://${value}`;
  } else if (
    /^www\.strava\.com\//i.test(
      value
    )
  ) {
    value =
      `https://${value}`;
  } else if (
    /^strava\.app\.link\//i.test(
      value
    )
  ) {
    value =
      `https://${value}`;
  }

  /*
   * Buang karakter tanda baca yang kadang ikut tercopy
   * di akhir URL dari kalimat/share message.
   */
  value =
    value.replace(
      /[),.;!?]+$/g,
      ""
    );

  try {
    const url =
      new URL(value);

    const hostname =
      url.hostname.toLowerCase();

    /*
     * Canonical URL aktivitas Strava:
     * - terima strava.com maupun www.strava.com
     * - simpan sebagai https://www.strava.com/activities/{id}
     */
    if (
      (
        hostname ===
          "strava.com" ||
        hostname ===
          "www.strava.com"
      ) &&
      /^\/activities\/\d+\/?$/.test(
        url.pathname
      )
    ) {
      const activityId =
        url.pathname.match(
          /^\/activities\/(\d+)\/?$/
        )?.[1];

      if (activityId) {
        return `https://www.strava.com/activities/${activityId}`;
      }
    }

    /*
     * Share/deep link dari aplikasi.
     * Query string tetap dipertahankan jika ada.
     */
    if (
      hostname ===
        "strava.app.link"
    ) {
      return url.toString();
    }

    return value;
  } catch {
    return value;
  }
}


export function validateStravaLink(
  input: string
): StravaLinkStatus {
  const normalized =
    normalizeStravaInput(
      input
    );

  if (!normalized) {
    return "invalid";
  }

  try {
    const url =
      new URL(normalized);

    const hostname =
      url.hostname.toLowerCase();

    if (
      (
        hostname ===
          "strava.com" ||
        hostname ===
          "www.strava.com"
      ) &&
      /^\/activities\/\d+\/?$/.test(
        url.pathname
      )
    ) {
      return "valid";
    }

    if (
      hostname ===
        "strava.app.link" &&
      url.pathname !== "/" &&
      url.pathname.length > 1
    ) {
      return "share-link";
    }

    return "invalid";
  } catch {
    return "invalid";
  }
}
