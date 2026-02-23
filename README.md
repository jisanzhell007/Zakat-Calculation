# Zakat-Calculation

A guided web app to help anyone estimate Zakat through a question-by-question flow.

## Features

- Intro screen with Islamic context text.
- Step-by-step guided questions with explanations and examples.
- Zakat timing preference plus optional specific reminder date.
- Country of residence step that auto-applies local currency.
- Nisab standard selection limited to either **85g gold** or **595g silver**.
- Automatic nisab threshold estimation using:
  - Stooq spot metal tickers (XAUUSD/XAGUSD) for gold/silver price basis.
  - Frankfurter (ECB reference rates) for USD -> local currency conversion.
- Summary screen with editable numeric inputs and instant recalculation.

## Run locally

Open `index.html` directly in a browser, or run:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.
