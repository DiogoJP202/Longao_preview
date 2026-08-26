# LONGÃO OS

Protótipo navegável de um sistema de pedidos criado para o **Longão** — cafeteria da Vila Buarque, São Paulo, que une café especial, corrida e comunidade.

O objetivo não é um sistema de produção, e sim um **preview convincente** para apresentar aos responsáveis pela cafeteria: todo o ciclo operacional — caixa → pedido → barista → preparo → pronto → retirada → venda registrada — funcionando de ponta a ponta com dados simulados.

## Rodando localmente

```bash
pnpm install
```

```bash
pnpm dev
```

O servidor sobe em `http://localhost:8443` (ou na porta definida em `$PORT`).

Outros comandos:

```bash
pnpm build && pnpm typecheck
```

## Modo apresentação

O botão **DEMO LONGÃO**, no canto superior direito, inicia uma sequência guiada de 9 passos com os controles `ANTERIOR` / `PRÓXIMO`. Ela cria o pedido demonstrativo **#045 (TONNY — Matcha Latte + Filtrado + Cookie)** e o acompanha por todas as telas, sem precisar navegar manualmente durante a apresentação.

## Telas

| Tela | Arquivo | Descrição |
| --- | --- | --- |
| Visão geral | `src/views/Overview.tsx` | Indicadores do dia, pedidos ativos, movimento por hora, mais pedidos, próximo evento |
| Novo pedido | `src/views/POS.tsx` | PDV: categorias, personalização, painel de café filtrado (grão + método), carrinho e checkout |
| Produção | `src/views/Production.tsx` | KDS kanban `LARGADA / EM RITMO / CHEGADA` com timer que escala para atenção (5 min) e atrasado (10 min) |
| Retirada | `src/views/Pickup.tsx` | Painel de TV, sem menu lateral, com destaque em tela cheia quando um pedido fica pronto |
| QR Code | `src/views/Mobile.tsx` | Autoatendimento pelo celular, em moldura de telefone |
| Cardápio | `src/views/MenuAdmin.tsx` | Alterna disponibilidade — reflete no PDV e no QR Code imediatamente |
| Relatórios | `src/views/Reports.tsx` | Faturamento, ticket médio, produtos mais vendidos e horários de pico |

## Responsividade

A interface funciona de celular a TV, com o corte principal em `md` (768px):

| Contexto | Comportamento |
| --- | --- |
| Celular | Menu lateral vira gaveta com barra superior; carrinho do PDV vira gaveta inferior com barra-resumo (`2 ITENS · R$ 38`); kanban da Produção rola horizontalmente com encaixe por coluna; o cardápio deixa de ser tabela e vira blocos; a tela de QR Code perde a moldura de celular e ocupa tudo |
| Tablet | Menu lateral fixo, carrinho em coluna, grades em duas colunas |
| Desktop / TV | Layout completo em colunas |

Nenhuma das sete telas gera rolagem horizontal em 375px, 768px ou desktop.

## Arquitetura

```
src/main.tsx → App.tsx (AppProvider + Shell: Sidebar, DemoBar, Toast, view ativa)
                  ↓
              context.tsx   estado global: pedidos, cardápio, view, demo, toast
              data.ts       dados simulados e catálogos
              types.ts      contratos de domínio
              views/*.tsx   as sete telas
```

Não há backend, autenticação, pagamento nem banco de dados. Todo o estado vive em memória num único React Context, e por isso é compartilhado entre as telas — mudar o status de um pedido na Produção aparece na hora na Retirada e na Visão geral.

## Identidade

Concreto claro e quente, sem cantos arredondados e sem gradientes — brutalismo editorial, não dashboard. Tokens em `src/index.css`:

| Papel | Cor |
| --- | --- |
| Fundo (concreto) | `#E5E2DB` |
| Laje (menu, carrinho) | `#DCD7CC` |
| Painel elevado | `#EFECE6` |
| Tinta | `#1A1714` |
| Texto secundário | `#625E57` |
| Texto apagado | `#736B5E` |
| Bordas | `#CEC8BC` / `#B4AC9D` |
| Acento (marca) | `#DD3E22` |

A **Retirada** é a única tela que segue escura (`#080807`): é uma TV vista de longe no salão, onde fundo escuro com números claros lê melhor à distância.

Todas as combinações de texto sobre fundo foram medidas: o pior caso é 3,66:1, e nenhuma fica abaixo de 3:1.

Tipografia: **Barlow Condensed** para display e números, **Inter** para interface, **DM Mono** para timers, códigos e etiquetas técnicas.

O briefing original está em `src/imports/pasted_text/longao-order-preview.md`.

## Stack

React 19 · Vite 8 · TypeScript 5.7 · Tailwind CSS v4 · lucide-react

## Aviso

Os preços exibidos são demonstrativos e não representam valores oficiais do Longão. A interface é original — não reproduz o site nem o Instagram da cafeteria.
