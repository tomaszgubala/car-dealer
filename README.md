# 🚗 AutoDealer — Ogłoszenia Samochodowe

Produkcyjna aplikacja webowa dla dealerów samochodowych. Minimalistyczny design, szybka wydajność, pełna funkcjonalność.

## Stack

- **Frontend/Backend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **DB:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth v5 (Credentials) + RBAC
- **Cache:** Redis (ioredis)
- **Email:** Resend
- **Testy:** Vitest (unit) + Playwright (e2e)
- **Deploy:** Docker / Vercel

---

## Uruchomienie lokalne

### 1. Wymagania
- Node.js 20+
- PostgreSQL 14+
- Redis 7+ (opcjonalne)

### 2. Klonowanie i instalacja
```bash
git clone <repo>
cd car-dealer
npm install
```

### 3. Konfiguracja środowiska
```bash
cp .env.example .env.local
```

Wypełnij `.env.local`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/car_dealer"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="min-32-chars-secret-change-in-prod"
REDIS_URL="redis://localhost:6379"
ENABLE_REDIS="true"
RESEND_API_KEY="re_xxx"           # opcjonalne - powiadomienia email
EMAIL_FROM="noreply@dealer.pl"
DEALER_EMAIL="kontakt@dealer.pl"
DEALER_PHONE="+48 123 456 789"
IMPORT_SECRET_TOKEN="your-token"  # do ochrony endpointu cron
```

### 4. Baza danych
```bash
# Utwórz bazę i uruchom migracje
npm run db:migrate

# Lub szybkie push (development)
npm run db:push

# Generowanie Prisma client
npm run db:generate

# Seed — 20+ przykładowych ogłoszeń + konto admina
npm run db:seed
```

**Domyślne konta:**
- `admin@dealer.pl` / `Admin1234!` (ADMIN)
- `editor@dealer.pl` / `Admin1234!` (EDITOR)

### 5. Uruchomienie
```bash
npm run dev
```

Otwórz: http://localhost:3000
Admin: http://localhost:3000/admin

---

## Docker

```bash
# Uruchom pełen stack (app + PostgreSQL + Redis)
docker-compose up -d

# Migracje i seed
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npm run db:seed
```

---

## Deploy na Vercel

1. Podłącz repo do Vercel
2. Ustaw zmienne środowiskowe w panelu Vercel
3. Skonfiguruj PostgreSQL (np. Neon, Supabase) i Redis (np. Upstash)
4. `vercel.json` automatycznie skonfiguruje cron co 30 min

---

## Struktura projektu

```
src/
├── app/
│   ├── page.tsx              # Listing główny (SSR/ISR)
│   ├── [type]/[slug]/        # Strona szczegółów pojazdu
│   ├── admin/                # Panel admina (chroniony)
│   │   ├── pojazdy/          # Zarządzanie ogłoszeniami
│   │   ├── statystyki/       # Statystyki + wykresy
│   │   ├── import/           # Zarządzanie importami
│   │   └── login/            # Logowanie
│   └── api/
│       ├── auth/             # NextAuth handlers
│       ├── vehicles/         # Publiczne API listingu
│       ├── leads/            # Formularz kontaktowy
│       ├── import/           # Import cron + manual
│       ├── stats/            # Event tracking
│       └── admin/            # CRUD vehicles, stats export
├── components/
│   ├── listing/              # Grid, filtry, karty
│   ├── vehicle/              # Galeria, formularz leadów
│   ├── admin/                # Sidebar, formularze
│   ├── ui/                   # Toggle, SegmentControl
│   ├── layout/               # Header, Footer
│   └── seo/                  # Structured data
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── redis.ts
│   ├── vehicles.ts           # Query helpers
│   ├── utils.ts
│   ├── cron.ts               # Harmonogram
│   └── connectors/
│       ├── base.ts           # Interface + validation
│       ├── sample.ts         # Przykładowy connector
│       └── registry.ts       # Rejestr + import runner
└── types/index.ts
```

---

## API

### Publiczne
| Method | Path | Opis |
|--------|------|------|
| GET | `/api/vehicles` | Lista pojazdów z filtrami |
| POST | `/api/leads` | Formularz kontaktowy |
| POST | `/api/stats/event` | Event tracking (cookie-free) |

### Admin (wymaga sesji)
| Method | Path | Opis |
|--------|------|------|
| POST | `/api/admin/vehicles` | Utwórz pojazd |
| PATCH | `/api/admin/vehicles/:id` | Edytuj pojazd |
| DELETE | `/api/admin/vehicles/:id` | Deaktywuj pojazd |
| GET | `/api/admin/stats/export` | Eksport CSV leadów |
| POST | `/api/import/run` | Uruchom import ręcznie |
| GET | `/api/import/cron` | Endpoint dla Vercel Cron |

---

## Jak dodać nowy connector importu

```typescript
// src/lib/connectors/my-connector.ts
import type { Connector, ConnectorResult } from './base'
import { validateConnectorVehicle } from './base'

export class MyConnector implements Connector {
  name = 'MyConnector'

  async fetch(): Promise<ConnectorResult> {
    const vehicles = []
    const errors: string[] = []

    // Pobierz dane z API
    const rawData = await fetch('https://api.my-source.com/cars', {
      headers: { 'Authorization': `Bearer ${process.env.MY_API_KEY}` }
    }).then(r => r.json())

    for (const item of rawData) {
      const { data, error } = validateConnectorVehicle({
        externalId: item.id,
        type: item.isNew ? 'NEW' : 'USED',
        make: item.brand,
        model: item.model,
        year: item.year,
        priceGross: item.price,
        // ... mapuj pozostałe pola
      })

      if (error) { errors.push(error); continue }
      vehicles.push(data)
    }

    return { vehicles, errors }
  }
}

// Zarejestruj w src/lib/connectors/registry.ts:
// const connectors: Connector[] = [
//   new SampleExternalAPIConnector(),
//   new MyConnector(),  // <-- dodaj tutaj
// ]
```

---

## Testy

```bash
# Unit tests (vitest)
npm test

# E2E (wymaga działającego serwera)
npm run test:e2e

# Prisma Studio
npm run db:studio
```

---

## Checklist bezpieczeństwa ✅

- [x] OWASP headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- [x] Input validation Zod na wszystkich endpointach API
- [x] Hasła hashowane argon2
- [x] Rate limiting na formularzu leadów (5/IP/godzinę)
- [x] Honeypot anti-spam w formularzu
- [x] CSRF: NextAuth obsługuje automatycznie
- [x] SQL injection: Prisma ORM (parametryzowane zapytania)
- [x] RBAC: ADMIN / EDITOR / VIEWER
- [x] Endpointy admina chronione middleware + session check
- [x] Endpointy importu chronione tokenem lub Vercel Cron signature
- [x] Anonimizacja IP (SHA-256 hash z salt)
- [x] Audit log krytycznych operacji (CREATE/UPDATE/DELETE)
- [x] Sanitizacja: opisy przechowywane jako plain text (bez HTML)
- [x] Admin panel oddzielony (/admin), własny layout, robots noindex

## Checklist SEO ✅

- [x] SSR/ISR dla listingu (revalidate: 60s) i szczegółów (revalidate: 120s)
- [x] Meta title + description dynamiczne
- [x] OpenGraph tags (title, description, image)
- [x] JSON-LD structured data (schema.org/Car + Offer)
- [x] sitemap.xml dynamiczny (/sitemap.xml)
- [x] robots.txt (/robots.txt)
- [x] Canonical URLs
- [x] Przyjazne URL-e: /uzywane/skoda-octavia-2021-abc123
- [x] Next/Image z lazy loading i responsive srcset
- [x] Breadcrumbs na stronach szczegółów
- [x] Wsparcie dla treści EN (hasEN flag + filtr)
