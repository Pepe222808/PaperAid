import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppIconMark } from '../components/AppIconMark';

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

function ActionTile({ icon, label, onPress, primary = false, colors, styles }) {
  return (
    <Pressable style={[styles.actionTile, primary ? styles.actionTilePrimary : null]} onPress={onPress}>
      <Ionicons name={icon} size={20} color={primary ? '#ffffff' : colors.text} />
      <Text style={[styles.actionTitle, primary ? styles.actionTitlePrimary : null]}>{label}</Text>
    </Pressable>
  );
}

function BrandMark({ styles }) {
  return (
    <View style={styles.brandWrap}>
      <AppIconMark size={30} />
    </View>
  );
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
    <ScreenShell
      title={{
        text: 'PAPER Aid',
        leading: <BrandMark styles={styles} />,
        textStyle: styles.homeTitle,
      }}
      subtitle={null}
      headerColor="#0f9f71"
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionCard title="Aktualny dokument">
          <Pressable style={({ pressed }) => [styles.statusBar, pressed ? styles.pressed : null]} onPress={handleOpenCurrentDocument}>
            <View style={styles.statusIconWrap}>
              <Ionicons name="document-text-outline" size={22} color="#ffffff" />
            </View>
            <View style={styles.statusTextWrap}>
              <Text style={styles.statusValue}>{hasPages ? documentName : 'Nowy dokument'}</Text>
              <Text style={styles.statusInfo}>{hasPages ? `${pages.length} stron` : 'Brak stron'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.muted} />
          </Pressable>
        </SectionCard>

        <SectionCard title="Szybkie akcje">
          <View style={styles.actionGrid}>
            <ActionTile
              icon="scan-outline"
              label="Nowy skan"
              onPress={() => navigation.navigate('CaptureTab')}
              primary
              colors={colors}
              styles={styles}
            />
            <ActionTile icon="create-outline" label="Edytor" onPress={() => navigation.navigate('Editor')} colors={colors} styles={styles} />
            <ActionTile icon="download-outline" label="Eksport PDF" onPress={() => navigation.navigate('Export')} colors={colors} styles={styles} />
            <ActionTile icon="library-outline" label="Dokumenty" onPress={() => navigation.navigate('LibraryTab')} colors={colors} styles={styles} />
          </View>
        </SectionCard>

        <SectionCard
          title="Ostatnie dokumenty"
          subtitle={recentDocuments.length ? '3 ostatnie pozycje' : 'Brak zapisanych dokumentow'}
        >
          {!recentDocuments.length ? (
            <Text style={styles.emptyState}>Po pierwszym zapisie dokumentu tutaj od razu zobaczysz historie.</Text>
          ) : null}
          {recentDocuments.map((document) => (
            <Pressable
              key={document.id}
              style={({ pressed }) => [styles.documentRow, pressed ? styles.pressed : null]}
              onPress={() => handleOpenRecentDocument(document.id)}
            >
              <View style={styles.documentIcon}>
                <Ionicons name="document-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.documentMeta}>
                <Text style={styles.documentName}>{document.name}</Text>
                <Text style={styles.documentInfo}>
                  {document.pagesCount} stron | {formatUpdatedAt(document.updatedAt)}
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
      paddingHorizontal: 8,
      paddingBottom: 102,
      gap: 10,
    },
    brandWrap: {
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    homeTitle: {
      fontSize: 30,
      letterSpacing: -0.6,
    },
    statusBar: {
      borderRadius: 12,
      backgroundColor: colors.surfaceStrong,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    statusIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusTextWrap: {
      flex: 1,
    },
    statusValue: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    statusInfo: {
      color: colors.muted,
      fontSize: 14,
      marginTop: 2,
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    actionTile: {
      width: '48.8%',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 14,
      backgroundColor: colors.canvas,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 78,
      gap: 4,
    },
    actionTilePrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    actionTitle: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '700',
      textAlign: 'center',
    },
    actionTitlePrimary: {
      color: '#ffffff',
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
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: colors.surface,
    },
    documentIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
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
      backgroundColor: isDark ? '#1a4033' : '#d2f0e5',
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    statusPillText: {
      color: isDark ? '#9ae6c7' : '#117553',
      fontSize: 11,
      fontWeight: '700',
    },
    pressed: {
      opacity: 0.84,
    },
  });
