 
# 📚 Chapitre 14 — **(Option) Introduction Data : NumPy, Pandas, Matplotlib**

> [!NOTE]
> Chapitre optionnel pour s'initier au trio data scientifique Python : **NumPy** (tableaux n-dimensionnels), **Pandas** (Series/DataFrame), et **Matplotlib** (visualisation). On pose des bases pratiques, avec le pourquoi, analogies, exemples, pièges, exercices, récap et mini-quiz.

---

## 🎯 Objectifs pédagogiques
- Comprendre les **tableaux** NumPy, la **vectorisation** et le **broadcasting**.  
- Manipuler des **Series** et **DataFrame** Pandas (chargement, sélection, transformation, agrégation).  
- Visualiser avec **Matplotlib** (courbes, barres, histogrammes, styles).  
- Connaître les **pièges** fréquents (copie vs vue, types, NA, chained assignment) et les **bonnes pratiques**.

---

## 🧠 Concepts clés

### 🧠 NumPy — tableau n-dimensionnel
- **ndarray**: conteneur dense de valeurs **homogènes** (même dtype).  
- **Vectorisation**: opérations élémentaires appliquées à tout un tableau (plus concis et performant que des boucles Python).  
- **Broadcasting**: extension implicite des dimensions compatibles pour opérer.

**Schéma ASCII — broadcasting simple**
```
A shape (3, 1)   +   B shape (1, 4)  =>  C shape (3, 4)
[[a],[b],[c]]    +   [[x,y,z,w]]     =>  additions par expansion
```

### 🧠 Pandas — Series & DataFrame
- **Series**: colonne étiquetée (index).  
- **DataFrame**: table 2D (lignes/colonnes) avec schéma flexible.  
- **Index & colonnes**: clés d'alignement pour merges/joins.

### 🧠 Matplotlib — visualisation de base
- API **pyplot** (impérative) pour figures/axes; style configurable.  
- Graphes: **line plot**, **bar**, **hist**, **scatter**; titres/labels/légendes.

> [!TIP]
> Commencez simple: un **line plot** pour séries temporelles, un **bar** pour catégories, un **hist** pour distributions.

---

## ❓ Pourquoi ces outils ?
- **NumPy**: base numérique performante; prérequis de nombreux libs.  
- **Pandas**: manipulations de données **expressives** et robustes.  
- **Matplotlib**: visualisation **standard** et extensible.

---

## 🧪 Exemples concrets (progressifs)

> [!NOTE]
> Exemples illustratifs; l'installation des packages est nécessaire dans votre environnement de dev (`pip install numpy pandas matplotlib`).

### NumPy — création et opérations
```python
import numpy as np

# tableau 1D
x = np.array([1, 2, 3, 4])
# vectorisation
y = x * 10             # [10, 20, 30, 40]
# broadcasting
M = np.array([[1], [2], [3]])   # shape (3,1)
N = np.array([10, 20, 30, 40])  # shape (4,)
C = M + N                        # shape (3,4)
# agrégations
print(x.mean(), x.sum())
# masques booléens
mask = x % 2 == 0
print(x[mask])  # [2, 4]
```

### Pandas — chargement, sélection, transformation
```python
import pandas as pd

# charger CSV
df = pd.read_csv('ventes.csv')  # colonnes: date, produit, quantite, prix
# types & aperçu
print(df.dtypes)
print(df.head())
# nouvelle colonne
df['total'] = df['quantite'] * df['prix']
# sélection
subset = df.loc[df['produit'] == 'Widget', ['date', 'total']]
# groupby/agg
agg = df.groupby('produit', as_index=False)['total'].sum()
# tri
agg = agg.sort_values('total', ascending=False)
```

### Pandas — index temporel & NA
```python
# parser dates
df['date'] = pd.to_datetime(df['date'])
df = df.set_index('date').sort_index()
# resample mensuel
mensuel = df['total'].resample('M').sum()
# valeurs manquantes
mensuel = mensuel.fillna(0)
```

### Matplotlib — tracés simples
```python
import matplotlib.pyplot as plt

# line plot
plt.figure(figsize=(6,3))
plt.plot(mensuel.index, mensuel.values, label='Total mensuel')
plt.title('Ventes mensuelles')
plt.xlabel('Date')
plt.ylabel('Total')
plt.legend()
plt.tight_layout()
plt.show()

# bar plot (top produits)
plt.figure(figsize=(6,3))
plt.bar(agg['produit'], agg['total'])
plt.xticks(rotation=45, ha='right')
plt.title('Top produits (total)')
plt.tight_layout()
plt.show()
```

---

## 🔧 Pratique guidée

### Pipeline mini-ETL avec Pandas
```python
import pandas as pd

raw = pd.read_csv('orders.csv')
# nettoyage
raw['date'] = pd.to_datetime(raw['date'], errors='coerce')
raw = raw.dropna(subset=['date', 'prix'])
raw['client'] = raw['client'].str.strip().str.title()
# agrégation
report = raw.groupby(pd.Grouper(key='date', freq='M')).agg(
    total=('prix', 'sum'),
    count=('prix', 'size')
)
# export
report.to_csv('report_mensuel.csv', index=True)
```

### NumPy vectorisation vs boucle Python
```python
import numpy as np
import math
# boucle Python
vals = [math.sqrt(i) for i in range(10_000)]
# NumPy vectorisé
arr = np.arange(10_000)
vals_np = np.sqrt(arr)
```

---

## ⚠️ Pièges courants (et solutions)

### 1) Pandas chained assignment
```python
# ⚠️ peut déclencher SettingWithCopyWarning
sub = df[df['produit'] == 'Widget']
sub['total'] = sub['quantite'] * sub['prix']  # ambigu (vue vs copie)
# ✅ utiliser .loc sur l'objet source
mask = df['produit'] == 'Widget'
df.loc[mask, 'total'] = df.loc[mask, 'quantite'] * df.loc[mask, 'prix']
```

### 2) Types & NA
```python
# ⚠️ object vs float/int; NaN force float
# ✅ convertir/normaliser (astype), utiliser Int64 pour entiers avec NA
```

### 3) Copie vs vue (NumPy/Pandas)
```python
# ⚠️ certaines opérations renvoient une vue; modifications inattendues
# ✅ utiliser .copy() si vous avez besoin d'un objet indépendant
```

### 4) Axes & shapes (NumPy)
```python
# ⚠️ erreurs de shape
# ✅ vérifier .shape et utiliser reshape/expand_dims
```

### 5) Styles Matplotlib
```python
# ⚠️ figures illisibles
# ✅ titres/labels/clarté; plt.tight_layout(); rotation des ticks
```

---

## 💡 Astuces de pro
- **Vectorisez** quand possible; évitez les boucles Python sur grandes séries.  
- **.loc** pour des assignations sûres en Pandas.  
- **Types** explicites (dtypes) et **parse** des dates dès le chargement.  
- **Plots**: axes, labels, unités, légende, titre; enregistrez avec `plt.savefig(...)`.  
- **Séparez** ETL (nettoyage), analyse (groupby/agg) et visualisation.

---

## 🧪🧮 Mini-formules (en Python)

### One-hot simple (Pandas)
```python
dummies = pd.get_dummies(df['categorie'], prefix='cat')
df2 = pd.concat([df, dummies], axis=1)
```

### Rolling mean (Pandas)
```python
roll = df['total'].rolling(window=7, min_periods=1).mean()
```

### Normalisation min-max (NumPy)
```python
x = np.array([1.0, 2.0, 4.0])
x_norm = (x - x.min()) / (x.max() - x.min())
```

---

## 🧩 Exercices (avec indications)

1. **Top N produits**: charger `ventes.csv`, créer `total`, agréger par produit, trier, afficher **Top 5** et tracer un **bar**.  
   *Indications*: `groupby`, `sum`, `sort_values`, `plt.bar`.

2. **Série temporelle**: convertir `date` en datetime, **resample mensuel**, tracer la série, calculer la **moyenne mobile 3 mois**.  
   *Indications*: `pd.to_datetime`, `set_index`, `resample`, `rolling`.

3. **Nettoyage NA**: détecter colonnes avec NA, remplir/prétraiter, documenter vos choix.  
   *Indications*: `isna`, `fillna`, `dropna`, `astype`.

4. **Broadcasting**: appliquer une transformation vectorisée `arr * scale + bias` sur un tableau 2D avec `scale` shape (n,) et `bias` shape (1,).  
   *Indications*: shapes compatibles.

5. **Chained assignment**: produire un exemple qui déclenche l'avertissement, corriger avec `.loc` et expliquer la différence.

---

## 🧭 Récap — A retenir absolument
- **NumPy**: ndarrays homogènes, **vectorisation**, **broadcasting**.  
- **Pandas**: Series/DataFrame, sélection `.loc`, groupby/agg, dtypes/NA, index temporel.  
- **Matplotlib**: graphiques simples bien annotés; mise en page `tight_layout`.  
- **Pièges**: chained assignment, vue vs copie, types imprécis, shapes.

---

## ✅ Checklist de compétence
- [ ] Je manipule des **ndarrays** (formes, dtypes, vectorisation).  
- [ ] Je sais charger/transformer **DataFrame** et agréger.  
- [ ] Je trace des **courbes**/**barres**/**histogrammes** correctement annotés.  
- [ ] Je connais `.loc` et j'évite **chained assignment**.  
- [ ] Je gère dtypes et NA proprement.

---

## 🧪 Mini-quiz

1) Pour des assignations sûres en Pandas, on préfère:  
   a) `df[col] = ...`  
   b) `df.loc[mask, col] = ...`  
   c) `df.iloc[...] = ...` uniquement

2) Le broadcasting permet:  
   a) d'aligner des shapes compatibles sans boucles explicites  
   b) d'interdire l'addition de tableaux  
   c) de convertir automatiquement les dtypes

3) En Matplotlib, pour éviter les débordements de labels, on utilise souvent:  
   a) `plt.tight_layout()`  
   b) `plt.force_layout()`  
   c) `plt.autosize()`

*Réponses attendues*: 1) b  2) a  3) a

---

> [!NOTE]
> Fin du tronc commun. Vous pouvez poursuivre avec des **projets** ou modules avancés (web, data, automation).
