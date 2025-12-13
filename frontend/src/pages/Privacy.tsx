import { useI18n } from '../i18n'

export default function PrivacyPage() {
  const { t } = useI18n()
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black tracking-[-0.02em]">{t('pages.privacy.title')}</h1>
      <p className="text-sm text-white/60">{t('pages.privacy.updated')}</p>
      <div className="prose prose-invert max-w-none text-white/80">
        <p>{t('pages.privacy.p1')}</p>
        <p>{t('pages.privacy.p2')}</p>
        <p>{t('pages.privacy.p3')}</p>
        <p>{t('pages.privacy.p4')}</p>
      </div>
    </div>
  )
}
