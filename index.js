const { app, BrowserWindow, Menu, shell } = require('electron')

const jsdom = require('jsdom')
const { JSDOM } = jsdom

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

const fs = require('fs')
const path = require('path')

require('dotenv').config()

const isMac = process.platform === 'darwin'

const template = [
  // // { role: 'appMenu' }
  // ...(isMac
  //   ? [{
  //       label: app.name,
  //       submenu: [
  //         { role: 'about' },
  //         { type: 'separator' },
  //         { role: 'services' },
  //         { type: 'separator' },
  //         { role: 'hide' },
  //         { role: 'hideOthers' },
  //         { role: 'unhide' },
  //         { type: 'separator' },
  //         { role: 'quit' }
  //       ]
  //     }]
  //   : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
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
        ? [
            // { role: 'pasteAndMatchStyle' },
            // { role: 'delete' },
            { role: 'selectAll' },
            // { type: 'separator' },
            // {
            //   label: 'Speech',
            //   submenu: [
            //     { role: 'startSpeaking' },
            //     { role: 'stopSpeaking' }
            //   ]
            // }
          ]
        : [
            // { role: 'delete' },
            // { type: 'separator' },
            { role: 'selectAll' }
          ])
    ]
  },
  // { role: 'viewMenu' }
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
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac
        ? [
            { type: 'separator' },
            { role: 'front' },
            { type: 'separator' },
            { role: 'window' }
          ]
        : [
            { role: 'close' }
          ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          await shell.openExternal('https://querybuddy.adarshrkumar.dev')
        }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

// Register protocol before app is ready
app.whenReady().then(() => {
  createWindow()
})

const createWindow = async () => {
  const win = new BrowserWindow({
    // width: 800,
    // height: 600
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png')
  })

  const url = 'https://assistant.adarshrkumar.dev/chat'

  switch (process.env.NODE_ENV) {
    case 'development':
      // Fetch and process main page only
      const response = await fetch(url)
      const html = await response.text()

      // Create a DOM to manipulate the HTML
      const dom = new JSDOM(html)
      const document = dom.window.document

      // Add base tag to head
      const base = document.createElement('base')
      base.href = url
      document.head.insertBefore(base, document.head.firstChild)

      // Save the modified HTML
      fs.writeFileSync(
        path.join(__dirname, 'chat.html'), 
        dom.serialize()
      )

      win.loadFile(path.join(__dirname, 'chat.html'))
      break
    default:
      win.loadURL(url)
  }
}