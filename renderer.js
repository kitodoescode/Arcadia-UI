// Window control functions
const minimizeWindow = async () => {
  if (window.electron?.windowControls) {
      await window.electron.windowControls.minimize();
  }
};

const maximizeWindow = async () => {
  if (window.electron?.windowControls) {
      await window.electron.windowControls.maximize();
  }
};

const closeWindow = async () => {
  if (window.electron?.windowControls) {
      await window.electron.windowControls.close();
  }
};

// Update window control styles and setup listeners
async function initializeAlwaysOnTop() {
  const toggle = document.getElementById('alwaysOnTopToggle');
  if (toggle && window.electron?.getAlwaysOnTop) {
      const isAlwaysOnTop = await window.electron.getAlwaysOnTop();
      toggle.checked = isAlwaysOnTop;
      
      toggle.addEventListener('change', async () => {
          await window.electron.toggleAlwaysOnTop();
      });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeAlwaysOnTop();
  const minimizeButton = document.querySelector('.rapeqwdqwd:nth-child(1)');
  const maximizeButton = document.querySelector('.rapeqwdqwd:nth-child(2)');
  const closeButton = document.querySelector('.rapeqwdqwd:nth-child(3)');

  minimizeButton?.addEventListener('click', minimizeWindow);
  maximizeButton?.addEventListener('click', maximizeWindow);
  closeButton?.addEventListener('click', closeWindow);

  // Listen for window state changes
  if (window.electron?.onWindowStateChange) {
      window.electron.onWindowStateChange((state) => {
          // Update UI based on window state if needed
          console.log('Window state changed:', state);
      });
  }
});

// Add window control styles
const windowControlStyles = document.createElement('style');
windowControlStyles.textContent = `
  .window-controls {
      display: flex;
      gap: 0;
      -webkit-app-region: no-drag;
  }
  .rapeqwdqwd {
      width: 46px;
      height: 32px;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      -webkit-app-region: no-drag;
      user-select: none;
  }
  .rapeqwdqwd:hover {
      background-color: var(--bg-tab);
  }
  .rapeqwdqwd:last-child:hover {
      background-color: #e81123;
      color: white;
  }
  .controls {
      -webkit-app-region: no-drag;
  }
  .header {
      -webkit-app-region: drag;
  }
  .header .logo,
  .header button,
  .header .controls {
      -webkit-app-region: no-drag;
  }
`;
document.head.appendChild(windowControlStyles);

async function executeCurrentScript() {
  if (window.electron?.executeScript) {
      const script = editor.getValue();
      await window.electron.executeScript(script);
  }
}

async function injectDll() {
  if (window.electron?.inject) {
      await window.electron.inject();
  }
}

async function killRoblox() {
  if (window.electron?.inject) {
      await window.electron.killRoblox();
  }
}

function saveSettings() {
  const settings = {
      alwaysOnTop: document.getElementById('alwaysOnTopToggle').checked,
      autoInject: document.getElementById('autoInjectToggle').checked,
      theme: document.getElementById('themeSelector').value,
  };
  localStorage.setItem('seleneSettings', JSON.stringify(settings));
}

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('seleneSettings')) || {};

  if (settings.alwaysOnTop !== undefined) {
      const toggle = document.getElementById('alwaysOnTopToggle');
      toggle.checked = settings.alwaysOnTop;
  }

  if (settings.autoInject !== undefined) {
      const autoInjectToggle = document.getElementById('autoInjectToggle');
      autoInjectToggle.checked = settings.autoInject;
  }

  if (settings.theme) {
      const themeSelector = document.getElementById('themeSelector');
      themeSelector.value = settings.theme;
      applyTheme(settings.theme);
  }
}


async function saveFile() {
  const { filePath, canceled } = await window.electron.showSaveDialog({
      title: 'Save File',
      defaultPath: 'untitled.lua',
      filters: [{ name: 'Lua Files', extensions: ['lua'] }]
  });

  if (!canceled && filePath) {
      const content = editor.getValue();
      await window.electron.saveFile(filePath, content);
      showToast(`File saved to ${filePath}`, 3000);
  }
}

async function openFile() {
  const { filePath, canceled } = await window.electron.showOpenDialog({
      title: 'Open File',
      filters: [{ name: 'Lua Files', extensions: ['lua'] }],
      properties: ['openFile']
  });

  if (!canceled && filePath) {
      const content = await window.electron.openFile(filePath);
      editor.setValue(content);
      editor.clearSelection();
      showToast(`Opened ${filePath}`, 3000);
  }
}
