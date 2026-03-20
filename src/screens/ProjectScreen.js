import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenShell } from '../components/ScreenShell';
import { SectionCard } from '../components/SectionCard';
import { useAppTheme } from '../context/ThemeContext';

const roadmapItems = [
  'Skanowanie z aparatu',
  'Import z galerii',
  'Automatyczna detekcja dokumentu',
  'Przycinanie i korekcja perspektywy',
  'Dokument wielostronicowy',
  'Eksport do PDF',
];

export function ProjectScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <ScreenShell title="Projekt" subtitle="Zakres i kolejne etapy rozwoju">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <SectionCard title="Plan produktu" subtitle="Widok projektu i roadmapy wdrozen">
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statLabel}>Glowne funkcje</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Kluczowe ekrany</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>Spojny flow</Text>
            </View>
          </View>

          <View style={styles.roadmapList}>
            {roadmapItems.map((item, index) => (
              <View key={item} style={styles.roadmapRow}>
                <View style={styles.roadmapIndex}>
                  <Text style={styles.roadmapIndexText}>{index + 1}</Text>
                </View>
                <Text style={styles.roadmapText}>{item}</Text>
              </View>
            ))}
          </View>
        </SectionCard>
      </ScrollView>
    </ScreenShell>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.canvas,
    borderRadius: 20,
    padding: 14,
    gap: 8,
  },
  statValue: {
    fontSize: 30,
    color: colors.primary,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
  roadmapList: {
    gap: 10,
  },
  roadmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    backgroundColor: colors.canvas,
    padding: 12,
  },
  roadmapIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadmapIndexText: {
    color: colors.primary,
    fontWeight: '800',
  },
  roadmapText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
});
