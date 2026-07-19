/**
 * Maps Russian keyboard layout characters to English equivalents
 * based on physical key positions on QWERTY keyboard.
 */

const RU_TO_EN: Record<string, string> = {
  // Lowercase
  "й": "q", "ц": "w", "у": "e", "к": "r", "е": "t",
  "н": "y", "г": "u", "ш": "i", "щ": "o", "з": "p",
  "х": "[", "ъ": "]",
  "ф": "a", "ы": "s", "в": "d", "а": "f", "п": "g",
  "р": "h", "о": "j", "л": "k", "д": "l", "ж": ";", "э": "'",
  "я": "z", "ч": "x", "с": "c", "м": "v", "и": "b",
  "т": "n", "ь": "m", "б": ",", "ю": ".", ".": "/",
  
  // Uppercase
  "Й": "Q", "Ц": "W", "У": "E", "К": "R", "Е": "T",
  "Н": "Y", "Г": "U", "Ш": "I", "Щ": "O", "З": "P",
  "Х": "{", "Ъ": "}",
  "Ф": "A", "Ы": "S", "В": "D", "А": "F", "П": "G",
  "Р": "H", "О": "J", "Л": "K", "Д": "L", "Ж": ":", "Э": "\"",
  "Я": "Z", "Ч": "X", "С": "C", "М": "V", "И": "B",
  "Т": "N", "Ь": "M", "Б": "<", "Ю": ">",
};

const UK_TO_EN: Record<string, string> = {
  // Ukrainian characters that differ from Russian
  "і": "i", "ї": "]", "є": "e", "ґ": "`",
  "І": "I", "Ї": "}", "Є": "E", "Ґ": "~",
};

/**
 * Convert any keyboard layout character to English equivalent.
 * Returns the English character if found, otherwise returns the original character.
 */
export function toEnglishKey(char: string): string {
  // Check Russian layout first, then Ukrainian
  return RU_TO_EN[char] || UK_TO_EN[char] || char;
}

/**
 * Get the normalized key name for shortcut matching.
 * Handles Russian/Ukrainian keyboard layouts by mapping to English equivalents.
 */
export function normalizeKeyName(key: string): string {
  // For single characters, convert to English layout
  if (key.length === 1) {
    return toEnglishKey(key);
  }
  // For special keys like "escape", "return", etc. - return as is
  return key;
}
