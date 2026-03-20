# TESTING

## Unit tests

Project uses `jest-expo`.

Run tests:

```bash
npm test
```

Current unit-test scope:

- `src/utils/pdfHelpers.test.js`
  - HTML escaping
  - file-name sanitization
  - CSS filter conversion
  - PDF HTML generation with expected content

## Manual smoke test checklist

1. Open app and verify main tabs render.
2. Scan with native scanner and add from gallery.
3. Confirm multi-page sequence updates correctly.
4. Open editor and modify filter/brightness/contrast/rotation/order.
5. Export to PDF and share.
6. Download PDF and choose a folder on Android picker.
7. Open `Dokumenty` and re-open an existing document.
8. Toggle theme in header (`☾/☀`) and verify all key screens remain readable.
