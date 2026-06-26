export interface LegalSection {
  heading: string
  body: string
}

export interface LegalDocument {
  title: string
  sections: LegalSection[]
}

export const privacyPolicy: Record<string, LegalDocument> = {
  en: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Information We Collect',
        body: 'When you create an account, we collect your email address and an encrypted version of your vault. The encryption key is derived from your password on your device and never sent to our servers. We do not collect any personal information beyond what is necessary to provide the service.',
      },
      {
        heading: 'How We Use Your Information',
        body: 'Your email is used solely for authentication and to associate your encrypted vault with your account. Your encrypted vault data is stored on our servers solely for the purpose of cloud backup and restoration across your devices.',
      },
      {
        heading: 'Data Storage and Security',
        body: 'All vault data is encrypted end-to-end using AES-256-GCM before leaving your device. The encryption key is derived from your password using Argon2id and never transmitted. We have no ability to access your vault contents.',
      },
      {
        heading: 'Data Sharing',
        body: 'We do not sell, trade, or share your personal information with third parties. Encrypted vault data may be stored on Supabase infrastructure for cloud backup functionality.',
      },
      {
        heading: 'Your Rights',
        body: 'You may delete your account and all associated data at any time. Contact us to request data deletion. You can export your vault data at any time from the app settings.',
      },
      {
        heading: 'Changes to This Policy',
        body: 'We may update this Privacy Policy from time to time. Users will be notified of material changes through the app.',
      },
      {
        heading: 'Contact',
        body: 'If you have questions about this Privacy Policy, please open an issue on our GitHub repository.',
      },
    ],
  },
  ar: {
    title: 'سياسة الخصوصية',
    sections: [
      {
        heading: 'المعلومات التي نجمعها',
        body: 'عند إنشاء حساب، نجمع عنوان بريدك الإلكتروني ونسخة مشفرة من خزنتك. يُشتق مفتاح التشفير من كلمة المرور الخاصة بك على جهازك ولا يُرسل أبداً إلى خوادمنا. لا نجمع أي معلومات شخصية تتجاوز ما هو ضروري لتقديم الخدمة.',
      },
      {
        heading: 'كيف نستخدم معلوماتك',
        body: 'يُستخدم بريدك الإلكتروني فقط للمصادقة وربط خزنتك المشفرة بحسابك. تُخزّن بيانات خزنتك المشفرة على خوادمنا لغرض النسخ الاحتياطي السحابي والاستعادة عبر أجهزتك.',
      },
      {
        heading: 'تخزين البيانات والأمان',
        body: 'جميع بيانات الخزنة مشفرة من البداية إلى النهاية باستخدام AES-256-GCM قبل مغادرتها جهازك. يُشتق مفتاح التشفير من كلمة المرور باستخدام Argonid ولا يُنقل أبداً. ليست لدينا القدرة على الوصول إلى محتويات خزنتك.',
      },
      {
        heading: 'مشاركة البيانات',
        body: 'لا نبيع أو نتبادل أو نشارك معلوماتك الشخصية مع أطراف ثالثة. قد تُخزّن بيانات الخزنة المشفرة على بنية Supabase التحتية لوظيفة النسخ الاحتياطي السحابي.',
      },
      {
        heading: 'حقوقك',
        body: 'يمكنك حذف حسابك وجميع البيانات المرتبطة به في أي وقت. تواصل معنا لطلب حذف البيانات. يمكنك تصدير بيانات خزنتك في أي وقت من إعدادات التطبيق.',
      },
      {
        heading: 'تغييرات هذه السياسة',
        body: 'قد نحدّث سياسة الخصوصية هذه من وقت لآخر. سيتم إخطار المستخدمين بالتغييرات الجوهرية عبر التطبيق.',
      },
      {
        heading: 'الاتصال بنا',
        body: 'إذا كانت لديك أسئلة حول سياسة الخصوصية هذه، يرجى فتح مشكلة في مستودع GitHub الخاص بنا.',
      },
    ],
  },
}

export const termsOfService: Record<string, LegalDocument> = {
  en: {
    title: 'Terms of Service',
    sections: [
      {
        heading: 'Acceptance of Terms',
        body: 'By creating an account and using OtpVault, you agree to these Terms of Service. If you do not agree, do not use the service.',
      },
      {
        heading: 'Description of Service',
        body: 'OtpVault is a desktop two-factor authentication (2FA) manager that stores your TOTP secrets in an encrypted local vault with optional cloud backup. The app runs locally on your device.',
      },
      {
        heading: 'User Responsibilities',
        body: 'You are responsible for maintaining the confidentiality of your email and password. You are solely responsible for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.',
      },
      {
        heading: 'Security',
        body: 'Your vault is encrypted with a key derived from your password. We cannot recover your vault if you forget your password. It is your responsibility to remember your password.',
      },
      {
        heading: 'Limitation of Liability',
        body: 'OtpVault is provided "as is" without warranty of any kind. The authors are not liable for any damages arising from the use of this software, including but not limited to loss of access to accounts.',
      },
      {
        heading: 'Open Source',
        body: 'OtpVault is open-source software. The source code is publicly available on GitHub for transparency. You may review, compile, and verify the software yourself.',
      },
      {
        heading: 'Changes to Terms',
        body: 'We reserve the right to modify these terms at any time. Continued use of the app after changes constitutes acceptance of the new terms.',
      },
      {
        heading: 'Termination',
        body: 'We reserve the right to suspend or terminate your account at any time for violations of these terms or for any other reason.',
      },
    ],
  },
  ar: {
    title: 'شروط الخدمة',
    sections: [
      {
        heading: 'قبول الشروط',
        body: 'بإنشاء حساب واستخدام OtpVault، فإنك توافق على شروط الخدمة هذه. إذا كنت لا توافق، فلا تستخدم الخدمة.',
      },
      {
        heading: 'وصف الخدمة',
        body: 'OtpVault هو مدير للتحقق بخطوتين (2FA) لسطح المكتب يخزّن أسرار TOTP الخاصة بك في خزنة مشفرة محلياً مع نسخ احتياطي سحابي اختياري. يعمل التطبيق محلياً على جهازك.',
      },
      {
        heading: 'مسؤوليات المستخدم',
        body: 'أنت مسؤول عن الحفاظ على سرية بريدك الإلكتروني وكلمة المرور. أنت المسؤول الوحيد عن جميع الأنشطة التي تحدث تحت حسابك. يجب عليك إخطارنا فوراً بأي استخدام غير مصرح به لحسابك.',
      },
      {
        heading: 'الأمان',
        body: 'خزنتك مشفرة بمفتاح مشتق من كلمة المرور الخاصة بك. لا يمكننا استعادة خزنتك إذا نسيت كلمة المرور. من مسؤوليتك تذكر كلمة المرور الخاصة بك.',
      },
      {
        heading: 'حدود المسؤولية',
        body: 'OtpVault يُقدّم "كما هو" دون أي ضمان. المؤلفون غير مسؤولين عن أي أضرار ناتجة عن استخدام هذا البرنامج، بما في ذلك على سبيل المثال لا الحصر فقدان الوصول إلى الحسابات.',
      },
      {
        heading: 'المصدر المفتوح',
        body: 'OtpVault هو برنامج مفتوح المصدر. كود المصدر متاح للعموم على GitHub للشفافية. يمكنك مراجعة البرنامج وتجميعه والتحقق منه بنفسك.',
      },
      {
        heading: 'تغييرات الشروط',
        body: 'نحتفظ بالحق في تعديل هذه الشروط في أي وقت. الاستمرار في استخدام التطبيق بعد التغييرات يعتبر قبولاً للشروط الجديدة.',
      },
      {
        heading: 'إنهاء الخدمة',
        body: 'نحتفظ بالحق في تعليق أو إنهاء حسابك في أي وقت بسبب انتهاك هذه الشروط أو لأي سبب آخر.',
      },
    ],
  },
}
