import { apiGetList, apiGetPagina, apiGetOne, apiPost, apiPatch, apiDelete, PaginaResultado } from "./client";
import { Pedido, PedidoDetalhado, StatusPedido, CheckoutPayload } from "./types";

/** GET /api/pedidos/usuario/all — pedidos do usuário autenticado (como comprador) */
export function listarMeusPedidos(): Promise<Pedido[]> {
  return apiGetList<Pedido>("/pedidos/usuario/all");
}

/** Igual a listarMeusPedidos, mas em lotes — usado na tela "Meus Pedidos". */
export function listarMeusPedidosPaginado(opts?: {
  lote?: number;
  limite?: number;
}): Promise<PaginaResultado<Pedido>> {
  return apiGetPagina<Pedido>("/pedidos/usuario/all", opts);
}

/** GET /api/pedidos/{id} */
export function getPedidoPorId(id: number): Promise<Pedido> {
  return apiGetOne<Pedido>(`/pedidos/${id}`);
}

/** GET /api/pedidos/detalhe/{id} — pedido + itens + pagamento, tudo junto */
export function getPedidoDetalhado(id: number): Promise<PedidoDetalhado> {
  return apiGetOne<PedidoDetalhado>(`/pedidos/detalhe/${id}`);
}

/**
 * GET /api/pedidos/entregue/{id} — marca o pedido como ENTREGUE.
 * (É uma leitura no verbo HTTP, mas na prática executa uma mutação; assim
 * foi definido no back-end.)
 */
export function confirmarEntregaPedido(id: number): Promise<Pedido> {
  return apiGetOne<Pedido>(`/pedidos/entregue/${id}`);
}

/**
 * PATCH /api/pedidos/status/{id}?novoStatus=ENVIADO
 * Atenção: o back-end espera o novo status como QUERY PARAM, não no corpo.
 * Só aceita AGUARDANDO_PAGAMENTO, PROCESSANDO ou ENVIADO — ENTREGUE e
 * CANCELADO têm endpoints próprios (confirmarEntregaPedido / cancelarPedido).
 */
export function atualizarStatusPedido(id: number, novoStatus: StatusPedido): Promise<Pedido> {
  return apiPatch<Pedido>(`/pedidos/status/${id}?novoStatus=${novoStatus}`);
}

/**
 * POST /api/pedidos/create
 * Cria apenas o "cabeçalho" do pedido (sem itens/pagamento). Mantido por
 * compatibilidade — para finalizar uma compra de verdade, use checkout().
 */
export function criarPedido(dados: {
  idUsuario: number;
  precoTotal: number;
  dataCompra: string;
  status: StatusPedido;
}): Promise<Pedido> {
  return apiPost<Pedido>("/pedidos/create", dados);
}

/**
 * POST /api/pedidos/checkout — finaliza a compra de uma vez: cria o Pedido,
 * um ItemPedido para cada item do carrinho e o Pagamento, tudo de forma
 * atômica. O preço de cada item é travado no valor ATUAL do produto no
 * back-end (o preço mostrado no carrinho é só para exibição).
 */
export function checkout(dados: CheckoutPayload): Promise<PedidoDetalhado> {
  return apiPost<PedidoDetalhado>("/pedidos/checkout", dados);
}

/** DELETE /api/pedidos/cancel/{id} */
export function cancelarPedido(id: number): Promise<void> {
  return apiDelete(`/pedidos/cancel/${id}`);
}
