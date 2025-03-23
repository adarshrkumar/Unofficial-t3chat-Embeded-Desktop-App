var { updateElectronApp } = require('update-electron-app')
// updateElectronApp()

var useLocalFavicon = false;

const { app, BrowserWindow, Menu, shell } = require('electron');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const path = require('path');

const isMac = process.platform === 'darwin';

const template = [
  {
    label: 'File',
    submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac
        ? [{ role: 'selectAll' }]
        : [{ role: 'selectAll' }]),
    ],
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
        : [{ role: 'close' }]),
    ],
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          await shell.openExternal('https://t3.chat');
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

const createWindow = async () => {
  const win = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1920,
    height: 1080,
    show: false,
    icon: path.join(__dirname, 'icon.png'),
  });

  win.maximize()
  win.show()

  const url = 'https://t3.chat';

  // Fetch and process main page only
  const response = await fetch(url);
  const html = await response.text();

  // Create a DOM to manipulate the HTML
  const dom = new JSDOM(html);
  const document = dom.window.document;

  if (!useLocalFavicon) {
    var hasFavicon = false;

    var icon = document.querySelector('link[rel*="icon"]');
    if (icon) {
      var iHref = icon.href;

      try {
        // Download the favicon
        const imageResponse = await fetch(`${url}/${iHref}`);
        const imageBuffer = await imageResponse.arrayBuffer();
        fs.writeFileSync(
          path.join(__dirname, iHref),
          Buffer.from(imageBuffer)
        );
        win.setIcon(path.join(__dirname, iHref)); //Set icon
        hasFavicon = true;
      } catch (imageError) {
        console.error('Error downloading or saving favicon:', imageError);
      }
    }

    if (!hasFavicon) {
      try {
        // Download the favicon
        const imageResponse = await fetch(`${url}/favicon.ico`);
        const imageBuffer = await imageResponse.arrayBuffer();
        fs.writeFileSync(
          path.join(__dirname, 'favicon.ico'),
          Buffer.from(imageBuffer)
        );
        win.setIcon(path.join(__dirname, 'favicon.ico')); //Set icon
        hasFavicon = true;
      } catch (imageError) {
        console.error('Error downloading or saving favicon:', imageError);
      }
    }
  }

  // Add base tag to head
  const base = document.createElement('base');
  base.href = url;
  document.head.insertBefore(base, document.head.firstChild);

  win.loadURL(url);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
  
};
