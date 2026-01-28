import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Palette, Check, Search } from 'lucide-react';
import { useTheme, themes } from '../contexts/ThemeContext';

const Header: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();
    const [themeSearch, setThemeSearch] = useState('');
    const location = useLocation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const filteredThemes = themes.filter(t =>
        t.toLowerCase().includes(themeSearch.toLowerCase())
    );

    const getPageTitle = () => {
        if (location.pathname.includes('/calendar')) return t('nav.calendar');
        if (location.pathname.includes('/deposit')) return t('nav.deposit');
        if (location.pathname.includes('/calc')) return t('nav.calculation');
        if (location.pathname.includes('/setting')) return t('nav.settings');
        return 'Asset App';
    };

    return (
        <header className="h-16 bg-base-100 border-b border-base-300 flex items-center justify-between px-8 z-40 shadow-sm">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-base-content">{getPageTitle()}</h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Theme Switcher */}
                <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-sm gap-2 normal-case border border-base-300 hover:bg-base-200">
                        <Palette size={14} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 hidden sm:inline-block">{theme}</span>
                    </label>
                    <div tabIndex={0} className="dropdown-content z-[100] p-2 shadow-2xl bg-base-100 border border-base-300 rounded-2xl w-64 mt-4 flex flex-col gap-2">
                        <div className="px-2 pt-2">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 group-focus-within:text-primary transition-colors" size={14} />
                                <input
                                    type="text"
                                    placeholder="Search themes..."
                                    className="w-full bg-base-200 border-none focus:ring-1 focus:ring-primary rounded-xl pl-9 pr-4 py-2 text-xs font-bold transition-all outline-none"
                                    value={themeSearch}
                                    onChange={(e) => setThemeSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        <ul className="menu p-1 flex-nowrap max-h-80 overflow-y-auto scroll-modern space-y-px">
                            <li className="menu-title text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 opacity-40">Available Skins</li>
                            {filteredThemes.length > 0 ? (
                                filteredThemes.map((t) => (
                                    <li key={t}>
                                        <button
                                            onClick={() => setTheme(t)}
                                            className={`flex justify-between items-center py-3 px-4 rounded-xl text-xs font-bold transition-all ${theme === t ? 'bg-primary/10 text-primary' : 'hover:bg-base-200 opacity-70 hover:opacity-100'}`}
                                            data-theme={t}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex gap-0.5">
                                                    <div className="w-1.5 h-3 bg-primary rounded-full"></div>
                                                    <div className="w-1.5 h-3 bg-secondary rounded-full"></div>
                                                </div>
                                                <span className="capitalize">{t}</span>
                                            </div>
                                            {theme === t && <Check size={12} />}
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <div className="p-8 text-center opacity-30 text-[10px] font-bold uppercase tracking-widest">No matching skins</div>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Language Switcher */}
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder border border-base-300">
                        <div className="bg-neutral text-neutral-content rounded-full w-8">
                            <span className="text-xs">{i18n.language.toUpperCase()}</span>
                        </div>
                    </div>
                    <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-32 border border-base-200">
                        <li><a className={i18n.language === 'tw' ? 'active' : ''} onClick={() => changeLanguage('tw')}>繁體中文</a></li>
                        <li><a className={i18n.language === 'en' ? 'active' : ''} onClick={() => changeLanguage('en')}>English</a></li>
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default Header;
