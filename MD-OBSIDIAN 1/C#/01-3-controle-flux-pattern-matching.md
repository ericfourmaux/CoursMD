
# 📘 Chapitre 1.3 — Contrôle de flux & Pattern Matching

> **Niveau** : Débutant — **Objectif** : structurer le code avec `if/else`, `switch`, boucles (`for/while/foreach`) et utiliser le **pattern matching** moderne de C# pour écrire du code plus expressif et sûr.

---

## 🎯 Objectifs d’apprentissage
- Savoir choisir entre `if`, `switch`, `for`, `while`, `foreach` selon le problème.
- Comprendre `switch` **expression** et les **patterns** (type/relational/guard `when`).
- Éviter les boucles **infinies** et utiliser **`break`/`continue`** intelligemment.

---

## 🧠 Concepts clés

### 🔀 Contrôle de flux
- `if/else` : branches **conditionnelles**.
- `switch` : **dispatch** selon une valeur (ou une forme via patterns).
- Boucles : `for` (compteur), `while` (condition), `foreach` (itération sur collection).

### 🎭 Pattern Matching
- **Type pattern** : `x is string s` extrait et **cast**.
- **Relational pattern** : `x is > 0 and < 10`.
- **Guard `when`** : condition supplémentaire.

### 🧭 Pourquoi c’est important
- Des structures de contrôle claires = code **lisible** et **maintenable**.  
- Le pattern matching **réduit** les casts manuels et **évite** des erreurs de type.

### 🧩 Analogie
- Le **`switch`** est comme un **standard téléphonique** qui redirige un appel selon des **critères** : numéro, catégorie, priorité.

---

## 💡 Exemples (C#)

```csharp
// if / else
int score = 85;
string mention;
if (score >= 90) mention = "A";
else if (score >= 80) mention = "B";
else mention = "C";

// switch basique
string role = "admin";
string permissions = role switch
{
    "admin" => "all",
    "editor" => "write",
    "viewer" => "read",
    _ => "none"
};

// Pattern matching (type + guard)
object o = "Hello";
int longueur = o switch
{
    string s when s.Length < 10 => s.Length,
    string s => s.Length,
    Array a => a.Length,
    null => 0,
    _ => 0
};

// Relational pattern
int n = 5;
string categorie = n switch
{
    < 0 => "negatif",
    0 => "zero",
    > 0 and < 10 => "petit",
    >= 10 => "grand"
};

// Boucles
for (int i = 0; i < 3; i++)
{
    Console.WriteLine(i);
}

int j = 0;
while (j < 3)
{
    if (j == 1) { j++; continue; } // sauter
    Console.WriteLine(j);
    j++;
}

foreach (var x in new[] {1,2,3})
{
    Console.WriteLine(x);
}
```

---

## 🧱 Schéma ASCII — Choisir sa structure

```
Problème →
  ├─ Condition simple ? → if/else
  ├─ Plusieurs cas distincts ? → switch (patterns si nécessaire)
  └─ Répéter ? →
       ├─ Compteur connu → for
       ├─ Tant que condition vraie → while
       └─ Parcourir une collection → foreach
```

---

## 🔧 Exercices guidés
1. Écris une **fonction** qui catégorise un **utilisateur** selon son rôle et son âge (patterns `when`).  
2. Parcours une **liste** et arrête-toi dès que tu trouves une valeur cible (`break`).

```csharp
// 1) Catégorisation
string CategorieUtilisateur(object u)
{
    return u switch
    {
        (string role, int age) t when t.role == "admin" && t.age >= 18 => "admin_adulte",
        (string role, int age) t when t.role == "viewer" && t.age < 18 => "viewer_mineur",
        _ => "autre"
    };
}

// 2) Recherche avec break
bool Contient(List<int> list, int cible)
{
    foreach (var v in list)
    {
        if (v == cible) return true; // break implicite par return
    }
    return false;
}
```

*(Astuce : les tuples `(string,int)` sont pratiques pour passer des groupes de données.)*

---

## 🧪 Tests / Vérifications
- Vérifie que `CategorieUtilisateur(("admin", 20)) == "admin_adulte"`.
- Vérifie que `Contient([1,2,3], 2)` retourne `true`.

---

## ⚠️ Pièges fréquents
- Oublier le cas **par défaut** (`_`) dans un `switch`.
- Boucles **infinies** (`while(true)` sans condition de sortie).  
- Casts manuels **dangereux** (`(string)o`) au lieu de `is` et pattern matching.

---

## 🧮 Formules (en JavaScript)
- **Somme contrôlée** : `const sum = arr.filter(x=>x!=null).reduce((s,x)=>s+x,0);`

---

## 📌 Résumé essentiel
- Choisis la structure de contrôle **adaptée** au problème.  
- Le **pattern matching** rend le code plus **expressif** et **sûr**.  
- `switch` expression + patterns = branches claires, sans boilerplate.
