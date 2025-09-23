const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

let mainWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    title: 'Image Captioner',
    backgroundColor: '#0b0f16',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('dialog:openImages', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Выберите изображения',
    properties: ['openFile', 'multiSelections', 'dontAddToRecent'],
    filters: [
      {
        name: 'Изображения',
        extensions: ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff', 'tif', 'heic', 'heif'],
      },
    ],
  });
  if (result.canceled) return [];
  return result.filePaths || [];
});

ipcMain.handle('dialog:openDirectory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Выберите папку для сохранения',
    properties: ['openDirectory', 'createDirectory', 'dontAddToRecent'],
  });
  if (result.canceled) return null;
  const [dir] = result.filePaths || [];
  return dir || null;
});

/**
 * @typedef {Object} ExportItem
 * @property {string} sourcePath
 * @property {string} caption
 */

ipcMain.handle('export:run', async (_event, args) => {
  /** @type {ExportItem[]} */
  const items = Array.isArray(args?.items) ? args.items : [];
  const outputDir = args?.outputDir;
  const startIndex = Number.isInteger(args?.startIndex) ? args.startIndex : 1;

  if (!outputDir) {
    return { success: false, error: 'Не указана папка назначения.' };
  }
  if (items.length === 0) {
    return { success: false, error: 'Список изображений пуст.' };
  }
  try {
    await fsp.mkdir(outputDir, { recursive: true });
  } catch (e) {
    return { success: false, error: 'Не удалось создать папку назначения.' };
  }

  try {
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const indexNumber = startIndex + i;
      const ext = path.extname(item.sourcePath) || '';
      const normalizedExt = ext.toLowerCase();

      const targetImagePath = path.join(outputDir, `${indexNumber}${normalizedExt}`);
      const targetTxtPath = path.join(outputDir, `${indexNumber}.txt`);

      // Копируем изображение, перезаписывая при необходимости
      await fsp.copyFile(item.sourcePath, targetImagePath);

      // Записываем подпись
      const content = (item.caption || '').trim();
      await fsp.writeFile(targetTxtPath, content, { encoding: 'utf8' });
    }

    return { success: true, written: items.length };
  } catch (error) {
    return { success: false, error: error?.message || String(error) };
  }
});


