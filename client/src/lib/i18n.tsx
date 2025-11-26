import React, { useEffect, useState, ReactNode } from 'react';
import { Globe } from 'lucide-react';

// Supported languages for Google Translate
export const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh-CN', name: 'Chinese', nativeName: '中文' },
];

// Declare global window types for Google Translate
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: {
      translate: {
        TranslateElement: new (options: {
          pageLanguage: string;
          includedLanguages: string;
          layout: number;
          autoDisplay: boolean;
        }, elementId: string) => void;
        TranslateElement: {
          InlineLayout: {
            SIMPLE: number;
            HORIZONTAL: number;
            VERTICAL: number;
          };
        };
      };
    };
  }
}

// Provider that initializes Google Translate
export function I18nProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if script is already loaded
    if (document.getElementById('google-translate-script')) {
      setIsLoaded(true);
      return;
    }

    // Create the Google Translate initialization function
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: languages.map(l => l.code).join(','),
            layout: window.google.translate.TranslateElement.InlineLayout?.SIMPLE || 0,
            autoDisplay: false,
          },
          'google_translate_element'
        );
        setIsLoaded(true);
      }
    };

    // Load Google Translate script
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Add CSS to hide Google Translate branding and improve styling
    const style = document.createElement('style');
    style.id = 'google-translate-style';
    style.textContent = `
      /* Hide Google Translate banner and branding */
      .goog-te-banner-frame,
      .skiptranslate,
      #goog-gt-tt,
      .goog-te-balloon-frame,
      .goog-tooltip,
      .goog-tooltip:hover,
      div#goog-gt-,
      .goog-te-spinner-pos,
      .goog-te-gadget-icon,
      iframe.goog-te-menu-frame,
      .goog-te-menu-value span:not(:first-child) {
        display: none !important;
      }

      body {
        top: 0 !important;
      }

      /* Style the dropdown */
      .goog-te-gadget {
        font-family: inherit !important;
        font-size: 14px !important;
      }

      .goog-te-gadget-simple {
        background-color: transparent !important;
        border: 1px solid hsl(var(--border)) !important;
        border-radius: 6px !important;
        padding: 6px 12px !important;
        cursor: pointer !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 8px !important;
      }

      .goog-te-gadget-simple:hover {
        background-color: hsl(var(--accent)) !important;
      }

      .goog-te-menu-value {
        color: hsl(var(--foreground)) !important;
        font-weight: 500 !important;
      }

      .goog-te-menu-value span {
        color: hsl(var(--foreground)) !important;
      }

      /* Style dropdown menu */
      .goog-te-menu-frame {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        border-radius: 8px !important;
      }

      /* Remove "Powered by Google" text */
      .goog-logo-link,
      .goog-te-gadget > span {
        display: none !important;
      }

      /* Custom language selector button */
      .privescreen-lang-selector {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border: 1px solid hsl(var(--border));
        border-radius: 6px;
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: hsl(var(--foreground));
        transition: all 0.2s;
      }

      .privescreen-lang-selector:hover {
        background-color: hsl(var(--accent));
      }

      /* Hide the iframe inserted by Google Translate at the top */
      .VIpgJd-ZVi9od-aZ2wEe-wOHMyf {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Cleanup on unmount
      const scriptEl = document.getElementById('google-translate-script');
      const styleEl = document.getElementById('google-translate-style');
      if (scriptEl) scriptEl.remove();
      if (styleEl) styleEl.remove();
    };
  }, []);

  return (
    <>
      {/* Hidden container for Google Translate initialization */}
      <div id="google_translate_element" style={{ display: 'none' }} />
      {children}
    </>
  );
}

// Custom language selector that triggers Google Translate
export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  // Function to change language using Google Translate
  const changeLanguage = (langCode: string) => {
    setIsOpen(false);
    setCurrentLang(langCode);
    localStorage.setItem('privescreen_language', langCode);

    // Find the Google Translate dropdown and change it
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    } else {
      // If Google Translate hasn't loaded yet, try setting a cookie
      document.cookie = `googtrans=/en/${langCode}; path=/`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${window.location.hostname}`;
      // Reload to apply translation
      window.location.reload();
    }
  };

  // Initialize from saved preference
  useEffect(() => {
    const saved = localStorage.getItem('privescreen_language');
    if (saved) {
      setCurrentLang(saved);
      // Wait for Google Translate to load, then set the language
      const timer = setTimeout(() => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select && select.value !== saved) {
          select.value = saved;
          select.dispatchEvent(new Event('change'));
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.lang-selector-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="relative lang-selector-container">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full border border-border/50 bg-background/80 backdrop-blur-sm hover:bg-accent hover:border-border transition-all duration-200 shadow-sm"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <Globe className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <svg
          className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 py-2 bg-card border border-border rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 border-b border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select Language</p>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-150 ${
                  currentLang === lang.code
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-accent text-foreground'
                }`}
              >
                <span className="flex-1 text-left">{lang.nativeName}</span>
                {currentLang === lang.code && (
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
              </svg>
              Powered by Google
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Simplified hook for backward compatibility (translations now handled by Google)
export function useI18n() {
  const language = localStorage.getItem('privescreen_language') || 'en';

  return {
    language,
    setLanguage: (lang: string) => {
      localStorage.setItem('privescreen_language', lang);
    },
    // t function is a pass-through since Google Translate handles actual translation
    t: (key: string) => key,
  };
}
