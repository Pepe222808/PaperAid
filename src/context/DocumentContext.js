import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DocumentContext = createContext(null);

const HISTORY_STORAGE_KEY = '@paperaid/document-history/v1';

function buildPageLabel(index) {
  return `Strona ${index + 1}`;
}

function createPage(asset, index) {
  return {
    id: `${Date.now()}-${index}`,
    label: buildPageLabel(index),
    uri: asset.uri,
    width: asset.width ?? null,
    height: asset.height ?? null,
    fileName: asset.fileName ?? `scan-${index + 1}.jpg`,
    state: asset.state ?? 'Zaimportowano z galerii',
    edits: {
      rotation: 0,
      filter: 'original',
      brightness: 0,
      contrast: 0,
    },
  };
}

function relabelPages(pages) {
  return pages.map((page, index) => ({
    ...page,
    label: buildPageLabel(index),
  }));
}

function buildHistoryRecord({ id, name, pages, createdAt, updatedAt, pdfUri = null }) {
  return {
    id,
    name,
    pages,
    pagesCount: pages.length,
    previewUri: pages[0]?.uri ?? null,
    createdAt,
    updatedAt,
    pdfUri,
    status: pdfUri ? 'PDF zapisany' : pages.length > 0 ? 'Gotowy do edycji' : 'Pusty dokument',
  };
}

export function DocumentProvider({ children }) {
  const [documentName, setDocumentName] = useState('Dokument bez nazwy');
  const [pages, setPages] = useState([]);
  const [activePageId, setActivePageId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const rawHistory = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        if (rawHistory) {
          const parsedHistory = JSON.parse(rawHistory);
          if (Array.isArray(parsedHistory)) {
            setHistory(parsedHistory);
          }
        }
      } catch (_error) {
      } finally {
        setIsHistoryLoaded(true);
      }
    };

    loadHistory();
  }, []);

  useEffect(() => {
    if (!isHistoryLoaded) {
      return;
    }

    AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history)).catch(() => {});
  }, [history, isHistoryLoaded]);

  const addPagesFromAssets = (assets) => {
    if (!assets?.length) {
      return;
    }

    setPages((currentPages) => {
      const nextPages = assets.map((asset, index) => createPage(asset, currentPages.length + index));
      const updatedPages = [...currentPages, ...nextPages];

      if (currentPages.length === 0) {
        const firstFileName = nextPages[0]?.fileName?.replace(/\.[^/.]+$/, '') || 'Dokument bez nazwy';
        setDocumentName(firstFileName);
        setActivePageId(nextPages[0]?.id ?? null);
      } else if (!activePageId && nextPages[0]?.id) {
        setActivePageId(nextPages[0].id);
      }

      return relabelPages(updatedPages);
    });
  };

  const removePage = (pageId) => {
    setPages((currentPages) => {
      const currentIndex = currentPages.findIndex((page) => page.id === pageId);
      const nextPages = relabelPages(currentPages.filter((page) => page.id !== pageId));

      if (nextPages.length === 0) {
        setActivePageId(null);
        return [];
      }

      if (activePageId === pageId) {
        const fallbackIndex = Math.min(currentIndex, nextPages.length - 1);
        setActivePageId(nextPages[fallbackIndex]?.id ?? nextPages[0].id);
      }

      return nextPages;
    });
  };

  const updatePage = (pageId, updater) => {
    setPages((currentPages) => currentPages.map((page) => (page.id === pageId ? updater(page) : page)));
  };

  const updatePageEdits = (pageId, partialEdits) => {
    updatePage(pageId, (page) => ({
      ...page,
      state: 'Zmieniono w edytorze',
      edits: {
        ...page.edits,
        ...partialEdits,
      },
    }));
  };

  const rotatePage = (pageId) => {
    updatePage(pageId, (page) => ({
      ...page,
      state: 'Obrocono strone',
      edits: {
        ...page.edits,
        rotation: ((page.edits?.rotation ?? 0) + 90) % 360,
      },
    }));
  };

  const reorderPage = (pageId, direction) => {
    setPages((currentPages) => {
      const currentIndex = currentPages.findIndex((page) => page.id === pageId);

      if (currentIndex === -1) {
        return currentPages;
      }

      const targetIndex =
        direction === 'up'
          ? Math.max(currentIndex - 1, 0)
          : Math.min(currentIndex + 1, currentPages.length - 1);

      if (targetIndex === currentIndex) {
        return currentPages;
      }

      const nextPages = [...currentPages];
      const [movedPage] = nextPages.splice(currentIndex, 1);
      nextPages.splice(targetIndex, 0, movedPage);

      return relabelPages(nextPages).map((page) =>
        page.id === movedPage.id ? { ...page, state: 'Zmieniono kolejnosc' } : page
      );
    });
  };

  const archiveCurrentDocument = (options = {}) => {
    if (!pages.length) {
      return null;
    }

    const now = new Date().toISOString();
    const existingIndex = history.findIndex((record) => record.name === documentName);
    const recordId = existingIndex >= 0 ? history[existingIndex].id : `doc-${Date.now()}`;
    const createdAt = existingIndex >= 0 ? history[existingIndex].createdAt : now;

    const historyRecord = buildHistoryRecord({
      id: recordId,
      name: documentName,
      pages,
      createdAt,
      updatedAt: now,
      pdfUri: options.pdfUri ?? (existingIndex >= 0 ? history[existingIndex].pdfUri ?? null : null),
    });

    setHistory((currentHistory) => {
      const index = currentHistory.findIndex((record) => record.id === recordId);
      if (index >= 0) {
        const nextHistory = [...currentHistory];
        nextHistory[index] = historyRecord;
        return nextHistory.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      }
      return [historyRecord, ...currentHistory];
    });

    return historyRecord;
  };

  const openHistoryDocument = (recordId) => {
    const selectedRecord = history.find((record) => record.id === recordId);
    if (!selectedRecord) {
      return false;
    }

    const clonedPages = selectedRecord.pages.map((page, index) => ({
      ...page,
      id: `${Date.now()}-${index}`,
      label: buildPageLabel(index),
    }));

    setDocumentName(selectedRecord.name);
    setPages(clonedPages);
    setActivePageId(clonedPages[0]?.id ?? null);

    return true;
  };

  const deleteHistoryDocument = (recordId) => {
    setHistory((currentHistory) => currentHistory.filter((record) => record.id !== recordId));
  };

  const updateHistoryPdfUri = (recordId, pdfUri) => {
    setHistory((currentHistory) =>
      currentHistory.map((record) => {
        if (record.id !== recordId) {
          return record;
        }

        return {
          ...record,
          pdfUri,
          status: 'PDF zapisany',
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const resetDocument = () => {
    setDocumentName('Dokument bez nazwy');
    setPages([]);
    setActivePageId(null);
  };

  const activePage = pages.find((page) => page.id === activePageId) ?? pages[0] ?? null;

  const value = useMemo(
    () => ({
      documentName,
      setDocumentName,
      pages,
      activePage,
      activePageId: activePage?.id ?? null,
      setActivePageId,
      addPagesFromAssets,
      removePage,
      updatePageEdits,
      rotatePage,
      reorderPage,
      archiveCurrentDocument,
      openHistoryDocument,
      deleteHistoryDocument,
      updateHistoryPdfUri,
      clearHistory,
      history,
      isHistoryLoaded,
      resetDocument,
      hasPages: pages.length > 0,
    }),
    [activePage, documentName, history, isHistoryLoaded, pages]
  );

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
}

export function useDocument() {
  const context = useContext(DocumentContext);

  if (!context) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }

  return context;
}
