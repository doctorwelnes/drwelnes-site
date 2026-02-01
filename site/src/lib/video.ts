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

    return trimmed;
  } catch {
    return trimmed;
  }
}
