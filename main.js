const { app, BrowserWindow, ipcMain } = require('electron');
const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

function GetRobloxProcessId() {
  const processName = "RobloxPlayerBeta.exe";
  try {
      const output = execSync(`tasklist | findstr ${processName}`, { encoding: 'utf8' });
      const lines = output.split('\n');
      if (lines.length > 0) {
          const processDetails = lines[0].trim().split(/\s+/);
          return parseInt(processDetails[1]);
      }
  } catch (error) {

  }
  return null;
}

function GenerateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function ScheduleScript(mainPath, script, pid = 0) {
  if (!fs.existsSync(mainPath)) {
      return 1;
  }

  const schedulerPath = path.join(mainPath, "Scheduler");

  if (!fs.existsSync(schedulerPath)) {
      return 3;
  }

  const randomFileName = GenerateRandomString(10) + ".lua";
  const filePath = path.join(schedulerPath, `${randomFileName}_${pid}`);

  try {
      fs.writeFileSync(filePath, script + "\n@@DONE");
  } catch (error) {
      return 4;
  }

  return 0;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      devTools: false,
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');

  ipcMain.handle('inject', async () => {
    const exeDir = path.dirname(process.execPath);
    const injPath = path.join(exeDir, 'Injector.exe');
  
    return new Promise((resolve, reject) => {
      const process = spawn('cmd.exe', ['/c', `start cmd.exe /k "${injPath}"`], { shell: true });
  
      process.on('error', (error) => {
        console.error(`Error starting process: ${error.message}`);
        reject(error);
      });
  
      process.on('close', (code) => {
        console.log(`Process exited with code ${code}`);
        resolve(`Process exited with code ${code}`);
      });
    });
  });

  ipcMain.handle('execute-script', async (event, message) => {
    try {
      ScheduleScript( process.cwd(), message, GetRobloxProcessId( ) )
      return "Script has been scheduled";
    } catch (error) {
      console.error(`Failed to Schedule Script: ${error}`);
      throw error;
    }
  });


  ipcMain.handle('kill-roblox', async () => {
    const platform = process.platform;

    try {
        exec('tasklist', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error occured checking task list: ${error.message}`);
                throw error;
            }

            if (!stdout.includes('RobloxPlayerBeta.exe')) {
                console.log('Roblox not running');
                return 'Roblox process is not running';
            }

            exec('taskkill /F /IM RobloxPlayerBeta.exe', (killError, killStdout, killStderr) => {
                if (killError) {
                    console.error(`Failed to kill roblox -> ${killError.message}`);
                    throw killError;
                }
                console.log(`stdout: ${killStdout}`);
                console.error(`stderr: ${killStderr}`);
            });

            return 'Roblox process terminated successfully';
        });
    } catch (error) {
        console.error(error.message);
        throw error;
    }
});

  ipcMain.handle('toggle-always-on-top', async () => {
    const isAlwaysOnTop = win.isAlwaysOnTop();
    win.setAlwaysOnTop(!isAlwaysOnTop);
    return !isAlwaysOnTop;
  });

  ipcMain.handle('get-always-on-top', async () => {
    return win.isAlwaysOnTop();
  });

  ipcMain.handle('window-controls', async (event, action) => {
    switch (action) {
      case 'minimize':
        win.minimize();
        return 'minimized';
      
      case 'maximize':
        if (win.isMaximized()) {
          win.unmaximize();
          return 'unmaximized';
        } else {
          win.maximize();
          return 'maximized';
        }
      
      case 'close':
        win.close();
        return 'closed';
      
      case 'get-state':
        return {
          isMaximized: win.isMaximized(),
          isMinimized: win.isMinimized(),
          isNormal: !win.isMaximized() && !win.isMinimized()
        };
    }
  });

  win.on('maximize', () => {
    win.webContents.send('window-state-change', 'maximized');
  });

  win.on('unmaximize', () => {
    win.webContents.send('window-state-change', 'unmaximized');
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();

    // delete here sysgyat v2 so no one can steal REAL!
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});