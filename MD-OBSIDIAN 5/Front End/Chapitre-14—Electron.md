
# 📘 Chapitre 14 — Electron (Desktop avec Tech Web)

> 🎯 **Objectifs du chapitre**
> - Comprendre l’architecture **Main** (processus principal) vs **Renderer** (fenêtres) et la **réactivité** Vue côté renderer.
> - Implémenter une communication **IPC** sûre (`ipcMain`/`ipcRenderer` + `contextBridge`) et des **préloads** isolés.
> - Configurer **Webpack + TypeScript** pour packager Main/Renderer/Preload.
> - Assurer la **sécurité** (CSP, `contextIsolation`, `sandbox`, `nodeIntegration: false`) et gérer les **fichiers** et **permissions** côté Main.
> - Packager l’app avec **Electron Builder** (Windows/macOS/Linux) et aborder **auto‑update** (aperçu).
> - Produire une **mini‑application** Vue + TS + Electron (lecture/écriture de fichiers, préférences persistées).

---

## 🧠 1. Architecture Electron

### 🔍 Définition
- **Main Process** (Node + Electron API): crée les `BrowserWindow`, gère menus, fichiers, système.
- **Renderer Process** (par fenêtre): rendu HTML/CSS/JS, Vue 3, DOM.
- **Preload**: script injecté **avant** le renderer, avec `contextIsolation` et `contextBridge` pour exposer une API **sûre**.

### 🗺 Schéma ASCII
```
[Main] ── creates ──> [BrowserWindow]
  │                       │
  ├─ file system          ├─ Vue app (Renderer)
  ├─ app lifecycle        ├─ DOM/UI
  └─ IPC handle <─── preload (contextBridge) ──> IPC invoke
```

### 💡 Règle d’or
**Jamais** d’accès direct au système (fs, process) depuis le **renderer**; **tout** passe par **IPC** et le **Main**.

---

## 🧠 2. Sécurité — paramètres essentiels

### ✅ Options `BrowserWindow`
```ts
// main.ts
import { BrowserWindow } from 'electron';
const win = new BrowserWindow({
  width: 1024,
  height: 768,
  webPreferences: {
    preload: __dirname + '/preload.js',
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    webSecurity: true,
    // dev seulement: allowRunningInsecureContent: false
  }
});
```

### ✅ CSP (Content Security Policy)
Ajouter une meta CSP en prod (éviter `unsafe-inline` si possible):
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self';">
```

### ✅ Autres bonnes pratiques
- **Désactiver** `remote` et les modems non sûrs.
- **Valider** toutes les entrées IPC.
- **Charger** via `loadFile` (local) ou `loadURL` seulement si contrôlé.

---

## 🧠 3. IPC sûre avec `contextBridge`

### 💡 Preload (API sécurisée)
```ts
// preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  readTextFile: (path: string) => ipcRenderer.invoke('fs:readTextFile', path),
  writeTextFile: (path: string, content: string) => ipcRenderer.invoke('fs:writeTextFile', { path, content }),
  getUserDir: () => ipcRenderer.invoke('app:userData'),
});
```

### 💡 Main (handlers)
```ts
// main.ts
import { app, ipcMain } from 'electron';
import fs from 'node:fs/promises';

ipcMain.handle('fs:readTextFile', async (_evt, path: string) => {
  if (!path || typeof path !== 'string') throw new Error('Chemin invalide');
  return fs.readFile(path, 'utf-8');
});

ipcMain.handle('fs:writeTextFile', async (_evt, payload: { path: string; content: string }) => {
  if (!payload?.path || typeof payload.path !== 'string') throw new Error('Chemin invalide');
  return fs.writeFile(payload.path, payload.content, 'utf-8');
});

ipcMain.handle('app:userData', async () => app.getPath('userData'));
```

### 💡 Renderer (Vue)
```ts
// src/renderer/utils/files.ts
export async function saveNote(name: string, text: string) {
  const dir = await window.api.getUserDir();
  const path = `${dir}/${name}.txt`;
  await window.api.writeTextFile(path, text);
  return path;
}
```

> ℹ️ `window.api` vient du **preload** via `contextBridge.exposeInMainWorld`.

---

## 🧠 4. Cycle de vie & fenêtres

### 💡 Création & chargement
```ts
// main.ts (extrait)
import { app, BrowserWindow } from 'electron';
let win: BrowserWindow | null = null;

async function createWindow(){
  win = new BrowserWindow({ /* options + webPreferences */ });
  await win.loadFile('dist/index.html'); // ou loadURL pour dev server
}
app.whenReady().then(createWindow);

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
```

### 💡 Menu & raccourcis
```ts
import { Menu, globalShortcut } from 'electron';
Menu.setApplicationMenu(Menu.buildFromTemplate([ { label: 'Fichier', submenu: [{ role: 'quit' }] } ]));
app.whenReady().then(() => { globalShortcut.register('CommandOrControl+Shift+I', () => win?.webContents.openDevTools()); });
```

---

## 🧠 5. Webpack + TypeScript (Main/Renderer/Preload)

### 📦 Arborescence
```
project/
  src/
    main.ts
    preload.ts
    renderer/
      main.ts
      App.vue
  public/index.html
  webpack.main.js
  webpack.renderer.js
  webpack.preload.js
  tsconfig.json
  package.json
```

### 💡 `webpack.main.js` (exemple minimal)
```js
import path from 'node:path';
export default {
  target: 'electron-main',
  mode: 'development',
  entry: './src/main.ts',
  output: { path: path.resolve('dist'), filename: 'main.js' },
  module: { rules: [ { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ } ] },
  resolve: { extensions: ['.ts', '.js'] }
};
```

### 💡 `webpack.preload.js`
```js
import path from 'node:path';
export default {
  target: 'electron-preload',
  mode: 'development',
  entry: './src/preload.ts',
  output: { path: path.resolve('dist'), filename: 'preload.js' },
  module: { rules: [ { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ } ] },
  resolve: { extensions: ['.ts', '.js'] }
};
```

### 💡 `webpack.renderer.js` (Vue 3)
```js
import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
export default {
  target: 'web',
  mode: 'development',
  entry: './src/renderer/main.ts',
  output: { path: path.resolve('dist'), filename: 'renderer.js' },
  module: {
    rules: [
      { test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.vue$/, loader: 'vue-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [ new HtmlWebpackPlugin({ template: 'public/index.html' }) ],
  resolve: { extensions: ['.ts', '.js'], alias: { '@': path.resolve('src/renderer') } }
};
```

### 💡 `tsconfig.json` (strict)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

### 💡 Scripts npm (dev)
```json
{
  "scripts": {
    "build:main": "webpack --config webpack.main.js",
    "build:preload": "webpack --config webpack.preload.js",
    "build:renderer": "webpack --config webpack.renderer.js",
    "build": "npm run build:main && npm run build:preload && npm run build:renderer",
    "start": "npm run build && electron ./dist/main.js",
    "dev": "concurrently \"webpack --config webpack.main.js --watch\" \"webpack --config webpack.preload.js --watch\" \"webpack --config webpack.renderer.js --watch\" \"electronmon ./dist/main.js\""
  }
}
```

> ℹ️ En dev, on peut utiliser **electronmon** ou **nodemon** pour relancer Main.

---

## 🧠 6. Packaging avec Electron Builder

### 💡 `package.json` — configuration de base
```json
{
  "name": "vue-electron-app",
  "version": "0.1.0",
  "main": "dist/main.js",
  "build": {
    "appId": "com.example.vueelectron",
    "files": [
      "dist/**/*",
      "package.json"
    ],
    "directories": { "buildResources": "build" },
    "mac": { "target": ["dmg", "zip"], "category": "public.app-category.productivity" },
    "win": { "target": ["nsis", "zip"], "publisherName": "Example Inc" },
    "linux": { "target": ["AppImage"], "category": "Utility" },
    "artifactName": "${productName}-${version}-${os}-${arch}.${ext}"
  },
  "scripts": {
    "build": "webpack --config webpack.main.js && webpack --config webpack.preload.js && webpack --config webpack.renderer.js",
    "dist": "npm run build && electron-builder"
  }
}
```

### 💡 Auto‑update (aperçu)
```ts
// main.ts (extrait)
import { app } from 'electron';
// import { autoUpdater } from 'electron-updater';
app.on('ready', () => {
  // autoUpdater.checkForUpdatesAndNotify(); // nécessite config de publication
});
```

> ⚠️ L’auto‑update requiert un **provider** (GitHub Releases, S3, etc.) et une signature (macOS).

---

## 🧠 7. Fichiers & préférences

### 💡 Dossier utilisateur & stockage
```ts
import { app } from 'electron';
const dataDir = app.getPath('userData'); // ex. ~/Library/Application Support/…
```

### 💡 Exemple simple de préférences (JSON)
```ts
// main/preferences.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron';

const file = path.join(app.getPath('userData'), 'prefs.json');
export async function readPrefs(){ try { return JSON.parse(await fs.readFile(file, 'utf-8')); } catch { return {}; } }
export async function writePrefs(prefs: Record<string, unknown>){ await fs.writeFile(file, JSON.stringify(prefs, null, 2)); }
```

---

## 🧠 8. Intégrations OS (Menu, Tray, Notifications)

### 💡 Tray & notification
```ts
import { Tray, nativeImage, Notification } from 'electron';
const tray = new Tray(nativeImage.createEmpty());
new Notification({ title: 'Vue Electron', body: 'Application lancée' }).show();
```

### 💡 Protocoles & liens profonds (aperçu)
Enregistrer un **protocole** custom pour ouvrir l’app (macOS/Windows) et gérer l’URL côté **Main**.

---

## 🧠 9. Tests & qualité

### ✅ Stratégie
- Testez la **logique** (utils, préférences) avec **Jest** (Chapitre 8).
- E2E: possible via **Playwright** ou **Spectron (déprécié)** alternatives; gardez une batterie **manuelle** pour bootstrap.

### 💡 Exemple de test unitaire
```ts
import { nextVersion } from '../common/semver';
// … mêmes patterns d’assertions que Chap. 8
```

---

## 🧪 10. Mini‑application (Livrable)

### 📦 Objectif
Une app **Notes**: créer/éditer des fichiers `.txt` dans le dossier utilisateur, avec **Vue 3** côté UI.

### 🧩 Fonctionnalités
- Liste des notes (lecture du dossier)
- Édition et **sauvegarde** via IPC
- Préférences (thème, répertoire)
- Menu Fichier (Nouveau, Ouvrir, Quitter)

---

## ✅ 11. Exercices guidés

1. **IPC**: Ajoutez un handler `fs:listFiles(dir)` qui renvoie les `.txt` triés.
2. **Sécurité**: Ajoutez une **CSP** stricte, supprimez `unsafe-inline` et utilisez des styles CSS externes.
3. **Packaging**: Générez un **AppImage** (Linux) et testez l’exécution.
4. **Auto‑update**: Simulez une mise à jour avec `electron-updater` et GitHub Releases (aperçu).
5. **Préférences**: Ajoutez la persistance du **thème** et appliquez‑le côté renderer.
6. **Tests**: Écrivez des tests unitaires pour les préférences (`readPrefs`/`writePrefs`).

---

## ✅ 12. Check‑list Electron

- [ ] `contextIsolation: true`, `nodeIntegration: false`, **preload** isolé.
- [ ] **Validation** des paramètres IPC.
- [ ] **CSP** en prod + `webSecurity: true`.
- [ ] Accès **fichiers** uniquement côté **Main**.
- [ ] **Packaging** multi‑plateformes (Electron Builder).
- [ ] **Auto‑update** configuré (si besoin).
- [ ] **Menu** et **shortcuts** adaptés à l’OS.

---

## 🔚 Résumé essentiel du Chapitre 14
- Electron sépare **Main** (accès système, fenêtres) et **Renderer** (UI). La **sécurité** exige un **preload** et un **IPC** strict.
- Webpack + TS packagent `main`, `preload` et `renderer`; Vue 3 gère l’UI.
- `electron-builder` produit des **artifacts** pour macOS/Windows/Linux; l’auto‑update nécessite une **publication** et des **signatures**.
- Les **fichiers** et **préférences** doivent être gérés côté **Main**, avec une API **exposée** via `contextBridge`.

---

> Prochain chapitre (15): **Projet Fil Rouge (Capstone)** — Kanban Vue 3 + TS + Pinia + Router + Webpack + Jest, CI + déploiement.
