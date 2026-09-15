# integracao-backend/

Esta pasta concentra **toda** a comunicação do front-end com o back-end
(`mesa-do-campo-back`, branch `dev`). Ela fica fora de `src/` de propósito,
como uma camada isolada e independente do resto da aplicação — se o back-end
mudar, o ajuste fica concentrado aqui.

## Estrutura

```
integracao-backend/
├── types.ts          Tipos TS espelhando as Entities/Enums do back-end
├── client.ts          Cliente HTTP base (envelope ReturnModel, erros, Basic Auth)
├── authStorage.ts      Guarda as credenciais usadas no Basic Auth
├── cliente.ts          /api/cliente/*
├── endereco.ts         /api/endereco/* (+ autocomplete de CEP via BrasilAPI)
├── vendedor.ts         /api/vendedor/*
├── produto.ts          /api/produto/*
├── pedido.ts           /api/pedidos/*
├── pagamento.ts        /api/pagamentos/* (somente leitura)
├── avaliacao.ts        /api/avaliacao/* (avalia o VENDEDOR, não o produto)
├── cartaoCredito.ts     /api/cartao-credito/*
├── cartaoDebito.ts      /api/cartao-debito/*
├── chavePix.ts          /api/chave-pix/*
└── index.ts            Reexporta tudo (import único: `@integracao-backend`)
```

## Como importar

Foi criado o alias `@integracao-backend/*` no `tsconfig.json`, então qualquer
arquivo dentro de `src/` pode importar assim:

```ts
import { loginCliente } from "@integracao-backend/cliente";
// ou, via barrel:
import { loginCliente } from "@integracao-backend";
```

## Como as requisições chegam ao back-end

O `next.config.ts` tem um `rewrite` que repassa tudo que for chamado em
`/api/*` pelo navegador para o back-end real (`BACKEND_URL`, padrão
`http://localhost:8080`). Isso evita problemas de CORS, já que o back-end
(nesta branch) não tem nenhuma configuração de CORS liberando o front.

Para rodar localmente:
1. Suba o back-end (`./mvnw spring-boot:run`), normalmente na porta 8080.
2. Copie `.env.local.example` para `.env.local` e ajuste `BACKEND_URL` se
   necessário.
3. Rode o front (`npm run dev`) normalmente.

## Autenticação (importante!)

O `Interceptador` do back-end usa **HTTP Basic Auth com `nome:senha`** — não
usa token/JWT, e usa o **nome** do cliente (não o e-mail, mesmo o login sendo
feito por e-mail). Por isso, depois do login bem-sucedido, o front guarda
`nome` + `senha` em texto puro (`authStorage.ts`, via `localStorage`) para
remontar o cabeçalho `Authorization` em cada requisição autenticada.

Isso é uma característica do back-end nesta branch, não uma escolha do
front — o ideal, no futuro, seria o back-end emitir um token de sessão em vez
de reenviar a senha em toda requisição.

## Paginação em lotes ("batch")

Toda lista retornada pela API agora vem cortada em lotes pelo back-end,
controlados por **headers HTTP** (não query params):

- `limit`: quantos itens por lote (padrão 10 se o header não for enviado)
- `batch`: qual lote buscar, começando em 1 (padrão 1)

A resposta inclui `quantity` (total de itens em TODOS os lotes) e um objeto
`batch: { quantity, loteAtual, loteTotal }`.

No front, isso é tratado por `apiGetPagina<T>(path, {lote, limite})`
(`client.ts`), que devolve `{ itens, totalItens, paginaAtual, totalPaginas,
tamanhoPagina }`. Cada recurso que tem uma listagem "grande" (produtos,
pedidos, itens vendidos) ganhou uma versão `*Paginado` ao lado da função
antiga, por exemplo `listarTodosProdutosPaginado()` ao lado de
`listarTodosProdutos()`.

`apiGetList<T>()` (usada nas listagens que ainda não têm paginação na tela,
como carrosséis e "meus cartões") continua funcionando como antes — ela
simplesmente pede um `limit` bem alto (1000) para trazer tudo de uma vez.

Nas telas com paginação de verdade (Catálogo, Meus Pedidos, Meus Produtos,
Pedidos Recebidos), o componente `src/components/ui/Paginacao.tsx` mostra
"Anterior / Próximo" e o total de itens. Como o back-end não tem busca por
nome nem filtro combinado com paginação, ao digitar uma busca ou aplicar um
filtro essas telas caem para uma busca completa (sem lotes) e filtram no
front — só a navegação "sem filtro" usa paginação de verdade no servidor.

## Toda resposta vem "embrulhada"

O `ModelResponseAdivice` do back-end envolve toda resposta em um
`ReturnModel`:

```json
{
  "status": 200,
  "path": "/api/produto/all",
  "success": true,
  "quantity": 5,
  "itens": [ /* ... */ ],
  "errors": null
}
```

O `client.ts` já trata isso: `apiGetOne`/`apiPost`/`apiPut`/`apiPatch`
retornam o objeto já "desembrulhado", e `apiGetList` retorna o array de
`itens` diretamente. Erros (`success: false` ou HTTP não-2xx) viram uma
`ApiError` com `.status` e `.message`.

## Limitações conhecidas do back-end (branch dev)

Ainda não existem endpoints para:
- **Criar** um `ItemPedido` (o carrinho não consegue gravar quais produtos
  compõem um pedido no back-end, só o pedido "cabeçalho" com o total).
- **Criar** um `Pagamento` (o endpoint novo, `/api/pagamentos`, é somente
  leitura — não há como registrar que um pagamento foi feito).
- Listar os **pedidos recebidos por um vendedor** (o endpoint de pedidos só
  retorna os pedidos do próprio usuário autenticado, como comprador).

Enquanto esses endpoints não existem, as telas de carrinho/checkout e "Meu
Negócio" continuam usando dados locais (`localStorage`) nesses pontos
específicos — o restante (login, cadastro, perfil, produtos, avaliação,
pedidos do comprador, cartões/chave PIX) já fala com o back-end de verdade.
