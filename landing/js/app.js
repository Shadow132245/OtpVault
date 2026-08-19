function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() :
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

function esc(s) {
  const el = document.createElement('div');
  el.textContent = s;
  return el.innerHTML;
}

const ISSUER_COLORS = {
  github: 'bg-gray-900', google: 'bg-blue-500', microsoft: 'bg-blue-600',
  twitter: 'bg-sky-500', facebook: 'bg-blue-800', amazon: 'bg-amber-500',
  discord: 'bg-indigo-600', slack: 'bg-purple-600', dropbox: 'bg-blue-500',
  gitlab: 'bg-orange-600',
};
function issuerColor(issuer) {
  const k = (issuer || '').toLowerCase().trim();
  return ISSUER_COLORS[k] || 'bg-primary-500';
}

const SVG = {
  shield: `<svg class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`,
  back: `<svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  plus: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  help: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  search: `<svg class="w-4 h-4 text-surface-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  copy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary-500"><polyline points="20 6 9 17 4 12"/></svg>`,
  lock: `<svg class="w-8 h-8 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
  qr: `<svg class="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  pencil: `<svg class="w-6 h-6 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  camera: `<svg class="w-6 h-6 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  upload: `<svg class="w-6 h-6 text-surface-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  save: `<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
  logout: `<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  x: `<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  spinner: `<svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>`,
};

window.App = {
  screen: 'landing',
  authTab: 'signup',
  email: '',
  password: '',
  accounts: [],
  _timer: null,

  _strings: {
    en: {
      myAccounts: 'My Accounts', addAccount: 'Add Account', settings: 'Settings',
      search: 'Search accounts...', noAccounts: 'No accounts yet',
      addFirst: 'Add your first account', scanQR: 'Scan QR Code',
      scanQRDesc: 'Use your camera to scan a QR code', manualEntry: 'Manual Entry',
      manualDesc: 'Enter your secret key manually', useCamera: 'Use Camera',
      useCameraDesc: 'Point camera at QR code', uploadQR: 'Upload QR Image',
      uploadQRDesc: 'Select a QR code image file', capture: 'Capture',
      issuer: 'Issuer', accountName: 'Account Name', secretKey: 'Secret Key',
      advanced: 'Advanced Settings', algorithm: 'Algorithm', digits: 'Digits',
      step: 'Step', saveAccount: 'Save Account', exportBackup: 'Export Backup',
      exportDesc: 'Download encrypted vault', importBackup: 'Import Backup',
      importDesc: 'Restore from backup file', export: 'Export', import: 'Import',
      language: 'Language', about: 'About', copyright: 'Copyright',
      lockVault: 'Lock Vault', logOut: 'Log Out', welcome: 'Welcome to OtpVault',
      secureManager: 'Your secure 2FA code manager', signUp: 'Sign Up',
      logIn: 'Log In', createVault: 'Create Vault', unlockVault: 'Unlock Vault',
      emailAddr: 'Email address', password: 'Password (min 4 characters)',
      rememberMe: 'Remember me', alreadyHave: 'Already have an account?',
      dontHave: "Don't have an account?", fillAll: 'Please fill all fields',
      minLength: 'Password must be at least 4 characters', agreeTerms: 'Please agree to the Terms of Service',
      copied: 'Copied!', copyFailed: 'Failed to copy', deleted: 'Account deleted',
      accountAdded: 'Account added!', notValid: 'Not a valid otpauth:// QR code',
      secretRequired: 'Secret key is required', cameraDenied: 'Could not access camera. Please allow camera permission or use file upload.',
      noVault: 'No vault found. Please sign up first.', wrongPass: 'Wrong password',
      backupExported: 'Backup exported!', exportFailed: 'Export failed',
      noVaultExport: 'No vault to export', invalidBackup: 'Invalid backup file',
      wrongBackupPass: 'Wrong password', backupImported: 'Backup imported!',
      importFailed: 'Failed to import. Wrong password?', invalidVault: 'Invalid vault data',
    },
    ar: {
      myAccounts: '\u062d\u0633\u0627\u0628\u0627\u062a\u064a', addAccount: '\u0625\u0636\u0627\u0641\u0629 \u062d\u0633\u0627\u0628', settings: '\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a',
      search: '\u0628\u062d\u062b \u0639\u0646 \u0627\u0644\u062d\u0633\u0627\u0628\u0627\u062a...', noAccounts: '\u0644\u0627 \u062a\u0648\u062c\u062f \u062d\u0633\u0627\u0628\u0627\u062a \u0628\u0639\u062f',
      addFirst: '\u0625\u0636\u0627\u0641\u0629 \u0623\u0648\u0644 \u062d\u0633\u0627\u0628\u0629 \u0644\u0643', scanQR: '\u0645\u0636\u0637\u0627\u062d \u0631\u0645\u0632 QR',
      scanQRDesc: '\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627 \u0644\u0645\u0636\u0637\u062d \u0631\u0645\u0632 QR', manualEntry: '\u0625\u062f\u062e\u0627\u0644 \u064a\u0648\u0636\u0639\u064a',
      manualDesc: '\u0623\u062f\u062e\u0644 \u0645\u0641\u062a\u0627\u062d \u0627\u0644\u0633\u0631 \u0628\u063a\u0636\u062f', useCamera: '\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627',
      useCameraDesc: '\u0635\u0648\u0631 \u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627 \u0639\u0644\u0649 \u0631\u0645\u0632 QR', uploadQR: '\u0631\u0641\u0639 \u0635\u0648\u0631\u0629 QR',
      uploadQRDesc: '\u062d\u062f\u062f \u0645\u0644\u0641 \u0635\u0648\u0631\u0629 QR', capture: '\u0644\u062d\u0638',
      issuer: '\u0627\u0644\u0645\u0635\u062f\u0631', accountName: '\u0627\u0633\u0645 \u0627\u0644\u062d\u0633\u0627\u0628', secretKey: '\u0645\u0641\u062a\u0627\u062d \u0627\u0644\u0633\u0631',
      advanced: '\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u062a\u0642\u062f\u0645\u0629', algorithm: '\u062e\u0637\u0629', digits: '\u0627\u0644\u0623\u0631\u0642\u0627\u0645',
      step: '\u0627\u0644\u062e\u0637\u0648\u0629', saveAccount: '\u062d\u0641\u0638 \u0627\u0644\u062d\u0633\u0627\u0628',       exportBackup: '\u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0646\u0633\u062e\u0629 \u0627\u0644\u0627\u062d\u062a\u064a\u0627\u0637\u064a\u0629',
      exportDesc: '\u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u062e\u0632\u0646 \u0627\u0644\u0645\u0634\u0641\u0648\u0639', importBackup: '\u0627\u0633\u062a\u0639\u0645\u0627\u0644 \u0646\u0633\u062e\u0629 \u0627\u0644\u0627\u062d\u062a\u064a\u0627\u0637\u064a\u0629',
      importDesc: '\u0627\u0633\u062a\u0639\u0627\u062f\u0629 \u0645\u0646 \u0645\u0644\u0641 \u0627\u0644\u0646\u0633\u062e\u0629', export: '\u062a\u0635\u062f\u064a\u0631', import: '\u0627\u0633\u062a\u0639\u0645\u0627\u0644',
      language: '\u0627\u0644\u0644\u063a\u0629', about: '\u062d\u0648\u0644', copyright: '\u0627\u0644\u062d\u0642\u0648\u0642',
      lockVault: '\u0642\u0641\u0644 \u0627\u0644\u062e\u0632\u0646', logOut: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c',
      welcome: '\u0645\u0631\u062d\u0628\u064b\u0627 \u0628\u0643 \u0641\u064a OtpVault',
      secureManager: '\u0645\u062f\u064a\u0631 \u0623\u0645\u0648\u0627\u0646 \u0627\u0644u062a\u062d\u0642\u0642 2FA \u0627\u0644u0623u0645u0646',
      signUp: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062d\u0633\u0627\u0628', logIn: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
      createVault: '\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062e\u0632\u0646', unlockVault: '\u0641\u062a\u062d \u0627\u0644\u062e\u0632\u0646',
      emailAddr: '\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
      password: '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 (\u062d\u062f \u0623\u0642\u0644 4 \u0623\u062d\u0631\u0641)',
      rememberMe: '\u062a\u0630\u0643\u0631\u0646\u064a', alreadyHave: '\u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628 \u0628\u0627\u0644\u0641\u0639\u0644\u061f',
      dontHave: '\u0644\u064a\u0633 \u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628\u061f',
      fillAll: '\u064a\u0631\u062c\u0649 \u0645\u0644\u0621 \u0627\u0644\u062d\u0642\u0648\u0644',
      minLength: '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0644\u0627 \u0628\u062f\u0621 \u0639\u0646 4 \u0623\u062d\u0631\u0641',
      agreeTerms: '\u064a\u0631\u062c\u0649 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0634\u0631\u0648\u0637 \u0627\u0644\u062e\u062f\u0645\u0629',
      copied: '\u062a\u0645 \u0627\u0644\u0646\u0633\u062e!', copyFailed: '\u0641\u0634\u0644 \u0627\u0644\u0646\u0633\u062e', deleted: '\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u062d\u0633\u0627\u0628',
      accountAdded: '\u062a\u0645\u062a \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062d\u0633\u0627\u0628!', notValid: '\u0631\u0645\u0632 QR \u063a\u064a\u0631 \u0635\u0627\u0644\u062d',
      secretRequired: '\u0645\u0641\u062a\u0627\u062d \u0627\u0644\u0633\u0631 \u0645\u0637\u0644\u0648\u0628',
      cameraDenied: '\u0644\u0645 \u064a\u0639\u0645\u0644 \u0627\u0644\u0648\u0635\u0644 \u0628\u0627\u0644\u0643\u0627\u0645\u064a\u0631\u0627. \u062a\u0643\u0631\u0645 \u0627\u0644\u0639\u062a\u0645\u0627\u062f \u0623\u0648 \u0627\u0633\u062a\u062e\u062f\u0645 \u0631\u0641\u0639 \u0627\u0644\u0645\u0644\u0641.',
      noVault: '\u0644\u064a\u0633 \u0647\u0646\u0627\u0643 \u062e\u0632\u0646. \u062a\u0643\u0631\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062d\u0633\u0627\u0628 \u0623\u0648\u0644\u0627\u064b.',
      wrongPass: '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d\u0629',
      backupExported: '\u062a\u0645 \u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0646\u0633\u062e\u0629!', exportFailed: '\u0641\u0634\u0644 \u0627\u0644\u062a\u0635\u062f\u064a\u0631',
      noVaultExport: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0646\u0633\u062e\u0629 \u0644\u0644\u062a\u0635\u062f\u064a\u0631',
      invalidBackup: '\u0645\u0644\u0641 \u0627\u0644\u0646\u0633\u062e\u0629 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d',
      wrongBackupPass: '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d\u0629',
      backupImported: '\u062a\u0645 \u0627\u0633\u062a\u0639\u0645\u0627\u0644 \u0627\u0644\u0646\u0633\u062e\u0629!',
      importFailed: '\u0641\u0634\u0644 \u0627\u0644\u0627\u0633\u062a\u0639\u0645\u0627\u0644. \u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d\u0629\u061f',
      invalidVault: '\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u062e\u0632\u0646 \u063a\u064a\u0631 \u0635\u0627\u0644\u062d\u0629',
    }
  },

  _t(key) {
    const lang = localStorage.getItem('landing-lang') || 'en';
    return (this._strings[lang] && this._strings[lang][key]) || this._strings.en[key] || key;
  },

  init() {
    document.documentElement.classList.add('dark');
    const remember = StorageService.loadRememberMe();
    if (remember && StorageService.isInitialized()) {
      this.email = remember.email;
      this.password = remember.password;
      this._loadLocalVault().then(() => {
        this.navigate('accounts');
        this._startCloudSync();
      });
    }
    this._startTOTPUpdater();
  },

  navigate(screen) {
    this.screen = screen;
    const landing = document.getElementById('landing-page');
    const shell = document.getElementById('app-shell');
    const auth = document.getElementById('auth-screen');
    const layout = document.getElementById('app-layout');
    const isLanding = screen === 'landing';

    landing.style.display = isLanding ? '' : 'none';
    shell.className = isLanding ? 'hidden' : '';
    auth.className = screen === 'onboarding' ? 'min-h-screen bg-surface-950 flex items-center justify-center p-4' : 'hidden';
    layout.className = (screen !== 'onboarding' && !isLanding) ? 'min-h-screen bg-surface-950 flex flex-col' : 'hidden';

    if (!isLanding) {
      const lang = localStorage.getItem('landing-lang') || 'en';
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }

    if (screen === 'onboarding') this._renderAuth();
    else if (screen === 'accounts') this._renderAccounts();
    else if (screen === 'add-account') this._renderAddAccount();
    else if (screen === 'settings') this._renderSettings();
  },

  // ===== AUTH =====
  _renderAuth() {
    const isSignup = this.authTab === 'signup';
    document.getElementById('auth-screen').innerHTML = `
      <div class="w-full max-w-sm animate-fade-in">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/25">
            ${SVG.shield}
          </div>
          <h1 class="text-2xl font-bold text-surface-100 mb-1">${this._t('welcome')}</h1>
          <p class="text-surface-400 text-sm">${this._t('secureManager')}</p>
          <div class="flex items-center justify-center gap-2 mt-4">
            <button onclick="App.authTab='signup';App._renderAuth()" class="px-3 py-1 text-xs font-medium rounded-lg transition-all ${isSignup ? 'bg-primary-500 text-white shadow-sm' : 'bg-surface-700 text-surface-400 hover:bg-surface-600'}">English</button>
            <button onclick="App.authTab='signup';App._renderAuth()" class="px-3 py-1 text-xs font-medium rounded-lg transition-all bg-surface-700 text-surface-400 hover:bg-surface-600">العربية</button>
          </div>
        </div>

        <div class="flex mb-6 bg-surface-800 rounded-xl p-1">
          <button onclick="App.authTab='signup';App._renderAuth()" class="flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isSignup ? 'bg-surface-700 text-surface-100 shadow-sm' : 'text-surface-400 hover:text-surface-300'}">${this._t('signUp')}</button>
          <button onclick="App.authTab='signin';App._renderAuth()" class="flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isSignup ? 'bg-surface-700 text-surface-100 shadow-sm' : 'text-surface-400 hover:text-surface-300'}">${this._t('logIn')}</button>
        </div>

        <form onsubmit="event.preventDefault();App._submitAuth()" class="flex flex-col gap-4">
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none">${SVG.mail}</span>
            <input type="email" id="auth-email" placeholder="${this._t('emailAddr')}" value="${(this.email||'').replace(/"/g,'&quot;')}" autofocus oninput="document.getElementById('auth-error').textContent=''"
              class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-surface-800 border border-surface-700 text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
          </div>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none">${SVG.lock.replace('w-8 h-8','w-4 h-4').replace('text-surface-400','text-surface-500')}</span>
            <input type="password" id="auth-password" placeholder="${this._t('password')}" oninput="document.getElementById('auth-error').textContent=''"
              class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-surface-800 border border-surface-700 text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
          </div>

          ${isSignup ? `
            <label class="flex items-center gap-2 cursor-pointer group" onclick="App._toggleTerms()">
              <div id="terms-check" class="w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 border-surface-600 group-hover:border-surface-400"></div>
              <span class="text-xs text-surface-400 group-hover:text-surface-300 transition-colors">I agree to the <span class="text-primary-500 hover:text-primary-400 underline">Terms of Service</span></span>
            </label>
          ` : `
            <label class="flex items-center gap-2 cursor-pointer group" onclick="App._toggleRemember()">
              <div id="remember-check" class="w-4 h-4 rounded border-2 flex items-center justify-center transition-all bg-primary-500 border-primary-500">
                <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span class="text-xs text-surface-400 group-hover:text-surface-300 transition-colors">Remember me</span>
            </label>
          `}

          <div class="text-red-500 text-xs text-center min-h-[16px]" id="auth-error"></div>

          <button type="submit" id="auth-submit" class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-xl transition-all duration-150 bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm shadow-primary-600/20 disabled:opacity-40 disabled:cursor-not-allowed select-none">
            ${isSignup ? this._t('createVault') : this._t('unlockVault')}
          </button>
        </form>

        <div class="text-center mt-6">
          <button onclick="App.authTab=App.authTab==='signin'?'signup':'signin';App._renderAuth()" class="text-xs text-primary-500 hover:text-primary-400 transition-colors">
            ${isSignup ? 'Already have an account?' : "Don't have an account?"}
          </button>
        </div>
      </div>`;
    this._agreeToTerms = false;
    this._rememberMe = true;
  },

  _agreeToTerms: false,
  _rememberMe: true,

  _toggleTerms() {
    this._agreeToTerms = !this._agreeToTerms;
    const el = document.getElementById('terms-check');
    if (this._agreeToTerms) {
      el.className = 'w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 bg-primary-500 border-primary-500';
      el.innerHTML = '<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    } else {
      el.className = 'w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0 border-surface-600 group-hover:border-surface-400';
      el.innerHTML = '';
    }
  },

  _toggleRemember() {
    this._rememberMe = !this._rememberMe;
    const el = document.getElementById('remember-check');
    if (this._rememberMe) {
      el.className = 'w-4 h-4 rounded border-2 flex items-center justify-center transition-all bg-primary-500 border-primary-500';
      el.innerHTML = '<svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    } else {
      el.className = 'w-4 h-4 rounded border-2 flex items-center justify-center transition-all border-surface-600 group-hover:border-surface-400';
      el.innerHTML = '';
    }
  },

  async _submitAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const pw = document.getElementById('auth-password').value;
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('auth-submit');
    if (!email || !pw) { errEl.textContent = this._t('fillAll'); return; }
    if (pw.length < 4) { errEl.textContent = this._t('minLength'); return; }

    this.email = email.toLowerCase();
    this.password = pw;

    btn.disabled = true;
    btn.innerHTML = `${SVG.spinner} ${this.authTab === 'signup' ? 'Creating...' : this._t('unlockVault')}...`;
    errEl.textContent = '';

    if (this.authTab === 'signup') {
      if (!this._agreeToTerms) { errEl.textContent = this._t('agreeTerms'); btn.disabled = false; btn.innerHTML = this._t('createVault'); return; }
      await this._doSignup();
    } else {
      await this._doSignin();
    }
  },

  async _doSignup() {
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('auth-submit');
    try {
      const row = await NeonAPI.fetchVault(this.email);
      if (row) {
        errEl.textContent = 'This email is already registered. Please sign in instead.';
        btn.disabled = false; btn.innerHTML = 'Create Vault';
        return;
      }
    } catch (e) {
      if (!e.message.includes('404') && !e.message.includes('Not found')) {
        if (!e.message.includes('Failed to fetch') && !e.message.includes('NetworkError')) {
          errEl.textContent = 'Server error. Please try again.';
          btn.disabled = false; btn.innerHTML = 'Create Vault';
          return;
        }
      }
    }
    await this._createVault();
  },

  async _doSignin() {
    const errEl = document.getElementById('auth-error');
    const btn = document.getElementById('auth-submit');
    try {
      const row = await NeonAPI.fetchVault(this.email);
      const testPayload = row.test_payload || row.testPayload || '';
      const salt = row.salt;
      const valid = await CryptoService.verifyTestPayload(testPayload, this.password, salt);
      if (!valid) {
        errEl.textContent = this._t('wrongPass');
        btn.disabled = false; btn.innerHTML = this._t('unlockVault');
        return;
      }
      const decrypted = await CryptoService.decryptVault(row.encrypted_vault, this.password, salt);
      const data = JSON.parse(decrypted);
        if (data.accounts) {
          StorageService.saveSalt(salt);
          StorageService.saveTestPayload(testPayload);
          StorageService.saveVaultData(row.encrypted_vault);
          StorageService.saveEmail(this.email);
          this.accounts = data.accounts;
          if (this._rememberMe) StorageService.saveRememberMe(this.email, this.password);
          this.navigate('accounts');
          this._startCloudSync();
          return;
      }
    } catch (e) {
      if (e.message.includes('404') || e.message.includes('Not found')) {
        errEl.textContent = 'No account found with this email';
        btn.disabled = false; btn.innerHTML = this._t('unlockVault');
        return;
      }
    }
    errEl.textContent = this._t('wrongPass');
    btn.disabled = false; btn.innerHTML = this._t('unlockVault');
  },

  async _createVault() {
    const salt = CryptoService.generateSalt();
    const testPayload = await CryptoService.generateTestPayload(this.password, salt);
    const vaultJson = JSON.stringify({ version: 1, accounts: [] });
    const encrypted = await CryptoService.encryptVault(vaultJson, this.password, salt);

    StorageService.saveSalt(salt);
    StorageService.saveTestPayload(testPayload);
    StorageService.saveEmail(this.email);
    StorageService.saveVaultData(encrypted);
    StorageService.saveRememberMe(this.email, this.password);

    try { await NeonAPI.uploadVault(this.email, salt, testPayload, encrypted); } catch {}

    this.accounts = [];
    this.navigate('accounts');
    this._startCloudSync();
  },

  // ===== LOCAL VAULT =====
  async _loadLocalVault() {
    try {
      const encrypted = StorageService.loadVaultData();
      const salt = StorageService.loadSalt();
      if (!encrypted || !salt) { this.accounts = []; return; }
      const json = await CryptoService.decryptVault(encrypted, this.password, salt);
      this.accounts = JSON.parse(json).accounts || [];
    } catch { this.accounts = []; }
  },

  async _saveVault() {
    const salt = StorageService.loadSalt();
    const vaultJson = JSON.stringify({ version: 1, accounts: this.accounts });
    const encrypted = await CryptoService.encryptVault(vaultJson, this.password, salt);
    StorageService.saveVaultData(encrypted);
    try { await NeonAPI.uploadVault(this.email, salt, StorageService.loadTestPayload() || '', encrypted); } catch {}
  },

  _syncIntervalId: null,

  _startCloudSync() {
    if (this._syncIntervalId) clearInterval(this._syncIntervalId);
    this._pullFromCloud();
    this._syncIntervalId = setInterval(() => this._pullFromCloud(), 10000);
  },

  _stopCloudSync() {
    if (this._syncIntervalId) { clearInterval(this._syncIntervalId); this._syncIntervalId = null; }
  },

  async _pullFromCloud() {
    if (!this.email || !this.password) return;
    try {
      const row = await NeonAPI.fetchVault(this.email);
      if (!row) return;
      const salt = StorageService.loadSalt();
      if (!salt) return;
      const localEncrypted = StorageService.loadVaultData();
      if (row.encrypted_vault === localEncrypted) return;
      const decrypted = await CryptoService.decryptVault(row.encrypted_vault, this.password, salt);
      const data = JSON.parse(decrypted);
      if (!data.accounts) return;
      const remoteAccounts = data.accounts;
      const localIds = new Set(this.accounts.map(a => a.id));
      let changed = false;
      for (const acc of remoteAccounts) {
        if (localIds.has(acc.id)) continue;
        if (acc.secret_encrypted) {
          try {
            const bytes = CryptoService._b64ToBytes(acc.secret_encrypted);
            const saltBytes = bytes.slice(0, 32);
            const iv = bytes.slice(32, 44);
            const ciphertext = bytes.slice(44);
            const key = await CryptoService._deriveKeyArgon2id(this.password, btoa(String.fromCharCode(...saltBytes)));
            const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
            acc.secret = new TextDecoder().decode(dec);
          } catch { continue; }
          delete acc.secret_encrypted;
        }
        if (!acc.secret) continue;
        const a = {
          id: acc.id, issuer: acc.issuer || 'Unknown',
          accountName: acc.accountName || acc.account_name || '',
          secret: acc.secret, algorithm: acc.algorithm || 'SHA1',
          digits: acc.digits || 6, step: acc.step || 30,
          icon: acc.icon || '', createdAt: acc.createdAt || acc.created_at || '',
          updatedAt: acc.updatedAt || acc.updated_at || '',
        };
        this.accounts.push(a);
        changed = true;
      }
      if (changed) {
        const vaultJson = JSON.stringify({ version: 1, accounts: this.accounts });
        const encrypted = await CryptoService.encryptVault(vaultJson, this.password, salt);
        StorageService.saveVaultData(encrypted);
        if (this.screen === 'accounts') this._renderAccounts();
      }
    } catch {}
  },

  // ===== ACCOUNTS SCREEN =====
  _renderAccounts() {
    document.getElementById('app-header-inner').innerHTML = `
      <div class="flex items-center gap-2">
        <h1 class="text-base font-semibold text-surface-100">${this._t('myAccounts')}</h1>
      </div>
      <div class="flex items-center gap-1">
        <button onclick="App.navigate('settings')" class="w-9 h-9 flex items-center justify-center rounded-xl transition-colors duration-150 text-surface-500 hover:text-surface-300 hover:bg-surface-700">${SVG.settings}</button>
      </div>`;

    const main = document.getElementById('app-main');
    if (this.accounts.length === 0 && !this._searchQuery) {
      main.innerHTML = `
        <div class="relative mb-5">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">${SVG.search}</span>
          <input type="text" placeholder="${this._t('search')}" oninput="App._searchQuery=this.value;App._renderAccounts()"
            class="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl bg-surface-800 border border-surface-700 text-surface-100 placeholder-surface-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
          <button onclick="App.navigate('add-account')" class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors">${SVG.plus}</button>
        </div>
        <div class="text-center py-16">
          <div class="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-surface-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <p class="text-surface-400 text-sm mb-4">${this._t('noAccounts')}</p>
          <button onclick="App.navigate('add-account')" class="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm shadow-primary-600/20">
            ${SVG.plus} ${this._t('addFirst')}
          </button>
        </div>`;
      return;
    }

    const filtered = this._getFiltered();
    const grouped = {};
    for (const a of filtered) {
      const k = (a.issuer || '?')[0].toUpperCase();
      if (!grouped[k]) grouped[k] = [];
      grouped[k].push(a);
    }
    const sortedKeys = Object.keys(grouped).sort();

    let html = `
      <div class="relative mb-5">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">${SVG.search}</span>
        <input type="text" placeholder="${this._t('search')}" value="${(this._searchQuery||'').replace(/"/g,'&quot;')}" oninput="App._searchQuery=this.value;App._renderAccounts()"
          class="w-full pl-10 pr-11 py-2.5 text-sm rounded-xl bg-surface-800 border border-surface-700 text-surface-100 placeholder-surface-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
        <button onclick="App.navigate('add-account')" class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-primary-500 hover:bg-primary-600 text-white flex items-center justify-center transition-colors">${SVG.plus}</button>
      </div>
      <div class="flex flex-col gap-5">`;

    for (const letter of sortedKeys) {
      if (sortedKeys.length > 1) {
        html += `<div class="flex items-center gap-3 mb-3"><span class="text-xs font-semibold tracking-wider text-surface-500">${letter}</span><div class="flex-1 h-px bg-surface-700/50"></div></div>`;
      }
      html += '<div class="flex flex-col gap-2">';
      for (const a of grouped[letter]) {
        const idx = this.accounts.indexOf(a);
        html += this._renderOTP(a, idx);
      }
      html += '</div>';
    }
    html += '</div>';
    main.innerHTML = html;
    this._updateCodes();
  },

  _searchQuery: '',

  _renderOTP(a, idx) {
    const color = issuerColor(a.issuer);
    const initial = (a.issuer || '?')[0].toUpperCase();
    const circumference = 2 * Math.PI * 13;
    return `
      <div class="relative group">
        <div class="card-hover select-none relative overflow-hidden cursor-pointer transition-all duration-200 bg-surface-800 rounded-2xl border border-surface-700 shadow-card hover:shadow-card-hover hover:border-primary-800" onclick="App.copyCode(${idx})">
          <div class="flex items-center gap-4 p-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${color}">${initial}</div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-surface-100 truncate text-sm">${esc(a.issuer||'Unknown')}</p>
              <p class="text-xs text-surface-500 truncate mt-0.5">${esc(a.accountName||'')}</p>
            </div>
            <div class="flex items-center gap-4">
              <span class="font-mono font-bold text-xl tracking-[0.15em] text-surface-100 tabular-nums" id="code-${idx}">------</span>
              <div class="relative w-9 h-9 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 36 36" class="transform -rotate-90">
                  <circle cx="18" cy="18" r="13" fill="none" stroke-width="3" class="stroke-surface-700"/>
                  <circle cx="18" cy="18" r="13" fill="none" stroke-width="3" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="0" id="ring-${idx}" class="stroke-primary-500" style="transition: stroke-dashoffset .5s linear, stroke .2s;"/>
                </svg>
                <span class="absolute text-[10px] font-mono font-medium text-surface-500" id="timer-${idx}">30</span>
              </div>
              <div class="w-8 h-8 flex items-center justify-center rounded-lg text-surface-500 hover:text-primary-500 hover:bg-primary-950 transition-colors" id="copy-${idx}" onclick="event.stopPropagation();App.copyCode(${idx})">
                ${SVG.copy}
              </div>
            </div>
          </div>
          <div class="h-0.5 bg-surface-700/50">
            <div class="h-full bg-primary-500 rounded-full" id="bar-${idx}" style="width:100%;transition:width .5s linear,background .2s;"></div>
          </div>
        </div>
        <button onclick="event.stopPropagation();App.deleteAccount(${idx})" class="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-surface-700 border border-surface-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-950 group">
          <svg class="w-3 h-3 text-red-400 group-hover:text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;
  },

  _getFiltered() {
    const q = (this._searchQuery || '').toLowerCase();
    if (!q) return this.accounts;
    return this.accounts.filter(a =>
      (a.issuer || '').toLowerCase().includes(q) || (a.accountName || '').toLowerCase().includes(q)
    );
  },

  _startTOTPUpdater() {
    if (this._timer) clearInterval(this._timer);
    this._timer = setInterval(() => this._updateCodes(), 500);
  },

  async _updateCodes() {
    const circumference = 2 * Math.PI * 13;
    for (let i = 0; i < this.accounts.length; i++) {
      const a = this.accounts[i];
      const codeEl = document.getElementById(`code-${i}`);
      const ringEl = document.getElementById(`ring-${i}`);
      const timerEl = document.getElementById(`timer-${i}`);
      const barEl = document.getElementById(`bar-${i}`);
      if (!codeEl) continue;
      try {
        const result = await TOTP.generate(a.secret, a.digits || 6, a.step || 30);
        codeEl.textContent = result.code.replace(/(.{3})/g, '$1 ').trim();
        const pct = result.remaining / result.period;
        if (ringEl) ringEl.style.strokeDashoffset = String(circumference * (1 - pct));
        if (timerEl) {
          timerEl.textContent = result.remaining;
          timerEl.className = `absolute text-[10px] font-mono font-medium ${result.remaining <= 5 ? 'text-red-500' : 'text-surface-500'}`;
        }
        if (barEl) {
          barEl.style.width = (pct * 100) + '%';
          barEl.className = `h-full rounded-full ${result.remaining <= 5 ? 'bg-red-500' : 'bg-primary-500'}`;
          barEl.style.transition = 'width .5s linear, background .2s';
        }
        if (ringEl) ringEl.setAttribute('class', `stroke-${result.remaining <= 5 ? 'red-500' : 'primary-500'}`);
      } catch { codeEl.textContent = '------'; }
    }
  },

  async copyCode(idx) {
    const a = this.accounts[idx];
    try {
      const result = await TOTP.generate(a.secret, a.digits || 6, a.step || 30);
      await navigator.clipboard.writeText(result.code);
      const el = document.getElementById(`copy-${idx}`);
      if (el) el.innerHTML = SVG.check;
      this._toast(this._t('copied'), 'success');
      setTimeout(() => { if (el) el.innerHTML = SVG.copy; }, 2000);
    } catch { this._toast(this._t('copyFailed'), 'error'); }
  },

  async deleteAccount(idx) {
    if (!confirm('Delete this account?')) return;
    this.accounts.splice(idx, 1);
    await this._saveVault();
    this._renderAccounts();
  },

  // ===== ADD ACCOUNT =====
  _renderAddAccount() {
    document.getElementById('app-header-inner').innerHTML = `
      <div class="flex items-center gap-2">
        <button onclick="App.navigate('accounts')" class="btn-icon -ml-1.5 w-9 h-9 flex items-center justify-center rounded-xl transition-colors duration-150 text-surface-500 hover:text-surface-300 hover:bg-surface-700">${SVG.back}</button>
        <h1 class="text-base font-semibold text-surface-100">${this._t('addAccount')}</h1>
      </div>
      <div class="flex items-center gap-1"></div>`;

    document.getElementById('app-main').innerHTML = `
      <div class="flex flex-col gap-3 pt-4 animate-fade-in">
        <button onclick="App._showAddMode('qr')" class="card-hover p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 bg-surface-800 rounded-2xl border border-surface-700 shadow-card hover:shadow-card-hover hover:border-primary-800">
          <div class="w-12 h-12 rounded-xl bg-primary-950 flex items-center justify-center shrink-0">${SVG.qr}</div>
          <div class="text-left"><p class="font-medium text-surface-100 text-sm">${this._t('scanQR')}</p><p class="text-xs text-surface-400 mt-0.5">${this._t('scanQRDesc')}</p></div>
        </button>
        <button onclick="App._showAddMode('manual')" class="card-hover p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 bg-surface-800 rounded-2xl border border-surface-700 shadow-card hover:shadow-card-hover hover:border-primary-800">
          <div class="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center shrink-0">${SVG.pencil}</div>
          <div class="text-left"><p class="font-medium text-surface-100 text-sm">${this._t('manualEntry')}</p><p class="text-xs text-surface-400 mt-0.5">${this._t('manualDesc')}</p></div>
        </button>
        <div id="add-form-container"></div>
      </div>`;
  },

  _showAddMode(mode) {
    const container = document.getElementById('add-form-container');
    if (mode === 'qr') {
      container.innerHTML = `
        <div class="flex flex-col gap-3 pt-4 animate-fade-in">
          <button onclick="App._startQRScan()" class="card-hover p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 bg-surface-800 rounded-2xl border border-surface-700 shadow-card hover:shadow-card-hover hover:border-primary-800">
            <div class="w-12 h-12 rounded-xl bg-primary-950 flex items-center justify-center shrink-0">${SVG.camera}</div>
            <div class="text-left"><p class="font-medium text-surface-100 text-sm">${this._t('useCamera')}</p><p class="text-xs text-surface-400 mt-0.5">${this._t('useCameraDesc')}</p></div>
          </button>
          <button onclick="document.getElementById('qr-file-input').click()" class="card-hover p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 bg-surface-800 rounded-2xl border border-surface-700 shadow-card hover:shadow-card-hover hover:border-primary-800">
            <div class="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center shrink-0">${SVG.upload}</div>
            <div class="text-left"><p class="font-medium text-surface-100 text-sm">${this._t('uploadQR')}</p><p class="text-xs text-surface-400 mt-0.5">${this._t('uploadQRDesc')}</p></div>
          </button>
          <input type="file" id="qr-file-input" accept="image/*" class="hidden" onchange="App._handleQRFile(this)">
          <div id="qr-camera-wrap" class="hidden">
            <div class="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-surface-900 mx-auto">
              <video id="qr-video" playsinline autoplay class="absolute inset-0 w-full h-full object-cover"></video>
              <div class="absolute inset-0 border-[3px] border-primary-400/60 rounded-2xl m-8 pointer-events-none"></div>
              <div class="absolute bottom-3 left-0 right-0 text-center">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 text-xs text-primary-300 backdrop-blur-sm">
                  <span class="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
                  ${this._t('scanQRDesc')}
                </span>
              </div>
            </div>
            <canvas id="qr-canvas" class="hidden"></canvas>
            <div class="flex gap-3 mt-3">
              <button onclick="App._captureQR()" class="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-xl transition-all duration-150 bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-600/20">${this._t('capture')}</button>
              <button onclick="QRScanner.stop();document.getElementById('qr-camera-wrap').classList.add('hidden')" class="inline-flex items-center justify-center px-4 py-3 rounded-xl border border-surface-600 text-surface-400 hover:text-surface-200 hover:bg-surface-700 transition-all">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>`;
    } else {
      container.innerHTML = `
        <div class="flex flex-col gap-5 pt-4 animate-fade-in">
          <div class="bg-surface-800 rounded-2xl border border-surface-700 shadow-card p-5">
            <div class="flex flex-col gap-4">
              <div>
                <label class="text-xs font-medium text-surface-400 block mb-1.5">Issuer</label>
                <input type="text" id="add-issuer" placeholder="GitHub"
                  class="w-full px-3 py-2.5 rounded-xl border border-surface-600 bg-surface-800 text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
              </div>
              <div>
                <label class="text-xs font-medium text-surface-400 block mb-1.5">Account Name</label>
                <input type="text" id="add-account-name" placeholder="user@email.com"
                  class="w-full px-3 py-2.5 rounded-xl border border-surface-600 bg-surface-800 text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
              </div>
              <div>
                <label class="text-xs font-medium text-surface-400 block mb-1.5">Secret Key</label>
                <input type="text" id="add-secret" placeholder="JBSWY3DPEHPK3PXP"
                  class="w-full px-3 py-2.5 rounded-xl border border-surface-600 bg-surface-800 text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all uppercase">
              </div>
            </div>
          </div>
          <div class="bg-surface-800 rounded-2xl border border-surface-700 shadow-card p-5">
            <p class="text-xs font-semibold tracking-wider uppercase text-surface-500 mb-4">Advanced Settings</p>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="text-xs font-medium text-surface-400 block mb-1.5">Algorithm</label>
                <select id="add-algo" class="w-full px-3 py-2.5 rounded-xl border border-surface-600 bg-surface-800 text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
                  <option value="SHA1">SHA1</option><option value="SHA256">SHA256</option><option value="SHA512">SHA512</option>
                </select>
              </div>
              <div>
                <label class="text-xs font-medium text-surface-400 block mb-1.5">Digits</label>
                <select id="add-digits" class="w-full px-3 py-2.5 rounded-xl border border-surface-600 bg-surface-800 text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
                  <option value="6">6</option><option value="7">7</option><option value="8">8</option>
                </select>
              </div>
              <div>
                <label class="text-xs font-medium text-surface-400 block mb-1.5">Step</label>
                <select id="add-step" class="w-full px-3 py-2.5 rounded-xl border border-surface-600 bg-surface-800 text-surface-100 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 transition-all">
                  <option value="30">30s</option><option value="60">60s</option>
                </select>
              </div>
            </div>
          </div>
          <button onclick="App._addManual()" class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-xl transition-all duration-150 bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm shadow-primary-600/20 disabled:opacity-40 disabled:cursor-not-allowed select-none">
            ${SVG.save} Save Account
          </button>
        </div>`;
    }
  },

  _addManual() {
    const issuer = document.getElementById('add-issuer').value.trim();
    const accountName = document.getElementById('add-account-name').value.trim();
    const secret = document.getElementById('add-secret').value.trim().toUpperCase().replace(/\s/g, '');
    if (!secret) return this._toast(this._t('secretRequired'), 'error');

    this.accounts.push({
      id: uuid(), issuer: issuer || 'Unknown', accountName, secret,
      algorithm: document.getElementById('add-algo').value,
      digits: parseInt(document.getElementById('add-digits').value),
      step: parseInt(document.getElementById('add-step').value),
      icon: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    this._saveVault();
    this._toast(this._t('accountAdded'), 'success');
    this.navigate('accounts');
  },

  async _startQRScan() {
    const wrap = document.getElementById('qr-camera-wrap');
    wrap.classList.remove('hidden');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported');
      }
      await QRScanner.scanFromCamera((data) => {
        const parsed = TOTP.parseURI(data);
        if (parsed) {
          this.accounts.push({
            id: uuid(), issuer: parsed.issuer || 'Unknown', accountName: parsed.accountName || '',
            secret: parsed.secret, algorithm: parsed.algorithm || 'SHA1',
            digits: parsed.digits || 6, step: parsed.period || 30,
            icon: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
          });
          this._saveVault();
          this._toast(this._t('accountAdded'), 'success');
          this.navigate('accounts');
        } else { this._toast(this._t('notValid'), 'error'); }
      }, document.getElementById('qr-video'));
    } catch (e) {
      console.error('QR scan error:', e);
      this._toast(this._t('cameraDenied'), 'error');
      wrap.classList.add('hidden');
    }
  },

  _captureQR() {
    const data = QRScanner.captureFrame();
    if (data) {
      const parsed = TOTP.parseURI(data);
      if (parsed) {
        this.accounts.push({
          id: uuid(), issuer: parsed.issuer || 'Unknown', accountName: parsed.accountName || '',
          secret: parsed.secret, algorithm: parsed.algorithm || 'SHA1',
          digits: parsed.digits || 6, step: parsed.period || 30,
          icon: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
        this._saveVault();
        this._toast(this._t('accountAdded'), 'success');
        document.getElementById('qr-camera-wrap').classList.add('hidden');
        this.navigate('accounts');
      } else {
        this._toast(this._t('notValid'), 'error');
      }
    } else {
      this._toast('No QR code detected. Point camera at QR code.', 'error');
    }
  },

  _handleQRFile(input) {
    const file = input.files[0]; if (!file) return;
    QRScanner.scanFromFile(file, (data) => {
      const parsed = TOTP.parseURI(data);
      if (parsed) {
        this.accounts.push({
          id: uuid(), issuer: parsed.issuer || 'Unknown', accountName: parsed.accountName || '',
          secret: parsed.secret, algorithm: parsed.algorithm || 'SHA1',
          digits: parsed.digits || 6, step: parsed.period || 30,
          icon: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        });
        this._saveVault();
        this._toast(this._t('accountAdded'), 'success');
        this.navigate('accounts');
      } else { this._toast(this._t('notValid'), 'error'); }
    }, (err) => {
      this._toast(err || this._t('notValid'), 'error');
    });
    input.value = '';
  },

  // ===== SETTINGS =====
  _renderSettings() {
    document.getElementById('app-header-inner').innerHTML = `
      <div class="flex items-center gap-2">
        <button onclick="App.navigate('accounts')" class="btn-icon -ml-1.5 w-9 h-9 flex items-center justify-center rounded-xl transition-colors duration-150 text-surface-500 hover:text-surface-300 hover:bg-surface-700">${SVG.back}</button>
        <h1 class="text-base font-semibold text-surface-100">${this._t('settings')}</h1>
      </div>
      <div class="flex items-center gap-1"></div>`;

    document.getElementById('app-main').innerHTML = `
      <div class="flex flex-col gap-6 animate-fade-in">
        <div>
          <p class="text-xs font-semibold tracking-wider uppercase text-surface-500 px-1 mb-3">${this._t('language')}</p>
          <div class="bg-surface-800 rounded-2xl border border-surface-700 shadow-card divide-y divide-surface-700/50 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3.5">
              <div class="flex flex-col"><span class="text-sm font-medium text-surface-100">${this._t('language')}</span></div>
              <div class="flex items-center gap-2 shrink-0">
                <button class="px-3 py-1.5 text-xs font-medium rounded-lg ${currentLang === 'en' ? 'bg-primary-600 text-white shadow-sm' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'}" onclick="switchLanguage('en')">EN</button>
                <button class="px-3 py-1.5 text-xs font-medium rounded-lg ${currentLang === 'ar' ? 'bg-primary-600 text-white shadow-sm' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700'}" onclick="switchLanguage('ar')">AR</button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold tracking-wider uppercase text-surface-500 px-1 mb-3">${this._t('exportBackup').split(' ')[0]}</p>
          <div class="bg-surface-800 rounded-2xl border border-surface-700 shadow-card divide-y divide-surface-700/50 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3.5">
              <div class="flex flex-col"><span class="text-sm font-medium text-surface-100">${this._t('exportBackup')}</span><span class="text-xs text-surface-400 mt-0.5">${this._t('exportDesc')}</span></div>
              <div class="flex items-center gap-2 shrink-0"><button onclick="App.exportBackup()" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-200 dark:hover:bg-surface-600">${this._t('export')}</button></div>
            </div>
            <div class="flex items-center justify-between px-4 py-3.5">
              <div class="flex flex-col"><span class="text-sm font-medium text-surface-100">${this._t('importBackup')}</span><span class="text-xs text-surface-400 mt-0.5">${this._t('importDesc')}</span></div>
              <div class="flex items-center gap-2 shrink-0"><button onclick="App.importBackup()" class="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-700 dark:text-surface-200 dark:hover:bg-surface-600">${this._t('import')}</button></div>
            </div>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold tracking-wider uppercase text-surface-500 px-1 mb-3">${this._t('about')}</p>
          <div class="bg-surface-800 rounded-2xl border border-surface-700 shadow-card divide-y divide-surface-700/50 overflow-hidden">
            <div class="flex items-center justify-between px-4 py-3.5">
              <div class="flex flex-col"><span class="text-sm font-medium text-surface-100">OtpVault</span><span class="text-xs text-surface-400 mt-0.5">v0.1.6</span></div>
            </div>
            <div class="flex items-center justify-between px-4 py-3.5">
              <div class="flex flex-col"><span class="text-sm font-medium text-surface-100">${this._t('copyright')}</span><span class="text-xs text-surface-400 mt-0.5">EuroMoscow Developments</span></div>
            </div>
          </div>
        </div>

        <button onclick="App._lockVault()" class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-xl transition-all duration-150 bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-600/20 disabled:opacity-40 disabled:cursor-not-allowed select-none">
          ${SVG.lock.replace('w-8 h-8','w-4 h-4').replace('text-surface-400','text-white')} ${this._t('lockVault')}
        </button>

        <button onclick="App.logout()" class="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium rounded-xl transition-all duration-150 text-surface-400 hover:text-red-500 hover:bg-red-950/30 select-none">
          ${SVG.logout} ${this._t('logOut')}
        </button>
      </div>`;
  },

  exportBackup() {
    try {
      const salt = StorageService.loadSalt();
      const testPayload = StorageService.loadTestPayload();
      const encryptedVault = StorageService.loadVaultData();
      if (!salt || !encryptedVault) return this._toast(this._t('noVaultExport'), 'error');
      const blob = new Blob([JSON.stringify({ version: 1, salt, testPayload: testPayload || '', encryptedVault }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'otpvault-backup.json'; a.click();
      URL.revokeObjectURL(url);
      this._toast(this._t('backupExported'), 'success');
    } catch (e) { this._toast(this._t('exportFailed') + ': ' + e.message, 'error'); }
  },

  importBackup() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0]; if (!file) return;
      try {
        const text = await file.text();
        const backup = JSON.parse(text);
        if (!backup.salt || !backup.encryptedVault) return this._toast(this._t('invalidBackup'), 'error');
        const pw = prompt('Enter the password for this backup:');
        if (!pw) return;
        const valid = await CryptoService.verifyTestPayload(backup.testPayload || '', pw, backup.salt);
        if (!valid) return this._toast(this._t('wrongBackupPass'), 'error');
        const decrypted = await CryptoService.decryptVault(backup.encryptedVault, pw, backup.salt);
        const data = JSON.parse(decrypted);
        if (!data.accounts) return this._toast(this._t('invalidVault'), 'error');
        StorageService.saveSalt(backup.salt);
        StorageService.saveTestPayload(backup.testPayload || '');
        StorageService.saveVaultData(backup.encryptedVault);
        this.accounts = data.accounts;
        this.password = pw;
        await this._saveVault();
        this._toast(this._t('backupImported'), 'success');
        this.navigate('accounts');
      } catch { this._toast(this._t('importFailed'), 'error'); }
    };
    input.click();
  },

  _lockVault() {
    StorageService.clearRememberMe();
    this.password = '';
    this.accounts = [];
    this.authTab = 'signin';
    this.navigate('onboarding');
  },

  logout() {
    this._stopCloudSync();
    StorageService.clearRememberMe();
    this.email = ''; this.password = ''; this.accounts = [];
    QRScanner.stop();
    this.navigate('landing');
  },

  _toast(msg, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  },
};
