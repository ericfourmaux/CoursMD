
# 📘 Chapitre 12 — Tests (Unitaires & E2E)

🎯 **Objectifs**
- Tester composants avec **Vitest + Vue Test Utils**.
- Tester E2E avec **Playwright/Cypress**.

🧠 **Concepts**
- **Unitaires** = petite unité ; **E2E** = scénario utilisateur.
- **Mock** des dépendances ; **coverage** ; **snapshot** (avec parcimonie).

🛠️ **Exemple — test simple**
```ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Counter from '@/components/Counter.vue'

describe('Counter', () => {
  it('increments', async () => {
    const wrapper = mount(Counter)
    await wrapper.find('button').trigger('click')
    expect(wrapper.text()).toContain('1')
  })
})
```

💡 **Analogie**
- Les tests sont des **filets de sécurité** qui permettent de **jongler** sans peur avec le code.

⚠️ **Pièges**
- Tester l’**implémentation** au lieu du **comportement**.

✅ **Bonnes pratiques**
- Couvrir les **cas critiques** (auth, paiements, formulaires).

🧩 **Exercice**
- Écrire un test E2E de login (formulaire, redirection, message d’erreur).

📝 **Résumé essentiel**
- Un mix **unitaires + E2E** apporte confiance ; tester **comportements** réels.


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
