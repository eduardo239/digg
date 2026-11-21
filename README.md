# Digg

Consulte registros DNS em vários resolvers ao mesmo tempo e compare as respostas e os tempos, direto do navegador.

O nome é uma brincadeira com o `dig`, o comando clássico de DNS. O Digg usa **DNS-over-HTTPS (DoH)**, então não precisa de backend: as consultas saem do navegador para cada resolver.

## Funcionalidades

- Consulta de um domínio nos tipos `A`, `AAAA`, `CNAME`, `MX`, `NS`, `TXT` e `SOA`
- Consultas em paralelo em vários resolvers:
  - Cloudflare
  - Google
  - DNS.SB
  - AliDNS
- Tempo de resposta (ms) de cada resolver
- Status da resposta (`NOERROR`, `NXDOMAIN`, `SERVFAIL` etc.)
- Tabela com nome, tipo, TTL e dados de cada registro retornado
- Erros por resolver isolados: se um falhar, os outros continuam

## Tecnologias

- [React](https://react.dev/) 18
- [Vite](https://vitejs.dev/) 6

## Como rodar

Requer [Node.js](https://nodejs.org/) instalado.

```bash
npm install
npm run dev
```

O app abre em `http://localhost:5173`.

### Outros comandos

| Comando           | Descrição                                |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento              |
| `npm run build`   | Gera o build de produção em `dist/`      |
| `npm run preview` | Serve localmente o build de produção     |

## Como usar

1. Digite um domínio (ex.: `example.com`).
2. Escolha o tipo de registro.
3. Marque os resolvers que quer comparar.
4. Clique em **Consultar**.

## Como funciona

Cada resolver recebe uma requisição `GET` no formato JSON do DoH:

```
https://dns.google/resolve?name=example.com&type=A
```

com o header `accept: application/dns-json`. A resposta é lida em `src/App.jsx`, que mede o tempo da requisição com `performance.now()` e traduz o código `Status` para o nome do RCODE.

## Estrutura

```
index.html        # Entrada HTML
src/
  main.jsx        # Montagem do React
  App.jsx         # Interface e lógica das consultas
  styles.css      # Estilos
vite.config.js    # Configuração do Vite
```

## Observações

- O navegador precisa conseguir acessar os resolvers. Redes com bloqueio de DoH ou extensões de privacidade podem causar erros em alguns deles.
- Os resolvers precisam permitir CORS. Se algum deixar de permitir, ele aparecerá com erro no app.
- O tempo medido inclui a latência de rede do navegador até o resolver, não só o tempo de resolução do DNS.
