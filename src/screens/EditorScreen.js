import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { DocumentPagePreview, getPageSummary } from '../components/DocumentPagePreview';
import { Pill } from '../components/Pill';
import { PrimaryButton } from '../components/PrimaryButton';
import { SectionCard } from '../components/SectionCard';
import { ScreenShell } from '../components/ScreenShell';
import { useDocument } from '../context/DocumentContext';
import { useAppTheme } from '../context/ThemeContext';

const FILTERS = [
  { key: 'original', label: 'Oryginal' },
  { key: 'clean', label: 'Dokument' },
  { key: 'warm', label: 'Cieply' },
  { key: 'bw', label: 'Mono' },
];

function clampValue(value) {
  return Math.max(-5, Math.min(5, value));
}

function AdjustmentControl({ styles, label, value, onDecrease, onIncrease }) {
  return (
    <View style={styles.adjustmentRow}>
      <Text style={styles.adjustmentLabel}>{label}</Text>
      <View style={styles.adjustmentControls}>
        <Pressable onPress={onDecrease} style={styles.adjustmentButton}>
          <Text style={styles.adjustmentButtonText}>-</Text>
        </Pressable>
        <Text style={styles.adjustmentValue}>{value > 0 ? `+${value}` : value}</Text>
        <Pressable onPress={onIncrease} style={styles.adjustmentButton}>
          <Text style={styles.adjustmentButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function EditorScreen({ navigation }) {
  const { colors, isDark } = useAppTheme();
  const styles = createStyles(colors, isDark);
  const {
    documentName,
    setDocumentName,
    pages,
    activePage,
    activePageId,
    setActivePageId,
    removePage,
    updatePageEdits,
    rotatePage,
    reorderPage,
    history,
    openHistoryDocument,
    hasPages,
  } = useDocument();

  const handleRemovePage = (pageId) => {
    Alert.alert('Usunac strone?', 'Ta strona zniknie z roboczego dokumentu.', [
      { text: 'Anuluj', style: 'cancel' },
      { text: 'Usun', style: 'destructive', onPress: () => removePage(pageId) },
    ]);
  };

  const updateActivePageValue = (field, diff) => {
    if (!activePage) {
      return;
    }

    const currentValue = activePage.edits?.[field] ?? 0;
    updatePageEdits(activePage.id, { [field]: clampValue(currentValue + diff) });
  };

  const setActiveFilter = (filter) => {
    if (!activePage) {
      return;
    }

    updatePageEdits(activePage.id, { filter });
  };

  const handleLoadDocument = (recordId) => {
    openHistoryDocument(recordId);
  };

  return (
    <ScreenShell title="Edytor" subtitle="Przycinanie, nazwa i kolejnosc stron">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionCard title="Edytor dokumentu" subtitle="Nazewnictwo, strony i podstawowa obrobka">
          <Text style={styles.inputLabel}>Nazwa dokumentu</Text>
          <TextInput
            value={documentName}
            onChangeText={setDocumentName}
            placeholder="Wpisz nazwe dokumentu"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          <View style={styles.editorPreview}>
            <View style={styles.editorSheet}>
              {hasPages ? (
                <DocumentPagePreview
                  page={activePage}
                  style={styles.editorImageWrap}
                  imageStyle={styles.editorImage}
                  showBadge
                />
              ) : null}
              <View style={styles.previewTextCard}>
                <Text style={styles.editorSheetTitle}>{hasPages ? activePage.label : 'Podglad strony'}</Text>
                <Text style={styles.editorSheetText}>
                  {hasPages
                    ? getPageSummary(activePage)
                    : 'W tym miejscu bedzie wynik przycinania, prostowania i filtrowania.'}
                </Text>
              </View>
            </View>

            <View style={styles.editorTools}>
              <Text style={styles.editorToolsTitle}>Narzedzia edytora</Text>

              <View style={styles.filterRow}>
                {FILTERS.map((filter) => (
                  <Pressable
                    key={filter.key}
                    onPress={() => setActiveFilter(filter.key)}
                    style={[
                      styles.filterChip,
                      activePage?.edits?.filter === filter.key ? styles.filterChipActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        activePage?.edits?.filter === filter.key ? styles.filterChipTextActive : null,
                      ]}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <AdjustmentControl
                styles={styles}
                label="Jasnosc"
                value={activePage?.edits?.brightness ?? 0}
                onDecrease={() => updateActivePageValue('brightness', -1)}
                onIncrease={() => updateActivePageValue('brightness', 1)}
              />
              <AdjustmentControl
                styles={styles}
                label="Kontrast"
                value={activePage?.edits?.contrast ?? 0}
                onDecrease={() => updateActivePageValue('contrast', -1)}
                onIncrease={() => updateActivePageValue('contrast', 1)}
              />

              <View style={styles.editorActionRow}>
                <PrimaryButton
                  label="Obroc 90°"
                  compact
                  variant="secondary"
                  onPress={() => activePage && rotatePage(activePage.id)}
                />
                <PrimaryButton
                  label="W gore"
                  compact
                  variant="secondary"
                  onPress={() => activePage && reorderPage(activePage.id, 'up')}
                />
                <PrimaryButton
                  label="W dol"
                  compact
                  variant="secondary"
                  onPress={() => activePage && reorderPage(activePage.id, 'down')}
                />
              </View>
            </View>
          </View>

          <View style={styles.buttonRow}>
            <View style={styles.buttonItem}>
              <PrimaryButton label="Wroc do skanera" variant="secondary" onPress={() => navigation.goBack()} />
            </View>
            <View style={styles.buttonItem}>
              <PrimaryButton label="Przejdz do eksportu" onPress={() => navigation.navigate('Export')} />
            </View>
          </View>
        </SectionCard>

        <SectionCard
          title="Miniatury stron"
          subtitle={hasPages ? 'Wybierz, usun albo przestaw strone w dokumencie' : 'Przyszly panel zarzadzania dokumentem'}
        >
          {(hasPages ? pages : []).map((page) => (
            <Pressable
              key={page.id}
              style={[styles.thumbnailRow, activePageId === page.id ? styles.thumbnailRowActive : null]}
              onPress={() => setActivePageId(page.id)}
            >
              <DocumentPagePreview page={page} style={styles.thumbnailBox} imageStyle={styles.thumbnailBox} showBadge />
              <View style={styles.thumbnailMeta}>
                <Text style={styles.thumbnailTitle}>{page.label}</Text>
                <Text style={styles.thumbnailSubtitle}>{getPageSummary(page)}</Text>
              </View>
              <View style={styles.thumbnailActions}>
                <Pill label={activePageId === page.id ? 'Aktywna' : 'Wybierz'} tone="accent" />
                <PrimaryButton label="Usun" compact variant="secondary" onPress={() => handleRemovePage(page.id)} />
              </View>
            </Pressable>
          ))}
          {!hasPages ? (
            <Text style={styles.emptyState}>
              Najpierw dodaj zdjecia w ekranie skanowania, a tutaj od razu pojawia sie miniatury stron.
            </Text>
          ) : null}
        </SectionCard>

        {!hasPages ? (
          <SectionCard
            title="Wybierz dokument"
            subtitle={history.length ? 'Zaladuj dokument z historii do edytora' : 'Brak dokumentow w historii'}
          >
            {!history.length ? (
              <Text style={styles.emptyState}>Przejdz do skanera i utworz pierwszy dokument.</Text>
            ) : null}
            {history.slice(0, 8).map((record) => (
              <View key={record.id} style={styles.historyRow}>
                <View style={styles.historyMeta}>
                  <Text style={styles.historyName}>{record.name}</Text>
                  <Text style={styles.historyInfo}>{record.pagesCount} stron</Text>
                </View>
                <PrimaryButton label="Wczytaj" compact variant="secondary" onPress={() => handleLoadDocument(record.id)} />
              </View>
            ))}
          </SectionCard>
        ) : null}
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
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  editorPreview: {
    gap: 14,
  },
  editorSheet: {
    minHeight: 320,
    borderRadius: 28,
    backgroundColor: isDark ? '#1f2925' : '#efe3d3',
    padding: 22,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  editorImageWrap: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
  },
  editorImage: {
    width: '100%',
    height: '100%',
  },
  editorSheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1c2421',
  },
  editorSheetText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2f3935',
    marginTop: 8,
  },
  previewTextCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 250, 242, 0.84)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  editorTools: {
    borderRadius: 22,
    backgroundColor: colors.canvas,
    padding: 16,
    gap: 12,
  },
  editorToolsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    backgroundColor: isDark ? '#27312d' : '#efe5d7',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#fffaf2',
  },
  adjustmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  adjustmentLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  adjustmentControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adjustmentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustmentButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  adjustmentValue: {
    minWidth: 18,
    textAlign: 'center',
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  editorActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonItem: {
    flex: 1,
  },
  thumbnailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    padding: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  thumbnailRowActive: {
    backgroundColor: isDark ? '#23302a' : '#f6efe3',
    borderColor: colors.primary,
  },
  thumbnailBox: {
    width: 64,
    height: 84,
    borderRadius: 14,
    backgroundColor: isDark ? '#1f2925' : '#eadfce',
  },
  thumbnailMeta: {
    flex: 1,
    gap: 4,
  },
  thumbnailActions: {
    gap: 8,
    alignItems: 'flex-end',
  },
  thumbnailTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  thumbnailSubtitle: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
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
