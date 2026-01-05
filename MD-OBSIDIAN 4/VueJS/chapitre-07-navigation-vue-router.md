
# 📘 Chapitre 07 — Navigation : Vue Router

🎯 **Objectifs**
- Créer des **routes** (pages), gérer **params/queries**, **guards**.
- Faire du **lazy‑loading** et des **layouts**.

🧠 **Concepts**
- `createRouter`, `createWebHistory`, `<RouterLink>`, `<RouterView>`.
- **Routes imbriquées**, **redirections**, **guards** (`beforeEach`).

🧪 **Exemple — config de base**
```ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/pages/Home.vue') },
  { path: '/users/:id', name: 'user', component: () => import('@/pages/User.vue') },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from) => {
  // guard d’auth (exemple)
  if (to.meta.requiresAuth && !isLoggedIn()) return { path: '/login' }
})
```

💡 **Analogie**
- Le Router est un **GPS** : il calcule un **itinéraire** (composants) selon l’URL.

⚠️ **Pièges**
- Abus des **guards** pour de la logique UI non liée à la navigation.
- Oublier `name` pour certaines routes → navigation programmatique pénible.

✅ **Bonnes pratiques**
- Préférer **routes nommées** ; centraliser les **guards**.
- Utiliser le **lazy‑loading** pour réduire le bundle initial.

🧩 **Exercice**
- Créez une route `/dashboard` protégée ; rediriger vers `/login` si non connecté.

📝 **Résumé essentiel**
- Vue Router **orchestré** = navigation **prévisible**, performances via **lazy‑load**.


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
