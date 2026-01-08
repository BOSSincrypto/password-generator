import { useState, useEffect, useCallback } from 'react'
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Eye, EyeOff, RefreshCw, Shield, AlertTriangle, Check } from 'lucide-react'
import './App.css'
import effWordlistRaw from './eff-wordlist.txt?raw'

// Initialize zxcvbn
const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
}
zxcvbnOptions.setOptions(options)

// Parse EFF wordlist
const effWordlist: string[] = effWordlistRaw
  .split('\n')
  .filter(line => line.trim())
  .map(line => line.split('\t')[1])
  .filter(Boolean)

// Character sets for random string generation
const CHAR_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

// Cryptographically secure random number generator
function getSecureRandomInt(max: number): number {
  const array = new Uint32Array(1)
  window.crypto.getRandomValues(array)
  return array[0] % max
}

// Generate random string using CSPRNG
function generateRandomString(
  length: number,
  useLowercase: boolean,
  useUppercase: boolean,
  useNumbers: boolean,
  useSymbols: boolean
): string {
  let charset = ''
  if (useLowercase) charset += CHAR_SETS.lowercase
  if (useUppercase) charset += CHAR_SETS.uppercase
  if (useNumbers) charset += CHAR_SETS.numbers
  if (useSymbols) charset += CHAR_SETS.symbols

  if (charset.length === 0) {
    charset = CHAR_SETS.lowercase + CHAR_SETS.uppercase + CHAR_SETS.numbers
  }

  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset[getSecureRandomInt(charset.length)]
  }
  return result
}

// Generate passphrase using Diceware method with EFF wordlist
function generatePassphrase(wordCount: number, separator: string): string {
  const words: string[] = []
  for (let i = 0; i < wordCount; i++) {
    const index = getSecureRandomInt(effWordlist.length)
    words.push(effWordlist[index])
  }
  return words.join(separator)
}

// Calculate entropy
function calculateEntropy(password: string, charsetSize: number): number {
  return password.length * Math.log2(charsetSize)
}

// Calculate passphrase entropy (EFF wordlist has 7776 words)
function calculatePassphraseEntropy(wordCount: number): number {
  return wordCount * Math.log2(7776) // ~12.9 bits per word
}

// Get byte length for bcrypt warning
function getByteLength(str: string): number {
  return new TextEncoder().encode(str).length
}

// Normalize to NFC
function normalizeNFC(str: string): string {
  return str.normalize('NFC')
}

// Strength labels in Russian
const strengthLabels = [
  { label: 'Очень слабый', color: 'bg-red-600', textColor: 'text-red-400' },
  { label: 'Слабый', color: 'bg-orange-500', textColor: 'text-orange-400' },
  { label: 'Средний', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  { label: 'Хороший', color: 'bg-lime-500', textColor: 'text-lime-400' },
  { label: 'Отличный', color: 'bg-green-500', textColor: 'text-green-400' },
]

// Time to crack estimates
function formatCrackTime(seconds: number): string {
  if (seconds < 1) return 'мгновенно'
  if (seconds < 60) return `${Math.round(seconds)} сек.`
  if (seconds < 3600) return `${Math.round(seconds / 60)} мин.`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} час.`
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} дн.`
  if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} лет`
  if (seconds < 31536000 * 1000000) return `${Math.round(seconds / 31536000 / 1000)} тыс. лет`
  if (seconds < 31536000 * 1000000000) return `${Math.round(seconds / 31536000 / 1000000)} млн. лет`
  return 'миллиарды лет'
}

function App() {
  const [mode, setMode] = useState<'passphrase' | 'random'>('passphrase')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(true)
  const [copied, setCopied] = useState(false)

  // Passphrase settings
  const [wordCount, setWordCount] = useState(6)
  const [separator, setSeparator] = useState('-')

  // Random string settings
  const [length, setLength] = useState(16)
  const [useLowercase, setUseLowercase] = useState(true)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)

  // Strength analysis
  const [strength, setStrength] = useState<ReturnType<typeof zxcvbn> | null>(null)

  const generatePassword = useCallback(() => {
    let newPassword: string
    if (mode === 'passphrase') {
      newPassword = generatePassphrase(wordCount, separator)
    } else {
      newPassword = generateRandomString(length, useLowercase, useUppercase, useNumbers, useSymbols)
    }
    newPassword = normalizeNFC(newPassword)
    setPassword(newPassword)
    setCopied(false)
  }, [mode, wordCount, separator, length, useLowercase, useUppercase, useNumbers, useSymbols])

  useEffect(() => {
    generatePassword()
  }, [generatePassword])

  useEffect(() => {
    if (password) {
      const result = zxcvbn(password)
      setStrength(result)
    }
  }, [password])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getCharsetSize = () => {
    let size = 0
    if (useLowercase) size += 26
    if (useUppercase) size += 26
    if (useNumbers) size += 10
    if (useSymbols) size += CHAR_SETS.symbols.length
    return size || 62
  }

  const entropy = mode === 'passphrase'
    ? calculatePassphraseEntropy(wordCount)
    : calculateEntropy(password, getCharsetSize())

  const byteLength = getByteLength(password)
  const bcryptWarning = byteLength > 72

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-emerald-500" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Генератор Паролей
            </h1>
          </div>
          <p className="text-zinc-400 text-sm md:text-base">
            Криптографически защищённые пароли с использованием CSPRNG
          </p>
          <p className="text-zinc-500 text-xs mt-2">
            Нулевая телеметрия. Все данные остаются на вашем устройстве.
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
          {/* Mode Tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'passphrase' | 'random')} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
              <TabsTrigger value="passphrase" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Парольная фраза
              </TabsTrigger>
              <TabsTrigger value="random" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                Случайная строка
              </TabsTrigger>
            </TabsList>

            <TabsContent value="passphrase" className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">
                  Количество слов: {wordCount} (~{(wordCount * 12.9).toFixed(1)} бит энтропии)
                </label>
                <Slider
                  value={[wordCount]}
                  onValueChange={([v]) => setWordCount(v)}
                  min={4}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">Разделитель</label>
                <div className="flex gap-2">
                  {['-', '_', '.', ' ', ''].map((sep) => (
                    <Button
                      key={sep}
                      variant={separator === sep ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSeparator(sep)}
                      className={separator === sep ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-zinc-700 hover:bg-zinc-800'}
                    >
                      {sep === '' ? 'нет' : sep === ' ' ? 'пробел' : `"${sep}"`}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="random" className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">
                  Длина: {length} символов (~{entropy.toFixed(1)} бит энтропии)
                </label>
                <Slider
                  value={[length]}
                  onValueChange={([v]) => setLength(v)}
                  min={8}
                  max={64}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-zinc-400">Строчные (a-z)</label>
                  <Switch checked={useLowercase} onCheckedChange={setUseLowercase} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-zinc-400">Прописные (A-Z)</label>
                  <Switch checked={useUppercase} onCheckedChange={setUseUppercase} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-zinc-400">Цифры (0-9)</label>
                  <Switch checked={useNumbers} onCheckedChange={setUseNumbers} />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-zinc-400">Символы (!@#...)</label>
                  <Switch checked={useSymbols} onCheckedChange={setUseSymbols} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Password Display */}
          <div className="relative mb-4">
            <div className="bg-zinc-950 border border-zinc-700 rounded-lg p-4 pr-24 min-h-16 flex items-center">
              <code className="text-lg md:text-xl font-mono break-all text-emerald-400">
                {showPassword ? password : '•'.repeat(Math.min(password.length, 30))}
              </code>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:bg-zinc-800"
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="hover:bg-zinc-800"
                aria-label="Копировать пароль"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generatePassword}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Сгенерировать новый пароль
          </Button>
        </Card>

        {/* Strength Analysis */}
        {strength && (
          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-zinc-200">Анализ надёжности</h2>
            
            {/* Strength Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className={`font-medium ${strengthLabels[strength.score].textColor}`}>
                  {strengthLabels[strength.score].label}
                </span>
                <span className="text-sm text-zinc-400">
                  {entropy.toFixed(1)} бит энтропии
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strengthLabels[strength.score].color} transition-all duration-300`}
                  style={{ width: `${(strength.score + 1) * 20}%` }}
                />
              </div>
            </div>

            {/* Time to Crack */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-zinc-800 rounded-lg p-3">
                <div className="text-zinc-400 mb-1">Онлайн атака (10/сек)</div>
                <div className="font-mono text-zinc-200">
                  {formatCrackTime(strength.crackTimesSeconds.onlineThrottling100PerHour * 36)}
                </div>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3">
                <div className="text-zinc-400 mb-1">Офлайн атака (10B/сек)</div>
                <div className="font-mono text-zinc-200">
                  {formatCrackTime(strength.crackTimesSeconds.offlineFastHashing1e10PerSecond)}
                </div>
              </div>
            </div>

            {/* Feedback */}
            {strength.feedback.warning && (
              <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-200">{strength.feedback.warning}</div>
                </div>
              </div>
            )}

            {/* bcrypt Warning */}
            {bcryptWarning && (
              <div className="mt-4 p-3 bg-orange-900/30 border border-orange-700/50 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-orange-200">
                    <strong>Предупреждение bcrypt:</strong> Этот пароль содержит {byteLength} байт. 
                    Алгоритм bcrypt обрезает пароли длиннее 72 байт, что может снизить безопасность.
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Info Section */}
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-4 text-zinc-200">О безопасности</h2>
          <div className="space-y-3 text-sm text-zinc-400">
            <p>
              <strong className="text-zinc-300">Криптографическая случайность:</strong> Используется 
              <code className="mx-1 px-1 bg-zinc-800 rounded">window.crypto.getRandomValues()</code> — 
              криптографически стойкий генератор случайных чисел операционной системы.
            </p>
            <p>
              <strong className="text-zinc-300">Парольные фразы:</strong> Метод Diceware со списком 
              EFF (7776 слов). 6 слов = ~77.5 бит энтропии.
            </p>
            <p>
              <strong className="text-zinc-300">Нормализация Unicode:</strong> Все пароли нормализуются 
              в форму NFC для совместимости между платформами.
            </p>
            <p>
              <strong className="text-zinc-300">Нулевая телеметрия:</strong> Никакие данные не покидают 
              ваше устройство. Весь код выполняется локально в браузере.
            </p>
          </div>
        </Card>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-zinc-600">
          <p>Статическое приложение без серверной части. Исходный код открыт.</p>
          <p className="mt-1">
            <code className="px-1 bg-zinc-900 rounded">autocomplete="new-password"</code> для интеграции с менеджерами паролей.
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
