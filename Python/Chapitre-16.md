 
# 📚 Chapitre 16 — **Packaging, dépendances & livraison**

> [!NOTE]
> Ce chapitre vous guide pour créer un **paquet Python** propre: structure de projet, **environnements** (`venv`), gestion de **dépendances** (`pip`), **`pyproject.toml`** (métadonnées & build), **scripts d'entrée** (`console_scripts`), **versionnement sémantique**, et livraison (wheel/sdist). Nous resterons sur des outils **standard**.

---

## 🎯 Objectifs pédagogiques
- Construire une **structure** de paquet (src/layout).  
- Gérer un **venv** et des **dépendances** avec `pip`.  
- Définir **métadonnées** et **build** via `pyproject.toml`.  
- Ajouter un **script d'entrée** (CLI installable).  
- Comprendre **wheel/sdist**, versions et distribution locale.

---

## 🧠 Concepts clés

### 🧠 Environnements (`venv`) & `pip`
- Créer un venv: `python -m venv .venv` puis **activer**.  
- Installer deps: `pip install -U pip`, `pip install package`.  
- Figer versions: `pip freeze > requirements.txt` (basique).

### 🧠 Structure de paquet (src)
```
my_pkg/
  pyproject.toml
  src/
    my_pkg/
      __init__.py
      __main__.py   # option: exécution 'python -m my_pkg'
      cli.py        # logique CLI
```

### 🧠 `pyproject.toml` (exemple minimal)
```
[project]
name = "my-pkg"
version = "0.1.0"
description = "Demo package"
readme = "README.md"
requires-python = ">=3.10"
authors = [{name = "Vous", email = "vous@example.com"}]
dependencies = [
  # "requests>=2.31.0",
]

[project.scripts]
my-pkg = "my_pkg.cli:main"

[build-system]
requires = ["setuptools>=68", "wheel", "build"]
build-backend = "setuptools.build_meta"
```

### 🧠 CLI installable
```python
# src/my_pkg/cli.py

def main():
    print("Hello from my-pkg!")
```

### 🧠 Construire & installer localement
```bash
python -m pip install -U build
python -m build              # crée dist/*.whl et *.tar.gz
python -m pip install dist/my_pkg-0.1.0-py3-none-any.whl
# ou
python -m pip install -e .   # mode editable durant dev
```

### 🧠 Versionnement & métadonnées
- **SemVer** classique: `major.minor.patch`.  
- Ajouter **licence**, **classifiers**, **keywords** pour diffusion.

---

## 🧪 Exemples pratiques
- **`__main__.py`** pour `python -m my_pkg`: point d'entrée modulaire.  
- **Data de paquet**: inclure fichiers via config (avancé) ou chemin relatif `importlib.resources`.

---

## ⚠️ Pièges & solutions
- **Imports relatifs fragiles**: préférer **imports absolus** (`my_pkg.module`).  
- **Dépendances non fixées**: préciser bornes si nécessaire, tester avec venv **propre**.  
- **Oubli des métadonnées**: `readme`, licence, authors → important pour partage.  
- **Package name**: éviter conflits avec modules stdlib (ex: `json`).

---

## 💡 Astuces de pro
- **src layout** pour éviter import du code non installé.  
- **`pip install -e .`** pour un cycle dev rapide.  
- **Tests** dans `tests/`; inclure CI basique (exécution `python -m unittest`).

---

## 🧩 Exercices
1. Créer un paquet minimal avec `pyproject.toml`, construire et installer en local.  
2. Ajouter un **script d'entrée** `my-pkg` pointant vers `cli:main`.  
3. Ajoutez une **option** CLI et testez l'appel.  
4. Créer un venv **neuf** et vérifier l'installation du wheel.  
5. Ajouter **metadata** (licence, classifiers) et re‑construire.

---

## 🧭 Récap
- venv + pip pour isoler; `pyproject.toml` pour config projet; build → wheel/sdist; `console_scripts` pour CLI.

---

## ✅ Checklist
- [ ] Je structure en `src/my_pkg`.  
- [ ] J'utilise `venv` et `pip`.  
- [ ] Je configure `pyproject.toml`.  
- [ ] Je construis et j'installe une wheel locale.  
- [ ] Je fournis un CLI via `project.scripts`.

---

## 🧪 Mini‑quiz
1) Pour un **CLI** installable:  
   a) `__main__.py` uniquement  
   b) `project.scripts` vers `module:function`  
   c) `requirements.txt`

2) Pour **isoler** les dépendances:  
   a) `venv`  
   b) `pip freeze`  
   c) global site‑packages

3) Pour **construire** wheel/sdist:  
   a) `python -m build`  
   b) `python setup.py build` seulement  
   c) `pip install --build`

*Réponses*: 1) b  2) a  3) a

---

> [!NOTE]
> Fin des chapitres. Consultez les **Annexes** pour glossaire, fiches mémo et ressources.
