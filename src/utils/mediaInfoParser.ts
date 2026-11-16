// ─── Утилиты форматирования и перевода отчётов MediaInfo ────

/** Доступные языки перевода отчёта MediaInfo (сырые данные всегда на английском). */
export type MediaInfoLang = "en" | "ru" | "zh";

export const KEY_TRANSLATIONS: Record<string, string> = {
  // Общее
  "Unique ID": "Уникальный идентификатор",
  "Complete name": "Полное имя",
  "Format": "Формат",
  "Format version": "Версия формата",
  "Format profile": "Профиль формата",
  "Format settings": "Настройки формата",
  "Format settings, CABAC": "Параметр CABAC формата",
  "Format settings, Reference frames": "Параметр RefFrames формата",
  "Format settings, ReFrames": "Параметр RefFrames формата",
  "Format settings, BVOP": "Параметр BVOP формата",
  "Format settings, Matrix": "Параметр матрицы формата",
  "Format settings, GOP": "Параметр GOP формата",
  "Codec ID": "Идентификатор кодека",
  "Codec ID/Info": "Информация об идентификаторе кодека",
  "File size": "Размер файла",
  "Duration": "Продолжительность",
  "Overall bit rate": "Общий битрейт",
  "Overall bit rate mode": "Вид общего битрейта",
  "Frame rate": "Частота кадров",
  "Frame rate mode": "Режим частоты кадров",
  "Writing application": "Программа кодирования",
  "Writing library": "Библиотека кодирования",
  "Writing front-end": "Оболочка программы кодирования",
  "Encoded date": "Дата кодирования",
  "Tagged date": "Дата маркировки",
  "File modification date/time": "Дата изменения файла",
  "File creation date/time": "Дата создания файла",

  // Видео
  "ID": "Идентификатор",
  "Format/Info": "Формат/Информация",
  "Bit rate mode": "Вид битрейта",
  "Bit rate": "Битрейт",
  "Nominal bit rate": "Номинальный битрейт",
  "Maximum bit rate": "Максимальный битрейт",
  "Minimum bit rate": "Минимальный битрейт",
  "Width": "Ширина",
  "Height": "Высота",
  "Display aspect ratio": "Соотношение сторон",
  "Original display aspect ratio": "Исходное соотношение сторон",
  "Pixel aspect ratio": "Соотношение сторон пикселей",
  "Color space": "Цветовое пространство",
  "Chroma subsampling": "Цветовая субдискретизация",
  "Bit depth": "Битовая глубина",
  "Scan type": "Тип развёртки",
  "Bits/(Pixel*Frame)": "Бит/(Пиксели*Кадры)",
  "Stream size": "Размер потока",
  "Title": "Заголовок",
  "Default": "По умолчанию",
  "Forced": "Принудительно",
  "Color range": "Цветовой диапазон",
  "Color primaries": "Основные цвета",
  "Transfer characteristics": "Характеристики трансфера",
  "Matrix coefficients": "Коэффициенты матрицы",

  // Аудио
  "Commercial name": "Коммерческое название",
  "Channel(s)": "Каналы",
  "Channel layout": "Расположение каналов",
  "Channel positions": "Расположение каналов",
  "Sampling rate": "Частота дискретизации",
  "Compression mode": "Метод сжатия",
  "Compression ratio": "Степень сжатия",
  "Language": "Язык",
  "Service kind": "Вид сервиса",
  "Dialogue Normalization": "Нормализация звука речи",
  "Dialogue Normalization, Mean": "Нормализация звука речи, среднее",
  "Dialogue Normalization, Minimum": "Нормализация звука речи, минимум",
  "Dialogue Normalization, Maximum": "Нормализация звука речи, максимум",
  "Dialnorm": "Нормализация звука речи",
  "Dialnorm, Mean": "Нормализация звука речи, среднее",
  "Dialnorm, Minimum": "Нормализация звука речи, минимум",
  "Dialnorm, Maximum": "Нормализация звука речи, максимум",
  "Audio delay": "Задержка звука",
  "Delay relative to video": "Задержка относительно видео",
  "Video delay": "Задержка видео",

  // Текст / Субтитры
  "Element count": "Количество элементов",
  "Count of elements": "Количество элементов",
  "Count of audio streams": "Количество аудиопотоков",
  "Count of text streams": "Количество потоков субтитров",
  "Source duration": "Продолжительность источника",
  "Source stream size": "Размер потока источника",
};

// ─── 简体中文属性名翻译（与上方俄语词典同一套键，术语对齐 MediaInfo 官方中文版）────
export const KEY_TRANSLATIONS_ZH: Record<string, string> = {
  // 常规
  "Unique ID": "特征 ID",
  "Complete name": "完整名称",
  "Format": "格式",
  "Format version": "格式版本",
  "Format profile": "格式配置 (Profile)",
  "Format settings": "格式设置",
  "Format settings, CABAC": "格式设置, CABAC",
  "Format settings, Reference frames": "格式设置, 参考帧",
  "Format settings, ReFrames": "格式设置, 参考帧",
  "Format settings, BVOP": "格式设置, B帧",
  "Format settings, Matrix": "格式设置, 矩阵",
  "Format settings, GOP": "格式设置, GOP",
  "Codec ID": "编解码器 ID",
  "Codec ID/Info": "编解码器 ID/信息",
  "File size": "文件大小",
  "Duration": "时长",
  "Overall bit rate": "总体码率",
  "Overall bit rate mode": "总体码率模式",
  "Frame rate": "帧率",
  "Frame rate mode": "帧率模式",
  "Writing application": "编码程序",
  "Writing library": "编码函数库",
  "Writing front-end": "编码程序前端",
  "Encoded date": "编码日期",
  "Tagged date": "标记日期",
  "File modification date/time": "文件修改时间",
  "File creation date/time": "文件创建时间",

  // 视频
  "ID": "ID",
  "Format/Info": "格式详细信息",
  "Bit rate mode": "码率模式",
  "Bit rate": "码率",
  "Nominal bit rate": "额定码率",
  "Maximum bit rate": "最大码率",
  "Minimum bit rate": "最小码率",
  "Width": "宽度",
  "Height": "高度",
  "Display aspect ratio": "画面比例",
  "Original display aspect ratio": "原始画面比例",
  "Pixel aspect ratio": "像素宽高比",
  "Color space": "色彩空间",
  "Chroma subsampling": "色度抽样",
  "Bit depth": "位深",
  "Scan type": "扫描类型",
  "Bits/(Pixel*Frame)": "Bits/(像素*帧)",
  "Stream size": "流大小",
  "Title": "标题",
  "Default": "默认",
  "Forced": "强制",
  "Color range": "色彩范围",
  "Color primaries": "色彩原色",
  "Transfer characteristics": "传输特性",
  "Matrix coefficients": "矩阵系数",

  // 音频
  "Commercial name": "传播名",
  "Channel(s)": "声道数",
  "Channel layout": "声道布局",
  "Channel positions": "声道位置",
  "Sampling rate": "采样率",
  "Compression mode": "压缩模式",
  "Compression ratio": "压缩比",
  "Language": "语言",
  "Service kind": "服务类别",
  "Dialogue Normalization": "对白归一化",
  "Dialogue Normalization, Mean": "对白归一化, 平均值",
  "Dialogue Normalization, Minimum": "对白归一化, 最小值",
  "Dialogue Normalization, Maximum": "对白归一化, 最大值",
  "Dialnorm": "对白归一化",
  "Dialnorm, Mean": "对白归一化, 平均值",
  "Dialnorm, Minimum": "对白归一化, 最小值",
  "Dialnorm, Maximum": "对白归一化, 最大值",
  "Audio delay": "音频延迟",
  "Delay relative to video": "相对视频的延迟",
  "Video delay": "相对视频的延迟",

  // 文本 / 字幕
  "Element count": "元素总数",
  "Count of elements": "元素总数",
  "Count of audio streams": "音频流数量",
  "Count of text streams": "字幕流数量",
  "Source duration": "源时长",
  "Source stream size": "源流大小",
};

export const SECTION_TRANSLATIONS: Record<string, string> = {
  "General": "Общее",
  "Video": "Видео",
  "Audio": "Аудио",
  "Text": "Текст",
  "Menu": "Меню",
  "Chapters": "Главы",
};

export const SECTION_TRANSLATIONS_ZH: Record<string, string> = {
  "General": "通用",
  "Video": "视频",
  "Audio": "音频",
  "Text": "文本",
  "Menu": "菜单",
  "Chapters": "章节",
};

export const WORD_MAP: Record<string, string> = {
  Yes: "Да",
  No: "Нет",
  Constant: "Постоянный",
  Variable: "Переменный",
  Progressive: "Прогрессивная",
  Interlaced: "Чересстрочная",
  Lossy: "С потерями",
  Lossless: "Без потерь",
  Japanese: "Японский",
  Russian: "Русский",
  English: "Английский",
  German: "Немецкий",
  French: "Французский",
  Spanish: "Испанский",
  Chinese: "Китайский",
  Korean: "Корейский",
  Italian: "Итальянский",
  Ukrainian: "Украинский",
  Belarusian: "Белорусский",
  Polish: "Польский",
  Portuguese: "Португальский",
  Turkish: "Турецкий",
  Arabic: "Арабский",
  FPS: "кадра/сек",
  "kb/s": "Кбит/сек",
  "Mb/s": "Мбит/сек",
  "Gb/s": "Гбит/сек",
  "b/s": "бит/сек",
  GiB: "Гбайт",
  MiB: "Мбайт",
  KiB: "Кбайт",
  kHz: "кГц",
  Hz: "Гц",
  bits: "бит",
  bit: "бит",
  bytes: "байт",
  byte: "байт",
  min: "м.",
  h: "ч.",
  s: "с.",
  ms: "мс",
};

export const WORD_MAP_ZH: Record<string, string> = {
  Yes: "是",
  No: "否",
  Constant: "恒定",
  Variable: "可变",
  Progressive: "逐行扫描",
  Interlaced: "隔行扫描",
  Lossy: "有损",
  Lossless: "无损",
  Japanese: "日语",
  Russian: "俄语",
  English: "英语",
  German: "德语",
  French: "法语",
  Spanish: "西班牙语",
  Chinese: "中文",
  Korean: "韩语",
  Italian: "意大利语",
  Ukrainian: "乌克兰语",
  Belarusian: "白俄罗斯语",
  Polish: "波兰语",
  Portuguese: "葡萄牙语",
  Turkish: "土耳其语",
  Arabic: "阿拉伯语",
  GiB: "GiB",
  MiB: "MiB",
  KiB: "KiB",
  kHz: "kHz",
  Hz: "Hz",
  bits: "位",
  bit: "位",
  bytes: "字节",
  byte: "字节",
  min: "分钟",
  h: "小时",
  s: "秒",
  ms: "毫秒",
};

const WORD_REGEX = /\b(Yes|No|Constant|Variable|Progressive|Interlaced|Lossy|Lossless|Japanese|Russian|English|German|French|Spanish|Chinese|Korean|Italian|Ukrainian|Belarusian|Polish|Portuguese|Turkish|Arabic|FPS|kb\/s|Mb\/s|Gb\/s|b\/s|GiB|MiB|KiB|kHz|Hz|bits|bit|bytes|byte|min|h|s|ms)\b/g;

/** Форматирование числительных с учётом правил русского языка */
export function formatPlural(num: number, one: string, few: string, many: string): string {
  const mod10 = num % 10;
  const mod100 = num % 100;
  if (mod10 === 1 && mod100 !== 11) return `${num} ${one}`;
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return `${num} ${few}`;
  return `${num} ${many}`;
}

/** Высокоскоростной перевод значений в один регулярный проход (русский) */
export function translateValue(val: string): string {
  return val
    .replace(/(\d+)\s+channels\b/g, (_m, n) => formatPlural(parseInt(n, 10), "канал", "канала", "каналов"))
    .replace(/(\d+)\s+frames\b/g, (_m, n) => formatPlural(parseInt(n, 10), "кадр", "кадра", "кадров"))
    .replace(/\bchannels\b/g, "канала")
    .replace(/\bchannel\b/g, "канал")
    .replace(/\bframes\b/g, "кадра")
    .replace(/\bpixels\b/g, "пикселей")
    .replace(WORD_REGEX, (m) => WORD_MAP[m] || m)
    .replace(/(\d+)\.(\d+)(?=\s*(?:Гбайт|Мбайт|Кбайт|кГц|Гц|кадра\/сек|кадров\/сек|\(24000\/1001\)))/g, "$1,$2");
}

/** 数值的中文翻译（中文没有复数变化，逻辑更简单） */
export function translateValueZh(val: string): string {
  return val
    .replace(/(\d+)\s+channels\b/g, "$1 声道")
    .replace(/(\d+)\s+frames\b/g, "$1 帧")
    .replace(/\bchannels\b/g, "声道")
    .replace(/\bchannel\b/g, "声道")
    .replace(/\bframes\b/g, "帧")
    .replace(/\bpixels\b/g, "像素")
    .replace(WORD_REGEX, (m) => WORD_MAP_ZH[m] || m);
}

export interface ParsedMediaInfoRow {
  id: number;
  key: string;
  value: string;
  cleanText: string;
  displayText: string;
}

export interface ParsedMediaInfoSection {
  id: string;
  title: string;
  rows: ParsedMediaInfoRow[];
  cleanText: string;
}

export interface ParsedMediaInfoLine {
  id: number;
  text: string;
  isSection: boolean;
  cleanText?: string;
}

export interface ParsedMediaInfoReport {
  rawText: string;
  cleanText: string;
  lines: ParsedMediaInfoLine[];
  sections: ParsedMediaInfoSection[];
}

/** Парсинг и структурирование строк отчёта MediaInfo */
export function parseMediaInfoLines(rawText: string, lang: MediaInfoLang = "en"): ParsedMediaInfoReport {
  if (!rawText) return { rawText: "", cleanText: "", lines: [], sections: [] };

  const localized = lang !== "en";
  const keyDict = lang === "ru" ? KEY_TRANSLATIONS : lang === "zh" ? KEY_TRANSLATIONS_ZH : {};
  const sectionDict = lang === "ru" ? SECTION_TRANSLATIONS : lang === "zh" ? SECTION_TRANSLATIONS_ZH : {};

  const rawLines = rawText.split("\n");
  const linesOut: ParsedMediaInfoLine[] = [];
  const textOut: string[] = [];
  const sections: ParsedMediaInfoSection[] = [];

  let currentSection: ParsedMediaInfoSection | null = null;
  let rowIdCounter = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].replace(/\r$/, "");
    const trimmed = line.trim();

    if (!trimmed && linesOut.length === 0) continue;

    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) {
      if (!trimmed) {
        linesOut.push({ id: i, text: "", isSection: false, cleanText: "" });
        textOut.push("");
        continue;
      }

      let sectionName = trimmed;
      if (localized) {
        const match = trimmed.match(/^([A-Za-z]+)(\s+#\d+)?$/);
        if (match) {
          const base = sectionDict[match[1]] || match[1];
          sectionName = match[2] ? `${base}${match[2]}` : base;
        }
      }

      currentSection = {
        id: `sec-${sections.length}-${sectionName}`,
        title: sectionName,
        rows: [],
        cleanText: "",
      };
      sections.push(currentSection);

      linesOut.push({ id: i, text: sectionName, isSection: true, cleanText: sectionName });
      textOut.push(sectionName);
    } else {
      const rawKey = line.substring(0, colonIdx).trim();
      const rawVal = line.substring(colonIdx + 1).trim();
      if (!rawKey && !rawVal) continue;

      const key = localized ? keyDict[rawKey] || rawKey : rawKey;
      const val = lang === "ru" ? translateValue(rawVal) : lang === "zh" ? translateValueZh(rawVal) : rawVal;

      const formattedLine = `${key.padEnd(38)} : ${val}`;
      const cleanLine = val ? `${key}: ${val}` : key;

      if (!currentSection) {
        const defaultTitle = lang === "ru" ? "Общее" : lang === "zh" ? "通用" : "General";
        currentSection = {
          id: `sec-0-${defaultTitle}`,
          title: defaultTitle,
          rows: [],
          cleanText: "",
        };
        sections.push(currentSection);
      }

      currentSection.rows.push({
        id: rowIdCounter++,
        key,
        value: val,
        cleanText: cleanLine,
        displayText: formattedLine,
      });

      linesOut.push({ id: i, text: formattedLine, isSection: false, cleanText: cleanLine });
      textOut.push(formattedLine);
    }
  }

  // Формирование структурированного чистого текста для каждой категории
  for (const sec of sections) {
    const secLines = [sec.title];
    for (const r of sec.rows) {
      if (r.cleanText) {
        secLines.push(r.cleanText);
      }
    }
    sec.cleanText = secLines.join("\n");
  }

  return {
    rawText: textOut.join("\n"),
    cleanText: sections.map((s) => s.cleanText).join("\n\n"),
    lines: linesOut,
    sections,
  };
}
