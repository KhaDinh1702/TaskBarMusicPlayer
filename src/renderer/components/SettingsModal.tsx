import { Language, getTranslation } from "../utils/i18n";

export type AppTheme = "warm" | "dark" | "light";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const SettingsModal = ({
  isOpen,
  onClose,
  theme,
  onThemeChange,
  language,
  onLanguageChange
}: SettingsModalProps) => {
  if (!isOpen) return null;

  const t = (key: Parameters<typeof getTranslation>[1]) =>
    getTranslation(language, key);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-palette-surface border border-palette-border rounded-2xl shadow-2xl p-6 text-palette-charcoal space-y-6 animate-in fade-in zoom-in-95 duration-150 font-mono"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-palette-border">
          <h2 className="text-xs font-bold uppercase tracking-widest text-palette-charcoal">
            {t("settings")}
          </h2>
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-palette-muted hover:text-palette-charcoal hover:bg-palette-base rounded transition-colors"
          >
            X
          </button>
        </div>

        {/* Theme Settings */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-palette-muted">
            {t("themeLabel")}
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => onThemeChange("warm")}
              className={`py-2 px-3 rounded-lg border text-center transition-all ${
                theme === "warm"
                  ? "bg-palette-charcoal text-palette-base border-palette-charcoal font-bold shadow-sm"
                  : "bg-palette-base border-palette-border text-palette-charcoal hover:border-palette-charcoal"
              }`}
            >
              {t("themeWarm")}
            </button>

            <button
              onClick={() => onThemeChange("dark")}
              className={`py-2 px-3 rounded-lg border text-center transition-all ${
                theme === "dark"
                  ? "bg-palette-charcoal text-palette-base border-palette-charcoal font-bold shadow-sm"
                  : "bg-palette-base border-palette-border text-palette-charcoal hover:border-palette-charcoal"
              }`}
            >
              {t("themeDark")}
            </button>

            <button
              onClick={() => onThemeChange("light")}
              className={`py-2 px-3 rounded-lg border text-center transition-all ${
                theme === "light"
                  ? "bg-palette-charcoal text-palette-base border-palette-charcoal font-bold shadow-sm"
                  : "bg-palette-base border-palette-border text-palette-charcoal hover:border-palette-charcoal"
              }`}
            >
              {t("themeLight")}
            </button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-palette-muted">
            {t("languageLabel")}
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => onLanguageChange("en")}
              className={`py-2 px-3 rounded-lg border text-center transition-all ${
                language === "en"
                  ? "bg-palette-charcoal text-palette-base border-palette-charcoal font-bold shadow-sm"
                  : "bg-palette-base border-palette-border text-palette-charcoal hover:border-palette-charcoal"
              }`}
            >
              English
            </button>

            <button
              onClick={() => onLanguageChange("vi")}
              className={`py-2 px-3 rounded-lg border text-center transition-all ${
                language === "vi"
                  ? "bg-palette-charcoal text-palette-base border-palette-charcoal font-bold shadow-sm"
                  : "bg-palette-base border-palette-border text-palette-charcoal hover:border-palette-charcoal"
              }`}
            >
              Tiếng Việt
            </button>
          </div>
        </div>

        {/* About App Info */}
        <div className="pt-3 border-t border-palette-border text-[10px] text-palette-muted flex items-center justify-between">
          <span>TaskBarMusic Desktop</span>
          <span>{t("appVersion")}</span>
        </div>
      </div>
    </div>
  );
};
