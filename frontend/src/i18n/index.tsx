import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type Lang = 'en' | 'tr'

type Dict = Record<string, any>

type I18nContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const defaultLang: Lang = (() => {
  const stored = typeof window !== 'undefined' ? (localStorage.getItem('zb_lang') as Lang | null) : null
  if (stored === 'en' || stored === 'tr') return stored
  // App default: Turkish
  return 'tr'
})()

const resources: Record<Lang, Dict> = {
  en: {
    app: { name: 'Zerobait' },
    risk: {
      ready: 'READY TO SCAN',
      high: 'HIGH RISK',
      medium: 'MODERATE RISK',
      low: 'LOW RISK',
      score_label: 'Risk Score',
    },
    nav: {
      dashboard: 'Dashboard',
      games: 'Games',
      progress: 'My Progress',
      leaderboard: 'Leaderboard',
      login: 'Log In',
      signup: 'Sign Up',
      logout: 'Log out',
      hello_name: 'Hello, {{name}}',
    },
    common: {
      privacy: 'Privacy Policy',
      about: 'About',
      contact: 'Contact',
      save: 'Save',
      cancel: 'Cancel',
      show: 'Show',
      hide: 'Hide',
      back: 'Back',
    },
    login: {
      title: 'Log In',
      subtitle: 'Welcome back. Enter your credentials to continue.',
      username: 'Username',
      password: 'Password',
      submit: 'Log In',
      submitting: 'Logging in…',
      noAccount: "Don’t have an account?",
      signupLink: 'Sign up',
      error_generic: 'Login failed',
    },
    signup: {
      title: 'Sign Up',
      subtitle: 'Create an account to save your progress and appear on leaderboards.',
      username: 'Username',
      email_optional: 'Email (optional)',
      password: 'Password',
      confirm: 'Confirm Password',
      submit: 'Sign Up',
      submitting: 'Creating account…',
      hasAccount: 'Already have an account?',
      loginLink: 'Log in',
      error_mismatch: 'Passwords do not match',
      error_generic: 'Registration failed',
    },
    footer: {
      copyright: '© 2024 Zerobait. All rights reserved.',
    },
    home: {
      hero_title: 'Scan URL for Phishing Threats',
      hero_subtitle: 'Enter a URL below to check for potential phishing threats in real-time.',
      input_placeholder: 'Enter URL to scan (e.g., https://example.com)',
      button_scan: 'Scan Now',
      button_scanning: 'Scanning…',
      report_link: 'Report this URL',
      no_vendor: 'No vendor data',
      waiting_vendor: 'Waiting for vendor analysis…',
      raw_title: 'Raw technical details',
      idle_desc: 'Scan a URL to see results from the Zerobait engine.',
    },
    scanner: {
      hero_title: 'Scan URL for Phishing Threats',
      hero_subtitle: 'Enter a URL below to check for potential phishing threats in real-time.',
      input_placeholder: 'Enter URL to scan (e.g., https://example.com)',
      scan: 'Scan Now',
      scanning: 'Scanning…',
      error_empty: 'Please enter a URL to scan.',
      error_analyze: 'Failed to analyze URL.',
      error_network: 'Network error while analyzing URL.',
      report: 'Report this URL',
      reporting: 'Reporting…',
      report_thanks: 'Thanks for your report!',
      report_failed: 'Failed to report URL.',
      report_network: 'Network error while reporting URL.',
      vt_title: 'VirusTotal',
      vt_no_vendor: 'No vendor data',
      vt_flagged_vendors: '{{count}} flagged / {{total}} vendors',
      ssl_title: 'SSL Labs',
      ssl_no_endpoints: 'No endpoints yet.',
      whois_title: 'WHOIS (Domain Age)',
      whois_unknown: 'unknown',
      screenshot: 'Screenshot',
      raw_title: 'Raw technical details',
    },
    games: {
      modes_label: 'Game Modes',
      choose_title: 'Choose your challenge',
      choose_desc: 'Practice your phishing awareness with short, focused scenarios. Earn points and level up your skills.',
      loading: 'Loading…',
      leaderboard: 'Leaderboard',
      all_time: 'All-time',
      total_score: 'Total Score',
      keep_it_up: 'Keep it up!',
      your_rank: 'Your Rank ({{window}})',
      your_score_line: 'Your {{period}} score: {{score}}',
      period_total: 'total',
      period_recent: 'recent',
      table_rank: 'Rank',
      table_player: 'Player',
      table_score: 'Score',
      not_ranked: 'Not ranked yet',
      prev: 'Prev',
      next: 'Next',
      page_of: 'Page {{page}} of {{pages}}',
      browse: 'Browse Games',
      essentials_title: 'Phishing Essentials',
      essentials_desc: 'URLs, social tricks, passwords, emails, and 2FA basics.',
      password_title: 'Password Security Puzzle',
      password_desc: 'Build a strong password and beat the crack-time target.',
      domain_title: 'Domain Detective',
      domain_desc: 'Spot the real domains among phishing look-alikes.',
      spot_title: 'Spot the Phish!',
      spot_desc: 'Read emails and decide: Safe or Phishing.',
      difficulty_all: 'easy/med/hard',
      no_entries: 'No entries yet',
      anonymous: 'Anonymous',
      difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
      essentials: {
        label: 'Phishing Essentials',
        choose_title: 'Choose a core skill',
        choose_desc: 'Five foundational challenges to sharpen your instincts: URLs, social tricks, passwords, email clues, and 2FA safety.',
      },
      pp: {
        label: 'Password Security Puzzle',
        choose_title: 'Choose your level',
        choose_desc: 'Pick a challenge and aim to exceed the target time to crack.',
        start: 'Start {{level}}',
        target_label: 'Target Time to Crack:',
        estimated_label: 'Estimated Time to Crack',
        reset: 'Reset',
        drag_here: 'Drag pieces here to build your password…',
        preview: 'Password preview',
        pieces_label: 'Pieces',
        win_title: 'Great job! Your password exceeds the target cracking time.',
        finish: 'Finish',
        finishing: 'Finishing…',
        keep_going: 'Keep going—add more variety and length to increase time to crack.',
        req_min8: 'Min 8 characters',
        req_3of4: 'Include at least 3 of: Uppercase, Lowercase, Number, Symbol',
        req_min12: 'Min 12 characters',
        req_all: 'Include Uppercase, Lowercase, Number, Symbol',
        req_min16: 'Min 16 characters',
        req_avoid: 'Avoid common sequences and personal info',
      },
      dd: {
        label: 'Domain Detective',
        choose_title: 'Choose your level',
        choose_desc: 'Click all real domains in each level. Avoid the phishing look-alikes.',
        start: 'Start {{level}}',
        playing_title: 'Find the real domains',
        playing_desc: 'Select only the 4 legitimate domains.',
        feedback_wrong: 'This is a phishing domain!',
        level_complete: 'Level complete! Great job spotting the real domains.',
        next_level: 'Next Level',
        continuing: 'Continuing…',
        finish: 'Finish',
        finishing: 'Finishing…',
        correct_selected: 'Correct selected',
        tip: 'Tip: Watch for number/letter swaps like 0↔o, l↔I, rn↔m.',
      },
      stp: {
        label: 'Spot the Phish!',
        title: 'Decide: Safe or Phishing',
        desc: 'Read the email details and choose. Get explanations after each answer.',
        question_of: 'Question {{i}} / {{n}}',
        from: 'From',
        subject: 'Subject',
        safe_email: 'Safe Email',
        phishing_attempt: 'Phishing Attempt',
        correct: 'Correct!',
        not_quite: 'Not quite.',
        next: 'Next',
        finish: 'Finish',
        score: 'Score',
      },
    },
    game: {
      back: 'Back',
      submit: 'Submit Answers',
      submitting: 'Submitting…',
      your_score: 'Your score',
      hint: 'Hint',
    },
  },
  tr: {
    app: { name: 'Zerobait' },
    risk: {
      ready: 'TARAMAYA HAZIR',
      high: 'YÜKSEK RİSK',
      medium: 'ORTA RİSK',
      low: 'DÜŞÜK RİSK',
      score_label: 'Risk Skoru',
    },
    nav: {
      dashboard: 'Panel',
      games: 'Oyunlar',
      progress: 'İlerlemem',
      leaderboard: 'Liderlik Tablosu',
      login: 'Giriş Yap',
      signup: 'Kayıt Ol',
      logout: 'Çıkış Yap',
      hello_name: 'Merhaba, {{name}}',
    },
    common: {
      privacy: 'Gizlilik Politikası',
      about: 'Hakkında',
      contact: 'İletişim',
      save: 'Kaydet',
      cancel: 'İptal',
      show: 'Göster',
      hide: 'Gizle',
      back: 'Geri',
    },
    login: {
      title: 'Giriş Yap',
      subtitle: 'Tekrar hoş geldin. Devam etmek için bilgilerini gir.',
      username: 'Kullanıcı Adı',
      password: 'Şifre',
      submit: 'Giriş Yap',
      submitting: 'Giriş yapılıyor…',
      noAccount: 'Hesabın yok mu?',
      signupLink: 'Kayıt ol',
      error_generic: 'Giriş başarısız',
    },
    signup: {
      title: 'Kayıt Ol',
      subtitle: 'İlerlemeni kaydetmek ve liderlik tablosunda yer almak için hesap oluştur.',
      username: 'Kullanıcı Adı',
      email_optional: 'E-posta (opsiyonel)',
      password: 'Şifre',
      confirm: 'Şifreyi Doğrula',
      submit: 'Kayıt Ol',
      submitting: 'Hesap oluşturuluyor…',
      hasAccount: 'Zaten hesabın var mı?',
      loginLink: 'Giriş yap',
      error_mismatch: 'Şifreler uyuşmuyor',
      error_generic: 'Kayıt başarısız',
    },
    footer: {
      copyright: '© 2024 Zerobait. Tüm hakları saklıdır.',
    },
    home: {
      hero_title: 'URL’i Oltalama Tehdidine Karşı Tara',
      hero_subtitle: 'Gerçek zamanlı kontrol için aşağıya bir URL gir.',
      input_placeholder: 'Kontrol edilecek URL’yi gir (örn. https://example.com)',
      button_scan: 'Şimdi Tara',
      button_scanning: 'Taranıyor…',
      report_link: 'Bu URL’i bildir',
      no_vendor: 'Satıcı verisi yok',
      waiting_vendor: 'Satıcı analizi bekleniyor…',
      raw_title: 'Ham teknik detaylar',
      idle_desc: 'Zerobait motorundan sonuçları görmek için bir URL tara.',
    },
    scanner: {
      hero_title: 'URL’i Oltalama Tehdidine Karşı Tara',
      hero_subtitle: 'Gerçek zamanlı kontrol için aşağıya bir URL gir.',
      input_placeholder: 'Kontrol edilecek URL’yi gir (örn. https://example.com)',
      scan: 'Şimdi Tara',
      scanning: 'Taranıyor…',
      error_empty: 'Taramak için bir URL girin.',
      error_analyze: 'URL analiz edilemedi.',
      error_network: 'URL analiz edilirken ağ hatası.',
      report: 'Bu URL’i bildir',
      reporting: 'Bildiriliyor…',
      report_thanks: 'Bildirim için teşekkürler!',
      report_failed: 'URL bildirilemedi.',
      report_network: 'URL bildirilirken ağ hatası.',
      vt_title: 'VirusTotal',
      vt_no_vendor: 'Satıcı verisi yok',
      vt_flagged_vendors: '{{count}} işaretli / {{total}} satıcı',
      ssl_title: 'SSL Labs',
      ssl_no_endpoints: 'Uç nokta yok.',
      whois_title: 'WHOIS (Alan Adı Yaşı)',
      whois_unknown: 'bilinmiyor',
      screenshot: 'Ekran görüntüsü',
      raw_title: 'Ham teknik detaylar',
    },
    games: {
      modes_label: 'Oyun Modları',
      choose_title: 'Meydan okumayı seç',
      choose_desc: 'Kısa ve odaklı senaryolarla oltalama farkındalığını geliştir. Puan kazan ve seviyeni yükselt.',
      loading: 'Yükleniyor…',
      leaderboard: 'Liderlik Tablosu',
      all_time: 'Tüm zamanlar',
      total_score: 'Toplam Puan',
      keep_it_up: 'Böyle devam!',
      your_rank: 'Sıralaman ({{window}})',
      your_score_line: '{{period}} puanın: {{score}}',
      period_total: 'toplam',
      period_recent: 'son',
      table_rank: 'Sıra',
      table_player: 'Oyuncu',
      table_score: 'Puan',
      not_ranked: 'Henüz sıralamada değilsin',
      prev: 'Önceki',
      next: 'Sonraki',
      page_of: 'Sayfa {{page}} / {{pages}}',
      browse: 'Oyunlara Göz At',
      essentials_title: 'Oltalama Temelleri',
      essentials_desc: 'URL’ler, sosyal taktikler, şifreler, e-postalar ve 2FA temelleri.',
      password_title: 'Şifre Güvenliği Bulmacası',
      password_desc: 'Güçlü bir şifre oluştur ve kırılma süresini geç.',
      domain_title: 'Alan Adı Dedektifi',
      domain_desc: 'Oltalama benzerleri arasından gerçek alan adlarını bul.',
      spot_title: 'Phish’i Yakala!',
      spot_desc: 'E-postaları oku ve karar ver: Güvenli mi Oltalama mı.',
      difficulty_all: 'kolay/orta/zor',
      no_entries: 'Henüz giriş yok',
      anonymous: 'Anonim',
      difficulty: { easy: 'Kolay', medium: 'Orta', hard: 'Zor' },
      essentials: {
        label: 'Oltalama Temelleri',
        choose_title: 'Temel bir beceri seç',
        choose_desc: 'İçgüdülerini bilemek için beş temel meydan okuma: URL’ler, sosyal taktikler, şifreler, e-posta ipuçları ve 2FA güvenliği.',
      },
      pp: {
        label: 'Şifre Güvenliği Bulmacası',
        choose_title: 'Seviyeni seç',
        choose_desc: 'Bir meydan okuma seç ve kırılma süresi hedefini aşmayı amaçla.',
        start: '{{level}} Başlat',
        target_label: 'Kırılma Hedef Süresi:',
        estimated_label: 'Tahmini Kırılma Süresi',
        reset: 'Sıfırla',
        drag_here: 'Şifreni oluşturmak için parçaları buraya sürükle…',
        preview: 'Şifre önizlemesi',
        pieces_label: 'Parçalar',
        win_title: 'Harika! Şifren hedeflenen kırılma süresini aşıyor.',
        finish: 'Bitir',
        finishing: 'Bitiriliyor…',
        keep_going: 'Devam et—çeşitliliği ve uzunluğu artırarak kırılma süresini yükselt.',
        req_min8: 'En az 8 karakter',
        req_3of4: "En az 3’ünü içer: Büyük, Küçük, Rakam, Sembol",
        req_min12: 'En az 12 karakter',
        req_all: 'Büyük, Küçük, Rakam, Sembol içersin',
        req_min16: 'En az 16 karakter',
        req_avoid: 'Yaygın diziler ve kişisel bilgilerden kaçın',
      },
      dd: {
        label: 'Alan Adı Dedektifi',
        choose_title: 'Seviyeni seç',
        choose_desc: 'Her seviyede gerçek alan adlarının tümünü seç. Oltalama benzerlerinden kaçın.',
        start: '{{level}} Başlat',
        playing_title: 'Gerçek alan adlarını bul',
        playing_desc: 'Yalnızca 4 gerçek alan adını seç.',
        feedback_wrong: 'Bu bir oltalama alan adı!',
        level_complete: 'Seviye tamam! Gerçek alan adlarını harika yakaladın.',
        next_level: 'Sonraki Seviye',
        continuing: 'Devam ediliyor…',
        finish: 'Bitir',
        finishing: 'Bitiriliyor…',
        correct_selected: 'Doğru seçilen',
        tip: 'İpucu: 0↔o, l↔I, rn↔m gibi harf/sayı değişimlerine dikkat et.',
      },
      stp: {
        label: 'Phish’i Yakala!',
        title: 'Karar ver: Güvenli mi Oltalama mı',
        desc: 'E-posta ayrıntılarını oku ve seçim yap. Her cevaptan sonra açıklamaları gör.',
        question_of: 'Soru {{i}} / {{n}}',
        from: 'Kimden',
        subject: 'Konu',
        safe_email: 'Güvenli E-posta',
        phishing_attempt: 'Oltalama Girişimi',
        correct: 'Doğru!',
        not_quite: 'Tam değil.',
        next: 'İleri',
        finish: 'Bitir',
        score: 'Puan',
      },
    },
    game: {
      back: 'Geri',
      submit: 'Cevapları Gönder',
      submitting: 'Gönderiliyor…',
      your_score: 'Puanın',
      hint: 'İpucu',
    },
  },
}

function interpolate(str: string, params?: Record<string, string | number>) {
  if (!params) return str
  return str.replace(/\{\{(.*?)\}\}/g, (_, k) => String(params[k.trim()] ?? ''))
}

function resolveKey(dict: Dict, key: string): string | undefined {
  const parts = key.split('.')
  let cur: any = dict
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p]
    else return undefined
  }
  return typeof cur === 'string' ? cur : undefined
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(defaultLang)

  useEffect(() => {
    try { localStorage.setItem('zb_lang', lang) } catch {}
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
  }, [])

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const raw = resolveKey(resources[lang], key) ?? resolveKey(resources.en, key) ?? key
    return interpolate(raw, params)
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider')
  return ctx
}
