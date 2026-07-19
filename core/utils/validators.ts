import crypto from "crypto";

const FIRST_NAMES = [
  "Alex", "John", "Max", "Sam", "Tom", "Leo", "Kai", "Zoe", "Eli", "Ivy",
  "Luna", "Mila", "Nova", "Otis", "Remy", "Sage", "Wren", "Finn", "Blake", "Quinn",
];

const LAST_NAMES = [
  "Fox", "Lee", "Hart", "Moon", "Wells", "Cole", "Gray", "Reed",
  "Knight", "Shaw", "Blake", "Lane", "Ross", "Ward", "Hale", "West",
];

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const PW_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";

function randomInt(max: number): number {
  return crypto.randomInt(0, max);
}

export function generatePassword(length = 16): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += PW_CHARS[randomInt(PW_CHARS.length)];
  }
  return result;
}

export function generateUsername(prefix = "", length = 12): string {
  let rand = "";
  for (let i = 0; i < length; i++) {
    rand += CHARS[randomInt(CHARS.length)];
  }
  return prefix ? `${prefix}${rand}` : rand;
}

export function generateName(): { firstName: string; lastName: string } {
  return {
    firstName: FIRST_NAMES[randomInt(FIRST_NAMES.length)],
    lastName: LAST_NAMES[randomInt(LAST_NAMES.length)],
  };
}

export function isValidEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function isValidUrl(url: string): boolean {
  return /^https?:\/\//.test(url);
}
