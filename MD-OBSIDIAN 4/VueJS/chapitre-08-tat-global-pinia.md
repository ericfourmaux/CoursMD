
# 📘 Chapitre 08 — État global : Pinia

🎯 **Objectifs**
- Créer des **stores** typés, avec **state/getters/actions**.
- Partager l’état entre pages ; persister dans `localStorage`.

🧠 **Concepts**
- **Store** = module d’état global ; **getters** = dérivées ; **actions** = mutations contrôlées.

🧪 **Exemple — store panier**
```ts
import { defineStore } from 'pinia'

export const useCart = defineStore('cart', {
  state: () => ({ items: [] as { id:number, name:string, price:number, qty:number }[] }),
  getters: {
    total: (s) => s.items.reduce((sum, it) => sum + it.price * it.qty, 0),
  },
  actions: {
    add(it) { this.items.push(it) },
    remove(id) { this.items = this.items.filter(it => it.id !== id) },
  },
})
```

💡 **Analogie**
- Pinia = **registre central** ; les composants y **déposent** et **consultent** l’état partagé.

⚠️ **Pièges**
- Muter l’état **hors actions** dans des libs externes → difficile à tracer.

✅ **Bonnes pratiques**
- Regrouper **logique métier** dans les **actions** ; typer les items.

🧩 **Exercice**
- Ajoutez persistance `localStorage` pour le store panier.

📝 **Résumé essentiel**
- Pinia **structure** l’état global ; **getters** pour dérivées, **actions** pour mutations.


## 🧭 Légende des icônes
- 📘 **Chapitre**
- 🎯 **Objectifs**
- 🧠 **Concept clé**
- 🔍 **Pourquoi ?**
- 🧪 **Exemple**
- 💡 **Analogie**
- ⚠️ **Pièges**
- ✅ **Bonnes pratiques**
- 🛠️ **Mise en pratique**
- 🧩 **Exercice**
- 📝 **Récap**
- 🔗 **Ressources**
- 🧰 **Outils**
- 🔒 **Sécurité**
- 🚀 **Déploiement**
- 🧪🧰 **Tests & Qualité**
- 🌐 **i18n**
- 🧭 **Architecture**
- ⚙️ **Tooling**
- 📊 **Performance**
- 🧱 **Interop**
