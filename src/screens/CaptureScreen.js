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
import { useDocument } from '../context/DocumentContext';
import { useAppTheme } from '../context/ThemeContext';
import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';

export function CaptureScreen({ navigation }) {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);
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
    } catch (error) {
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
      title="Skanowanie"
      subtitle="Natywny auto-skan dokumentow"
      rightAccessory={
        hasPages ? (
          <Pressable style={styles.closeDocumentButton} onPress={handleCloseDocument}>
            <Text style={styles.closeDocumentButtonText}>X</Text>
          </Pressable>
        ) : null
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <SectionCard
          title="Auto-skaner dokumentow"
          subtitle="Skanuj kamera albo dodawaj zdjecia z galerii"
          accent
        >
          <View style={styles.cameraMock}>
            {hasPages ? (
              <DocumentPagePreview
                page={activePage}
                style={styles.previewImageWrap}
                imageStyle={styles.previewImage}
                showBadge
              />
            ) : (
              <>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
                <View style={styles.detectionBadge}>
                  <Text style={styles.detectionBadgeText}>Auto detect + auto crop</Text>
                </View>
                <View style={styles.cameraCenterCard}>
                  <Text style={styles.cameraCenterTitle}>Uruchom natywny skaner</Text>
                  <Text style={styles.cameraCenterText}>
                    Dokument zostanie automatycznie wykryty i zapisany jako kolejna strona.
                  </Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.quickStats}>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatLabel}>Strony</Text>
              <Text style={styles.quickStatValue}>{pages.length || 0}</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatLabel}>Aktywna</Text>
              <Text style={styles.quickStatValue}>{activePage?.label ?? 'Brak'}</Text>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <View style={styles.buttonItem}>
              <PrimaryButton label={isScanning ? 'Uruchamianie...' : 'Uruchom skaner'} onPress={handleAutoScan} />
            </View>
            <View style={styles.buttonItem}>
              <PrimaryButton label="Dodaj z galerii" variant="secondary" onPress={handlePickImages} />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <View style={styles.buttonItem}>
              <PrimaryButton label="Edytor" variant="secondary" onPress={() => navigation.navigate('Editor')} />
            </View>
            <View style={styles.buttonItem}>
              <PrimaryButton label="Eksport i share" onPress={() => navigation.navigate('Export')} />
            </View>
          </View>

        </SectionCard>

        <SectionCard
          title="Sekwencja wielostronicowa"
          subtitle={hasPages ? 'Aktualne strony roboczego dokumentu' : 'Po skanowaniu strony pojawia sie tutaj'}
        >
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
                  <Text style={styles.pageState}>{page.state}</Text>
                </Pressable>
              ))}
              <Pressable style={styles.pageCardAdd} onPress={handlePickImages}>
                <Text style={styles.pageAddText}>{hasPages ? '+ Dodaj kolejna' : '+ Dodaj strone'}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </SectionCard>
      </ScrollView>
    </ScreenShell>
  );
}

const createStyles = (colors, isDark) =>
  StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 168,
    gap: 16,
  },
  cameraMock: {
    height: 420,
    borderRadius: 28,
    backgroundColor: colors.camera,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: '#fff7ec',
  },
  cornerTopLeft: {
    top: 28,
    left: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 28,
    right: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 28,
    left: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 28,
    right: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  detectionBadge: {
    position: 'absolute',
    top: 22,
    alignSelf: 'center',
    backgroundColor: 'rgba(247, 242, 232, 0.16)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  detectionBadgeText: {
    color: '#fff7ec',
    fontSize: 12,
    fontWeight: '700',
  },
  cameraCenterCard: {
    width: '78%',
    borderRadius: 24,
    padding: 18,
    backgroundColor: 'rgba(255, 250, 242, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 250, 242, 0.18)',
    gap: 8,
  },
  cameraCenterTitle: {
    color: '#fffaf2',
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
  },
  cameraCenterText: {
    color: '#dbe6e0',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  previewImageWrap: {
    position: 'absolute',
    top: 26,
    right: 24,
    bottom: 26,
    left: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 250, 242, 0.18)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.canvas,
    padding: 12,
    gap: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  quickStatValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonItem: {
    flex: 1,
  },
  closeDocumentButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeDocumentButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  pageStrip: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 4,
  },
  pageCard: {
    width: 138,
    borderRadius: 22,
    backgroundColor: colors.canvas,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pageCardActive: {
    borderColor: colors.primary,
    backgroundColor: isDark ? '#23302a' : '#f6efe3',
  },
  pageCardAdd: {
    width: 138,
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: 12,
  },
  pageAddText: {
    color: colors.accent,
    fontWeight: '700',
  },
  pagePreview: {
    height: 144,
    borderRadius: 16,
    backgroundColor: isDark ? '#1f2925' : '#ece2d4',
  },
  pageLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  pageState: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
});
