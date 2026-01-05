# 📘 Chapitre 14 — Patterns avancés

> [!summary]
> 🎯 **Objectif** : Découvrir **CQRS**, **Event Sourcing**, **Change Streams**, TTL/time-series, et le **cache** (Redis).

## 🧭 Légende des icônes

- 📘 **Chapitre**
- 🎯 **Objectifs**
- 🧠 **Concept clé**
- 💡 **Exemple**
- 🧭 **Analogie**
- 🔧 **Pratique / TP**
- 🧰 **Outils**
- 🔎 **À retenir / Checklist**
- ⚠️ **Piège courant**
- 🧪 **Mini-projet**
- 🏁 **Quiz & Évaluation**
- 🧾 **Formule (JavaScript)**

## 🎯 Objectifs
- Mettre en place notifications temps réel via **Change Streams**.
- Comprendre **CQRS** et **Event Sourcing**.
- Utiliser TTL et collections **time-series**.

## 🧠 Concepts clés

### 🧠 CQRS
- **Définition** : séparer lecture/écriture.
- **Pourquoi** : optimiser indépendamment.

### 🧠 Event Sourcing
- **Définition** : stocker **événements** puis reconstruire l’état.
- **Pourquoi** : traçabilité, audit.

### 🧠 Change Streams (MongoDB)
- **Définition** : flux d’événements sur opérations.
- **Pourquoi** : réactions en temps réel.

## 💡 Exemples

> [!example] MongoDB — Change Stream
```javascript
const cs = db.collection('orders').watch();
cs.on('change', (ev) => console.log('order change', ev));
```

> [!example] TTL
```javascript
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

## 🔧 TP — Flux réactif
1. Écoutez `orders` et publiez une notification.
2. Mesurez latence et débit.

## 🔎 À retenir / Checklist
- ✅ Architecture **adaptée** au besoin.
- ✅ TTL pour nettoyage automatique.
- ✅ Cache pour soulager base primaire.

## 📌 Résumé
Les patterns avancés répondent à des **exigences** de temps réel, d’audit, et d’échelle. **Adoptez-les** si le besoin est avéré ; restez **simple** sinon.
