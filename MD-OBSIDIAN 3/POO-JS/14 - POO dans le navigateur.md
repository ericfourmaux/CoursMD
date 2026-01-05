
# 📘 Chapitre 14 — POO côté navigateur : DOM, événements & MVC minimal

> 🎯 **Objectifs** : architecturer une UI avec objets (Model, View, Controller).

---

## 🧠 Concepts
- **Observer** pour synchroniser modèle/vue.
- **Controller** orchestre les interactions.

---

## 🧩 Exemple : Todo MVC minimal
```js
class TodoModel {
  constructor(){ this.items=[]; this.listeners=[]; }
  add(text){ this.items.push({text,done:false}); this._emit(); }
  toggle(i){ this.items[i].done=!this.items[i].done; this._emit(); }
  onChange(fn){ this.listeners.push(fn); }
  _emit(){ this.listeners.forEach(fn=>fn(this.items)); }
}

class TodoView {
  constructor(root){ this.root=root; }
  render(items){
    this.root.innerHTML = items.map((it,i)=>`<li data-i="${i}">${it.done?'✅':'⬜'} ${it.text}</li>`).join('');
  }
}

class TodoController {
  constructor(model, view){ this.model=model; this.view=view; this.model.onChange(items=>this.view.render(items)); }
  bind(root){ root.addEventListener('click', e=>{ const li=e.target.closest('li'); if(!li) return; this.model.toggle(Number(li.dataset.i)); }); }
}
```

---

## 📈 Schéma
```
[Model] --(Observer)--> [View]
   ^                     |
   |                     v
 [Controller] <--- DOM events
```

---

## 🔗 Références
- MDN DOM Events: https://developer.mozilla.org/fr/docs/Web/API/Event

---

## 🧭 Exercices
1. Ajoutez une input pour créer des todos.
2. Séparez la View en sous‑vues (liste, formulaire).

---

## ✅ Résumé
- MVC minimal organise la UI en **objets** coopérants.
- L’**Observer** aligne modèle et vue.
