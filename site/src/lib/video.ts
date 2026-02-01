export function toEmbedUrl(url: string): string {
  const trimmed = url.trim();

  try {
    const u = new URL(trimmed);

    // YouTube
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      return `https://www.youtube.com/embed/${id}`;
    }

    if (u.hostname.endsWith("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;

      const m = u.pathname.match(/\/embed\/(.+)$/);
      if (m?.[1]) return `https://www.youtube.com/embed/${m[1]}`;

      const shorts = u.pathname.match(/\/shorts\/(.+)$/);
      if (shorts?.[1]) return `https://www.youtube.com/embed/${shorts[1]}`;

      const live = u.pathname.match(/\/live\/(.+)$/);
      if (live?.[1]) return `https://www.youtube.com/embed/${live[1]}`;
    }

    // VK Video
    if (u.hostname.endsWith("vk.com")) {
      const oid = u.searchParams.get("oid");
      const id = u.searchParams.get("id");
      if (oid && id) {
        return `https://vk.com/video_ext.php?oid=${encodeURIComponent(oid)}&id=${encodeURIComponent(id)}&hd=2`;
      }

      // Already an embed
      if (u.pathname.includes("video_ext.php")) return trimmed;
    }

    // RuTube
    if (u.hostname.endsWith("rutube.ru")) {
      // https://rutube.ru/video/<id>/  -> https://rutube.ru/play/embed/<id>
      const m = u.pathname.match(/^\/video\/([^/]+)\/?/);
      if (m?.[1]) return `https://rutube.ru/play/embed/${m[1]}`;

      // Already an embed
      const e = u.pathname.match(/^\/play\/embed\/([^/]+)\/?/);
      if (e?.[1]) return trimmed;
    }

    // OK Video
    if (u.hostname === "ok.ru" || u.hostname.endsWith(".ok.ru")) {
      // https://ok.ru/video/<id> -> https://ok.ru/videoembed/<id>
      const m = u.pathname.match(/^\/video\/(\d+)\/?/);
      if (m?.[1]) return `https://ok.ru/videoembed/${m[1]}`;

      // Already an embed
      const e = u.pathname.match(/^\/videoembed\/(\d+)\/?/);
      if (e?.[1]) return trimmed;
    }

    return trimmed;
  } catch {
    return trimmed;
  }
}
