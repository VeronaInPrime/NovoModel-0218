# Supermercado Miro — Estúdio de ofertas

Ferramenta web de criação de encartes, não e-commerce. Referências fornecidas orientam os fluxos de calendário, menu e placas; modernização editorial com fotografia real, espaço generoso e legibilidade.

Paleta: verde #063d27 / #085b37, vinho #77142a, amarelo #ffd23f, papel #f7f8f4, borda #e1e7df, texto #152c21. Poppins local para títulos e interface; Arial em preços. Marca tipográfica Miro com sacola. Entrada com mensagem editorial e calendário; editor com ferramentas laterais e encarte central. Produtos em células de encarte com divisórias, sem cards comerciais arredondados.

## Brand & Colors

One token set, consumed per platform:

- **Web & desktop**: CSS variables in `packages/web/src/web/styles.css` (desktop loads the web UI).
- **Mobile**: `Colors.light` / `Colors.dark` in `packages/mobile/constants/theme.ts`, read via `useColors()`; `userInterfaceStyle: "automatic"` follows the system light/dark setting.

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| primary | #1F1F1F | #E5E5E5 | Buttons, active tab, accents |
| background | #FFFFFF | #0A0A0A | Page/screen background |
| card | #FFFFFF | #1A1A1A | Cards, surfaces |
| foreground | #171717 | #FAFAFA | Primary text |
| mutedForeground | #737373 | #A3A3A3 | Secondary text |
| border | #E5E5E5 | #262626 | Hairlines |
| destructive | #DC2626 | #EF4444 | Delete / errors |

## Typography

Name the display + body pairing here. Web: set font families in `styles.css` (self-hosted files go in `packages/web/public/fonts/`). Mobile: system font by default; load custom fonts with `useFonts` from `expo-font` and reference them via `Fonts` in `constants/theme.ts`.

## Pages & Screens

List each page/screen, its route file, and what it shows. Example:

- **Web — Home** (`packages/web/src/web/pages/index.tsx`) — what the user sees first.
- **Mobile — Home** (`packages/mobile/app/(tabs)/index.tsx`) — main tab.
- Add web pages under `src/web/pages/` (+ route in `app.tsx`); mobile tabs under `app/(tabs)/`, stack/modal screens under `app/`.

## Key User Flows

1. Escolher data → campanha do dia, sábado e domingo unificados → editor. Sem dados de exemplo confundidos com produtos reais.
2. Cadastrar produto com foto, nome, preço e medida → agrupar, editar, arrastar por alça com touch/teclado → salvamento IndexedDB → prévia e PNG 1080 px.
3. Selecionar ofertas → placas A4 editáveis → imprimir. Configurar link → QR Code/convite A4.
4. Botões de pelo menos 44 px, validação explícita, modais fecham com Escape, exclusões confirmadas. Mobile: apenas encarte pode rolar horizontalmente.

## Architecture

- **API**: typed oRPC client (`lib/api.ts` in each package) → the backend in `@template/web`. Query/mutation hooks live in `queries/` (one file per feature); pages/screens call them with `@tanstack/react-query`.
- **State/sync**: TanStack Query with optimistic updates for instant-feel interactions.
- **Auth / payments / uploads**: see `skills/app/references/` when those features are needed.
