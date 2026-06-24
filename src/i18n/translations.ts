export type Language = 'en' | 'ru'

export interface TranslationShape {
  appTitle: string
  appSubtitle: string
  zeroTelemetry: string
  settingsTitle: string
  modeRandom: string
  modePassphrase: string
  lengthLabel: (length: number, entropy: number) => string
  wordCountLabel: (count: number, entropy: number) => string
  lowercase: string
  uppercase: string
  numbers: string
  symbols: string
  separatorLabel: string
  separatorNone: string
  separatorSpace: string
  passwordCountLabel: (count: number) => string
  generatePasswords: (count: number) => string
  generatedTitle: string
  copyAll: string
  clear: string
  copyAria: string
  copiedAria: string
  aboutSecurityTitle: string
  cryptoRandomness: string
  cryptoRandomnessDesc: string
  passphrases: string
  passphrasesDesc: string
  zeroTelemetryDetail: string
  zeroTelemetryDetailDesc: string
  footer: string
  strengthLabels: string[]
  langSwitchEn: string
  langSwitchRu: string
  htmlTitle: string
}

export const translations: Record<Language, TranslationShape> = {
  en: {
    appTitle: 'Password Generator',
    appSubtitle: 'Cryptographically secure passwords and passphrases for your services',
    zeroTelemetry: 'Zero telemetry. All data stays on your device.',
    settingsTitle: 'Generator settings',
    modeRandom: 'Random string',
    modePassphrase: 'Passphrase',
    lengthLabel: (length: number, entropy: number) =>
      `Password length: ${length} characters (~${entropy.toFixed(0)} bits of entropy)`,
    wordCountLabel: (count: number, entropy: number) =>
      `Word count: ${count} (~${entropy.toFixed(0)} bits of entropy)`,
    lowercase: 'Lowercase (a-z)',
    uppercase: 'Uppercase (A-Z)',
    numbers: 'Numbers (0-9)',
    symbols: 'Symbols (!@#...)',
    separatorLabel: 'Separator',
    separatorNone: 'none',
    separatorSpace: 'space',
    passwordCountLabel: (count: number) => `Number of passwords: ${count}`,
    generatePasswords: (count: number) =>
      `Generate ${count} ${count === 1 ? 'password' : 'passwords'}`,
    generatedTitle: 'Generated passwords',
    copyAll: 'Copy all',
    clear: 'Clear',
    copyAria: 'Copy password',
    copiedAria: 'Copied',
    aboutSecurityTitle: 'About security',
    cryptoRandomness: 'Cryptographic randomness:',
    cryptoRandomnessDesc:
      'Uses window.crypto.getRandomValues() — a cryptographically secure generator.',
    passphrases: 'Passphrases:',
    passphrasesDesc:
      'Diceware method with the EFF wordlist (7776 words). 6 words = ~77 bits of entropy.',
    zeroTelemetryDetail: 'Zero telemetry:',
    zeroTelemetryDetailDesc: 'No data ever leaves your device.',
    footer: 'Static client-side application.',
    strengthLabels: ['Very weak', 'Weak', 'Medium', 'Good', 'Excellent'],
    langSwitchEn: 'EN',
    langSwitchRu: 'RU',
    htmlTitle: 'Password Generator | Secure Random Passwords & Passphrases',
  },
  ru: {
    appTitle: 'Генератор паролей',
    appSubtitle: 'Криптографически защищённые пароли и парольные фразы для ваших сервисов',
    zeroTelemetry: 'Нулевая телеметрия. Все данные остаются на вашем устройстве.',
    settingsTitle: 'Настройки генератора',
    modeRandom: 'Случайная строка',
    modePassphrase: 'Парольная фраза',
    lengthLabel: (length: number, entropy: number) =>
      `Длина пароля: ${length} символов (~${entropy.toFixed(0)} бит энтропии)`,
    wordCountLabel: (count: number, entropy: number) =>
      `Количество слов: ${count} (~${entropy.toFixed(0)} бит энтропии)`,
    lowercase: 'Строчные (a-z)',
    uppercase: 'Прописные (A-Z)',
    numbers: 'Цифры (0-9)',
    symbols: 'Символы (!@#...)',
    separatorLabel: 'Разделитель',
    separatorNone: 'нет',
    separatorSpace: 'пробел',
    passwordCountLabel: (count: number) => `Количество паролей: ${count}`,
    generatePasswords: (count: number) => {
      let form: string
      if (count % 10 === 1 && count % 100 !== 11) {
        form = 'пароль'
      } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
        form = 'пароля'
      } else {
        form = 'паролей'
      }
      return `Сгенерировать ${count} ${form}`
    },
    generatedTitle: 'Сгенерированные пароли',
    copyAll: 'Копировать все',
    clear: 'Очистить',
    copyAria: 'Копировать пароль',
    copiedAria: 'Скопировано',
    aboutSecurityTitle: 'О безопасности',
    cryptoRandomness: 'Криптографическая случайность:',
    cryptoRandomnessDesc:
      'Используется window.crypto.getRandomValues() — криптографически стойкий генератор.',
    passphrases: 'Парольные фразы:',
    passphrasesDesc:
      'Метод Diceware со списком EFF (7776 слов). 6 слов = ~77 бит энтропии.',
    zeroTelemetryDetail: 'Нулевая телеметрия:',
    zeroTelemetryDetailDesc: 'Никакие данные не покидают ваше устройство.',
    footer: 'Статическое клиентское приложение.',
    strengthLabels: ['Очень слабый', 'Слабый', 'Средний', 'Хороший', 'Отличный'],
    langSwitchEn: 'EN',
    langSwitchRu: 'RU',
    htmlTitle: 'Генератор паролей | Надёжные пароли и парольные фразы',
  },
}

export type TranslationKey = keyof TranslationShape

export function t(lang: Language, key: TranslationKey, ...args: any[]): string {
  const value = translations[lang][key]
  if (typeof value === 'function') {
    return (value as (...args: any[]) => string)(...args)
  }
  return value as string
}
