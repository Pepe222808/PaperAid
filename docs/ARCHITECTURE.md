# ARCHITECTURE

## High-level flow

1. User scans/imports pages on `CaptureScreen`.
2. Pages are stored in `DocumentContext` as the current working document.
3. User edits pages in `EditorScreen` (filter, brightness, contrast, rotation, order).
4. `ExportScreen` generates PDF (`expo-print`) and allows share/download.
5. Document history is persisted with AsyncStorage.

## Main modules

- `src/context/DocumentContext.js`
  - central state for current document and history
  - page operations: add/remove/reorder/rotate/edit
  - persistence key: `@paperaid/document-history/v1`
- `src/context/ThemeContext.js`
  - light/dark mode preference and persistence
  - persistence key: `@paperaid/theme-preference/v1`
- `src/utils/pdf.js`
  - PDF creation (`createPdfFile`)
  - save to device via Android SAF (`savePdfToDevice`)
- `src/utils/pdfHelpers.js`
  - pure helper functions for HTML/filter/name transformations

## Navigation

- Bottom tabs (`MainTabs`):
  - Start
  - Skan
  - Dokumenty
- Stack screens:
  - Edytor
  - Eksport

Szczegolowa dokumentacja ekranow:

- `docs/SCREENS.md`

## Native notes

- Auto document detection/crop/perspective:
  - `react-native-document-scanner-plugin`
- Gallery:
  - `expo-image-picker`
- PDF and sharing:
  - `expo-print`
  - `expo-sharing`
- Android download folder picker:
  - `expo-file-system/legacy` + Storage Access Framework
