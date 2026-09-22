export interface LegalSection {
  icon: string
  heading: string
  body: string
}

export interface LegalContact {
  email: string
  title: string
  intro: string
  noteTitle: string
  note: string
}

export interface LegalDocument {
  title: string
  sections: LegalSection[]
  contact: LegalContact
}

export const CONTACT_EMAIL = 'fghfghffdgfhfgh@gmail.com'

const CONTACT_NOTE = {
  en: {
    noteTitle: 'A quick note about this email:',
    note:
      'This address may look like a random string of letters, but it is simply the developer\u2019s personal email address \u2014 not a suspicious or auto-generated one. It is the official way to reach us.',
  },
  ar: {
    noteTitle: 'ملاحظة سريعة حول هذا البريد:',
    note:
      'قد يبدو هذا العنوان كسلسلة حروف عشوائية، لكنه مجرد البريد الشخصي للمطوّر — وليس بريداً مشبوهاً أو مولّداً تلقائياً. إنه الطريقة الرسمية للتواصل معنا.',
  },
}

export const privacyPolicy: Record<string, LegalDocument> = {
  en: {
    title: 'Privacy Policy',
    sections: [
      {
        icon: '📋',
        heading: 'Information We Collect',
        body: 'When you create an account, we collect only your email address and an encrypted copy of your vault. Your password is never collected, transmitted, or stored \u2014 the encryption key is derived from it on your device and never leaves it. No trackers, ads, or analytics of any kind.',
      },
      {
        icon: '🔐',
        heading: 'How We Use Your Information',
        body: 'Your email is used only for authentication and to associate your encrypted vault with your account. Your encrypted vault data is stored solely for cloud backup and restoration across your devices \u2014 and only if you enable cloud sync.',
      },
      {
        icon: '🫆',
        heading: 'Biometrics (Android)',
        body: 'OtpVault can unlock with your fingerprint or face using Android\u2019s system BiometricPrompt. Biometric data is processed entirely by the operating system on your device \u2014 OtpVault never sees, stores, or transmits any biometric information.',
      },
      {
        icon: '🛡️',
        heading: 'Data Storage and Security',
        body: 'Your vault is encrypted end-to-end with AES-256-GCM before it ever leaves your device. The key is derived from your password with Argon2id and never transmitted. Our servers (hosted on Neon PostgreSQL behind a Vercel serverless API) only ever see ciphertext \u2014 we cannot read your vault, and therefore cannot recover it if you forget your password.',
      },
      {
        icon: '🔗',
        heading: 'Data Sharing',
        body: 'We do not sell, trade, or share your personal information with any third party. Infrastructure partners (Vercel, Neon, GitHub) process data solely to operate the service and never have access to readable vault contents.',
      },
      {
        icon: '⬆️',
        heading: 'App Updates',
        body: 'OtpVault checks GitHub Releases for new versions. On Windows and Android you may be offered a one-tap update that downloads the official installer or APK. Only official releases published to the OtpVault repository are ever used.',
      },
      {
        icon: '✅',
        heading: 'Your Rights',
        body: 'You own your data. You can export your whole vault from the app settings at any time, and delete your account and all associated data with one tap. For anything else, contact us at the address below.',
      },
      {
        icon: '🔄',
        heading: 'Changes to This Policy',
        body: 'We may update this Privacy Policy from time to time. Material changes are announced through the app and the repository. Continued use of the service after changes take effect means you accept the updated policy.',
      },
    ],
    contact: {
      email: CONTACT_EMAIL,
      title: 'Contact',
      intro:
        'Questions, data-deletion requests, or anything privacy-related? Reach out directly \u2014 this is your single point of contact with the developer:',
      ...CONTACT_NOTE.en,
    },
  },
  ar: {
    title: 'سياسة الخصوصية',
    sections: [
      {
        icon: '📋',
        heading: 'المعلومات التي نجمعها',
        body: 'عند إنشاء حساب، نجمع فقط بريدك الإلكتروني ونسخة مشفرة من خزنتك. كلمة المرور الخاصة بك لا تُجمع ولا تُرسل ولا تُخزّن أبداً — يُشتق مفتاح التشفير منها على جهازك ولا يغادره إطلاقاً. لا توجد أدوات تتبع أو إعلانات أو تحليلات من أي نوع.',
      },
      {
        icon: '🔐',
        heading: 'كيف نستخدم معلوماتك',
        body: 'يُستخدم بريدك الإلكتروني فقط للمصادقة وربط خزنتك المشفرة بحسابك. تُخزَّن بيانات خزنتك المشفرة لغرض النسخ الاحتياطي السحابي والاستعادة عبر أجهزتك — وفقط إذا اخترت تفعيل المزامنة السحابية.',
      },
      {
        icon: '🫆',
        heading: 'القياسات الحيوية (أندرويد)',
        body: 'يمكن لـ OtpVault فتح القفل ببصمة إصبعك أو وجهك عبر BiometricPrompt الخاص بنظام أندرويد. تُعالَج البيانات الحيوية بالكامل داخل نظام التشغيل على جهازك — ولا يطّلع OtpVault عليها أو يخزّنها أو يرسلها أبداً.',
      },
      {
        icon: '🛡️',
        heading: 'تخزين البيانات والأمان',
        body: 'تُشفَّر خزنتك بالكامل بتقنية AES-256-GCM قبل مغادرتها جهازك. يُشتق المفتاح من كلمة المرور بتقنية Argon2id ولا يُرسل أبداً. خوادمنا (المستضافة على Neon PostgreSQL عبر واجهة Vercel) لا ترى سوى نص مشفّر — لا يمكننا قراءة خزنتك، ولهذا لا يمكننا استعادتها أبداً إذا نسيت كلمة المرور.',
      },
      {
        icon: '🔗',
        heading: 'مشاركة البيانات',
        body: 'لا نبيع أو نتبادل أو نشارك معلوماتك الشخصية مع أي طرف ثالث. شركاء البنية التحتية (Vercel وNeon وGitHub) يعالجون البيانات فقط لتشغيل الخدمة ولا يصلون أبداً إلى محتويات الخزنة القابلة للقراءة.',
      },
      {
        icon: '⬆️',
        heading: 'تحديثات التطبيق',
        body: 'يتحقق OtpVault من إصدارات GitHub Releases للحصول على النسخ الجديدة. على ويندوز وأندرويد قد يُعرض عليك تحديث بنقرة واحدة لتنزيل المثبّت الرسمي أو الـ APK. لا تُستخدم سوى النسخ الرسمية المنشورة في مستودع OtpVault.',
      },
      {
        icon: '✅',
        heading: 'حقوقك',
        body: 'بياناتك ملكك. يمكنك تصدير خزنتك بالكامل من إعدادات التطبيق في أي وقت، وحذف حسابك وجميع بياناته بنقرة واحدة. لأي شيء آخر، تواصل معنا على العنوان أدناه.',
      },
      {
        icon: '🔄',
        heading: 'تغييرات هذه السياسة',
        body: 'قد نحدّث سياسة الخصوصية هذه من وقت لآخر. يتم الإعلان عن التغييرات الجوهرية عبر التطبيق والمستودع. استمرارك في استخدام الخدمة بعد سريان التغييرات يعني قبولك للسياسة المحدّثة.',
      },
    ],
    contact: {
      email: CONTACT_EMAIL,
      title: 'الاتصال بنا',
      intro:
        'لديك أسئلة أو طلب حذف بيانات أو أي أمر يخص الخصوصية؟ تواصل مباشرة — هذا هو نقطة التواصل الوحيدة مع المطوّر:',
      ...CONTACT_NOTE.ar,
    },
  },
}

export const termsOfService: Record<string, LegalDocument> = {
  en: {
    title: 'Terms of Service',
    sections: [
      {
        icon: '✅',
        heading: 'Acceptance of Terms',
        body: 'By creating an account and using OtpVault \u2014 on Windows, Android, or the browser PWA \u2014 you agree to these Terms of Service. If you do not agree, please do not use the service.',
      },
      {
        icon: '📱',
        heading: 'Description of Service',
        body: 'OtpVault is a two-factor authentication (2FA) app that stores your TOTP secrets in a zero-knowledge encrypted vault. It runs natively on Windows (MSI), on Android (APK), and in any modern browser (PWA). Optional cloud sync backs up your encrypted vault across your devices.',
      },
      {
        icon: '🙋',
        heading: 'User Responsibilities',
        body: 'You are responsible for keeping your email and password confidential, and for all activity that happens under your account. Because OtpVault is zero-knowledge, your password cannot be recovered or reset by anyone \u2014 if you lose it, your encrypted vault is unrecoverable.',
      },
      {
        icon: '🛡️',
        heading: 'Security and Biometric Unlock',
        body: 'Your vault is protected with AES-256-GCM, with the key derived from your password using Argon2id. On Android you may optionally unlock with fingerprint or face via the system BiometricPrompt. You are responsible for controlling who can use your device and your biometrics to unlock the vault.',
      },
      {
        icon: '⚖️',
        heading: 'Acceptable Use',
        body: 'You agree not to misuse the service, attempt to disrupt it, abuse the cloud sync endpoints, or use OtpVault for any unlawful purpose. You also agree not to attempt to extract other users\u2019 data from the service.',
      },
      {
        icon: '⬆️',
        heading: 'Updates and Availability',
        body: 'OtpVault is updated through GitHub Releases. On Windows and Android, in-app update prompts install the latest official version. Cloud sync requires an internet connection; core TOTP generation works fully offline.',
      },
      {
        icon: '📖',
        heading: 'Open Source',
        body: 'OtpVault is open-source software released under the MIT license. The entire source code is public on GitHub \u2014 you may review, compile, and verify every build yourself.',
      },
      {
        icon: '🚫',
        heading: 'Limitation of Liability',
        body: 'OtpVault is provided "as is" without warranty of any kind, express or implied. The developers are not liable for any damages arising from the use of this software, including but not limited to lost account access, data loss, or missed codes.',
      },
      {
        icon: '🔄',
        heading: 'Changes to Terms',
        body: 'We may update these terms from time to time. Changes are announced through the app and the repository. Continued use of the service after changes take effect constitutes acceptance of the new terms.',
      },
      {
        icon: '⛔',
        heading: 'Termination',
        body: 'We may suspend or terminate an account that violates these terms or disrupts the service. You may stop using OtpVault at any time and delete your account \u2014 including all associated data \u2014 directly from the app.',
      },
    ],
    contact: {
      email: CONTACT_EMAIL,
      title: 'Contact',
      intro: 'Questions about these terms, or anything else? This is the developer\u2019s direct line:',
      ...CONTACT_NOTE.en,
    },
  },
  ar: {
    title: 'شروط الخدمة',
    sections: [
      {
        icon: '✅',
        heading: 'قبول الشروط',
        body: 'بإنشاء حساب واستخدام OtpVault — على ويندوز أو أندرويد أو PWA المتصفح — فإنك توافق على شروط الخدمة هذه. إذا كنت لا توافق، يرجى عدم استخدام الخدمة.',
      },
      {
        icon: '📱',
        heading: 'وصف الخدمة',
        body: 'OtpVault هو تطبيق للتحقق بخطوتين (2FA) يخزّن أسرار TOTP الخاصة بك في خزنة مشفّرة بالكامل (Zero-Knowledge). يعمل أصلياً على ويندوز (MSI) وعلى أندرويد (APK) وفي أي متصفح حديث (PWA). النسخ الاحتياطي السحابي الاختياري يزامن خزنتك المشفّرة بين أجهزتك.',
      },
      {
        icon: '🙋',
        heading: 'مسؤوليات المستخدم',
        body: 'أنت مسؤول عن الحفاظ على سرية بريدك الإلكتروني وكلمة المرور، وعن جميع الأنشطة التي تتم تحت حسابك. ولأن OtpVault لا يعرف كلمة مرورك (Zero-Knowledge)، فلا يمكن لأحد استعادة كلمة المرور أو إعادة تعيينها — إذا فقدتها، تصبح خزنتك المشفّرة غير قابلة للاستعادة.',
      },
      {
        icon: '🛡️',
        heading: 'الأمان وفتح القفل البيومتري',
        body: 'خزنتك محمية بتقنية AES-256-GCM، والمفتاح يُشتق من كلمة المرور باستخدام Argon2id. على أندرويد يمكنك اختيارياً فتح القفل ببصمة الإصبع أو الوجه عبر BiometricPrompt الخاص بالنظام. أنت مسؤول عن التحكم في من يستخدم جهازك وبياناتك البيومترية لفتح الخزنة.',
      },
      {
        icon: '⚖️',
        heading: 'الاستخدام المقبول',
        body: 'أنت توافق على عدم إساءة استخدام الخدمة أو محاولة تعطيلها أو إساءة استخدام نقاط المزامنة السحابية، وعدم استخدام OtpVault لأي غرض غير قانوني، وعدم محاولة استخراج بيانات مستخدمين آخرين من الخدمة.',
      },
      {
        icon: '⬆️',
        heading: 'التحديثات والتوفر',
        body: 'يتم تحديث OtpVault عبر GitHub Releases. على ويندوز وأندرويد، تثبّت مطالبات التحديث داخل التطبيق أحدث نسخة رسمية. المزامنة السحابية تحتاج اتصالاً بالإنترنت؛ بينما يعمل توليد أكواد TOTP الأساسي بالكامل دون اتصال.',
      },
      {
        icon: '📖',
        heading: 'المصدر المفتوح',
        body: 'OtpVault برنامج مفتوح المصدر يُرخّص بموجب رخصة MIT. كامل كود المصدر متاح للعموم على GitHub — يمكنك مراجعة البرنامج وتجميعه والتحقق من كل بناء بنفسك.',
      },
      {
        icon: '🚫',
        heading: 'حدود المسؤولية',
        body: 'OtpVault يُقدَّم "كما هو" دون أي ضمان من أي نوع، صريح أو ضمني. المطوّرون غير مسؤولين عن أي أضرار ناتجة عن استخدام هذا البرنامج، بما في ذلك على سبيل المثال لا الحصر فقدان الوصول إلى الحسابات أو فقدان البيانات أو الأكواد الفائتة.',
      },
      {
        icon: '🔄',
        heading: 'تغييرات الشروط',
        body: 'قد نحدّث هذه الشروط من وقت لآخر. يتم الإعلان عن التغييرات عبر التطبيق والمستودع. استمرارك في استخدام الخدمة بعد سريان التغييرات يعني قبولك للشروط الجديدة.',
      },
      {
        icon: '⛔',
        heading: 'إنهاء الخدمة',
        body: 'قد نعلّق أو ننهي حساباً يخالف هذه الشروط أو يعطّل الخدمة. يمكنك التوقف عن استخدام OtpVault في أي وقت وحذف حسابك — بما في ذلك جميع البيانات المرتبطة — مباشرة من التطبيق.',
      },
    ],
    contact: {
      email: CONTACT_EMAIL,
      title: 'الاتصال بنا',
      intro: 'لديك أسئلة حول هذه الشروط أو أي شيء آخر؟ هذا هو خط المطوّر المباشر:',
      ...CONTACT_NOTE.ar,
    },
  },
}