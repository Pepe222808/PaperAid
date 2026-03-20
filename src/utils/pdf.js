import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { Platform } from 'react-native';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function toCssFilter(page) {
  const brightness = page?.edits?.brightness ?? 0;
  const contrast = page?.edits?.contrast ?? 0;
  const filter = page?.edits?.filter ?? 'original';

  const brightnessPercent = 100 + brightness * 12;
  const contrastPercent = 100 + contrast * 10;

  let filterCss = `brightness(${brightnessPercent}%) contrast(${contrastPercent}%)`;

  if (filter === 'bw') {
    filterCss += ' grayscale(100%)';
  }
  if (filter === 'clean') {
    filterCss += ' saturate(0%) contrast(120%)';
  }
  if (filter === 'warm') {
    filterCss += ' sepia(45%) saturate(115%)';
  }

  return filterCss;
}

export function buildPdfHtml(documentName, pages) {
  const safeName = escapeHtml(documentName || 'PAPER Aid');
  const renderedPages = pages
    .map((page, index) => {
      const safeLabel = escapeHtml(page.label);
      const safeState = escapeHtml(page.state ?? '');
      const filterCss = toCssFilter(page);
      const rotation = page?.edits?.rotation ?? 0;
      const scale = rotation % 180 === 0 ? 1 : 0.78;

      return `
      <section class="page">
        <div class="head">
          <h2>${safeLabel}</h2>
          <p>${safeState}</p>
        </div>
        <div class="imageWrap">
          <img
            src="${page.uri}"
            style="transform: rotate(${rotation}deg) scale(${scale}); filter: ${filterCss};"
          />
        </div>
        <div class="foot">Strona ${index + 1} / ${pages.length}</div>
      </section>
      `;
    })
    .join('');

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #f9f5ee;
          color: #202722;
        }
        .cover {
          min-height: 100vh;
          padding: 34px 30px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: linear-gradient(180deg, #f9f5ee 0%, #f1e7d9 100%);
        }
        .cover h1 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -0.4px;
        }
        .cover p {
          margin: 8px 0 0;
          color: #5a645d;
          font-size: 14px;
        }
        .page {
          min-height: 100vh;
          page-break-before: always;
          padding: 26px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .head h2 {
          margin: 0;
          font-size: 18px;
        }
        .head p {
          margin: 4px 0 0;
          color: #637069;
          font-size: 12px;
        }
        .imageWrap {
          flex: 1;
          min-height: 60vh;
          border-radius: 18px;
          border: 1px solid #dfd3c1;
          background: #f6efe3;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .foot {
          font-size: 12px;
          color: #6f7b74;
          text-align: right;
        }
      </style>
    </head>
    <body>
      <section class="cover">
        <h1>${safeName}.pdf</h1>
        <p>Liczba stron: ${pages.length}</p>
      </section>
      ${renderedPages}
    </body>
  </html>
  `;
}

function sanitizeFileName(value) {
  return (value || 'dokument')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, '_')
    .slice(0, 60);
}

export async function createPdfFile(documentName, pages) {
  const html = buildPdfHtml(documentName, pages);
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });
  return uri;
}

export async function savePdfToDevice(pdfUri, documentName) {
  const safeName = `${sanitizeFileName(documentName)}-${Date.now()}.pdf`;

  if (Platform.OS === 'android') {
    try {
      if (!FileSystem.StorageAccessFramework?.requestDirectoryPermissionsAsync) {
        return { saved: false, reason: 'saf_unavailable' };
      }

      const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permission.granted) {
        return { saved: false, cancelled: true };
      }

      const source = await FileSystem.getInfoAsync(pdfUri);
      if (!source.exists) {
        return { saved: false, reason: 'missing_source' };
      }

      const base64 = await FileSystem.readAsStringAsync(pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const targetUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permission.directoryUri,
        safeName,
        'application/pdf'
      );

      await FileSystem.StorageAccessFramework.writeAsStringAsync(targetUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return { saved: true, uri: targetUri };
    } catch (error) {
      return { saved: false, reason: 'android_saf_failed', message: String(error), uri: pdfUri };
    }
  }

  try {
    const targetUri = `${FileSystem.documentDirectory}${safeName}`;
    const existing = await FileSystem.getInfoAsync(targetUri);
    if (existing.exists) {
      await FileSystem.deleteAsync(targetUri, { idempotent: true });
    }
    await FileSystem.copyAsync({ from: pdfUri, to: targetUri });
    return { saved: true, uri: targetUri };
  } catch (_error) {
    return { saved: false, reason: 'copy_failed', uri: pdfUri };
  }
}
