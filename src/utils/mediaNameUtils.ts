/**
 * 统一处理播放器里显示的文件名（标题栏、媒体信息面板共用）。
 *
 * 顺序很关键：先砍网址查询尾巴，再处理分段流编号，
 * 否则 ".mp4" 后缀会连尾巴一起被误判。
 */
export function cleanMediaName(raw: string | null | undefined): string {
  if (!raw) return "";
  const base = raw.split(/[/\\]/).pop() || "";
  let name = base;
  // 1. URL 解码：%E4%B9%9D%E9%97%A8 -> 中文
  if (name.includes("%")) {
    try {
      name = decodeURIComponent(name);
    } catch (_) {}
  }
  // 2. 去掉 ?sign=... 这类查询尾巴，保留 .mkv / .mp4 后缀
  const q = name.indexOf("?");
  if (q > 0) name = name.slice(0, q);
  // 3. 只删 B 站分段流的内部编号（..._BV1xxxx.p2.mp4），
  //    普通含空格的文件名（Dolby Vision-Oblivion.ts）不受影响
  name = name.replace(
    /[_\s]+(?:BV[0-9A-Za-z]{4,}|[A-Za-z0-9]{8,})\.p\d+\.(?:mp4|m4s|ts)$/i,
    ""
  );
  return name || base;
}
