'use client'

import { bookingIcon, chatIcon, dropdownIcon, favoriteIcon, homeIcon, languageIcon, lightThemeIcon, locationIcon, mapIcon, notificationIcon, profileIcon } from "../assets/svg";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import './navbar.css'
import Link from "next/link";
import { usePathname } from "next/navigation";

const regions = [
    "Ташкент",
    "Каракалпакстан",
    "Андижан",
    "Бухара",
    "Джизак",
    "Карши",
    "Навои",
    "Наманган",
    "Самарканд",
    "Термез",
    "Гулистан",
    "Хорезм",
    "Фергана",
];

const languages = ["Русский", "O‘zbek", "English"];

export default function Navbar({ onRegionChange }: { onRegionChange?: (region: string) => void } = {}) {
    const pathname = usePathname();
    const [selectedRegion, setSelectedRegion] = useState(regions[0]);
    const [isRegionMenuOpen, setIsRegionMenuOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const locationRef = useRef<HTMLDivElement>(null);
    const locationButtonRef = useRef<HTMLButtonElement>(null);
    const languageRef = useRef<HTMLDivElement>(null);
    const languageButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isRegionMenuOpen && !isLanguageMenuOpen) {
            return;
        }

        const handlePointerDown = (event: PointerEvent) => {
            if (!locationRef.current?.contains(event.target as Node)) {
                setIsRegionMenuOpen(false);
            }
            if (!languageRef.current?.contains(event.target as Node)) {
                setIsLanguageMenuOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsRegionMenuOpen(false);
                setIsLanguageMenuOpen(false);
                if (isLanguageMenuOpen) {
                    languageButtonRef.current?.focus();
                } else {
                    locationButtonRef.current?.focus();
                }
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isRegionMenuOpen, isLanguageMenuOpen]);

    return (
        <header className="navbar">
            <Link href="/" className="navbar__brand" aria-label="BRON — главная">
                BRON
            </Link>
            <nav className="navbar__navigation" aria-label="Основная навигация">
                <ul className="navbar__menu">
                    {[
                        { href: "/", label: "Главная", icon: homeIcon },
                        { href: "/map", label: "Карта", icon: mapIcon },
                        { href: "/favorites", label: "Любимые", icon: favoriteIcon },
                        { href: "/bookings", label: "Бронирование", icon: bookingIcon },
                        { href: "/chat", label: "Чат", icon: chatIcon },
                    ].map(({ href, label, icon }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                className="navbar__menu_link"
                                aria-label={label}
                                aria-current={pathname === href ? "page" : undefined}
                                title={label}
                            >
                                <Image src={icon} alt="" aria-hidden="true" />
                                <span className="navbar__menu_label">{label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="navbar__location" ref={locationRef}>
                <button
                    ref={locationButtonRef}
                    type="button"
                    className="navbar__location_trigger"
                    aria-label={`Регион: ${selectedRegion}`}
                    aria-expanded={isRegionMenuOpen}
                    aria-controls="navbar-region-menu"
                    onClick={() => {
                        setIsRegionMenuOpen((isOpen) => !isOpen);
                        setIsLanguageMenuOpen(false);
                    }}
                >
                    <Image src={locationIcon} alt="" aria-hidden="true" />
                    <span className="navbar__location_selected">{selectedRegion}</span>
                    <Image
                        className="navbar__location_arrow"
                        src={dropdownIcon}
                        alt=""
                        aria-hidden="true"
                    />
                </button>
                {isRegionMenuOpen && (
                    <ul className="navbar__location_menu" id="navbar-region-menu">
                        {regions.map((region) => (
                            <li key={region}>
                                <button
                                    type="button"
                                    className="navbar__location_option"
                                    aria-pressed={selectedRegion === region}
                                    onClick={() => {
                                        setSelectedRegion(region);
                                        onRegionChange?.(region);
                                        setIsRegionMenuOpen(false);
                                    }}
                                >
                                    {region}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button className="navbar__theme" type="button" aria-label="Тема оформления" title="Тема оформления">
                <Image src={lightThemeIcon} alt="" aria-hidden="true" />
            </button>
            <div className="navbar__lang" ref={languageRef}>
                <button
                    ref={languageButtonRef}
                    type="button"
                    className="navbar__lang_trigger"
                    aria-label={`Язык: ${selectedLanguage}`}
                    aria-expanded={isLanguageMenuOpen}
                    aria-controls="navbar-language-menu"
                    onClick={() => {
                        setIsLanguageMenuOpen((isOpen) => !isOpen);
                        setIsRegionMenuOpen(false);
                    }}
                >
                    <Image src={languageIcon} alt="" aria-hidden="true" />
                    <span className="navbar__lang_selected">{selectedLanguage}</span>
                    <Image
                        className="navbar__lang_arrow"
                        src={dropdownIcon}
                        alt=""
                        aria-hidden="true"
                    />
                </button>
                {isLanguageMenuOpen && (
                    <ul className="navbar__lang_menu" id="navbar-language-menu">
                        {languages.map((language) => (
                            <li key={language}>
                                <button
                                    type="button"
                                    className="navbar__lang_option"
                                    aria-pressed={selectedLanguage === language}
                                    onClick={() => {
                                        setSelectedLanguage(language);
                                        setIsLanguageMenuOpen(false);
                                    }}
                                >
                                    {language}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button className="navbar__notification" type="button" aria-label="Уведомления" title="Уведомления">
                <Image src={notificationIcon} alt="" aria-hidden="true" />
            </button>
            <button className="navbar__profile" type="button" aria-label="Профиль" title="Профиль">
                <Image src={profileIcon} alt="" aria-hidden="true" />
            </button>

        </header>
    )
}