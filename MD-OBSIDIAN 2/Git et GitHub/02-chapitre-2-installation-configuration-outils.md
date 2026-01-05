---
title: "🔧 Chapitre 2 — Installation, configuration & outils"
tags: [git, github, installation, configuration, ssh, https, gpg, vscode, débutant]
cssclass: chapitre
---

# 🔧 Chapitre 2 — Installation, configuration & outils

> **Objectif pédagogique :** installer Git correctement sur ton OS, configurer l’identité et les préférences d’édition, préparer une authentification **sécurisée** avec GitHub (**SSH recommandé**), activer la **signature GPG** des commits (optionnel mais pro), poser les bases de `.gitignore` et `.gitattributes`, et vérifier l’intégration à **VS Code**.

---

## 🧠 Résumé rapide (à garder en tête)
- Installe **Git** (dernier binaire stable) et vérifie `git --version`.
- Configure **identité** : `user.name`, `user.email` (attention à la confidentialité), et **branche par défaut** : `init.defaultBranch=main`.
- Choisis ton **éditeur** (ex.: VS Code) et la gestion des fins de ligne (**CRLF/LF** via `core.autocrlf`).
- Préfère **SSH** à **HTTPS** pour GitHub (génère une **clé ed25519**, ajoute-la au compte, `ssh -T git@github.com`).
- (Optionnel) **Signe tes commits** avec **GPG** et vérifie les signatures.
- Mets en place un **global ignore** et, au besoin, des attributs (`.gitattributes`) pour normaliser le texte.

---

## 🖥️ Installer Git

### 🪟 Windows
- Télécharge **Git for Windows** (inclut *Git Bash*).  
- Lance l’installateur et accepte les options par défaut sauf :
  - **Éditeur par défaut** : choisis **Visual Studio Code** si tu l’utilises.
  - **Nom de la branche par défaut** : `main`.
  - **Line endings** : si tu collabores avec macOS/Linux, *recommandé* → **Checkout Windows-style, commit Unix-style**.

### 🍎 macOS
- Via **Homebrew** (recommandé) :
  ```bash
  brew install git
  git --version
  ```
- Ou via **Xcode Command Line Tools** (installe une version de Git) :
  ```bash
  xcode-select --install
  git --version
  ```

### 🐧 Linux (Debian/Ubuntu)
```bash
sudo apt update && sudo apt install -y git
git --version
```

### ✅ Vérification
```bash
git --version
```
> Tu dois voir une version récente (ex.: `git version 2.x.y`).

---

## 🔧 Configuration initiale

### 👤 Identité & branche par défaut
```bash
git config --global user.name "Eric Fourmaux"
# Astuce confidentialité : utilise l’adresse noreply GitHub si nécessaire
# git config --global user.email "<id+username>@users.noreply.github.com"

git config --global init.defaultBranch main
```

### 🖊️ Éditeur par défaut
- **VS Code** :
  ```bash
  git config --global core.editor "code --wait"
  ```
- (Alternatives) `nano`, `vim`, etc.

### 🔁 Fins de ligne (CRLF vs LF)
- Recommandation **multi-OS** :
  - **Windows** :
    ```bash
    git config --global core.autocrlf true
    ```
  - **macOS/Linux** :
    ```bash
    git config --global core.autocrlf input
    ```
- Option de normalisation supplémentaire (via `.gitattributes`) plus bas.

### 🔐 Aide-mémoire identifiants
- **Cache des identifiants HTTPS** (si tu choisis HTTPS) :
  ```bash
  git config --global credential.helper cache   # cache en mémoire (temporaire)
  # ou Windows Credential Manager / macOS Keychain selon l'install
  ```

---

## 🔑 Authentification avec GitHub — **SSH recommandé**

### Pourquoi SSH ?
- **Sécurisé**, **sans mot de passe** (clé publique/privée), évite la gestion de PAT en local.  
- Fonctionne de façon fluide avec `git@github.com:owner/repo.git`.

### Générer une clé **ed25519** (recommandé)
```bash
# Sous macOS/Linux
ssh-keygen -t ed25519 -C "eric@example.com"
# Sous Windows (Git Bash)
ssh-keygen.exe -t ed25519 -C "eric@example.com"
```
- Choisis un chemin (par défaut `~/.ssh/id_ed25519`) et un **passphrase**.

### Ajouter la clé à l’agent SSH
```bash
# macOS
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Linux
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Windows (Git Bash)
# Lance l'agent via Git Bash et ajoute la clé
eval "$(ssh-agent -s)"
ssh-add /c/Users/<toi>/.ssh/id_ed25519
```

### Ajouter la clé à GitHub
- Copie la **clé publique** :
  ```bash
  # macOS
  pbcopy < ~/.ssh/id_ed25519.pub
  # Linux
  xclip -sel clip < ~/.ssh/id_ed25519.pub  # (si xclip installé)
  # Windows
  clip < ~/.ssh/id_ed25519.pub
  ```
- Va sur **GitHub → Settings → SSH and GPG keys → New SSH key** et colle la clé.

### Tester la connexion
```bash
ssh -T git@github.com
# Réponse attendue : "Hi <username>! You've successfully authenticated..."
```

> **URL SSH d’un dépôt** : `git@github.com:<owner>/<repo>.git`

---

## 🔁 Alternative : **HTTPS + PAT** (Personal Access Token)
- Utilise une URL : `https://github.com/<owner>/<repo>.git`  
- À la première opération *push*, Git demandera **utilisateur** + **token** (au lieu du mot de passe).
- Crée un **PAT** sur GitHub → *Settings → Developer settings → Personal access tokens* (classic ou fine‑grained).  
- Scopes minimaux pour dépôt perso : `repo` (et *workflow* si Actions). Stocke via le **credential helper**.

> **Remarque :** SSH est généralement plus simple et plus sûr au quotidien.

---

## ✍️ Signature **GPG** des commits (optionnel mais recommandé)

### Installer GPG
- **Windows** : installe *Gpg4win*.  
- **macOS** : `brew install gnupg`  
- **Linux** : `sudo apt install gnupg`

### Générer une clé
```bash
gpg --full-generate-key
# Type: RSA (3072 ou 4096) ou ed25519 (via keys modernes)
# Associe ton email (même que GitHub ou noreply)
```

### Lister et récupérer l’ID
```bash
gpg --list-secret-keys --keyid-format LONG
# Note l'ID: ex. 0123ABCD4567EFGH
```

### Configurer Git pour signer
```bash
git config --global user.signingkey 0123ABCD4567EFGH
git config --global commit.gpgsign true
```

### Publier ta clé publique sur GitHub (GPG Keys)
- Exporte la clé publique :
  ```bash
gpg --armor --export 0123ABCD4567EFGH > pubkey.asc
  ```
- Ajoute-la dans **GitHub → Settings → SSH and GPG keys → New GPG key**.

### Vérifier une signature
```bash
git log --show-signature -1
```

> **Bonnes pratiques** : garde ta clé privée **sécurisée**, protège-la par passphrase.

---

## 📄 `.gitignore` global & projet

### Global ignore (pour tout ton poste)
- Crée un fichier (ex.: `~/.gitignore_global`) et déclare-le :
  ```bash
git config --global core.excludesfile ~/.gitignore_global
  ```
- Exemple d’entrées utiles (front‑end) :
  ```gitignore
# Systèmes
.DS_Store
Thumbs.db

# Node & build
node_modules/
dist/
coverage/
.cache/

# Environnements
.env*
*.local

# Éditeurs
.vscode/
.idea/
  ```

### `.gitignore` au niveau du projet
- Place un `.gitignore` à la racine pour les spécificités du dépôt.

---

## 🧾 `.gitattributes` — normaliser les fichiers

- Normaliser le texte et éviter les surprises d’EOL :
  ```gitattributes
# Normalisation des fichiers texte
* text=auto eol=lf

# Exemples de binaires (ne pas normaliser)
*.png binary
*.jpg binary
*.pdf binary
  ```
- (Optionnel) déclarer des langues ou diff personnalisés.

---

## 💻 VS Code & outils utiles

- **VS Code** : installe l’éditeur et ouvre le **Terminal** intégré.
- Extensions recommandées :
  - **GitLens** (lecture d’historique, blame enrichi)
  - **EditorConfig** (consistance des styles)
  - **Prettier** + **ESLint** (qualité code ; branchement via hooks au Chap. 20)
- Paramétrer l’intégration :
  ```json
  // settings.json (extraits)
  {
    "git.confirmSync": false,
    "git.enableSmartCommit": true,
    "git.autofetch": true,
    "files.eol": "\n" // LF
  }
  ```

---

## 🚀 Créer ton premier dépôt (local → GitHub)

### 1) Initialiser
```bash
mkdir demo-git && cd demo-git
git init -b main
```

### 2) Créer un README
```bash
echo "# Demo Git" > README.md
```

### 3) Ajouter & commit
```bash
git status
git add README.md
git commit -m "feat(docs): init README"
```

### 4) Créer le dépôt sur GitHub
- Crée un repo vide **sans README** (si tu as déjà créé localement) : `demo-git`.

### 5) Lier le remote
```bash
# SSH
git remote add origin git@github.com:<ton-user>/demo-git.git
# HTTPS
# git remote add origin https://github.com/<ton-user>/demo-git.git
```

### 6) Pousser
```bash
git push -u origin main
```

### 7) Vérifier sur GitHub
- Le README doit apparaître, avec ton commit.

---

## 🧭 Schémas ASCII — Vue d’ensemble

```
[Ton PC]
  ├─ Working tree
  ├─ Index (staging)
  └─ .git (historique)
        ↕ push/pull
[GitHub]
  └─ origin (remote)
```

```
Config Git (priorités)
Global (~/.gitconfig)
  ↓
Local (.git/config)
  ↓
Command-line (override)
```

---

## ⚠️ Encadré risques & hygiène
- **Adresse email publique** : utilise l’adresse **noreply** si tu ne veux pas exposer ton email.  
- **Line endings** : mélange LF/CRLF peut créer des diffs bruyants — **normalise** via `core.autocrlf` et `.gitattributes`.  
- **Clés SSH non protégées** : mets un **passphrase** ; ne partage jamais ta **clé privée**.  
- **PAT trop permissif** : donne seulement les **scopes** nécessaires.  
- **GPG mal configuré** : garder la cohérence email ↔ GitHub pour que la signature soit **vérifiée**.

---

## 🧪 Exercices pratiques
1. **Installer Git & vérifier**  
   Installe Git, exécute `git --version`.
2. **Configurer identité & branche par défaut**  
   Configure `user.name`, `user.email` (noreply si besoin), `init.defaultBranch=main`.
3. **Normaliser EOL**  
   Mets en place `core.autocrlf` selon ton OS et un `.gitattributes` basique.
4. **SSH vers GitHub**  
   Génère une clé `ed25519`, ajoute-la à GitHub, teste `ssh -T git@github.com`.
5. **Signature GPG** (optionnel)  
   Génère une clé, configure `commit.gpgsign=true`, vérifie `git log --show-signature -1`.
6. **Premier dépôt**  
   Init local, crée README.md, push vers GitHub (SSH).

---

## 🧑‍🏫 Théorie en **JavaScript** (illustrations)

### 1) Normaliser les fins de ligne (LF ↔ CRLF)
```js
// Convertit CRLF (\r\n) en LF (\n) pour un contenu texte
function normalizeToLF(text) {
  return text.replace(/\r\n/g, "\n");
}

// Convertit LF en CRLF
function normalizeToCRLF(text) {
  return text.replace(/(?<!\r)\n/g, "\r\n");
}

// Détection simple (illustrative)
function detectEOL(text) {
  const crlf = (text.match(/\r\n/g) || []).length;
  const lf = (text.match(/(?<!\r)\n/g) || []).length;
  return { crlf, lf };
}
```

### 2) Résolution de configuration (global → local → CLI)
```js
// Fusion prioritaire : CLI > local (.git/config) > global (~/.gitconfig)
function resolveConfig(globalCfg, localCfg, cliCfg) {
  return { ...globalCfg, ...localCfg, ...cliCfg };
}

// Exemple
const globalCfg = { user: { name: "Eric", email: "noreply" }, core: { autocrlf: "input" } };
const localCfg  = { core: { autocrlf: "true" } };
const cliCfg    = { user: { email: "eric@exemple.com" } };

const effective = resolveConfig(globalCfg, localCfg, cliCfg);
// effective.user.email === "eric@exemple.com" ; effective.core.autocrlf === "true"
```

---

## 📎 Glossaire (sélection)
- **SSH** : protocole sécurisé par paires de clés (publique/privée).
- **PAT** : *Personal Access Token*, substitut de mot de passe pour HTTPS.
- **GPG** : outil de chiffrement et de signature ; permet de **signer** les commits.
- **`.gitignore`** : liste de fichiers/dossiers à **ne pas suivre**.
- **`.gitattributes`** : règles de traitement (texte/binaire, EOL, diff, etc.).

---

## 📚 Ressources officielles
- Télécharger Git : https://git-scm.com/downloads  
- Configuration Git : https://git-scm.com/docs/git-config  
- Clés SSH GitHub : https://docs.github.com/en/authentication/connecting-to-github-with-ssh  
- PAT (tokens d’accès) : https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token  
- Signer les commits : https://docs.github.com/en/authentication/managing-commit-signature-verification  
- `.gitignore` : https://git-scm.com/docs/gitignore  
- VS Code Git : https://code.visualstudio.com/docs/editor/versioncontrol

---

## 🧾 Résumé des points essentiels — Chapitre 2
- Installe Git et **vérifie** la version ; configure **identité** et **branche par défaut**.  
- Choisis **SSH** (clé `ed25519`, agent, test) ou **HTTPS** + **PAT** (scopes justes).  
- Normalise les **EOL** (CRLF/LF) via `core.autocrlf` et `.gitattributes`.  
- (Optionnel) **signe** tes commits avec **GPG** et lie la clé à GitHub.  
- Mets en place **`.gitignore`** global + projet ; installe **VS Code** et extensions utiles.  
- Crée et **pousse** un premier dépôt vers GitHub.

---

> 🔜 **Prochain chapitre** : [[03-chapitre-3-markdown-bonnes-pratiques-docs]] (sera fourni après validation).
