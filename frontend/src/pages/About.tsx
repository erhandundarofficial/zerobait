import { useI18n } from '../i18n'

export default function AboutPage() {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black tracking-[-0.02em]">{t('pages.about.title')}</h1>
      <p className="text-sm text-white/60">{t('pages.about.subtitle')}</p>
      <div className="prose prose-invert max-w-none text-white/80">
        <p>{t('pages.about.p1')}</p>
        <p>{t('pages.about.p2')}</p>
        <p>{t('pages.about.p3')}</p>
      </div>
    </div>
  )
}
