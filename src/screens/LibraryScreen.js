import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Pill } from '../components/Pill';
import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { useDocument } from '../context/DocumentContext';
import { useAppTheme } from '../context/ThemeContext';
import { createPdfFile, savePdfToDevice } from '../utils/pdf';

function formatDate(isoDate) {
  if (!isoDate) {
    return 'Brak daty';
  }

  const date = new Date(isoDate);
  return date.toLocaleString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function LibraryScreen({ navigation }) {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);
  const {
    history,
    openHistoryDocument,
    deleteHistoryDocument,
    updateHistoryPdfUri,
    isHistoryLoaded,
  } = useDocument();

  const handleOpenDocument = (recordId) => {
    const opened = openHistoryDocument(recordId);
    if (opened) {
      navigation.navigate('Editor');
    }
  };

  const handleDeleteDocument = (recordId, name) => {
    Alert.alert('Usunac dokument z historii?', `Dokument "${name}" zostanie usuniety z historii aplikacji.`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: () => deleteHistoryDocument(recordId) },
    ]);
  };

  const handleDownloadDocument = async (record) => {
    try {
      const pdfUri = record.pdfUri ?? (await createPdfFile(record.name, record.pages));
      if (!record.pdfUri) {
        updateHistoryPdfUri(record.id, pdfUri);
      }

      const result = await savePdfToDevice(pdfUri, record.name);
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
      Alert.alert('Blad pobierania', 'Nie udalo sie zapisac PDF w wybranym folderze.');
    } catch (_error) {
      Alert.alert('Blad pobierania', 'Nie udalo sie pobrac PDF dla tego dokumentu.');
    }
  };

  return (
    <ScreenShell title="Dokumenty" subtitle="Prawdziwa historia roboczych i zapisanych dokumentow">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionCard title="Biblioteka dokumentow" subtitle="Dokumenty zapisane lokalnie w historii aplikacji">
          <View style={styles.searchBar}>
            <Text style={styles.searchText}>
              {isHistoryLoaded ? `${history.length} dokumentow w historii` : 'Ladowanie historii...'}
            </Text>
          </View>

          {!history.length && isHistoryLoaded ? (
            <Text style={styles.emptyState}>Historia jest pusta. Zapisz pierwszy dokument na ekranie Eksport.</Text>
          ) : null}

          {history.map((item) => (
            <View key={item.id} style={styles.libraryRow}>
              <Pressable style={styles.libraryOpenArea} onPress={() => handleOpenDocument(item.id)}>
                <View style={styles.libraryIcon}>
                  <Text style={styles.libraryIconText}>DOC</Text>
                </View>
                <View style={styles.libraryMeta}>
                  <Text style={styles.libraryName}>{item.name}</Text>
                  <Text style={styles.libraryInfo}>
                    {item.pagesCount} stron  |  Aktualizacja: {formatDate(item.updatedAt)}
                  </Text>
                  <Text style={styles.libraryInfo}>Utworzono: {formatDate(item.createdAt)}</Text>
                </View>
              </Pressable>
              <View style={styles.libraryActions}>
                <Pill label={item.status} />
                <Pressable style={styles.downloadButton} onPress={() => handleDownloadDocument(item)}>
                  <Text style={styles.downloadButtonText}>Pobierz PDF</Text>
                </Pressable>
                <Pressable style={styles.deleteButton} onPress={() => handleDeleteDocument(item.id, item.name)}>
                  <Text style={styles.deleteButtonText}>Usun</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </SectionCard>
      </ScrollView>
    </ScreenShell>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 16,
  },
  searchBar: {
    borderRadius: 18,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: '#eadfce',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchText: {
    color: colors.muted,
    fontSize: 14,
  },
  emptyState: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  libraryOpenArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  libraryIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#f1e5d8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryIconText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  libraryMeta: {
    flex: 1,
    gap: 4,
  },
  libraryName: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '700',
  },
  libraryInfo: {
    fontSize: 13,
    color: colors.muted,
  },
  libraryActions: {
    gap: 8,
    alignItems: 'flex-end',
  },
  downloadButton: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: isDark ? '#466456' : '#b8d5c2',
    backgroundColor: isDark ? '#24362e' : '#e8f5ed',
  },
  downloadButtonText: {
    color: isDark ? '#c9eed9' : '#256343',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: isDark ? '#704a3d' : '#ddb9a9',
    backgroundColor: isDark ? '#3a2823' : '#f7e6de',
  },
  deleteButtonText: {
    color: isDark ? '#f0c7b4' : '#9a4e2c',
    fontSize: 12,
    fontWeight: '700',
  },
});
