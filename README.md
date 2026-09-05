# Planning Poker

App completo de Planning Poker para times de desenvolvimento, com web e mobile
compartilhando a mesma lógica e o mesmo backend em tempo real.

## O que já está funcionando

- Criar salas de votação com nome, escala de votação e opção de revelar
  automaticamente quando todos votarem.
- Convidar pessoas via código da sala (6 caracteres) ou link direto.
- Lista de tarefas dentro da sala: título, descrição e estimativa final.
- Três perfis de acesso, aplicados no **servidor** (não só na UI):
  - **Organizador**: cria/edita/remove tarefas, escolhe qual tarefa está em
    votação, revela e reseta os votos. Não vota.
  - **Votante**: vota nas tarefas e vê os resultados depois de revelados.
  - **Espectador**: só acompanha a sala, sem votar.
- Escalas de votação prontas: Fibonacci, tamanhos de camiseta (PP–XG),
  pontos (1–10), potências de 2 e uma escala sequencial curta — todas com as
  cartas especiais `?` (não sei estimar) e `☕` (pausa). Fica fácil adicionar
  outras em `packages/shared/src/votingScales.ts`.
- Revelação manual pelo organizador ou automática quando todos os votantes
  conectados já votaram.
- Estatísticas ao revelar: média, mínimo, máximo, consenso e distribuição de
  votos.

## Arquitetura

Monorepo com 4 pacotes, para reaproveitar tipos e regras de negócio entre
todas as plataformas:

```
packages/
  shared/    tipos, escalas de votação e contrato de eventos (usado por todos)
  backend/   Node.js + Express + Socket.io — dono da verdade sobre as salas
  web/       React + Vite — cliente web
  mobile/    Expo (React Native) — cliente mobile (iOS/Android)
```

- **Tempo real**: tudo passa por WebSocket (Socket.io). O backend é a única
  fonte de verdade — ele guarda o estado da sala em memória e transmite o
  estado inteiro (`room:state`) para todo mundo conectado sempre que algo
  muda. Os clientes não calculam nada sozinhos, só refletem o que vem do
  servidor.
- **Permissões no servidor**: cada evento (`task:create`, `vote:cast`, etc.)
  valida o papel do participante em `roomLogic.ts` antes de aplicar a
  mudança. Isso impede, por exemplo, que alguém edite a UI do celular e vote
  sendo espectador.
- **Sem banco de dados (por enquanto)**: salas de planning poker são
  efêmeras — duram a reunião. O estado fica em memória no processo do
  backend (`roomStore.ts`). Para rodar em múltiplas instâncias/escala,
  troque esse armazenamento por Redis mantendo a mesma interface.

## Como rodar localmente

Pré-requisitos: Node.js 18+, npm 9+. Para o mobile, também o app **Expo Go**
no celular (ou um emulador Android/iOS).

```bash
# na raiz do projeto
npm install

# compila o pacote compartilhado (tipos usados por backend/web/mobile)
npm run build:shared

# em um terminal: sobe o backend (porta 3333)
npm run dev:backend

# em outro terminal: sobe o web (porta 5173)
npm run dev:web

# em outro terminal: sobe o mobile via Expo
npm run dev:mobile
```

No mobile, como `localhost` não existe no celular físico, ajuste o IP do
backend em `packages/mobile/.env.example` → copie para `.env` com o IP da
sua máquina na rede local (ex: `EXPO_PUBLIC_BACKEND_URL=http://192.168.0.10:3333`).

No web, copie `packages/web/.env.example` para `.env` se for apontar para um
backend que não seja `localhost:3333`.

## Deploy (sugestão)

- **Backend**: qualquer serviço que rode um processo Node.js persistente com
  suporte a WebSocket (Render, Railway, Fly.io, um VPS com PM2). Não use
  hosting serverless puro (Vercel Functions, por ex.) porque o Socket.io
  precisa de conexão persistente.
- **Web**: qualquer host estático (Vercel, Netlify, Cloudflare Pages),
  apontando `VITE_BACKEND_URL` para a URL pública do backend.
- **Mobile**: build com EAS Build (`eas build`) para gerar os binários de
  loja, apontando `EXPO_PUBLIC_BACKEND_URL` para o backend em produção.

## Próximos passos sugeridos

- Persistir sessão do participante (ex: token salvo local) pra sobreviver a
  um refresh de página sem perder o lugar na sala.
- Histórico de estimativas por tarefa (mostrar todas as rodadas de votação,
  não só a última).
- Exportar o resultado da sessão (CSV/Jira) ao final.
- Autenticação opcional para organizadores recorrentes.
- Trocar o `roomStore` em memória por Redis se for rodar mais de uma
  instância do backend.
