const { app, BrowserWindow, Menu, shell } = require('electron');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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
  createWindow();
});

const createWindow = async () => {
  const win = new BrowserWindow({
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'),
  });

  const url = 'https://t3.chat';

    // Fetch and process main page only
    const response = await fetch(url);
    const html = await response.text();

    // Create a DOM to manipulate the HTML
    const dom = new JSDOM(html);
    const document = dom.window.document;

    var icon = document.querySelector('link[rel*="icon"]');
    console.log(icon);
    if (icon) {
      var iHref = icon.href;
      console.log(iHref);

      // Check if the href contains "favicon" and ends with ".png" (case-insensitive)
      if (
        iHref.toLowerCase().includes('favicon') &&
        iHref.toLowerCase().endsWith('.png')
      ) {
        try {
          // Download the favicon
          const imageResponse = await fetch(iHref);
          const imageBuffer = await imageResponse.arrayBuffer();
          fs.writeFileSync(
            path.join(__dirname, 'icon.png'),
            Buffer.from(imageBuffer)
          );
          console.log('Favicon downloaded and saved as icon.png');
          win.setIcon(path.join(__dirname, 'icon.png')); //Set icon
        } catch (imageError) {
          console.error('Error downloading or saving favicon:', imageError);
        }
      }
    }

    // Add base tag to head
    const base = document.createElement('base');
    base.href = url;
    document.head.insertBefore(base, document.head.firstChild);

  switch (process.env.NODE_ENV) {
    case 'development':
      // Save the modified HTML
      fs.writeFileSync(
        path.join(__dirname, 'chat.html'),
        dom.serialize()
      );

      win.loadFile(path.join(__dirname, 'chat.html'));
      break;
    default:
      win.loadURL(url);
  }
};
