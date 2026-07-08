"use client";

import { createContext, type ReactNode, useContext, useState } from "react";
import { LANG_STORAGE_KEY, type Lang, type Strings, UI } from "./i18n";
import { useMountEffect } from "./use-mount-effect";

type LangContextValue = {
	lang: Lang;
	dir: "ltr" | "rtl";
	ui: Strings;
	setLang: (lang: Lang) => void;
};

const LangContext = createContext<LangContextValue | null>(null);

function applyDocumentLang(lang: Lang) {
	document.documentElement.lang = lang;
	document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

export function LangProvider({ children }: { children: ReactNode }) {
	const [lang, setLangState] = useState<Lang>("en");

	// Mount-only sync: restore the persisted language (SSR always renders EN).
	useMountEffect(() => {
		let stored: string | null = null;
		try {
			stored = localStorage.getItem(LANG_STORAGE_KEY);
		} catch {
			stored = null;
		}
		if (stored === "ar" || stored === "en") {
			setLangState(stored);
			applyDocumentLang(stored);
		}
	});

	const setLang = (next: Lang) => {
		setLangState(next);
		applyDocumentLang(next);
		try {
			localStorage.setItem(LANG_STORAGE_KEY, next);
		} catch {
			// persistence is best-effort
		}
	};

	const dir = lang === "ar" ? "rtl" : "ltr";
	return <LangContext.Provider value={{ lang, dir, ui: UI[lang], setLang }}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
	const value = useContext(LangContext);
	if (!value) {
		throw new Error("useLang must be used inside <LangProvider>");
	}
	return value;
}
