import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { Platform } from 'react-native';
import { buildPdfHtml, sanitizeFileName } from './pdfHelpers';

export { buildPdfHtml, sanitizeFileName };

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
