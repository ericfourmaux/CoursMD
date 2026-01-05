
# 📘 Chapitre 11.4 — TypeScript pour APIs : JSON, Zod, validation & inference

> **Niveau** : Intermédiaire → Avancé — **Objectif** : modéliser des **APIs** en TypeScript avec des **schémas runtime** (Zod), obtenir l’**inférence** statique des **DTOs**, valider/transformer des **payloads JSON**, gérer les **erreurs** proprement, et **générer** des schémas **OpenAPI**/**JSON Schema** pour la **documentation** et les **tests**.

---

## 🎯 Objectifs d’apprentissage
- Définir des **schémas** robustes (Zod) pour **valider** et **parser** des payloads JSON.
- Extraire des **types** statiques à partir des schémas (`z.infer`) pour **aligner** runtime et compile‑time.
- Gérer les **transformations** (dates, enums, unions) et les **erreurs** (`ZodError`) avec des **messages** clairs.
- Générer des **JSON Schema/OpenAPI** et intégrer **tests** (contract tests) et **CI**.
- Construire un **client API** type‑safe (fetch wrapper) et **normaliser** les réponses.

---

## 🧠 Concepts clés

### 🔗 Runtime vs Compile‑time
- **TypeScript** vérifie **à la compilation**, mais ne **valide** pas les données **runtime**.
- Un **schema** runtime (ex. **Zod**) permet de **parser**/valider des objets **JSON**, puis d’**inférer** automatiquement les **types** TS.

### 🧩 Alignement schéma ↔ types
- Un schéma Zod bien défini devient la **source de vérité** : `z.infer<typeof Schema>` offre le **type** correspondant **sans divergence**.

---

## 🧰 Installation & setup

```bash
npm i zod                               # schémas runtime
npm i -D @types/node                    # si nécessaire pour Node
npm i -D zod-to-json-schema openapi3-ts # génération JSON Schema / OpenAPI (exemples)
```

---

## 💡 Définir des schémas & inférer les types

```ts
import { z } from 'zod';

// Schéma de produit
export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  tags: z.array(z.string()).default([]),
  createdAt: z.coerce.date() // coerce depuis string ISO vers Date
});

// Type statique inféré
export type Product = z.infer<typeof ProductSchema>;
```

### Variantes & unions
```ts
// Schéma de création (sans id/createdAt)
export const NewProductSchema = ProductSchema.omit({ id: true, createdAt: true });

// Réponse API (union discriminée)
export const ApiResponseSchema = z.union([
  z.object({ ok: z.literal(true), data: ProductSchema }),
  z.object({ ok: z.literal(false), error: z.string() })
]);
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
```

---

## 🧪 Parser/valider (safe)

```ts
// Parse l'entrée JSON (ex. corps de requête)
export function parseNewProduct(input: unknown): Product {
  const data = NewProductSchema.parse(input); // lève ZodError si invalide
  return { ...data, id: crypto.randomUUID(), createdAt: new Date() };
}

// Variante safe (ne lève pas)
export function safeParseProduct(json: unknown) {
  const res = ProductSchema.safeParse(json);
  return res.success ? { ok: true as const, data: res.data } : { ok: false as const, error: res.error };
}
```

### Gestion des erreurs
```ts
try {
  parseNewProduct({ name: '', price: -1 });
} catch (e) {
  if (e instanceof z.ZodError) {
    // e.format() pour messages structurés
    console.error(e.errors.map(err => `${err.path.join('.')}: ${err.message}`));
  }
}
```

---

## 🌐 Client API type‑safe (fetch wrapper)

```ts
type HttpOk<T> = { ok: true; data: T };
type HttpErr = { ok: false; error: string; status: number };

export async function getProduct(id: string): Promise<HttpOk<Product> | HttpErr> {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) return { ok: false, status: res.status, error: `HTTP ${res.status}` };
  const json = await res.json();
  const parsed = ProductSchema.safeParse(json);
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, status: 500, error: 'Invalid shape' };
}
```

### Normalisation de listes
```ts
export const ProductsListSchema = z.array(ProductSchema);
export type ProductsList = z.infer<typeof ProductsListSchema>;

export async function listProducts(): Promise<HttpOk<ProductsList> | HttpErr> {
  const r = await fetch('/api/products');
  if (!r.ok) return { ok: false, status: r.status, error: 'HTTP ' + r.status };
  const j = await r.json();
  const p = ProductsListSchema.safeParse(j);
  return p.success ? { ok: true, data: p.data } : { ok: false, status: 500, error: 'Invalid list' };
}
```

---

## 🧾 DTOs, mapping & transformations

```ts
// Mapper vers un DTO "public" (exclure champs internes)
const PublicProductSchema = ProductSchema.pick({ id: true, name: true, price: true, tags: true });
export type PublicProduct = z.infer<typeof PublicProductSchema>;

// Exemple transformation: prix TTC
export function toPublic(p: Product, tva = 0.1495): PublicProduct & { priceTtc: number } {
  return { ...PublicProductSchema.parse(p), priceTtc: +(p.price * (1 + tva)).toFixed(2) };
}
```

---

## 🧰 Générer **JSON Schema** & **OpenAPI** (documentation/tests)

```ts
import { zodToJsonSchema } from 'zod-to-json-schema';
import { OpenAPIBuilder } from 'openapi3-ts/oas31';

// JSON Schema
const productJsonSchema = zodToJsonSchema(ProductSchema, 'Product');

// OpenAPI (schémas + endpoints)
const openapi = new OpenAPIBuilder()
  .addTitle('Products API')
  .addVersion('1.0.0')
  .addSchema('Product', productJsonSchema)
  .addPath('/products/{id}', {
    get: {
      summary: 'Get product by id',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      responses: {
        '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } },
        '404': { description: 'Not Found' }
      }
    }
  });

export const openapiDoc = openapi.getSpec();
```

> **Usage** : publier `openapiDoc` dans la CI (artifact), et alimenter des **tests** contractuels (ex. `jest` + **AJV** sur `productJsonSchema`).

---

## 🔐 Sécurité & robustesse (tips)
- **Ne jamais** faire confiance aux **entrées** : `parse`/**`safeParse`** sur **tous** les points d’entrée.
- **Prefer** `coerce` pour **dates**/nombres lorsque les payloads sont **textuels**.
- Utiliser des **enum** (`z.enum([...])`) pour limiter les **valeurs** (roles/états).
- Centraliser les **messages** d’erreur et **traces**; logguer `ZodError.format()` en **non‑prod**.
- **Limiter** les tailles (`z.string().max(...)`, `z.array(z.string()).max(...)`) et **sanitiser** (trim, toLowerCase) via **transform**.

---

## 🧱 Schémas ASCII

### A) Flux typé API
```
Request JSON → Zod.parse → Types inférés → Mapping DTO → Réponse
                                 └─ JSON Schema/OpenAPI (doc/tests)
```

### B) Client type‑safe
```
fetch → json → safeParse(schema)
   ├─ ok: data (type Product)
   └─ err: status + message
```

---

## 🔧 Exercices guidés
1. **Création** : ajoute `POST /products` (NewProductSchema) qui **valide** le corps et renvoie `201` avec `Product`.  
2. **Liste** : bâtis `GET /products?tag=...` et valide `tag` via `z.string().min(1)` (query schema).  
3. **OpenAPI** : expose `/openapi.json` généré et vérifie (en test) que le schéma `Product` **existe** et contient `name`/`price`.

```ts
// 3) Idée (test)
import { openapiDoc } from './openapi';
expect(openapiDoc.components?.schemas?.Product).toBeTruthy();
```

---

## 🧪 Tests / Vérifications (rapides)
```ts
// Parse OK
await expect(ProductSchema.parseAsync({ id: crypto.randomUUID(), name: 'Laptop', price: 999, tags: [], createdAt: new Date() })).resolves.toBeTruthy();

// Parse KO
const bad = ProductSchema.safeParse({ id: 'not-uuid', name: '', price: -1 });
console.log(bad.success === false);

// Client wrapper
const r = await getProduct(crypto.randomUUID());
console.log(r.ok ? r.data.name.length > 0 : r.status >= 400);
```

---

## ⚠️ Pièges fréquents
- **Types TS seuls** (sans schéma) : pas de **garantie runtime** → toujours **valider**.
- **Divergences** schéma ↔ type : modifier **le schéma**, pas seulement le **type** (source de vérité).  
- **`any`** dans le code API : court‑circuit **l’inférence**; préférer `unknown` + **parse**.
- **Erreurs** non structurées : retourne un **format** cohérent (`code`, `message`, `path`).
- **Dates**/nombres textuels : penser `coerce`/`transform`.  
- **Schemas énormes** : factoriser en **sous‑schémas** (compose) pour réutiliser.

---

## 🧮 Formules (JS)
- **Taux de conformité JSON** (naïf)
```javascript
const compliance = (valid, total) => valid / Math.max(1, total);
```
- **Temps de validation** (approx.)
```javascript
const validateCostMs = (n, costPerItemMs) => n * costPerItemMs;
```

---

## 📌 Résumé essentiel
- **Zod** apporte des schémas **runtime** avec **inférence** statique via `z.infer`.
- **Valider**/**parser** toutes les **entrées**; gérer proprement **ZodError** et **coercions**.
- **Générer** **JSON Schema/OpenAPI** pour la **doc** et les **tests** contractuels.
- **Clients** type‑safe + **DTO mapping** assurent des réponses **prédictibles** et **robustes**.
