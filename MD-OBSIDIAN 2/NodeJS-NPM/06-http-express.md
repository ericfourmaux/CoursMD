
# 🌐 Chapitre 6 — HTTP & Express (routing, middlewares, streaming, sécurité)

> [!NOTE] Objectifs du chapitre
> - Comprendre le **module HTTP natif** de Node (serveur, requête, réponse, statut, en-têtes). citeturn8search214  
> - Construire des APIs avec **Express 5.x** : routing, middlewares, `req`/`res`, JSON, fichiers. citeturn8search273turn8search261  
> - Gérer les **erreurs** (sync/async, `next(err)`), avec les évolutions d’Express 5. citeturn8search208  
> - **Streamer** des réponses et traiter le **backpressure** (flux, `pipeline`). citeturn8search250turn8search249  
> - Sécuriser un serveur : **Helmet**, **CORS**, **rate limiting**, **compression**. citeturn8search237turn8search202turn8search231turn8search243

---

## 6.1 🔎 HTTP natif de Node.js

### Créer un serveur
```js
// ESM
import http from 'node:http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, HTTP');
});

server.listen(3000, () => console.log('http://localhost:3000'));
```
- `http.createServer()` reçoit `(req, res)`, instances de **streams** (`IncomingMessage`/`ServerResponse`). citeturn8search214
- Les **en‑têtes**, le **status** et la **méthode** sont accessibles via l’API HTTP. citeturn8search214

### Codes de statut essentiels
- 200 (OK), 201 (Created), 204 (No Content), 301/302 (Redirect), 400 (Bad Request), 404 (Not Found), 429 (Too Many Requests), 500 (Internal Server Error). citeturn8search220

> [!TIP]
> En Node, `res.writeHead(status, headers)` et `res.end()` terminent la réponse. Les clients interprètent les codes selon la **RFC 9110** (MDN). citeturn8search214turn8search220

---

## 6.2 🚀 Express 5.x en pratique

### Installer et version
```bash
npm i express
```
- Express 5.x est la version actuelle (ex : 5.2.1) et **requiert Node 18+**. citeturn8search226turn8search228

### Démarrage & routing
```js
import express from 'express';
const app = express();

app.get('/', (req, res) => res.send('Hello World'));
app.post('/users', (req, res) => res.status(201).json({ ok: true }));

app.listen(3000);
```
- Le **routing** se définit via `app.METHOD(PATH, HANDLER)` (`get`, `post`, etc.). citeturn8search275
- `app.all()` applique un handler à **toutes** les méthodes, `app.use()` pour **middlewares**. citeturn8search274

### Middlewares indispensables
```js
app.use(express.json());            // parse JSON
app.use(express.urlencoded({ extended: false })); // parse form
```
- `express.json()`/`express.urlencoded()` sont **intégrés** et basés sur *body-parser*, avec options (`limit`, `strict`, etc.). citeturn8search261
- Un middleware a la forme `(req, res, next)` et doit appeler `next()` s’il ne termine pas la réponse. citeturn8search255

### Objet réponse (`res`) : méthodes clés
```js
res.status(201).json({ id });     // JSON + code
res.sendFile('index.html', { root: __dirname }); // fichier
res.redirect('/login');           // redirection
```
- `res.send()`, `res.json()`, `res.sendFile()`, `res.redirect()`, `res.cookie()`… **étendent** `http.ServerResponse`. citeturn8search268
- `res.sendFile()` accepte des **options** (cache, `immutable`, `acceptRanges`, `root`, etc.). citeturn8search269

> [!WARNING]
> Sécurisez les chemins fournis à `res.sendFile()` (utilisez `root` pour éviter l’**escalade** de répertoires). citeturn8search269

---

## 6.3 🧰 Gestion des erreurs

### Principe général
```js
// Middleware d’erreurs (signature à 4 paramètres)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: 'Internal Error' });
});
```
- Un **middleware d’erreurs** a la forme `(err, req, res, next)` et intercepte les erreurs propagées. citeturn8search208

### Sync / Async (Express 5)
```js
app.get('/user/:id', async (req, res) => {
  const user = await getUserById(req.params.id); // rejette → capturé
  res.json(user);
});
```
- En **Express 5**, une **promesse rejetée** ou une erreur lancée dans un handler **appelle automatiquement** `next(err)`. citeturn8search208

> [!TIP]
> En Express 4, il fallait **catcher** et passer l’erreur à `next(err)` manuellement. citeturn8search221

---

## 6.4 📡 Streaming & backpressure

### Streamer une réponse
```js
app.get('/stream.csv', (req, res) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.write('id,name\n');
  for (let i = 0; i < 5; i++) res.write(`${i},User${i}\n`);
  res.end();
});
```
- En Express, `res` est un **Writable stream** : `res.write()` + `res.end()` permettent le flux **par morceaux**. citeturn8search266

### Backpressure (flux Node)
- Utilisez `stream.pipeline()` (ou la version **promises**) pour **chaîner** des flux avec gestion d’erreurs et de pression. citeturn8search250  
- Le **backpressure** est l’accumulation de données lorsque le consommateur est plus lent que la source ; les **streams** appliquent un **flow control**. citeturn8search249

---

## 6.5 🛡️ Sécurité & robustesse

### Helmet (en‑têtes de sécurité)
```js
import helmet from 'helmet';
app.use(helmet());
```
- Ajoute notamment **CSP**, **HSTS**, **X‑Content‑Type‑Options**, **Referrer‑Policy**, etc. (configurable). citeturn8search237

### CORS
```js
import cors from 'cors';
app.use(cors({ origin: ['https://example.com'], credentials: true }));
```
- Le middleware officiel **CORS** permet de gérer origines, pré‑requêtes `OPTIONS`, etc. citeturn8search202

### Rate limiting
```js
import { rateLimit } from 'express-rate-limit';
app.use(rateLimit({ windowMs: 15*60*1000, limit: 100 }));
```
- Limite les requêtes par IP, expose les en‑têtes **RateLimit** (config `standardHeaders`), supporte stores externes. citeturn8search231

### Compression
```js
import compression from 'compression';
app.use(compression());
```
- Compresse les **réponses** (gzip/deflate/Brotli) si le **client** les supporte ; évite `Cache-Control: no-transform`. citeturn8search243

### Logging HTTP (morgan)
```js
import morgan from 'morgan';
app.use(morgan('dev'));
```
- `morgan` propose des **formats prédéfinis** (`dev`, `combined`, `tiny`) et la **personnalisation** via tokens. citeturn8search196

> [!TIP]
> Placez `helmet`, `cors`, `rateLimit`, `compression`, et `morgan` **avant** vos routes pour protéger/observer tout le trafic. citeturn8search255

---

## 6.6 📁 Fichiers & téléchargements
```js
import path from 'node:path';
app.get('/download', (req, res) => {
  res.download(path.join(process.cwd(), 'files/report.pdf'));
});
```
- `res.download()`/`res.sendFile()` gèrent **type MIME**, **cache**, **ranges** (`acceptRanges`) et en‑têtes. citeturn8search269

---

## 6.7 🧪 Exercices pratiques

### Ex. A — API REST complète
1) Créez `/users` (GET/POST), `/users/:id` (GET/PUT/DELETE) avec statuts **200/201/204/404/422** pertinents. citeturn8search220  
2) Ajoutez `express.json()` + validation simple.

### Ex. B — Erreurs & promesses
- Implémentez un handler `async` qui **rejette** ; vérifiez que le middleware d’erreurs récupère **automatiquement** en Express 5. citeturn8search208

### Ex. C — Streaming & pipeline
- Servez un gros fichier via `fs.createReadStream()` → `compression()` → `res` avec `stream.pipeline()` (promises). citeturn8search250

### Ex. D — Sécurité minimale
- Ajoutez **Helmet**, **CORS**, **rate limiting** et **compression** ; testez les en‑têtes et la négociation d’encodage. citeturn8search237turn8search202turn8search231turn8search243

---

## 6.8 🧭 FAQ
- **Express 5.x, c’est stable ?** Oui, avec un **changelog** actif et des correctifs récents (ex. 5.2.1). citeturn8search225turn8search226  
- **Node requis ?** Express **5** demande **Node 18+**. citeturn8search228  
- **Pourquoi compresser ?** Pour réduire la **bande passante** et accélérer le ressenti ; activez gzip/Brotli via `compression()`. citeturn8search243

---

## 6.9 📘 Résumé
- Node fournit une **API HTTP** complète ; Express ajoute **routing**/**middlewares** et des helpers de réponse. citeturn8search214turn8search273  
- En Express 5, les **promesses rejetées** sont **capturées** automatiquement par le router. citeturn8search208  
- Les **streams** + `pipeline` gèrent **backpressure** et **erreurs** pour des réponses **scalables**. citeturn8search250turn8search249  
- La **sécurité** de base repose sur **Helmet**, **CORS**, **rate limiting**, **compression** et **logging**. citeturn8search237turn8search202turn8search231turn8search243turn8search196

---

### 📎 Téléchargement (Chapitre 6)
- **Fichier Obsidian** : `06-http-express.md` (ce document).

