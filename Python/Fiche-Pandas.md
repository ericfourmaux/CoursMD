 
# 📝 Fiche mémo — **Pandas**

> Objectif : mémoriser rapidement les **opérations clés** sur Series/DataFrame : chargement, sélection, filtrage, assignation, agrégation, join/merge, reshape, datetime, NA, export — et **pièges** courants.

---

## 🚀 Démarrage
```python
import pandas as pd
pd.__version__
```

### Chargement & types
```python
df = pd.read_csv('data.csv', dtype={'id': 'Int64'}, parse_dates=['date'])
df.head(); df.info(); df.dtypes
```

### Sélection
```python
df['col']                 # Series
df[['c1','c2']]           # colonnes multiples
# lignes par étiquette/booleen
mask = df['val'] > 0
df.loc[mask, ['c1','c2']] 
# lignes par position
df.iloc[:5, :3]
```

### Filtrage & assignation sûre
```python
mask = df['produit'].str.contains('widget', case=False)
df.loc[mask, 'total'] = df.loc[mask, 'qte'] * df.loc[mask, 'prix']
```

### Groupby & agrégation
```python
agg = (df.groupby('produit', as_index=False)
         .agg(total=('total','sum'), count=('id','size'))
         .sort_values('total', ascending=False))
```

### Join / Merge
```python
left.merge(right, on='id', how='left')   # équi‑jointure
```

### Pivot / Reshape
```python
pd.pivot_table(df, values='total', index='produit', columns='mois', aggfunc='sum')
df.melt(id_vars=['id'], var_name='metric', value_name='value')
```

### Datetime & resample
```python
df['date'] = pd.to_datetime(df['date'])
df = df.set_index('date').sort_index()
mensuel = df['total'].resample('M').sum()
```

### NA & dtypes
```python
df.isna().sum()
df = df.fillna({'qte': 0, 'prix': df['prix'].median()})
df['id'] = df['id'].astype('Int64')   # entier nullable
```

### Strings & categories
```python
df['client'] = (df['client'].str.strip().str.title())
df['prod_cat'] = df['produit'].astype('category')
```

### Export
```python
df.to_csv('out.csv', index=False)
df.to_parquet('out.parquet')  # rapide & compact (nécessite pyarrow)
```

---

## ⚠️ Pièges courants
- **Chained assignment** : `df[df.x>0]['y']=...` → **SettingWithCopyWarning**. Utiliser `df.loc[...] = ...`.  
- **Performance** : éviter `apply` sur grandes DF; préférez opérations **vectorisées**/`map`.  
- **Types implicites** : colonnes `object` ralentissent; convertir (`astype`).  
- **Resample/groupby** : attention à l’**ordre** (trier l’index; clé adéquate).

---

## 💡 Astuces
- `assign`, `pipe` pour **chaîner** proprement.  
- **Index temporel** + `Grouper(freq='M')` pour agrégations calendaire.  
- `query` pour filtres lisibles (attention à l’injection).
