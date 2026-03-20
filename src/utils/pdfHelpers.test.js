import {
  buildPdfHtml,
  escapeHtml,
  sanitizeFileName,
  toCssFilter,
} from './pdfHelpers';

describe('pdfHelpers', () => {
  test('escapeHtml escapes unsafe characters', () => {
    expect(escapeHtml(`A&B <tag> "x" 'y'`)).toBe(
      'A&amp;B &lt;tag&gt; &quot;x&quot; &#039;y&#039;'
    );
  });

  test('sanitizeFileName removes forbidden chars and normalizes spaces', () => {
    expect(sanitizeFileName(' umowa: klient/test ? 2026 ')).toBe(
      '_umowa-_klient-test_-_2026_'
    );
  });

  test('toCssFilter returns expected css for mono filter', () => {
    const css = toCssFilter({
      edits: {
        brightness: 1,
        contrast: 2,
        filter: 'bw',
      },
    });

    expect(css).toContain('brightness(112%)');
    expect(css).toContain('contrast(120%)');
    expect(css).toContain('grayscale(100%)');
  });

  test('buildPdfHtml renders escaped title and page metadata', () => {
    const html = buildPdfHtml('Faktura <A&B>', [
      {
        label: 'Strona 1',
        state: 'Gotowa',
        uri: 'file:///doc-1.jpg',
        edits: {
          rotation: 90,
          brightness: 0,
          contrast: 0,
          filter: 'original',
        },
      },
    ]);

    expect(html).toContain('Faktura &lt;A&amp;B&gt;.pdf');
    expect(html).toContain('Strona 1 / 1');
    expect(html).toContain('file:///doc-1.jpg');
    expect(html).toContain('rotate(90deg)');
  });
});
