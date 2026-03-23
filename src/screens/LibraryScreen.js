import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '../components/ScreenShell';
import { useDocument } from '../context/DocumentContext';
import { useAppTheme } from '../context/ThemeContext';
import { createPdfFile, savePdfToDevice } from '../utils/pdf';

function formatDate(isoDate) {
  if (!isoDate) {
    return 'Brak daty';
  }

  const date = new Date(isoDate);
  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
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

  const pdfCount = history.filter((x) => Boolean(x.pdfUri)).length;

  const ensurePdf = async (record) => {
    const pdfUri = record.pdfUri ?? (await createPdfFile(record.name, record.pages));
    if (!record.pdfUri) {
      updateHistoryPdfUri(record.id, pdfUri);
    }
    return pdfUri;
  };

  const handleOpenDocument = (recordId) => {
    const opened = openHistoryDocument(recordId);
    if (opened) {
      navigation.navigate('Export');
    }
  };

  const handleDownloadDocument = async (record) => {
    try {
      const pdfUri = await ensurePdf(record);
      const result = await savePdfToDevice(pdfUri, record.name);
      if (result.cancelled) {
        return;
      }

      if (result.saved) {
        Alert.alert('PDF pobrany', `Plik zapisany na urzadzeniu.\n\n${result.uri}`);
        return;
      }
      Alert.alert('Blad pobierania', 'Nie udalo sie zapisac PDF w wybranym folderze.');
    } catch (_error) {
      Alert.alert('Blad pobierania', 'Nie udalo sie pobrac PDF dla tego dokumentu.');
    }
  };

  const handleShareDocument = async (record) => {
    try {
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        Alert.alert('Brak wsparcia', 'Udostepnianie plikow nie jest dostepne na tym urzadzeniu.');
        return;
      }

      const pdfUri = await ensurePdf(record);
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Udostepnij dokument PDF',
        UTI: 'com.adobe.pdf',
      });
    } catch (_error) {
      Alert.alert('Blad udostepniania', 'Nie udalo sie udostepnic PDF dla tego dokumentu.');
    }
  };

  const handleDeleteDocument = (recordId, name) => {
    Alert.alert('Usunac dokument?', `Dokument "${name}" zostanie usuniety z historii aplikacji.`, [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: () => deleteHistoryDocument(recordId) },
    ]);
  };

  return (
    <ScreenShell title="Dokumenty" subtitle={isHistoryLoaded ? `${history.length} dokument${history.length === 1 ? '' : 'y'}` : 'Ladowanie...'}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsCard}>
          <View style={styles.statsLeft}>
            <View style={styles.statsIconWrap}>
              <Ionicons name="folder-open-outline" size={20} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.statsLabel}>Calkowita liczba</Text>
              <Text style={styles.statsValue}>{history.length}</Text>
            </View>
          </View>
          <View style={styles.statsPill}>
            <Text style={styles.statsPillText}>{pdfCount} PDF</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Wszystkie dokumenty</Text>
          </View>

          {!history.length && isHistoryLoaded ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>Brak dokumentow. Zeskanuj pierwszy dokument.</Text>
            </View>
          ) : null}

          {history.map((item) => (
            <View key={item.id} style={styles.docCard}>
              <Pressable style={styles.docMain} onPress={() => handleOpenDocument(item.id)}>
                <View style={styles.docIconWrap}>
                  <Ionicons name="document-text-outline" size={22} color="#ffffff" />
                </View>
                <View style={styles.docMeta}>
                  <Text style={styles.docName}>{item.name}</Text>
                  <Text style={styles.docInfo}>{item.pagesCount} str</Text>
                  <Text style={styles.docDate}>{formatDate(item.updatedAt)}</Text>
                </View>
                <View style={styles.docBadge}>
                  <Text style={styles.docBadgeText}>{item.status}</Text>
                </View>
              </Pressable>

              <View style={styles.actionsRow}>
                <Pressable style={styles.actionBtn} onPress={() => handleDownloadDocument(item)}>
                  <Ionicons name="download-outline" size={14} color="#15c58e" />
                  <Text style={styles.actionTextDownload}>Pobierz</Text>
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => handleShareDocument(item)}>
                  <Ionicons name="share-social-outline" size={14} color="#15c58e" />
                  <Text style={styles.actionTextDownload}>Udostepnij</Text>
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => handleDeleteDocument(item.id, item.name)}>
                  <Ionicons name="trash-outline" size={14} color="#ef4444" />
                  <Text style={styles.actionTextDelete}>Usun</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenShell>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: 10,
      paddingBottom: 104,
      gap: 12,
    },
    statsCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDark ? '#2f4b44' : '#9dd7c4',
      backgroundColor: isDark ? '#0e231f' : '#e4f4ee',
      paddingHorizontal: 12,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statsLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    statsIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#10b981',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsLabel: {
      color: colors.muted,
      fontSize: 13,
    },
    statsValue: {
      color: colors.text,
      fontSize: 34,
      fontWeight: '700',
      lineHeight: 34,
    },
    statsPill: {
      backgroundColor: isDark ? '#113429' : '#d5f3e8',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    statsPillText: {
      color: '#10b981',
      fontWeight: '700',
      fontSize: 12,
    },
    sectionCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: isDark ? '#121f1c' : colors.surface,
      overflow: 'hidden',
    },
    sectionHeader: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '700',
    },
    emptyWrap: {
      padding: 16,
    },
    emptyText: {
      color: colors.muted,
      fontSize: 14,
    },
    docCard: {
      margin: 12,
      borderWidth: 1,
      borderColor: isDark ? '#2f4b44' : '#9dcdbf',
      borderRadius: 12,
      backgroundColor: isDark ? '#20302b' : '#f2faf7',
      overflow: 'hidden',
    },
    docMain: {
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    docIconWrap: {
      width: 54,
      height: 54,
      borderRadius: 10,
      backgroundColor: '#10b981',
      alignItems: 'center',
      justifyContent: 'center',
    },
    docMeta: {
      flex: 1,
      gap: 2,
    },
    docName: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '700',
    },
    docInfo: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '600',
    },
    docDate: {
      color: colors.muted,
      fontSize: 13,
    },
    docBadge: {
      backgroundColor: isDark ? '#12362b' : '#d9f5ea',
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    docBadgeText: {
      color: '#10b981',
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    actionsRow: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionBtn: {
      flex: 1,
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      backgroundColor: isDark ? '#1a2824' : '#edf6f3',
    },
    actionTextDownload: {
      color: '#10b981',
      fontWeight: '700',
      fontSize: 15,
    },
    actionTextDelete: {
      color: '#ef4444',
      fontWeight: '700',
      fontSize: 15,
    },
  });
