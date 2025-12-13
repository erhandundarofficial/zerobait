import { useI18n } from '../i18n'

export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n()
  return (
    <div className="flex items-center gap-2" aria-label="Language selector">
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`px-2 py-1 text-xs rounded-md border ${lang === 'en' ? 'border-white/30 bg-white/10 text-white' : 'border-white/10 text-white/70 hover:text-white hover:border-white/20'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('tr')}
        className={`px-2 py-1 text-xs rounded-md border ${lang === 'tr' ? 'border-white/30 bg-white/10 text-white' : 'border-white/10 text-white/70 hover:text-white hover:border-white/20'}`}
      >
        TR
      </button>
    </div>
  )
}
