# Mini-Ebook : Bases de Données avec SQL et MongoDB

## Module 1 : Introduction aux Bases de Données
### Concepts clés
- **Base de données** : système permettant de stocker, organiser et interroger des données.
- **Deux grandes familles** :
  - **SQL (relationnel)** : données organisées en tables (MySQL, PostgreSQL).
  - **NoSQL (documentaire)** : données sous forme de documents (MongoDB).

### Différences principales
| Aspect        | SQL (Relationnel)       | MongoDB (NoSQL)          |
|--------------|-------------------------|---------------------------|
| Structure    | Tables, colonnes       | Documents JSON           |
| Schéma       | Fixe                   | Flexible                 |
| Transactions | Oui                    | Oui (mais limitées)      |
| Scalabilité  | Verticale              | Horizontale              |

---

## Module 2 : SQL – Bases Relationnelles
### Concepts
- **Table** = ensemble de lignes et colonnes.
- **Clé primaire** = identifiant unique.
- **Clé étrangère** = lien entre deux tables.
- **Normalisation** = éviter la redondance.

### Commandes essentielles
```sql
CREATE TABLE Utilisateurs (
    id INT PRIMARY KEY,
    nom VARCHAR(50),
    email VARCHAR(100)
);

INSERT INTO Utilisateurs (id, nom, email)
VALUES (1, 'Eric', 'eric@example.com');

SELECT * FROM Utilisateurs;

UPDATE Utilisateurs SET email='nouveau@example.com' WHERE id=1;

DELETE FROM Utilisateurs WHERE id=1;
```

### Exercices
1. Crée une table **Produits** avec `id`, `nom`, `prix`.
2. Ajoute 3 produits.
3. Affiche uniquement les produits dont le prix > 50.
4. Mets à jour le prix d’un produit.
5. Supprime un produit.

---

## Module 3 : MongoDB – Bases Documentaires
### Concepts
- **Document** = objet JSON stocké dans une collection.
- **Collection** = ensemble de documents.
- **Base** = ensemble de collections.

### Commandes essentielles
```javascript
db.utilisateurs.insertOne({
    nom: "Eric",
    email: "eric@example.com"
});

db.utilisateurs.find();

db.utilisateurs.find({nom: "Eric"});

db.utilisateurs.updateOne(
    {nom: "Eric"},
    {$set: {email: "nouveau@example.com"}}
);

db.utilisateurs.deleteOne({nom: "Eric"});
```

### Exercices
1. Crée une collection **produits**.
2. Ajoute 3 documents avec `nom`, `prix`, `stock`.
3. Affiche les produits dont le stock < 10.
4. Mets à jour le stock d’un produit.
5. Supprime un produit.

---

## Module 4 : Comparaison SQL vs MongoDB
- **SQL** : idéal pour données structurées, transactions complexes.
- **MongoDB** : idéal pour données flexibles, scalabilité horizontale.

---

## Module 5 : Bonnes Pratiques
- **SQL** : utiliser des index, normaliser les tables.
- **MongoDB** : indexer les champs utilisés dans les requêtes, éviter les documents trop gros.

---

## Module 6 : Projet Final
- **SQL** : Crée une base pour gérer des utilisateurs et leurs commandes.
- **MongoDB** : Crée une base pour gérer un catalogue de produits avec catégories.
