# TP06-Backend – Intégration MySQL et gestion asynchrone avec Node.js

API REST **Node.js / Express** connectée à **MySQL** : architecture en couches (Routes → Controllers → Services → Repositories), pool de connexions `mysql2`, requêtes paramétrées, validation avec `express-validator`, gestion centralisée des erreurs, recherche paginée et transactions.

> LAB 6 – Module M10 « Développement Backend avec Java, Node.js et PHP » – Master IAIDDWM, semestre 2.

---

## Sommaire

1. [Objectifs](#objectifs)
2. [Technologies](#technologies)
3. [Architecture du projet](#architecture-du-projet)
4. [Installation et lancement](#installation-et-lancement)
5. [Endpoints de l'API](#endpoints-de-lapi)
6. [Déroulement du lab, étape par étape](#déroulement-du-lab-étape-par-étape)
7. [Résultats des tests Postman](#résultats-des-tests-postman)
8. [Point connu](#point-connu)
9. [LAB 7 – Authentification et autorisation avec JWT](#lab-7--authentification-et-autorisation-avec-jwt)

---

## Objectifs

- Comprendre l'intégration de MySQL dans une application Node.js.
- Maîtriser la programmation asynchrone avec `async/await`.
- Appliquer une architecture en couches (Routes-Controllers-Services-Repositories).

## Technologies

| Outil | Rôle |
| --- | --- |
| Node.js 24 LTS / npm 11 | Environnement d'exécution |
| Express | Serveur HTTP et routage |
| mysql2 (`mysql2/promise`) | Pool de connexions MySQL, requêtes paramétrées |
| dotenv | Variables d'environnement (`.env`) |
| express-validator | Validation des données entrantes |
| nodemon | Rechargement automatique en développement |
| MySQL Community Server 8.0 + MySQL Workbench | Base de données |
| Postman / curl | Tests des endpoints |

## Architecture du projet

```
product-api/
├─ .env                      # non versionné (voir Installation)
├─ .gitignore
├─ package.json
├─ index.js                  # point d'entrée
├─ postman/
│  └─ Product API.postman_collection.json
├─ src/
│  ├─ config/db.js           # pool mysql2
│  ├─ routes/                # productRoutes.js, categoryRoutes.js
│  ├─ controllers/           # productController.js, categoryController.js
│  ├─ services/              # productService.js, categoryService.js
│  ├─ repositories/          # productRepository.js, categoryRepository.js
│  └─ middlewares/           # validation.js, errorHandler.js
└─ sql/
   ├─ create_database.sql
   └─ seed_data.sql
```

Le trajet d'une requête : **Route** → middleware de validation → **Controller** → **Service** (règles métier) → **Repository** (SQL) → MySQL. Toute erreur est transmise par `next(err)` au middleware `errorHandler`, qui renvoie `404` si le message contient « not found », sinon `400`.

## Installation et lancement

**Prérequis :** Node.js LTS, MySQL Server 8, MySQL Workbench.

1. Cloner le dépôt et installer les dépendances :

   ```bash
   git clone https://github.com/<votre-utilisateur>/TP06-Backend.git
   cd TP06-Backend
   npm install
   ```

2. Dans MySQL Workbench (compte `root`), créer l'utilisateur dédié :

   ```sql
   CREATE USER 'lab_user'@'localhost' IDENTIFIED BY 'LabPass123!';
   GRANT ALL PRIVILEGES ON *.* TO 'lab_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Exécuter `sql/create_database.sql`, puis `sql/seed_data.sql`.

4. Créer un fichier `.env` à la racine (il n'est pas versionné) :

   ```
   DB_HOST=localhost
   DB_USER=lab_user
   DB_PASSWORD=LabPass123!
   DB_NAME=lab_product
   DB_PORT=3306
   PORT=3000
   ```

5. Démarrer le serveur :

   ```bash
   npm start
   ```

   Le terminal affiche `Server running on port 3000`.

## Endpoints de l'API

Base : `http://localhost:3000/api`

| Méthode | Route | Description | Statuts |
| --- | --- | --- | --- |
| GET | `/products` | Liste des produits | 200 |
| GET | `/products/:id` | Détail d'un produit | 200, 404 |
| GET | `/products/search` | Recherche : `name`, `minPrice`, `maxPrice`, `categoryId`, `sort`, `limit`, `offset` | 200 |
| POST | `/products` | Création (validée) | 201, 400 |
| POST | `/products/with-category` | Création produit + catégorie dans une transaction | 201, 400 |
| PUT | `/products/:id` | Modification (validée) | 200, 400, 404 |
| DELETE | `/products/:id` | Suppression | 204, 404 |
| GET | `/categories` | Liste des catégories | 200 |
| GET | `/categories/:id` | Détail d'une catégorie | 200, 404 |
| POST | `/categories` | Création (validée) | 201, 400 |
| PUT | `/categories/:id` | Modification (validée) | 200, 400, 404 |
| DELETE | `/categories/:id` | Suppression (refusée si des produits sont liés) | 204, 400 |

---

## Déroulement du lab, étape par étape

### Étapes 1 à 3 – Initialisation du projet et de Git

Création du dossier `product-api`, `npm init -y`, installation de `express`, `mysql2`, `dotenv`, `express-validator` et de `nodemon` (script `start` : `nodemon index.js`). Dépôt Git initialisé avec un `.gitignore` excluant `node_modules/` et `.env`.

### Étape 4 – Installation et configuration de MySQL

Création de l'utilisateur dédié `lab_user`, puis connexion à MySQL Workbench avec ce compte.

![Connexion à MySQL Workbench avec lab_user](docs/captures/image-01.png)

### Étape 5 – Création de la base de données et des tables

Exécution du script de création de `lab_product`, des tables `categories` et `products` (clé étrangère `fk_category`, `ON DELETE SET NULL`) et des données de test.

![Exécution du script de création de la base](docs/captures/image-02.png)

Vérification des données insérées : 3 catégories et 3 produits.

![Table categories](docs/captures/image-04.png)

![Table products](docs/captures/image-03.png)

### Étapes 6 et 7 – Variables d'environnement et pool de connexions

Paramètres de connexion dans `.env`, chargés par `dotenv` au début de `index.js`. Le pool `mysql2/promise` est défini dans `src/config/db.js`. Premier démarrage du serveur :

![Démarrage du serveur avec npm start](docs/captures/image-05.png)

### Étapes 8 à 14 – Architecture en couches

- **Étape 8 :** organisation `routes / controllers / services / repositories / middlewares`.
- **Étapes 9 et 10 :** repositories Product et Category (CRUD, requêtes paramétrées `?`).
- **Étapes 11 et 12 :** services Product et Category (règles métier : existence du produit, validité de `category_id`, suppression de catégorie liée interdite).
- **Étapes 13 et 14 :** contrôleurs Product et Category (`async/await`, erreurs transmises via `next(err)`).

### Étapes 15 et 16 – Validation et gestion globale des erreurs

Les routes sont branchées sous `/api`. Le middleware `errorHandler` renvoie une réponse JSON cohérente : `200` pour la liste, `404` pour un produit inexistant.

![GET /api/products (200) et produit inexistant (404)](docs/captures/image-06.png)

`express-validator` rejette les données invalides (`400` avec le tableau `errors`). Une création valide renvoie `201`.

![Validation 400 puis création 201](docs/captures/image-07.png)

### Étape 17 – Recherche, filtrage, pagination et tri

`GET /api/products/search` avec filtres, tri et pagination :

![Recherche filtrée, triée et paginée](docs/captures/image-08.png)

Le paramètre `sort` est limité à une liste de colonnes autorisées : une tentative d'injection SQL est ignorée et la table reste intacte.

![Tentative d'injection dans sort ignorée](docs/captures/image-09.png)

### Étape 18 – Transactions MySQL

Création d'un produit et de sa catégorie dans une même transaction (`commit`) :

![Transaction validée (commit)](docs/captures/image-10.png)

En cas d'erreur (prix manquant), la transaction est annulée (`rollback`) : la catégorie « Robotique » n'est pas créée.

![Transaction annulée (rollback)](docs/captures/image-11.png)

### Étape 19 – Tests des endpoints avec Postman et curl

La collection `postman/Product API.postman_collection.json` regroupe 26 requêtes et 45 tests automatiques (CRUD, recherche, pagination, transaction, nettoyage), exécutés avec le Runner de Postman.

![Runner Postman – produits et recherche](docs/captures/image-12.png)

![Runner Postman – transaction, catégories et nettoyage](docs/captures/image-13.png)

### Étape 20 – Arborescence finale et scripts SQL

Voir [Architecture du projet](#architecture-du-projet). Les scripts de `sql/` permettent de réinitialiser la base avant une démonstration :

```sql
DROP DATABASE IF EXISTS lab_product;
-- puis exécuter create_database.sql et seed_data.sql
```

### Étape 21 – Conclusion

Acquis : configuration de MySQL et de tables relationnelles, `mysql2` avec un pool et des requêtes paramétrées, architecture en couches, programmation asynchrone et gestion d'erreurs, CRUD, filtres avancés, validation et transactions.

Pistes suivantes : tests unitaires (Jest, supertest), documentation Swagger, comparaison avec un ORM (Sequelize, TypeORM).

---

## Résultats des tests Postman

| Tests | Réussis | Échoués | Erreurs | Temps moyen |
| --- | --- | --- | --- | --- |
| 45 | 43 | 2 | 0 | 27 ms |

Les 2 échecs concernent la suppression de catégorie et ont une seule cause, décrite ci-dessous.

## Point connu

Dans `src/services/categoryService.js` (code fourni par l'énoncé, étape 12), la fonction `deleteCategory` contient :

```javascript
const [products] = await productRepo.getAll();
const linked = products.filter(p => p.category_id === id);
```

`productRepo.getAll()` renvoie déjà le tableau des lignes. La déstructuration ne récupère donc que le premier produit, et `products.filter` lève `products.filter is not a function`. Toute suppression de catégorie répond alors `400`. De plus, `id` (issu de `req.params`) est une chaîne, alors que `category_id` est un nombre.

Correction proposée, qui fait passer les 45 tests :

```javascript
const products = await productRepo.getAll();
const linked = products.filter(p => p.category_id === Number(id));
```

---

# LAB 7 – Authentification et autorisation avec JWT

Le LAB 7 sécurise l'API des produits du LAB 6 : table `users`, hachage des mots de passe avec **bcrypt**, génération et vérification de **JWT** (access token d'une heure), contrôle d'accès basé sur les rôles **USER** et **ADMIN**, validation des données et gestion centralisée des erreurs.

> LAB 7 – Module M10 « Développement Backend avec Java, Node.js et PHP » – Master IAIDDWM, semestre 2.

## Nouveautés par rapport au LAB 6

| Élément | Détail |
| --- | --- |
| Modules ES | `"type": "module"` dans `package.json` : tous les fichiers utilisent `import` / `export` (les fichiers du LAB 6 ont été convertis, sans changement de logique). |
| Dépendances ajoutées | `bcrypt`, `jsonwebtoken`, `cors` (`express-validator` et `dotenv` étaient déjà installés). |
| Base de données | Tables `users` et `login_logs` (script `sql/lab7_users.sql`) dans la base `lab_product` (MySQL 8.0). |
| Variables `.env` | `JWT_SECRET` et `JWT_EXPIRES_IN` en plus des variables du LAB 6. |

## Architecture mise à jour

```
product-api/
├─ index.js                      # point d'entrée (routes /api/auth, /api/products, /api/categories)
├─ postman/
│  ├─ Product API.postman_collection.json            # LAB 6
│  └─ Product API - LAB7 Auth JWT.postman_collection.json
├─ sql/
│  ├─ create_database.sql, seed_data.sql             # LAB 6
│  └─ lab7_users.sql                                 # LAB 7 : users + login_logs
└─ src/
   ├─ config/db.js               # pool mysql2 (paramètres lus dans .env)
   ├─ utils/password.js          # hashPassword / verifyPassword (bcrypt, 10 tours)
   ├─ controllers/authController.js   # register, login, getMe, refresh, deleteMe
   ├─ routes/authRoutes.js
   ├─ middleware/
   │  ├─ auth.js                 # authenticate (JWT) et authorize (rôles)
   │  └─ validators.js           # registerValidation, handleValidation
   └─ middlewares/               # LAB 6 : validation.js, errorHandler.js (étendu à l'étape 16)
```

## Installation et lancement (LAB 7)

1. Installer les dépendances (ajoute `bcrypt`, `jsonwebtoken`, `cors`) :

   ```bash
   npm install
   ```

2. Dans MySQL Workbench, exécuter `sql/lab7_users.sql` (la base `lab_product` du LAB 6 doit exister).

3. Compléter le fichier `.env` :

   ```
   JWT_SECRET=une_très_longue_clé_aléatoire_de_64_caractères
   JWT_EXPIRES_IN=1h
   ```

4. Démarrer le serveur :

   ```bash
   npm start
   ```

5. Créer un compte ADMIN pour les tests : s'inscrire via `POST /api/auth/register`, puis promouvoir le compte directement en SQL :

   ```sql
   UPDATE users SET role = 'ADMIN' WHERE email = 'admin@test.com';
   ```

## Endpoints d'authentification

Base : `http://localhost:3000/api`

| Méthode | Route | Accès | Description | Statuts |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | Public | Inscription (validation : username ≥ 3, email valide, mot de passe ≥ 6) | 201, 400, 409 |
| POST | `/auth/login` | Public | Connexion, renvoie `{ token, role }` | 200, 401 |
| GET | `/auth/me` | Token | Profil de l'utilisateur connecté (sans mot de passe) | 200, 401, 403, 404 |
| POST | `/auth/refresh` | Token | Exercice niveau 1 : génère un nouveau token | 200, 401, 403, 404 |
| DELETE | `/auth/me` | Token | Exercice niveau 2 : suppression du compte connecté | 204, 401, 403, 404 |

Le token se transmet dans l'en-tête `Authorization: Bearer <token>`. Un token absent donne `401`, un token invalide ou expiré donne `403`.

## Protection des routes produits

| Méthode | Route | Rôle requis |
| --- | --- | --- |
| GET | `/products`, `/products/search`, `/products/:id` | Tout utilisateur authentifié (USER ou ADMIN) |
| POST | `/products`, `/products/with-category` | ADMIN |
| PUT | `/products/:id` | ADMIN |
| DELETE | `/products/:id` | ADMIN |

Un utilisateur sans le rôle requis reçoit `403 Forbidden: insufficient permissions`. Les routes `/categories` ne sont pas protégées par le LAB 7.

## Déroulement du lab 7, étape par étape

- **Étapes 1 à 4 – Théorie :** objectifs et prérequis, authentification vs autorisation, anatomie d'un JWT (header, payload, signature), authentification stateless (access token d'une heure ; le refresh token est traité par l'exercice niveau 1).
- **Étape 5 – Initialisation :** création de `src/middleware`, `src/controllers`, `src/routes`, `src/config`, installation de `express mysql2 bcrypt jsonwebtoken express-validator cors dotenv`, vérification de `"type": "module"`.
- **Étape 6 – Base de données :** table `users` (rôle `ENUM('USER','ADMIN')`) et pool `mysql2/promise` dans `src/config/db.js`.
- **Étape 7 – Bcrypt :** `src/utils/password.js` avec `hashPassword` et `verifyPassword` (10 tours de salage).
- **Étapes 8 à 10 – Endpoints :** `register`, `login` (JWT signé avec `{ id, role }`, expiration `1h`) et `getMe`.
- **Étapes 11 et 12 – Middlewares :** `authenticate` (vérification du JWT, `req.user`) et `authorize(...roles)` (RBAC).
- **Étape 13 – Validation :** `registerValidation` et `handleValidation` (`express-validator`).
- **Étape 14 – Routes d'authentification :** `src/routes/authRoutes.js` monté sur `/api/auth`.
- **Étape 15 – Protection des produits :** `authenticate` sur `/api/products`, `authorize('ADMIN')` sur l'écriture.
- **Étape 16 – Erreurs :** le gestionnaire global renvoie `401` (`JsonWebTokenError`), `409` (`ER_DUP_ENTRY`) ; le comportement du LAB 6 (404 / 400) est conservé pour les erreurs métier.
- **Étape 17 – Bonnes pratiques :** variables d'environnement (`.env` exclu de Git), requêtes préparées. HTTPS, restriction CORS et `express-rate-limit` sont les mesures recommandées pour la production.
- **Étapes 18 et 19 – Tests :** scénario Postman et commandes cURL (voir ci-dessous).
- **Étape 20 – Comparaison avec Spring Security (LAB 4) :** mêmes concepts (authentification, autorisation), mais Express oblige à écrire les middlewares à la main.
- **Étape 21 – Exercices et conclusion :** niveaux 1 à 3 ci-dessous ; transition vers le LAB 8 (Laravel, `Auth::guard('api')`).

### Exercices de l'étape 21

| Niveau | Énoncé | Réalisation |
| --- | --- | --- |
| 1 | Ajouter un endpoint `POST /api/auth/refresh` pour générer un nouveau token | `refresh` dans `authController.js` (route protégée par `authenticate`) |
| 2 | Implémenter la suppression d'un compte utilisateur (`DELETE /api/auth/me`) | `deleteMe` dans `authController.js`, réponse `204` |
| 3 | Ajouter un log d'activité pour chaque tentative de login échouée | Insertion dans la table `login_logs` (email, adresse IP, date) pour chaque échec (email inconnu ou mot de passe incorrect) |

Consulter les échecs :

```sql
SELECT * FROM login_logs ORDER BY created_at DESC;
```

## Tests du LAB 7

**Scénario (étape 18)** : inscription (201) → connexion (copier le `token`) → `GET /api/auth/me` avec `Authorization: Bearer [token]` → création d'un produit avec un compte USER (403) → création avec un compte ADMIN (201).

**cURL (étape 19)** :

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"123456"}'

# Accès protégé
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <VOTRE_TOKEN>"
```

**Collection Postman** : importer `postman/Product API - LAB7 Auth JWT.postman_collection.json` et lancer le Runner dans l'ordre. Elle contient 21 requêtes et 29 assertions (authentification, autorisation USER et ADMIN, exercices 1 à 3). Le compte admin (`admin@test.com` / `123456`, modifiables dans les variables de la collection) doit être promu en SQL avant le dossier 3 (voir Installation, point 5).

| Requêtes | Assertions | Échecs |
| --- | --- | --- |
| 21 | 29 | 0 |

> Ces résultats ont été obtenus avec Newman sur une base MariaDB 10.11 compatible MySQL ; relancez le Runner sur votre MySQL 8.0 pour les confirmer.

> La collection du LAB 6 n'envoie pas de token : ses requêtes sur `/api/products` renvoient désormais `401`. Ajoutez-y l'en-tête `Authorization: Bearer {{token}}` (token d'un compte ADMIN) pour la rejouer.

---

**Auteur :** Luchianhi – Master IAIDDWM, M10 Développement Backend.
