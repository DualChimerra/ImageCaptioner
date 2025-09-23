/* global api */

const btnOpen = document.getElementById('btn-open');
const btnOutput = document.getElementById('btn-output');
const btnExport = document.getElementById('btn-export');
const langSelect = document.getElementById('lang');
const list = document.getElementById('list');
const outputPathEl = document.getElementById('output-path');
const statusEl = document.getElementById('status');
const startIndexInput = document.getElementById('start-index');
const filterCaption = document.getElementById('filter-caption');
const filterDone = document.getElementById('filter-done');
const sortMode = document.getElementById('sort-mode');
const exportVisibleOnly = document.getElementById('export-visible-only');
const countTotal = document.getElementById('count-total');
const countWithCaption = document.getElementById('count-with-caption');
const countDone = document.getElementById('count-done');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const exportModal = document.getElementById('export-modal');
const modalOpenFolderBtn = document.getElementById('modal-open-folder');
const modalCloseBtn = document.getElementById('modal-close');
const modalExportBody = document.getElementById('modal-export-body');
const modalExportTitle = document.getElementById('modal-export-title');
const bulkBar = document.getElementById('bulk-bar');
const bulkDeleteBtn = document.getElementById('bulk-delete');
const bulkMarkDoneBtn = document.getElementById('bulk-mark-done');
const bulkClearBtn = document.getElementById('bulk-clear');

const template = document.getElementById('item-template');

/** @type {{ sourcePath: string; caption: string; done: boolean; }[]} */
let items = [];
let outputDir = null;
let selectedPaths = new Set();
let isMouseSelecting = false;
let selectionStart = null;
let selectionRectEl = null;
let didDragSelect = false;

// Simple i18n
const i18n = {
  lang: 'en',
  dict: {
    ru: {
      buttons: { open: 'Загрузить изображения', output: 'Выбрать папку', export: 'Экспорт' },
      labels: {
        outputDir: 'Папка вывода',
        startIndex: 'Начальный номер',
        filtersTitle: 'Фильтры',
        filterCaption: 'Подпись',
        filterDone: 'Статус',
        sortMode: 'Сортировка',
        exportVisibleOnly: 'Экспорт только видимых',
        outputPlaceholder: 'Выберите папку, нажав кнопку ниже',
        countersTitle: 'Счётчики',
        counterTotal: 'Всего',
        counterWithCaption: 'С подписью',
        counterDone: 'Готово',
        statusTitle: 'Статус',
        doneLabel: 'Готово',
        doneOn: 'Готово (нажмите, чтобы поменять статус)',
        doneOff: 'Не готово (нажмите, чтобы поменять статус)',
      },
      options: {
        caption: { all: 'Все', with: 'С подписью', without: 'Без подписи' },
        done: { all: 'Все', done: 'Готово', not: 'Не готово' },
        sort: { none: 'Без сортировки', withoutFirst: 'Без подписи сначала', withFirst: 'С подписью сначала' },
      },
      placeholder: { caption: 'Введите подпись (prompt) для этого изображения...' },
      status: {
        ready: 'Готово',
        loaded: (p) => `Загружено: ${p.count}`,
        chooseOutput: 'Выберите папку для сохранения',
        addImagesFirst: 'Сначала добавьте изображения',
        nothingToExport: 'Нет элементов для экспорта по текущему фильтру',
        exporting: 'Экспорт...',
        exported: (p) => `Готово. Экспортировано: ${p.count}`,
        exportError: 'Ошибка экспорта',
      },
      bulk: {
        delete: 'Удалить',
        markDone: 'Пометить как готовые',
      },
    },
    en: {
      buttons: { open: 'Load images', output: 'Choose folder', export: 'Export' },
      labels: {
        outputDir: 'Output folder',
        startIndex: 'Start index',
        filtersTitle: 'Filters',
        filterCaption: 'Caption',
        filterDone: 'Status',
        sortMode: 'Sort',
        exportVisibleOnly: 'Export visible only',
        outputPlaceholder: 'Choose a folder using the button below',
        countersTitle: 'Counts',
        counterTotal: 'Total',
        counterWithCaption: 'With caption',
        counterDone: 'Done',
        statusTitle: 'Status',
        doneLabel: 'Done',
        doneOn: 'Done (click to toggle)',
        doneOff: 'Not done (click to toggle)',
      },
      options: {
        caption: { all: 'All', with: 'With caption', without: 'Without caption' },
        done: { all: 'All', done: 'Done', not: 'Not done' },
        sort: { none: 'No sort', withoutFirst: 'No caption first', withFirst: 'With caption first' },
      },
      placeholder: { caption: 'Enter caption (prompt) for this image...' },
      status: {
        ready: 'Ready',
        loaded: (p) => `Loaded: ${p.count}`,
        chooseOutput: 'Choose output folder',
        addImagesFirst: 'Add images first',
        nothingToExport: 'No items to export for current filter',
        exporting: 'Exporting...',
        exported: (p) => `Done. Exported: ${p.count}`,
        exportError: 'Export error',
      },
      bulk: {
        delete: 'Delete',
        markDone: 'Mark as done',
        clear: 'Clear selection',
      },
    },
  },
};

function t(path, params = {}) {
  const segs = path.split('.');
  let node = i18n.dict[i18n.lang];
  for (const s of segs) {
    if (node == null) break;
    node = node[s];
  }
  if (typeof node === 'function') return node(params);
  return node != null ? node : path;
}

function setTextById(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function applyI18n() {
  // Buttons
  btnOpen.textContent = t('buttons.open');
  btnOutput.textContent = t('buttons.output');
  btnExport.textContent = t('buttons.export');
  // Left labels
  setTextById('label-output-dir', t('labels.outputDir'));
  if (!outputDir) {
    outputPathEl.textContent = t('labels.outputPlaceholder');
  }
  setTextById('label-start-index', t('labels.startIndex'));
  setTextById('label-filters-title', t('labels.filtersTitle'));
  setTextById('label-filter-caption', t('labels.filterCaption'));
  setTextById('label-filter-done', t('labels.filterDone'));
  setTextById('label-sort-mode', t('labels.sortMode'));
  setTextById('label-export-visible-only', t('labels.exportVisibleOnly'));
  setTextById('label-counters-title', t('labels.countersTitle'));
  setTextById('label-counter-total', t('labels.counterTotal'));
  setTextById('label-counter-with-caption', t('labels.counterWithCaption'));
  setTextById('label-counter-done', t('labels.counterDone'));
  setTextById('label-status-title', t('labels.statusTitle'));
  // Select options
  setOptionText(filterCaption, 'all', t('options.caption.all'));
  setOptionText(filterCaption, 'with', t('options.caption.with'));
  setOptionText(filterCaption, 'without', t('options.caption.without'));
  setOptionText(filterDone, 'all', t('options.done.all'));
  setOptionText(filterDone, 'done', t('options.done.done'));
  setOptionText(filterDone, 'not', t('options.done.not'));
  setOptionText(sortMode, 'none', t('options.sort.none'));
  setOptionText(sortMode, 'withoutFirst', t('options.sort.withoutFirst'));
  setOptionText(sortMode, 'withFirst', t('options.sort.withFirst'));
  // List items: placeholder and done label
  list.querySelectorAll('textarea.caption').forEach((el) => {
    el.placeholder = t('placeholder.caption');
  });
  list.querySelectorAll('.done-label').forEach((el) => {
    const parent = el.closest('.item');
    const checkbox = parent?.querySelector('input.done-checkbox');
    const isDone = checkbox?.checked;
    el.textContent = isDone ? t('labels.doneOn') : t('labels.doneOff');
  });
  // Status default
  if (statusEl) statusEl.textContent = t('status.ready');
  // Bulk texts
  const bd = document.getElementById('bulk-delete-text');
  const bm = document.getElementById('bulk-mark-done-text');
  const bc = document.getElementById('bulk-clear-text');
  if (bd) bd.textContent = i18n.dict[i18n.lang].bulk.delete;
  if (bm) bm.textContent = i18n.dict[i18n.lang].bulk.markDone;
  if (bc) bc.textContent = i18n.dict[i18n.lang].bulk.clear || (i18n.lang === 'ru' ? 'Отменить выделение' : 'Clear selection');
}

function setOptionText(selectEl, value, text) {
  const opt = Array.from(selectEl.options).find((o) => o.value === value);
  if (opt) opt.textContent = text;
}

function setLang(lang) {
  i18n.lang = lang;
  localStorage.setItem('lang', lang);
  if (langSelect) langSelect.value = lang;
  applyI18n();
  renderList();
  updateCounters();
}

function showModal(titleText, bodyText, showOpenFolder) {
  modalExportTitle.textContent = titleText;
  modalExportBody.textContent = bodyText;
  if (showOpenFolder) {
    modalOpenFolderBtn.classList.remove('hidden');
  } else {
    modalOpenFolderBtn.classList.add('hidden');
  }
  exportModal.classList.remove('hidden');
}

function showExportModal(count) {
  modalExportTitle.textContent = i18n.lang === 'ru' ? 'Экспорт завершен' : 'Export completed';
  modalExportBody.textContent = (i18n.lang === 'ru' ? 'Экспортировано: ' : 'Exported: ') + count;
  // buttons
  const openText = i18n.lang === 'ru' ? 'Открыть папку' : 'Open folder';
  const closeText = i18n.lang === 'ru' ? 'Закрыть' : 'Close';
  const openBtn = document.getElementById('modal-open-folder');
  const closeBtn = document.getElementById('modal-close');
  if (openBtn) openBtn.textContent = openText;
  if (closeBtn) closeBtn.textContent = closeText;
  exportModal.classList.remove('hidden');
}

function closeExportModal() {
  exportModal.classList.add('hidden');
}

function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

function createItemElement(filePath) {
  const node = template.content.cloneNode(true);
  const root = node.querySelector('.item');
  const img = node.querySelector('img.thumb');
  const filenameEl = node.querySelector('.filename');
  const textarea = node.querySelector('textarea.caption');
  const doneCheckbox = node.querySelector('input.done-checkbox');
  const doneLabelEl = node.querySelector('.done-label');

  const url = `file://${filePath}`;
  img.src = url;
  filenameEl.textContent = filePath.split('/').pop();
  textarea.placeholder = t('placeholder.caption');
  if (doneLabelEl) doneLabelEl.textContent = t('labels.doneOff');

  textarea.addEventListener('input', (e) => {
    const idx = items.findIndex((it) => it.sourcePath === filePath);
    if (idx >= 0) items[idx].caption = e.target.value;
    updateCounters();
  });

  doneCheckbox.addEventListener('change', (e) => {
    const idx = items.findIndex((it) => it.sourcePath === filePath);
    if (idx >= 0) items[idx].done = !!e.target.checked;
    if (doneLabelEl) doneLabelEl.textContent = e.target.checked ? t('labels.doneOn') : t('labels.doneOff');
    updateCounters();
  });

  img.addEventListener('click', () => {
    lightboxImg.src = url;
    lightbox.classList.remove('hidden');
  });

  const deleteBtn = node.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      items = items.filter((x) => x.sourcePath !== filePath);
      selectedPaths.delete(filePath);
      renderList();
      updateCounters();
      updateBulkBar();
    });
  }

  // Toggle select with Cmd/Ctrl click on the item header area
  root.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey) {
      toggleSelection(filePath, root);
    }
  });

  return node;
}

function closeLightbox() {
  lightbox.classList.add('hidden');
  lightboxImg.src = '';
}

async function handleOpenImages() {
  const files = await window.api.openImages();
  if (!files || files.length === 0) return;

  // Append new items
  files.forEach((file) => {
    items.push({ sourcePath: file, caption: '', done: false });
  });
  renderList();
  updateCounters();
  setStatus(t('status.loaded', { count: items.length }));
}

async function handleOpenDirectory() {
  const dir = await window.api.openDirectory();
  if (!dir) return;
  outputDir = dir;
  outputPathEl.textContent = dir;
}

async function handleExport() {
  if (!outputDir) {
    setStatus(t('status.chooseOutput'));
    showModal(
      i18n.lang === 'ru' ? 'Нужна папка вывода' : 'Output folder required',
      t('status.chooseOutput'),
      false
    );
    return;
  }
  if (items.length === 0) {
    setStatus(t('status.addImagesFirst'));
    showModal(
      i18n.lang === 'ru' ? 'Нет изображений' : 'No images',
      t('status.addImagesFirst'),
      false
    );
    return;
  }
  const startIndex = Math.max(parseInt(startIndexInput.value, 10) || 1, 1);
  const visible = getVisibleItems();
  const toExport = exportVisibleOnly?.checked ? visible : items;
  if (toExport.length === 0) {
    setStatus(t('status.nothingToExport'));
    showModal(
      i18n.lang === 'ru' ? 'Нечего экспортировать' : 'Nothing to export',
      t('status.nothingToExport'),
      false
    );
    return;
  }
  setStatus(t('status.exporting'));
  btnExport.disabled = true;
  try {
    const res = await window.api.exportRun(toExport, outputDir, startIndex);
    if (res?.success) {
      setStatus(t('status.exported', { count: res.written }));
      showExportModal(res.written);
    } else {
      setStatus(res?.error || t('status.exportError'));
    }
  } finally {
    btnExport.disabled = false;
  }
}

btnOpen.addEventListener('click', handleOpenImages);
btnOutput.addEventListener('click', handleOpenDirectory);
btnExport.addEventListener('click', handleExport);
document.getElementById('gh-link')?.addEventListener('click', (e) => {
  e.preventDefault();
  window.api.openExternal('https://github.com/DualChimerra');
});

lightbox.addEventListener('click', (e) => {
  // Close only if clicking outside the image
  if (!lightboxImg.contains(e.target)) {
    closeLightbox();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
    closeLightbox();
  }
  if (e.key === 'Escape' && !exportModal.classList.contains('hidden')) {
    closeExportModal();
  }
});

function updateCounters() {
  const total = items.length;
  const withCaption = items.filter((it) => (it.caption || '').trim().length > 0).length;
  const done = items.filter((it) => it.done).length;
  countTotal.textContent = String(total);
  countWithCaption.textContent = String(withCaption);
  countDone.textContent = String(done);
}

function getVisibleItems() {
  let filtered = [...items];
  // filter by caption
  const cap = filterCaption?.value || 'all';
  if (cap === 'with') filtered = filtered.filter((it) => (it.caption || '').trim().length > 0);
  if (cap === 'without') filtered = filtered.filter((it) => (it.caption || '').trim().length === 0);
  // filter by done
  const done = filterDone?.value || 'all';
  if (done === 'done') filtered = filtered.filter((it) => it.done);
  if (done === 'not') filtered = filtered.filter((it) => !it.done);
  // sort
  const sort = sortMode?.value || 'none';
  if (sort === 'withoutFirst') {
    filtered.sort((a, b) => {
      const ac = (a.caption || '').trim().length > 0 ? 1 : 0;
      const bc = (b.caption || '').trim().length > 0 ? 1 : 0;
      return ac - bc;
    });
  } else if (sort === 'withFirst') {
    filtered.sort((a, b) => {
      const ac = (a.caption || '').trim().length > 0 ? 1 : 0;
      const bc = (b.caption || '').trim().length > 0 ? 1 : 0;
      return bc - ac;
    });
  }
  return filtered;
}

function renderList() {
  list.innerHTML = '';
  const visible = getVisibleItems();
  visible.forEach((it) => {
    const element = createItemElement(it.sourcePath);
    const root = element.querySelector('.item');
    const textarea = element.querySelector('textarea.caption');
    const doneCheckbox = element.querySelector('input.done-checkbox');
    const doneLabelEl = element.querySelector('.done-label');
    textarea.value = it.caption || '';
    doneCheckbox.checked = !!it.done;
    if (doneLabelEl) doneLabelEl.textContent = it.done ? t('labels.doneOn') : t('labels.doneOff');
    if (selectedPaths.has(it.sourcePath)) root.classList.add('selected');
    list.appendChild(element);
  });
}

filterCaption?.addEventListener('change', () => { renderList(); updateCounters(); });
filterDone?.addEventListener('change', () => { renderList(); updateCounters(); });
sortMode?.addEventListener('change', () => { renderList(); updateCounters(); });

// language init: default EN on startup (ignore saved)
if (langSelect) {
  langSelect.value = i18n.lang;
  langSelect.addEventListener('change', (e) => {
    setLang(e.target.value);
  });
}
applyI18n();

// export modal events
modalCloseBtn.addEventListener('click', () => closeExportModal());
modalOpenFolderBtn.addEventListener('click', () => {
  if (outputDir) {
    // Open folder via shell API from preload (need handler)
    window.api.openDirectoryPath?.(outputDir);
  }
});
exportModal.addEventListener('click', (e) => {
  if (e.target === exportModal || e.target.classList.contains('modal-backdrop')) closeExportModal();
});

// Drag selection rectangle
list.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  isMouseSelecting = true;
  selectionStart = { x: e.pageX, y: e.pageY };
  selectionRectEl = document.createElement('div');
  selectionRectEl.className = 'selection-rect';
  document.body.appendChild(selectionRectEl);
  Object.assign(selectionRectEl.style, { left: `${selectionStart.x}px`, top: `${selectionStart.y}px` });
  didDragSelect = false;
});
document.addEventListener('mousemove', (e) => {
  if (!isMouseSelecting || !selectionRectEl) return;
  const x1 = Math.min(selectionStart.x, e.pageX);
  const y1 = Math.min(selectionStart.y, e.pageY);
  const x2 = Math.max(selectionStart.x, e.pageX);
  const y2 = Math.max(selectionStart.y, e.pageY);
  Object.assign(selectionRectEl.style, { left: `${x1}px`, top: `${y1}px`, width: `${x2 - x1}px`, height: `${y2 - y1}px` });
  if (!didDragSelect && (Math.abs(e.pageX - selectionStart.x) > 3 || Math.abs(e.pageY - selectionStart.y) > 3)) {
    didDragSelect = true;
  }
  Array.from(list.children).forEach((child) => {
    const rect = child.getBoundingClientRect();
    const cx1 = rect.left + window.scrollX; const cy1 = rect.top + window.scrollY;
    const cx2 = rect.right + window.scrollX; const cy2 = rect.bottom + window.scrollY;
    const intersects = !(x2 < cx1 || x1 > cx2 || y2 < cy1 || y1 > cy2);
    const filename = child.querySelector('.filename')?.textContent;
    const it = items.find((x) => x.sourcePath.endsWith(filename));
    if (!it) return;
    if (intersects) {
      selectedPaths.add(it.sourcePath);
      child.classList.add('selected');
    } else {
      selectedPaths.delete(it.sourcePath);
      child.classList.remove('selected');
    }
  });
  updateBulkBar();
});
document.addEventListener('mouseup', () => {
  if (!isMouseSelecting) return;
  isMouseSelecting = false;
  if (selectionRectEl) selectionRectEl.remove();
  selectionRectEl = null;
  // keep selection; prevent the subsequent click from clearing it
  setTimeout(() => { didDragSelect = false; }, 0);
});

function toggleSelection(path, rootEl) {
  if (selectedPaths.has(path)) {
    selectedPaths.delete(path);
    rootEl.classList.remove('selected');
  } else {
    selectedPaths.add(path);
    rootEl.classList.add('selected');
  }
  updateBulkBar();
}

function updateBulkBar() {
  if (!bulkBar) return;
  if (selectedPaths.size > 0) bulkBar.classList.remove('hidden');
  else bulkBar.classList.add('hidden');
}

bulkDeleteBtn?.addEventListener('click', () => {
  if (selectedPaths.size === 0) return;
  items = items.filter((it) => !selectedPaths.has(it.sourcePath));
  selectedPaths.clear();
  renderList();
  updateCounters();
  updateBulkBar();
});
bulkMarkDoneBtn?.addEventListener('click', () => {
  if (selectedPaths.size === 0) return;
  items = items.map((it) => selectedPaths.has(it.sourcePath) ? { ...it, done: true } : it);
  renderList();
  updateCounters();
  updateBulkBar();
});

bulkClearBtn?.addEventListener('click', () => {
  selectedPaths.clear();
  renderList();
  updateBulkBar();
});

// Clear selection by clicking on empty area in list
list.addEventListener('click', (e) => {
  if (didDragSelect) return;
  if (e.target === list) {
    selectedPaths.clear();
    renderList();
    updateBulkBar();
  }
});

// ESC clears selection as well
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && selectedPaths.size > 0) {
    selectedPaths.clear();
    renderList();
    updateBulkBar();
  }
});


