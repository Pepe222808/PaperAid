import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { useDocument } from '../context/DocumentContext';
import { useAppTheme } from '../context/ThemeContext';

function formatUpdatedAt(isoDate) {
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

export function HomeScreen({ navigation }) {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);
  const { history, pages, hasPages, documentName, openHistoryDocument } = useDocument();
  const recentDocuments = history.slice(0, 3);

  const handleOpenCurrentDocument = () => {
    if (hasPages) {
      navigation.navigate('Editor');
      return;
    }
    navigation.navigate('CaptureTab');
  };

  const handleOpenRecentDocument = (recordId) => {
    const opened = openHistoryDocument(recordId);
    if (opened) {
      navigation.navigate('Editor');
    }
  };

  return (
    <ScreenShell title="PAPER Aid" subtitle="Nowoczesny skaner dokumentow">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable style={({ pressed }) => [styles.statusBar, pressed ? styles.pressed : null]} onPress={handleOpenCurrentDocument}>
          <Text style={styles.statusTitle}>Aktualny dokument</Text>
          <Text style={styles.statusValue}>
            {hasPages ? `${documentName} (${pages.length} stron)` : 'Brak aktywnego dokumentu'}
          </Text>
        </Pressable>

        <SectionCard title="Szybkie akcje" subtitle="Najczesciej uzywane">
          <View style={styles.actionGrid}>
            <Pressable style={styles.actionTile} onPress={() => navigation.navigate('CaptureTab')}>
              <Text style={styles.actionTitle}>Nowy skan</Text>
              <Text style={styles.actionText}>Kamera i auto-detekcja</Text>
            </Pressable>
            <Pressable style={styles.actionTile} onPress={() => navigation.navigate('Editor')}>
              <Text style={styles.actionTitle}>Edytor</Text>
              <Text style={styles.actionText}>Filtry i kolejnosc stron</Text>
            </Pressable>
            <Pressable style={styles.actionTile} onPress={() => navigation.navigate('Export')}>
              <Text style={styles.actionTitle}>Eksport PDF</Text>
              <Text style={styles.actionText}>Zapis i udostepnianie</Text>
            </Pressable>
            <Pressable style={styles.actionTile} onPress={() => navigation.navigate('LibraryTab')}>
              <Text style={styles.actionTitle}>Dokumenty</Text>
              <Text style={styles.actionText}>Historia i otwieranie</Text>
            </Pressable>
          </View>
        </SectionCard>

        <SectionCard
          title="Ostatnie dokumenty"
          subtitle={recentDocuments.length ? 'Pokazuje 3 ostatnie pozycje' : 'Brak zapisanych dokumentow'}
        >
          {!recentDocuments.length ? (
            <Text style={styles.emptyState}>Po pierwszym zapisie dokumentu tutaj od razu zobaczysz jego historie.</Text>
          ) : null}
          {recentDocuments.map((document) => (
            <Pressable
              key={document.id}
              style={({ pressed }) => [styles.documentRow, pressed ? styles.pressed : null]}
              onPress={() => handleOpenRecentDocument(document.id)}
            >
              <View style={styles.documentIcon}>
                <Text style={styles.documentIconText}>DOC</Text>
              </View>
              <View style={styles.documentMeta}>
                <Text style={styles.documentName}>{document.name}</Text>
                <Text style={styles.documentInfo}>
                  {document.pagesCount} stron  |  {formatUpdatedAt(document.updatedAt)}
                </Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{document.status}</Text>
              </View>
            </Pressable>
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
    paddingBottom: 110,
    gap: 12,
  },
  statusBar: {
    borderRadius: 18,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  statusTitle: {
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  statusValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  actionGrid: {
    gap: 8,
  },
  actionTile: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: '#eadfce',
    gap: 2,
  },
  actionTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
  },
  actionText: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
  },
  emptyState: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
  },
  documentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  documentIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentIconText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 11,
  },
  documentMeta: {
    flex: 1,
    gap: 2,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  documentInfo: {
    fontSize: 12,
    color: colors.muted,
  },
  statusPill: {
    borderRadius: 999,
    backgroundColor: isDark ? '#2e4c3e' : '#e6f3eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillText: {
    color: isDark ? '#c9eed9' : '#2f6b47',
    fontSize: 11,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.84,
  },
});
