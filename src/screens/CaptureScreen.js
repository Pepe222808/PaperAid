import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DocumentScanner, {
  ResponseType,
  ScanDocumentResponseStatus,
} from 'react-native-document-scanner-plugin';

import { DocumentPagePreview } from '../components/DocumentPagePreview';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { useDocument } from '../context/DocumentContext';
import { useAppTheme } from '../context/ThemeContext';

export function CaptureScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const styles = createStyles(colors);
  const [isScanning, setIsScanning] = useState(false);

  const {
    pages,
    activePage,
    activePageId,
    setActivePageId,
    addPagesFromAssets,
    archiveCurrentDocument,
    resetDocument,
    hasPages,
  } = useDocument();

  const handlePickImages = async () => {
    const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!galleryPermission.granted) {
      Alert.alert('Brak dostepu', 'Zezwol na dostep do galerii, aby dodawac strony dokumentu.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 10,
    });

    if (!result.canceled && result.assets?.length) {
      addPagesFromAssets(result.assets);
    }
  };

  const handleAutoScan = async () => {
    if (isScanning) {
      return;
    }

    try {
      setIsScanning(true);

      if (Platform.OS === 'android') {
        const permissionResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );

        if (permissionResult !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Brak dostepu', 'Musisz zezwolic na kamere, aby uruchomic auto-skaner.');
          return;
        }
      }

      const result = await DocumentScanner.scanDocument({
        croppedImageQuality: 100,
        maxNumDocuments: 10,
        responseType: ResponseType.ImageFilePath,
      });

      if (
        result.status === ScanDocumentResponseStatus.Success &&
        result.scannedImages &&
        result.scannedImages.length > 0
      ) {
        addPagesFromAssets(
          result.scannedImages.map((uri, index) => ({
            uri,
            fileName: `document-scan-${Date.now()}-${index + 1}.jpg`,
            state: 'Wykryto dokument i zeskanowano',
          }))
        );
      }
    } catch (_error) {
      Alert.alert(
        'Auto-skan niedostepny',
        'Ten natywny skaner nie dziala w Expo Go. Potrzebny jest dev build aplikacji.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleCloseDocument = () => {
    if (!hasPages) {
      return;
    }

    Alert.alert('Zamknac aktualny dokument?', 'Mozesz zapisac go w historii albo zamknac bez zapisu.', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Zamknij bez zapisu',
        style: 'destructive',
        onPress: () => resetDocument(),
      },
      {
        text: 'Zapisz i zamknij',
        onPress: () => {
          archiveCurrentDocument();
          resetDocument();
        },
      },
    ]);
  };

  return (
    <ScreenShell
      title="Skan"
      subtitle="Auto-skaner dokumentow"
      rightAccessory={
        hasPages ? (
          <View style={styles.headerAccessoryRow}>
            <Pressable style={styles.headerActionButton} onPress={toggleTheme}>
              <Text style={styles.headerActionText}>{isDark ? '\u2600' : '\u263E'}</Text>
            </Pressable>
            <Pressable style={styles.headerActionButton} onPress={handleCloseDocument}>
              <Ionicons name="close" size={18} color="#ffffff" />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.headerActionButton} onPress={toggleTheme}>
            <Text style={styles.headerActionText}>{isDark ? '\u2600' : '\u263E'}</Text>
          </Pressable>
        )
      }
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{pages.length} {pages.length === 1 ? 'strona' : 'stron'}</Text>
          </View>
          {hasPages ? <Text style={styles.activeText}>Aktywna: {activePage?.label ?? '1'}</Text> : null}
        </View>

        <SectionCard title="">
          <PrimaryButton
            label={isScanning ? 'Skanowanie...' : 'Zeskanuj dokument'}
            onPress={handleAutoScan}
          />
          <PrimaryButton label="Import z galerii" variant="secondary" onPress={handlePickImages} />
        </SectionCard>

        {hasPages ? (
          <>
            <SectionCard title="Szybkie przejscia">
              <View style={styles.buttonRow}>
                <View style={styles.buttonItem}>
                  <PrimaryButton label="Dokumenty" variant="secondary" onPress={() => navigation.navigate('LibraryTab')} />
                </View>
                <View style={styles.buttonItem}>
                  <PrimaryButton label="Eksport" variant="secondary" onPress={() => navigation.navigate('Export')} />
                </View>
              </View>
            </SectionCard>

            <SectionCard title="Sekwencja stron">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.pageStrip}>
                  {pages.map((page) => (
                    <Pressable
                      key={page.id}
                      style={[styles.pageCard, activePageId === page.id ? styles.pageCardActive : null]}
                      onPress={() => setActivePageId(page.id)}
                    >
                      <DocumentPagePreview page={page} style={styles.pagePreview} imageStyle={styles.pagePreview} showBadge />
                      <Text style={styles.pageLabel}>{page.label}</Text>
                    </Pressable>
                  ))}
                  <Pressable style={styles.pageCardAdd} onPress={handlePickImages}>
                    <Ionicons name="add" size={26} color={colors.muted} />
                  </Pressable>
                </View>
              </ScrollView>
            </SectionCard>
          </>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: 8,
      paddingBottom: 104,
      gap: 10,
    },
    headerAccessoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerActionButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(255,255,255,0.24)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerActionText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: '700',
    },
    statsRow: {
      paddingHorizontal: 4,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
    },
    pill: {
      backgroundColor: colors.accentSoft,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    pillText: {
      color: colors.accent,
      fontWeight: '700',
      fontSize: 14,
    },
    activeText: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '500',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 10,
    },
    buttonItem: {
      flex: 1,
    },
    pageStrip: {
      flexDirection: 'row',
      gap: 10,
      paddingRight: 4,
    },
    pageCard: {
      width: 112,
      borderRadius: 12,
      backgroundColor: colors.canvas,
      borderWidth: 1,
      borderColor: 'transparent',
      padding: 6,
      gap: 6,
    },
    pageCardActive: {
      borderColor: colors.primary,
    },
    pagePreview: {
      height: 140,
      borderRadius: 10,
    },
    pageLabel: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '600',
      textAlign: 'center',
    },
    pageCardAdd: {
      width: 112,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
  });
