---
title: Index du cours Electron (Syllabus)
tags: [electron, cours, syllabus]
---

# 📚 Index du cours Electron (Syllabus)

> 🧭 **Légende des icônes**  
> 📘 Chapitre · 🎯 Objectifs · 🧩 Concepts · 💡 Exemple · 🛠️ Atelier · ⚠️ Sécurité · 🧪 Tests · 🧠 Bonnes pratiques · 🗂️ Livrables · 🖼️ Schémas (Mermaid)

> 📂 **Convention de nommage Obsidian**  
> `NN-titre-court.md` (ex. `01-decouvrir-electron.md`)

## 📘 0. Vue d’ensemble & objectifs (Découvrir Electron)
- 🎯 Comprendre **ce qu’est Electron** (Chromium + Node.js) et **pourquoi** on l’utilise pour des apps desktop multi-plateformes.
- 🧩 Architecture **Main / Renderer / Preload / IPC**, cycle de vie d’une app.
- 🗂️ Fichier : [[01-decouvrir-electron]] (à venir)
- 🔎 **Résumé** : Panorama d’Electron, terminologie et flux d’exécution, premiers schémas.

## 📘 1. Environnement & premiers pas
- 🎯 Installer Node.js, npm, Electron; **créer un projet minimal** propre.
- 🧩 `package.json`, scripts npm, fichiers de base `main.js`, `index.html`, `preload.js`.
- ⚠️ Sécurité par défaut : `nodeIntegration: false`, `contextIsolation: true`, CSP.
- 🗂️ Fichier : [[02-environnement-premiers-pas]] *(disponible)*
- 🔎 **Résumé** : Mise en place fiable (Windows & macOS), lancement de l’app, DevTools et logs.

## 📘 2. Cycle de vie & fenêtres (BrowserWindow)
- 🎯 Événements `app.ready`, `window-all-closed`, `activate`, gestion multi-fenêtres.
- 🧩 Options `webPreferences`, `loadFile`/`loadURL`, `ready-to-show`.
- 🗂️ Fichier : [[03-cycle-vie-fenetres]] (à venir)
- 🔎 **Résumé** : Créer/fermer des fenêtres de façon sûre et ergonomique.

## 📘 3. Sécurité d’abord (Preload, sandbox, CSP)
- 🎯 Barrières Renderer↔Node via Preload, **CSP stricte**, sandbox.
- 🗂️ Fichier : [[04-securite-preload-csp]] (à venir)
- 🔎 **Résumé** : Modèle de menace de base et checklist.

## 📘 4. IPC maîtrisé (ipcMain/ipcRenderer)
- 🎯 Schéma **Request/Response** typé, canaux IPC nommés.
- 🗂️ Fichier : [[05-ipc-architecture]] (à venir)
- 🔎 **Résumé** : Échanges fiables, erreurs standardisées.

## 📘 5. Interface Renderer (Vanilla JS ou Vue 3)
- 🎯 Construire l’UI **sans exposer Node**; état et composants.
- 🗂️ Fichier : [[06-ui-renderer-vanilla]] / [[06-ui-renderer-vue3]] (à venir)
- 🔎 **Résumé** : Structurer une UI moderne et réactive.

## 📘 6. Bundling avec Webpack (Main, Preload, Renderer)
- 🎯 Configurer un bundling **séparé** pour chaque cible.
- 🗂️ Fichier : [[07-bundling-webpack]] (à venir)
- 🔎 **Résumé** : Performance, source maps, HMR.

## 📘 7. Intégrations OS (Menus, Tray, Dialogs, Clipboard, Notifications)
- 🎯 Exploiter les **API natives** d’Electron.
- 🗂️ Fichier : [[08-integrations-os]] (à venir)
- 🔎 **Résumé** : UX desktop soignée.

## 📘 8. Gestion multi-fenêtres & BrowserView
- 🎯 Orchestration multi-fenêtres, intégration web.
- 🗂️ Fichier : [[09-multi-fenetres-browserview]] (à venir)
- 🔎 **Résumé** : Manager de fenêtres maintenable.

## 📘 9. Fichiers & stockage local (fs, config, chiffrement)
- 🎯 Lire/écrire, dossier `userData`, persistance.
- 🗂️ Fichier : [[10-stockage-fichiers]] (à venir)
- 🔎 **Résumé** : Données locales sûres.

## 📘 10. Packaging & distribution (electron-builder)
- 🎯 Builds pour Windows/macOS/Linux, signatures.
- 🗂️ Fichier : [[11-packaging-distribution]] (à venir)
- 🔎 **Résumé** : Préparer une release professionnelle.

## 📘 11. Auto-update (electron-updater)
- 🎯 Mettre à jour en production; canaux.
- 🗂️ Fichier : [[12-auto-update]] (à venir)
- 🔎 **Résumé** : Mise à jour fiable et UX.

## 📘 12. Tests (Jest + Playwright)
- 🎯 Unitaires Preload/Renderer, E2E.
- 🗂️ Fichier : [[13-tests-jest-playwright]] (à venir)
- 🔎 **Résumé** : Qualité et non-régression.

## 📘 13. Performance & debugging
- 🎯 Profilage CPU/mémoire, optimisations.
- 🗂️ Fichier : [[14-performance-debugging]] (à venir)
- 🔎 **Résumé** : Tracer, mesurer, améliorer.

## 📘 14. Architecture & patterns
- 🎯 Couches, responsabilités, patterns.
- 🗂️ Fichier : [[15-architecture-patterns]] (à venir)
- 🔎 **Résumé** : Code durable et testable.

## 📘 15. Accessibilité & i18n
- 🎯 A11y, navigation clavier, i18n.
- 🗂️ Fichier : [[16-accessibilite-i18n]] (à venir)
- 🔎 **Résumé** : Inclusif et multilingue.

## 📘 16. Intégrations avancées (N-API)
- 🎯 Modules natifs, sandbox strict.
- 🗂️ Fichier : [[17-integrations-avancees]] (à venir)
- 🔎 **Résumé** : Ponts vers le natif en sécurité.

## 📘 17. Projet fil rouge : Mini‑Obsidian Desktop
- 🎯 App complète Markdown Vault.
- 🗂️ Fichier : [[18-projet-fil-rouge-mini-obsidian]] (à venir)
- 🔎 **Résumé** : Intégration de tous les chapitres.

## 📘 18. Déploiement & maintenance
- 🎯 CI/CD, releases, crash reporting.
- 🗂️ Fichier : [[19-deploiement-maintenance]] (à venir)
- 🔎 **Résumé** : Opérations et suivi en production.
