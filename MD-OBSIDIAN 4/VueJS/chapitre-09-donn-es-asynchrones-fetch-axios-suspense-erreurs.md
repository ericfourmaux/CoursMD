
# 📘 Chapitre 09 — Données asynchrones (fetch/axios, Suspense, erreurs)

🎯 **Objectifs**
- Appeler une API, gérer **loading**, **erreurs**, **retry**.
- Utiliser **`Suspense`** pour des composants asynchrones.

🧠 **Concepts**
- **Fetch API** ou **axios** ; **abort controller** pour annuler.
- **Stratégies de cache** (simple) ; **backoff** pour retry.

🛠️ **Composables — useApi**
```ts
export async function apiGet(url, { signal } = {}) {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function retry(fn, attempts = 3) {
  let lastErr
  for (let i = 0; i < attempts; i++) {
    try { return await fn() } catch (e) { lastErr = e }
    await new Promise(r => setTimeout(r, (i+1) * 300))
  }
  throw lastErr
}
```

💡 **Analogie**
- `Suspense` est comme un **rideau de scène** : il s’ouvre quand tout est prêt.

⚠️ **Pièges**
- Ignorer les erreurs réseau ; ne pas annuler les **requests** en navigation.

✅ **Bonnes pratiques**
- Afficher **skeletons** ; journaliser les **erreurs** ; distinguer **vide** de **erreur**.

🧩 **Exercice**
- Implémentez une liste paginée avec loader, erreur, et retry.

📝 **Résumé essentiel**
- Gérez le **cycle réseau** : loading, succès, erreur ; `Suspense` pour orchestrer l’attente.


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
