 
# 🛠️ Projet pratique complet — **ETL & Visualisation des ventes**

> Objectif : construire un mini **pipeline ETL** (Extract‑Transform‑Load) avec **Pandas**, produire des **rapports** et des **visualisations** (Matplotlib), et fournir une **CLI** + **tests**. Architecture modulaire, séparation **core/I‑O/CLI**, données persistées en CSV.

---

## 🗂️ Structure du projet
```
projet_etl/
  data/
    ventes.csv            # données source (date, produit, quantite, prix)
  src/
    etl_core.py           # logique pure (transformations)
    etl_io.py             # I/O (lecture/écriture)
    etl_cli.py            # CLI (argparse)
  reports/
    report_mensuel.csv    # sortie agrégée
    top_produits.csv      # sortie top N
    figures/
      ventes_mensuelles.png
  tests/
    test_core.py
```

---

## 📄 Format des données (exemple `ventes.csv`)
```
date,produit,quantite,prix
2025-12-28,Widget,3,19.9
2025-12-29,Gadget,2,29.0
2025-12-31,Widget,1,20.0
2026-01-02,Gizmo,5,9.9
```

---

## 🔧 Modules (extraits de code)

### `src/etl_core.py` — logique (pure)
```python
import pandas as pd

def nettoie(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    out['date'] = pd.to_datetime(out['date'], errors='coerce')
    out = out.dropna(subset=['date', 'produit', 'quantite', 'prix'])
    out['produit'] = out['produit'].str.strip().str.title()
    out['quantite'] = out['quantite'].astype('Int64')
    out['prix'] = out['prix'].astype('float64')
    out['total'] = out['quantite'] * out['prix']
    return out


def agr_mensuel(df: pd.DataFrame) -> pd.DataFrame:
    tmp = df[['date','total']].copy().set_index('date').sort_index()
    return (tmp.resample('M').sum().rename(columns={'total':'total_mensuel'}))


def top_produits(df: pd.DataFrame, n: int = 5) -> pd.DataFrame:
    return (df.groupby('produit', as_index=False)['total']
              .sum()
              .sort_values('total', ascending=False)
              .head(n))
```

### `src/etl_io.py` — I/O
```python
from pathlib import Path
import pandas as pd

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / 'data'
REPORTS = BASE / 'reports'
FIGS = REPORTS / 'figures'
REPORTS.mkdir(exist_ok=True)
FIGS.mkdir(exist_ok=True)

def read_src() -> pd.DataFrame:
    return pd.read_csv(DATA / 'ventes.csv')


def write_report_mensuel(df: pd.DataFrame) -> None:
    df.to_csv(REPORTS / 'report_mensuel.csv')


def write_top_produits(df: pd.DataFrame) -> None:
    df.to_csv(REPORTS / 'top_produits.csv', index=False)


def save_plot(fig, name: str) -> None:
    fig.savefig(FIGS / name, bbox_inches='tight')
```

### `src/etl_cli.py` — CLI
```python
import argparse
import matplotlib.pyplot as plt
from etl_io import read_src, write_report_mensuel, write_top_produits, save_plot
from etl_core import nettoie, agr_mensuel, top_produits

parser = argparse.ArgumentParser(prog='etl')
parser.add_argument('--top', type=int, default=5, help='Top N produits')
args = parser.parse_args()

# ETL
raw = read_src()
df = nettoie(raw)
mensuel = agr_mensuel(df)
topN = top_produits(df, n=args.top)

# sortie CSV
write_report_mensuel(mensuel)
write_top_produits(topN)

# figure (matplotlib)
fig, ax = plt.subplots(figsize=(6,3))
ax.plot(mensuel.index, mensuel['total_mensuel'], label='Total mensuel')
ax.set_title('Ventes mensuelles')
ax.set_xlabel('Date'); ax.set_ylabel('Total')
ax.legend(); fig.tight_layout()
save_plot(fig, 'ventes_mensuelles.png')
print('OK : reports + figure générés')
```

### `tests/test_core.py` — tests unitaires
```python
import unittest
import pandas as pd
from etl_core import nettoie, agr_mensuel, top_produits

class TestCore(unittest.TestCase):
    def setUp(self):
        self.src = pd.DataFrame({
            'date': ['2025-12-28','2025-12-29','bad','2026-01-02'],
            'produit': ['Widget','Gadget','Widget','Gizmo'],
            'quantite': [3,2,1,5],
            'prix': [19.9,29.0,20.0,9.9]
        })

    def test_nettoie(self):
        df = nettoie(self.src)
        self.assertTrue(df['date'].dtype.kind in ('M','m'))
        self.assertIn('total', df.columns)

    def test_agr_mensuel(self):
        df = nettoie(self.src)
        m = agr_mensuel(df)
        self.assertIn('total_mensuel', m.columns)

    def test_top(self):
        df = nettoie(self.src)
        top = top_produits(df, 2)
        self.assertEqual(len(top), 2)

if __name__ == '__main__':
    unittest.main()
```

---

## ▶️ Exécution
```bash
# depuis la racine 'projet_etl/'
python -m src.etl_cli --top 5
python -m unittest discover -s tests -p 'test_*.py'
```

---

## ⚠️ Pièges & bonnes pratiques
- **I/O** : basez les chemins sur `__file__` et créez les dossiers de sortie.  
- **Nettoyage** : parse des dates au début, gestion des NA, dtypes explicites.  
- **Séparation** : cœur métier **pur**; I/O et plotting aux **frontières**.  
- **Tests** : couvre `nettoie`, `agr_mensuel`, `top_produits`.

---

## 📦 Extensions (idées)
- Export **Parquet**; ajout d’une **ligne de commande** `--mois YYYY-MM` pour filtrer.  
- Ajout d’un **tableau de bord** simple (Streamlit) en bonus.
