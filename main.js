const { app, BrowserWindow } = require('electron');


const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            // 官网似乎说是默认false，但是这里必须设置contextIsolation
            contextIsolation: false,
            enableRemoteModule: true
        }
    })
    win.loadFile('index.html')
}
app.allowRendererProcessReuse = false;
app.whenReady().then(() => {
    createWindow()       
})


app.on('window-all-closed', () => {
    // darwin represent macOS
    if (process.platform != 'darwin') {
        app.quit()
    }
})