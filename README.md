#PAPER Aid

<p align="center">
  <img src="assets/branding/logo-long.svg" alt="PAPER Aid logo long" width="520" />
</p>

Aplikacja mobilna do skanowania dokumentow (Android/iOS) zbudowana w Expo React Native.

## Funkcjonalnosci

- skanowanie dokumentow: aparat + galeria
- automatyczna detekcja dokumentu (native scanner)
- automatyczne przycinanie i korekcja perspektywy
- dokument wielostronicowy
- edytor stron (filtry, jasnosc, kontrast, rotacja, kolejnosc)
- nadawanie nazwy dokumentowi
- eksport do PDF
- udostepnianie PDF
- pobieranie PDF na urzadzenie (wybor folderu)
- historia dokumentow i ponowne otwieranie
- motyw jasny/ciemny

## Technologia

- React Native + Expo (SDK 54)
- `react-native-document-scanner-plugin`
- `expo-image-picker`
- `expo-print`
- `expo-sharing`
- `expo-file-system/legacy` (SAF - zapis do wybranego folderu na Androidzie)
- `@react-native-async-storage/async-storage`
- Git + EAS Build

## Wymagania lokalne

- Node.js LTS
- npm
- JDK 21 (zalecane)
- Android SDK

## Uruchomienie lokalne

```bash
npm install
npm run start
```

Jesli PowerShell blokuje `npx`, uzyj:

```powershell
npx.cmd expo start
```

## Android dev build (EAS)

```powershell
npx.cmd eas-cli build --platform android --profile development
```

Po instalacji dev builda uruchamiasz projekt przez Metro i laczysz aplikacje z tym samym serwerem.

## Testy

Testy jednostkowe:

```bash
npm test
```

Szczegoly testow i checklista manualna:

- `docs/TESTING.md`

## Struktura (skrot)

- `src/screens` - ekrany aplikacji
- `src/context/DocumentContext.js` - stan dokumentu i historia
- `src/context/ThemeContext.js` - motyw jasny/ciemny
- `src/utils/pdf.js` - generowanie i zapis PDF

Dokumentacja techniczna:

- `docs/ARCHITECTURE.md`
- `docs/BRANDING.md`

## Przykladowy PDF

Przykladowy plik PDF do repo:

- `samples/przykladowy-dokument.pdf`

## Status projektu

Aplikacja jest dzialajaca i obejmuje docelowy flow skanowanie -> edycja -> eksport/historia.
