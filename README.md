# CafePay Admin

CafePay Admin is the Persian restaurant administration application.
Staff manage menus, products, tables, orders, payments, receipts, and printer settings.
The interface supports right-to-left layouts and narrow screens.
Status labels and symbols provide information without color alone.

[راهنمای فارسی مدیر و کارکنان](docs/ADMIN_GUIDE_FA.md)

## What this app does

This repository contains the Vue web app.
The [backend](https://github.com/cafepay-oss/cafepal) provides the API, login, live order updates, and database.
Customers use [cafepay-webapp](https://github.com/cafepay-oss/cafepay-webapp).
Waiters use [cafepay_waiter](https://github.com/cafepay-oss/cafepay_waiter).

| Area | Main location |
| --- | --- |
| Routes and screens | `src/router.js`, `src/views/` |
| Shared state and API actions | `src/store.js`, `src/modules/` |
| Order and table models | `src/models/` |
| Menu, table, and invoice controls | `src/components/Management/` |
| Persian translations | `src/locales/fa-IR.json` |
| Responsive layouts and contrast | `src/scss/` |
| Desktop printer integration | `public/desktop.js`, `src/modules/printer.js` |
| Focused regression checks | `tests/` |

## Run the apps locally

Keep the related repositories in one directory:

```text
cafepay/
├── cafepal/
├── cafepay-admin/
├── cafepay-webapp/
└── cafepay_waiter/
```

Use the backend [local setup guide](https://github.com/cafepay-oss/cafepal/blob/main/LOCAL_SETUP.md) for database setup, demo records, and account creation.
Docker Compose builds the web app with the required older tools.
The web app image uses Node 14.21.3 and npm 8.19.4.

After initial setup, run these commands from `cafepal`:

```sh
./local up
./local check
```

Open [the local admin application](http://localhost:3001).
Use the local account configured through the setup guide.
Select a demo cafe before tests that change orders.
The local setup uses test payments.
It does not require payment card details.

Rebuild only the staff app after source changes:

```sh
docker compose --env-file .env.local -f compose.local.yml build admin
docker compose --env-file .env.local -f compose.local.yml up -d --no-deps admin
```

## Run the web app development server

Start the backend first.
Use Node 14.21.3 and npm 8.19.4 for this Vue CLI application.
These older versions belong in an isolated development environment.
Run these commands from this repository:

```sh
npm ci --legacy-peer-deps --no-audit --no-fund
```

Create an ignored `.env.development.local` file:

```dotenv
VUE_APP_CAFEPAY_ADMIN_BASEURL=http://localhost:8000/
VUE_APP_CAFEPAY_ADMIN_SOCKETURL=ws://localhost:8000/
VUE_APP_CAFEPAY_LOCAL_RECOVERY=true
VUE_APP_I18N_LOCALE=fa-IR
VUE_APP_I18N_FALLBACK_LOCALE=fa-IR
VUE_APP_SENTRY_KEY=
```

These values target the isolated local backend.
The local login form also requires local recovery mode on that backend.
The checked-in environment files use localhost addresses and disable error reporting.
The local login form needs `VUE_APP_CAFEPAY_LOCAL_RECOVERY=true`.

```sh
npm run serve -- --port 3001
```

Stop the Compose `admin` service first if it already uses port `3001`.
Environment changes require a development server restart.

## Build and deploy

```sh
npm run build
```

The output directory is `dist/`.
Configure production API and WebSocket addresses before this command.
Vue embeds environment values during the build.
Use `.env.production.local` or deployment environment variables for those values.
Disable local recovery mode outside isolated local installations.

Serve `index.html` for application routes, such as `/cafe/menus`.
Forward API and WebSocket traffic to the configured backend.
The backend repository contains the working local Nginx configuration.
The production PWA includes the notification worker through Workbox.
Local recovery builds disable service worker caching.

## Card transfers and receipts

Open **کارت‌به‌کارت و رسیدها** at `/card-transfers` after selecting a cafe.
A cafe manager can set the destination card number and account holder.
Enable card transfers to offer this payment method for online orders.

Customers transfer money through their bank application, then upload a receipt.
The receipt lets staff start preparation immediately.
The receipt does not prove that the bank transferred the money.
Staff check the destination account before selecting **واریز را در حساب دیدم**.

If the receipt needs correction, select **رسید نیاز به اصلاح دارد** and give the customer a reason.
Use the filters to find submitted, confirmed, or rejected receipts.
The preorder list keeps preparation status separate from payment status.
Only confirmation records the payment against the order.

See the [backend card transfer guide](https://github.com/cafepay-oss/cafepal/blob/main/CARD_TRANSFERS.md) for permissions and receipt storage.

## Verification

Run the tests with Node 18 or newer.
These tests need no dependency installation:

```sh
node --test tests/*.cjs
```

These checks cover payments, network failures, cafe selection, printing, startup, and status labels.
They also cover receipt review, receipt filters, cafe changes, and delivery fees.
They also check contrast calculations and selected layout behavior.
They do not replace a production build or browser checks.
They do not verify a physical printer.

For browser checks, use sample cafe data.
Check login, cafe selection, menu editing, table orders, payments, receipt review, and error recovery.
Check narrow and wide screens, including `320`, `390`, `768`, and `1280` pixel widths.
Check keyboard focus and status labels without relying on color.

## Documentation and support

- [Persian admin guide](docs/ADMIN_GUIDE_FA.md): daily tasks, status meanings, printing, and recovery.
- [Backend setup guide](https://github.com/cafepay-oss/cafepal/blob/main/LOCAL_SETUP.md): local services, setup, and tests.
- [Tests](tests/): checks for application behavior.

Include the affected screen, browser version, screen width, and steps to reproduce in bug reports.
Use sample data in screenshots.
Exclude passwords, tokens, customer details, and historical invoices.

The interface builds on Admin One, Buefy, and Bulma.

## License and included assets

CafePay code uses the [MIT license](LICENSE).
The interface uses [Vazirmatn v33.003](https://github.com/rastikerdar/vazirmatn/tree/v33.003).
Its [SIL Open Font License](src/assets/fonts/vazirmatn/OFL.txt) applies to the included font files.
See [third-party notices](THIRD_PARTY_NOTICES.md) for the Admin One license and other included files.
