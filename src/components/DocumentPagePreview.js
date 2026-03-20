import { Image, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';

const FILTER_TITLES = {
  original: 'Oryginal',
  clean: 'Dokument',
  warm: 'Cieply',
  bw: 'Mono',
};

function getOverlayStyle(page) {
  if (!page) {
    return null;
  }

  const brightnessOffset = page.edits?.brightness ?? 0;
  const contrastOffset = page.edits?.contrast ?? 0;
  const filter = page.edits?.filter ?? 'original';

  let backgroundColor = 'transparent';
  let opacity = 0;

  if (brightnessOffset > 0) {
    backgroundColor = '#fffaf2';
    opacity += brightnessOffset * 0.06;
  }

  if (brightnessOffset < 0) {
    backgroundColor = '#101614';
    opacity += Math.abs(brightnessOffset) * 0.07;
  }

  if (filter === 'warm') {
    backgroundColor = '#c96d42';
    opacity += 0.14;
  }

  if (filter === 'bw') {
    backgroundColor = '#f4f1ea';
    opacity += 0.22;
  }

  if (filter === 'clean') {
    backgroundColor = '#ffffff';
    opacity += 0.1;
  }

  opacity += Math.abs(contrastOffset) * 0.04;

  return {
    backgroundColor,
    opacity: Math.min(opacity, 0.46),
  };
}

export function getPageSummary(page) {
  if (!page) {
    return 'Brak strony';
  }

  const filter = FILTER_TITLES[page.edits?.filter ?? 'original'];
  const rotation = page.edits?.rotation ?? 0;
  const brightness = page.edits?.brightness ?? 0;
  const contrast = page.edits?.contrast ?? 0;
  const brightnessLabel = brightness > 0 ? `+${brightness}` : brightness;
  const contrastLabel = contrast > 0 ? `+${contrast}` : contrast;

  return `${filter}  |  Rotacja ${rotation}°  |  Jasnosc ${brightnessLabel}  |  Kontrast ${contrastLabel}`;
}

export function DocumentPagePreview({
  page,
  style,
  imageStyle,
  showBadge = false,
  badgeStyle,
  badgeTextStyle,
}) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  if (!page) {
    return <View style={[styles.emptyState, style]} />;
  }

  const rotation = page.edits?.rotation ?? 0;
  const overlayStyle = getOverlayStyle(page);
  const filter = FILTER_TITLES[page.edits?.filter ?? 'original'];

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: page.uri }}
        resizeMode="cover"
        style={[
          styles.image,
          imageStyle,
          {
            transform: [{ rotate: `${rotation}deg` }, { scale: rotation % 180 === 0 ? 1 : 0.78 }],
          },
        ]}
      />
      <View pointerEvents="none" style={[styles.overlay, overlayStyle]} />
      {showBadge ? (
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeTextStyle]}>{filter}</Text>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors) =>
  StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(28, 36, 33, 0.74)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#fffaf2',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: colors.canvas,
  },
});
