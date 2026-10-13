/* 유튜브·비메오 주소를 iframe에 넣을 수 있는 주소로 바꾼다. 알 수 없는 주소면 null. */
export function toVideoEmbedUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  const path = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" && path[0]) {
    return `https://www.youtube-nocookie.com/embed/${path[0]}`;
  }
  if (host === "youtube.com") {
    const id =
      url.searchParams.get("v") ??
      (["embed", "shorts", "live"].includes(path[0]) ? path[1] : null);
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com" && /^\d+$/.test(path[0] ?? "")) {
    return `https://player.vimeo.com/video/${path[0]}`;
  }
  if (host === "player.vimeo.com" && path[0] === "video") {
    return `https://player.vimeo.com/video/${path[1]}`;
  }

  return null;
}
