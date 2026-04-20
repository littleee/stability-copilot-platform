import React, { createContext, useContext, useMemo, useCallback } from "react";
import type { DevPilotLocale, TranslationDict } from "./dict";
import { getDict } from "./dict";

export interface I18nContextValue {
  locale: DevPilotLocale;
  setLocale: (locale: DevPilotLocale) => void;
  t: (key: keyof TranslationDict, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

interface I18nProviderProps {
  locale: DevPilotLocale;
  setLocale: (locale: DevPilotLocale) => void;
  children: React.ReactNode;
}

export function I18nProvider({ locale, setLocale, children }: I18nProviderProps) {
  const dict = useMemo(() => getDict(locale), [locale]);

  const t = useCallback(
    (key: keyof TranslationDict, vars?: Record<string, string | number>): string => {
      let text = dict[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return text;
    },
    [dict],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
