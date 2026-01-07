 
# 📝 Fiche mémo — **NumPy**

> Objectif : mémoriser rapidement les **bases utiles** de NumPy (création, formes, dtypes, slicing, masques, broadcasting, agrégations, algèbre linéaire, pseudo‑aléatoire) et les **pièges** courants.

---

## 🚀 Démarrage
```python
import numpy as np
np.__version__  # vérifier la version
```

### Création
```python
np.array([1, 2, 3])              # depuis liste
np.arange(0, 10, 2)              # 0..8 par pas 2
np.linspace(0, 1, 5)             # 5 valeurs entre 0 et 1
np.zeros((3, 4))                 # matrice 3x4 de zéros
np.ones((2, 2), dtype=np.float32) # avec dtype
np.eye(3)                        # matrice identité
```

### Forme & dtype
```python
A.shape          # (n, m, ...)
A.ndim           # nombre de dimensions
A.dtype          # type (ex. float64)
A.astype(np.int64)  # conversion
```

### Reshape & axes
```python
A.reshape(3, 4)          # nouvelle vue si possible
A.ravel()                # aplati (vue si possible)
A.T                      # transposé
np.expand_dims(A, axis=0) # ajoute une dimension
```

### Indexation & slicing
```python
A[0, 1]                 # élément
A[1:4, :2]              # tranches
A[:, -1]                # dernière colonne
A[A > 0]                # masque booléen
```

### Broadcasting (expansion implicite)
```python
M = np.array([[1],[2],[3]])    # (3,1)
N = np.array([10, 20, 30, 40]) # (4,)
C = M + N                      # -> (3,4)
```

### Ufuncs & agrégations
```python
np.sqrt(A)                 # ufunc élémentaire
np.add(A, B)               # ufunc binaire
A.sum(axis=0), A.mean(axis=1)  # agrégations par axe
np.max(A), np.min(A)
```

### Empilement & concaténation
```python
np.concatenate([A, B], axis=0)
np.stack([v1, v2, v3], axis=1)
np.hstack([c1, c2])
np.vstack([r1, r2])
```

### Algèbre linéaire (module `numpy.linalg`)
```python
import numpy.linalg as LA
LA.norm(v)               # norme
LA.inv(M)                # inverse
LA.solve(M, b)           # système linéaire
LA.svd(M)                # SVD
```

### Pseudo‑aléatoire (module `numpy.random`)
```python
rng = np.random.default_rng(42)  # générateur (reproductible)
rng.random((2, 3))               # uniformes [0,1)
rng.integers(0, 10, size=5)      # entiers
rng.normal(loc=0, scale=1, size=100)
```

### I/O simple
```python
np.save('arr.npy', A)     # binaire .npy
B = np.load('arr.npy')
np.savetxt('arr.csv', A, delimiter=',', fmt='%.6f')
```

---

## ⚠️ Pièges courants
- **Vue vs copie** : certaines opérations renvoient une **vue**; modif. répercute. Utiliser `A.copy()` si indépendance voulue.  
- **Dtypes & upcasting** : mélanges int/float → promotion; vérifiez `dtype`.  
- **Shapes incompatibles** : broadcasting nécessite **dimensions compatibles** (1 ou égales).  
- **NaN** dans entiers : privilégier dtype flottant ou utiliser `np.nan` sur float.

---

## 💡 Astuces
- Préférez la **vectorisation** aux boucles Python pour performance/concision.  
- Utilisez `default_rng` (API moderne) au lieu de l’ancien `np.random` global.  
- Pensez **axes** : `axis=0` (colonnes), `axis=1` (lignes) pour matrices 2D.
