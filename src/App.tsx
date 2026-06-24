import { useState, useCallback } from 'react'
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, RefreshCw, Shield, Check, Trash2 } from 'lucide-react'
import { useLanguage } from '@/i18n/useLanguage'
import './App.css'
import effWordlistRaw from './eff-wordlist.txt?raw'

const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: { ...zxcvbnCommonPackage.dictionary, ...zxcvbnEnPackage.dictionary },
}
zxcvbnOptions.setOptions(options)

const effWordlist: string[] = effWordlistRaw.split('\n').filter(line => line.trim()).map(line => line.split('\t')[1]).filter(Boolean)

const CHAR_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

function getSecureRandomInt(max: number): number {
  const array = new Uint32Array(1)
  window.crypto.getRandomValues(array)
  return array[0] % max
}

function generateRandomString(length: number, useLowercase: boolean, useUppercase: boolean, useNumbers: boolean, useSymbols: boolean): string {
  let charset = ''
  if (useLowercase) charset += CHAR_SETS.lowercase
  if (useUppercase) charset += CHAR_SETS.uppercase
  if (useNumbers) charset += CHAR_SETS.numbers
  if (useSymbols) charset += CHAR_SETS.symbols
  if (charset.length === 0) charset = CHAR_SETS.lowercase + CHAR_SETS.uppercase + CHAR_SETS.numbers
  let result = ''
  for (let i = 0; i < length; i++) result += charset[getSecureRandomInt(charset.length)]
  return result
}

function generatePassphrase(wordCount: number, separator: string): string {
  const words: string[] = []
  for (let i = 0; i < wordCount; i++) words.push(effWordlist[getSecureRandomInt(effWordlist.length)])
  return words.join(separator)
}

function calculateEntropy(length: number, charsetSize: number): number {
  return length * Math.log2(charsetSize)
}

function calculatePassphraseEntropy(wordCount: number): number {
  return wordCount * Math.log2(7776)
}

interface GeneratedPassword {
  id: number
  password: string
  strength: ReturnType<typeof zxcvbn>
  copied: boolean
}

function App() {
  const { lang, setLang, t, strengthLabels } = useLanguage()
  const [mode, setMode] = useState<'passphrase' | 'random'>('random')
  const [passwords, setPasswords] = useState<GeneratedPassword[]>([])
  const [wordCount, setWordCount] = useState(6)
  const [separator, setSeparator] = useState('-')
  const [length, setLength] = useState(16)
  const [useLowercase, setUseLowercase] = useState(true)
  const [useUppercase, setUseUppercase] = useState(true)
  const [useNumbers, setUseNumbers] = useState(true)
  const [useSymbols, setUseSymbols] = useState(true)
  const [passwordCount, setPasswordCount] = useState(10)

  const generatePasswords = useCallback(() => {
    const newPasswords: GeneratedPassword[] = []
    for (let i = 0; i < passwordCount; i++) {
      const newPassword = mode === 'passphrase'
        ? generatePassphrase(wordCount, separator)
        : generateRandomString(length, useLowercase, useUppercase, useNumbers, useSymbols)
      newPasswords.push({ id: Date.now() + i, password: newPassword.normalize('NFC'), strength: zxcvbn(newPassword), copied: false })
    }
    setPasswords(newPasswords)
  }, [mode, wordCount, separator, length, useLowercase, useUppercase, useNumbers, useSymbols, passwordCount])

  const copyToClipboard = async (id: number, password: string) => {
    await navigator.clipboard.writeText(password)
    setPasswords(prev => prev.map(p => p.id === id ? { ...p, copied: true } : p))
    setTimeout(() => setPasswords(prev => prev.map(p => p.id === id ? { ...p, copied: false } : p)), 2000)
  }

  const copyAllPasswords = async () => {
    await navigator.clipboard.writeText(passwords.map(p => p.password).join('\n'))
  }

  const getCharsetSize = () => {
    let size = 0
    if (useLowercase) size += 26
    if (useUppercase) size += 26
    if (useNumbers) size += 10
    if (useSymbols) size += CHAR_SETS.symbols.length
    return size || 62
  }

  const entropy = mode === 'passphrase' ? calculatePassphraseEntropy(wordCount) : calculateEntropy(length, getCharsetSize())

  const separatorLabel = (sep: string) => {
    if (sep === '') return t('separatorNone')
    if (sep === ' ') return t('separatorSpace')
    return `"${sep}"`
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-emerald-500" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t('appTitle')}</h1>
          </div>
          <p className="text-zinc-400 text-sm md:text-base">{t('appSubtitle')}</p>
          <p className="text-zinc-500 text-xs mt-2">{t('zeroTelemetry')}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant={lang === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLang('en')}
              aria-label="Switch to English"
              className={lang === 'en' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-zinc-700 hover:bg-zinc-800'}
            >
              {t('langSwitchEn')}
            </Button>
            <Button
              variant={lang === 'ru' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLang('ru')}
              aria-label="Switch to Russian"
              className={lang === 'ru' ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-zinc-700 hover:bg-zinc-800'}
            >
              {t('langSwitchRu')}
            </Button>
          </div>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-zinc-200">{t('settingsTitle')}</h2>
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'passphrase' | 'random')} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
              <TabsTrigger value="random" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">{t('modeRandom')}</TabsTrigger>
              <TabsTrigger value="passphrase" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">{t('modePassphrase')}</TabsTrigger>
            </TabsList>
            <TabsContent value="random" className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">{t('lengthLabel', length, entropy)}</label>
                <Slider value={[length]} onValueChange={([v]) => setLength(v)} min={6} max={64} step={1} className="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between"><label className="text-sm text-zinc-400">{t('lowercase')}</label><Switch checked={useLowercase} onCheckedChange={setUseLowercase} /></div>
                <div className="flex items-center justify-between"><label className="text-sm text-zinc-400">{t('uppercase')}</label><Switch checked={useUppercase} onCheckedChange={setUseUppercase} /></div>
                <div className="flex items-center justify-between"><label className="text-sm text-zinc-400">{t('numbers')}</label><Switch checked={useNumbers} onCheckedChange={setUseNumbers} /></div>
                <div className="flex items-center justify-between"><label className="text-sm text-zinc-400">{t('symbols')}</label><Switch checked={useSymbols} onCheckedChange={setUseSymbols} /></div>
              </div>
            </TabsContent>
            <TabsContent value="passphrase" className="mt-4 space-y-4">
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">{t('wordCountLabel', wordCount, entropy)}</label>
                <Slider value={[wordCount]} onValueChange={([v]) => setWordCount(v)} min={3} max={10} step={1} className="w-full" />
              </div>
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">{t('separatorLabel')}</label>
                <div className="flex gap-2 flex-wrap">
                  {['-', '_', '.', ' ', ''].map((sep) => (
                    <Button key={sep} variant={separator === sep ? 'default' : 'outline'} size="sm" onClick={() => setSeparator(sep)} className={separator === sep ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-zinc-700 hover:bg-zinc-800'}>
                      {separatorLabel(sep)}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mb-6">
            <label className="text-sm text-zinc-400 mb-2 block">{t('passwordCountLabel', passwordCount)}</label>
            <Slider value={[passwordCount]} onValueChange={([v]) => setPasswordCount(v)} min={1} max={20} step={1} className="w-full" />
          </div>
          <Button onClick={generatePasswords} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6">
            <RefreshCw className="w-5 h-5 mr-2" />{t('generatePasswords', passwordCount)}
          </Button>
        </Card>

        {passwords.length > 0 && (
          <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-zinc-200">{t('generatedTitle')}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyAllPasswords} className="border-zinc-700 hover:bg-zinc-800"><Copy className="w-4 h-4 mr-1" />{t('copyAll')}</Button>
                <Button variant="outline" size="sm" onClick={() => setPasswords([])} className="border-zinc-700 hover:bg-zinc-800"><Trash2 className="w-4 h-4 mr-1" />{t('clear')}</Button>
              </div>
            </div>
            <div className="space-y-2">
              {passwords.map((item, index) => (
                <div key={item.id} className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors">
                  <span className="text-zinc-500 text-sm w-6 text-right">{index + 1}.</span>
                  <code className="flex-1 font-mono text-emerald-400 break-all text-sm md:text-base">{item.password}</code>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${['bg-red-600', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'][item.strength.score]} text-white`}>{strengthLabels[item.strength.score]}</span>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(item.id, item.password)} className="hover:bg-zinc-800 h-8 w-8" aria-label={item.copied ? t('copiedAria') : t('copyAria')}>
                      {item.copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <h2 className="text-lg font-semibold mb-4 text-zinc-200">{t('aboutSecurityTitle')}</h2>
          <div className="space-y-3 text-sm text-zinc-400">
            <p><strong className="text-zinc-300">{t('cryptoRandomness')}</strong> {t('cryptoRandomnessDesc')}</p>
            <p><strong className="text-zinc-300">{t('passphrases')}</strong> {t('passphrasesDesc')}</p>
            <p><strong className="text-zinc-300">{t('zeroTelemetryDetail')}</strong> {t('zeroTelemetryDetailDesc')}</p>
          </div>
        </Card>
        <footer className="mt-8 text-center text-xs text-zinc-600"><p>{t('footer')}</p></footer>
      </div>
    </div>
  )
}

export default App
