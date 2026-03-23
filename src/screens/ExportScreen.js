import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Sharing from 'expo-sharing';

import { DocumentPagePreview, getPageSummary } from '../components/DocumentPagePreview';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { useDocument } from '../context/DocumentContext';
import { useAppTheme } from '../context/ThemeContext';
import { createPdfFile, savePdfToDevice } from '../utils/pdf';

export function ExportScreen({ navigation }) {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);
  const {
    documentName,
    pages,
    activePage,
    hasPages,
    history,
    openHistoryDocument,
    archiveCurrentDocument,
  } = useDocument();
  const [isExporting, setIsExporting] = useState(false);
  const [lastPdfUri, setLastPdfUri] = useState(null);

  const createPdf = async () => {
    if (!hasPages) {
      Alert.alert('Brak stron', 'Dodaj minimum jedna strone dokumentu, aby zapisac PDF.');
      return null;
    }

    setIsExporting(true);
    try {
      const uri = await createPdfFile(documentName, pages);

      archiveCurrentDocument({ pdfUri: uri });
      setLastPdfUri(uri);
      return uri;
    } catch (_error) {
      Alert.alert('Blad eksportu', 'Nie udalo sie wygenerowac PDF. Sprobuj ponownie.');
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveDocument = async () => {
    const uri = await createPdf();
    if (!uri) {
      return;
    }

    Alert.alert('PDF zapisany', `Plik zapisano lokalnie.\n\n${uri}`, [
      {
        text: 'Przejdz do biblioteki',
        onPress: () => navigation.navigate('MainTabs', { screen: 'LibraryTab' }),
      },
      { text: 'OK' },
    ]);
  };

  const handleShareDocument = async () => {
    const uri = lastPdfUri ?? (await createPdf());
    if (!uri) {
      return;
    }

    const sharingAvailable = await Sharing.isAvailableAsync();
    if (!sharingAvailable) {
      Alert.alert('Brak wsparcia', 'Udostepnianie plikow nie jest dostepne na tym urzadzeniu.');
      return;
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Udostepnij dokument PDF',
      UTI: 'com.adobe.pdf',
    });
  };

  const handleDownloadDocument = async () => {
    const uri = lastPdfUri ?? (await createPdf());
    if (!uri) {
      return;
    }

    try {
      const result = await savePdfToDevice(uri, documentName);
      if (result.cancelled) {
        return;
      }

      if (result.saved) {
        Alert.alert('PDF pobrany', `Plik zapisany na urzadzeniu.\n\n${result.uri}`);
        return;
      }
      if (result.reason === 'saf_unavailable') {
        Alert.alert(
          'Brak modulu zapisu',
          'Ten build nie ma wsparcia wyboru folderu. Zainstaluj najnowszy dev build i sprobuj ponownie.'
        );
        return;
      }
      Alert.alert('Blad zapisu', 'Nie udalo sie zapisac PDF w wybranym folderze.');
    } catch (_error) {
      Alert.alert('Blad zapisu', 'Nie udalo sie zapisac PDF na urzadzeniu.');
    }
  };

  const handleLoadHistoryDocument = (recordId) => {
    openHistoryDocument(recordId);
    setLastPdfUri(null);
  };

  return (
    <ScreenShell title="Eksport" subtitle="Podglad finalnego PDF i zapis do historii">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!hasPages ? (
          <SectionCard
            title="Wybierz dokument do eksportu"
            subtitle={history.length ? 'Mozesz eksportowac dokument z historii' : 'Brak zapisanych dokumentow'}
          >
            {!history.length ? (
              <Text style={styles.emptyState}>Najpierw zeskanuj dokument albo zapisz go do historii.</Text>
            ) : null}
            {history.slice(0, 8).map((record) => (
              <View key={record.id} style={styles.historyRow}>
                <View style={styles.historyMeta}>
                  <Text style={styles.historyName}>{record.name}</Text>
                  <Text style={styles.historyInfo}>{record.pagesCount} stron</Text>
                </View>
                <PrimaryButton
                  label="Wczytaj"
                  compact
                  variant="secondary"
                  onPress={() => handleLoadHistoryDocument(record.id)}
                />
              </View>
            ))}
          </SectionCard>
        ) : null}

        <SectionCard title="Eksport PDF" subtitle="Finalny ekran przed zapisaniem dokumentu" accent>
          <View style={styles.exportPreview}>
            <View style={styles.exportSheetLarge}>
              {hasPages ? (
                <DocumentPagePreview
                  page={activePage}
                  style={styles.exportImageWrap}
                  imageStyle={styles.exportImage}
                  showBadge
                />
              ) : null}
              <View style={styles.previewTextCard}>
                <Text style={styles.exportSheetTitle}>{documentName || 'PAPER Aid'}.pdf</Text>
                <Text style={styles.exportSheetText}>{pages.length || 0} stron  |  A4  |  Podglad roboczy</Text>
              </View>
            </View>
            <View style={styles.exportOptions}>
              <View style={styles.exportRow}>
                <Text style={styles.exportLabel}>Strona podgladu</Text>
                <Text style={styles.exportValue}>{activePage?.label ?? 'Brak'}</Text>
              </View>
              <View style={styles.exportSummaryBox}>
                <Text style={styles.exportSummaryText}>{getPageSummary(activePage)}</Text>
              </View>
              <View style={styles.exportRow}>
                <Text style={styles.exportLabel}>Jakosc</Text>
                <Text style={styles.exportValue}>Wysoka</Text>
              </View>
              <View style={styles.exportRow}>
                <Text style={styles.exportLabel}>Kolor</Text>
                <Text style={styles.exportValue}>Auto</Text>
              </View>
              <View style={styles.exportRow}>
                <Text style={styles.exportLabel}>Rozmiar</Text>
                <Text style={styles.exportValue}>A4</Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label={isExporting ? 'Generowanie PDF...' : 'Zapisz jako PDF'}
              onPress={handleSaveDocument}
            />
            <PrimaryButton
              label={isExporting ? 'Przygotowanie...' : 'Udostepnij dokument'}
              variant="secondary"
              onPress={handleShareDocument}
            />
            <PrimaryButton
              label={isExporting ? 'Przygotowanie...' : 'Pobierz PDF na urzadzenie'}
              variant="secondary"
              onPress={handleDownloadDocument}
            />
          </View>
        </SectionCard>
      </ScrollView>
    </ScreenShell>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  exportPreview: {
    gap: 14,
  },
  exportSheetLarge: {
    minHeight: 280,
    borderRadius: 16,
    backgroundColor: colors.surfaceStrong,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'flex-end',
  },
  exportImageWrap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  exportImage: {
    width: '100%',
    height: '100%',
  },
  exportSheetTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: isDark ? '#f8fafc' : '#0f172a',
  },
  exportSheetText: {
    fontSize: 14,
    color: isDark ? '#cbd5e1' : '#334155',
    marginTop: 8,
  },
  previewTextCard: {
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(2, 6, 23, 0.68)' : 'rgba(248, 250, 252, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(148, 163, 184, 0.24)' : 'rgba(100, 116, 139, 0.24)',
  },
  exportOptions: {
    borderRadius: 16,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },
  exportSummaryBox: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 12,
  },
  exportSummaryText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exportLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  exportValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '700',
  },
  actions: {
    gap: 12,
  },
  emptyState: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  historyMeta: {
    flex: 1,
    gap: 2,
  },
  historyName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  historyInfo: {
    color: colors.muted,
    fontSize: 12,
  },
});
