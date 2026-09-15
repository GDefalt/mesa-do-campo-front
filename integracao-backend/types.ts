/**
 * Tipos espelhando as Entities e Enums do back-end (mesa-do-campo-back,
 * branch dev — conforme o zip fornecido). Sempre que o back-end mudar um
 * campo ou um enum, este arquivo deve ser atualizado junto, já que é a fonte
 * única da "forma" dos dados usada pelo front.
 */

// ===== Enums (Entities/Enum/*.java) =====

/** CategoriaProduto.java */
export const CATEGORIA_PRODUTO = [
  "VERDURAS",
  "LEGUMES",
  "FRUTAS",
  "LATICINIOS",
  "GRAOS",
  "CEREAIS",
  "OVOS",
  "OUTROS",
] as const;
export type CategoriaProduto = (typeof CATEGORIA_PRODUTO)[number];

export const CATEGORIA_PRODUTO_LABEL: Record<CategoriaProduto, string> = {
  VERDURAS: "Verduras",
  LEGUMES: "Legumes",
  FRUTAS: "Frutas",
  LATICINIOS: "Laticínios",
  GRAOS: "Grãos",
  CEREAIS: "Cereais",
  OVOS: "Ovos",
  OUTROS: "Outros",
};

/** StatusPedido.java (status do pedido como um todo) */
export const STATUS_PEDIDO = [
  "AGUARDANDO_PAGAMENTO",
  "PROCESSANDO",
  "ENVIADO",
  "ENTREGUE",
  "CANCELADO",
] as const;
export type StatusPedido = (typeof STATUS_PEDIDO)[number];

export const STATUS_PEDIDO_LABEL: Record<StatusPedido, string> = {
  AGUARDANDO_PAGAMENTO: "Aguardando pagamento",
  PROCESSANDO: "Processando",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

/** StatusItemPedido.java (status de cada item dentro de um pedido) */
export const STATUS_ITEM_PEDIDO = [
  "PENDENTE",
  "PREPARANDO",
  "EM_TRANSITO",
  "ENTREGUE",
  "CANCELADO",
] as const;
export type StatusItemPedido = (typeof STATUS_ITEM_PEDIDO)[number];

export const STATUS_ITEM_PEDIDO_LABEL: Record<StatusItemPedido, string> = {
  PENDENTE: "Pendente",
  PREPARANDO: "Preparando",
  EM_TRANSITO: "Em trânsito",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

/** StatusPagamento.java */
export const STATUS_PAGAMENTO = [
  "PENDENTE",
  "EM_ANALISE",
  "APROVADO",
  "RECUSADO",
  "CANCELADO",
  "ESTORNADO",
] as const;
export type StatusPagamento = (typeof STATUS_PAGAMENTO)[number];

export const STATUS_PAGAMENTO_LABEL: Record<StatusPagamento, string> = {
  PENDENTE: "Pendente",
  EM_ANALISE: "Em análise",
  APROVADO: "Aprovado",
  RECUSADO: "Recusado",
  CANCELADO: "Cancelado",
  ESTORNADO: "Estornado",
};

/** TipoPagamento.java */
export const TIPO_PAGAMENTO = ["CREDITO", "DEBITO", "PIX"] as const;
export type TipoPagamento = (typeof TIPO_PAGAMENTO)[number];

export const TIPO_PAGAMENTO_LABEL: Record<TipoPagamento, string> = {
  CREDITO: "Crédito",
  DEBITO: "Débito",
  PIX: "PIX",
};

// ===== Entities =====

/** Cliente.java (retorno da API vem como ClienteDTO.java) */
export interface ClienteDTO {
  id: number;
  nome: string;
  cpfOrCnpj: string;
  email: string;
  telefone: string;
  // Integer (nullable) no back-end — cliente recém-cadastrado ainda não tem endereço.
  idEnderecoEntrega: number | null;
}

/** Corpo esperado por POST /api/cliente/create (entidade Cliente completa) */
export interface ClienteCreate {
  nome: string;
  cpfCnpj: string;
  email: string;
  senha: string;
  telefone?: string;
}

/** Endereco.java */
export interface Endereco {
  id: number;
  idUsuario: number;
  cep: string;
  country?: string;
  state?: string;
  city?: string;
  adress?: string; // grafia exata usada no back-end (sem o segundo "d")
  number?: number;
  complement?: string;
}

/** VendedorDTO.java (retorno) */
export interface VendedorDTO {
  idVendedor: number;
  nome: string;
  email: string;
  telefone: string;
  avaliacao: number;
  dataAdmissao: string; // LocalDate (YYYY-MM-DD)
}

/** Vendedor.java (corpo esperado por POST /api/vendedor/create) */
export interface VendedorCreate {
  idVendedor: number;
  avaliacao?: number;
  dataAdmissao?: string;
  contaRecebimento?: string;
  tipoPagamento?: TipoPagamento;
}

/** Produto.java */
export interface Produto {
  id: number;
  idVendedor: number;
  nome: string;
  preco: number;
  quantidade: number;
  categoria: CategoriaProduto;
  descricao?: string;
}

/** Pedido.java */
export interface Pedido {
  id: number;
  idUsuario: number;
  precoTotal: number;
  dataCompra: string; // LocalDateTime ISO
  status: StatusPedido;
}

/** Pagamento.java */
export interface Pagamento {
  id: number;
  idPedido: number;
  metodoPagamento: TipoPagamento;
  status: StatusPagamento;
  dataPagamento?: string; // LocalDateTime ISO
  valorPago: number;
}

/** ItemPedido.java */
export interface ItemPedido {
  id: number;
  idPedido: number;
  idProduto: number;
  quantidade: number;
  precoUnit: number;
  status: StatusItemPedido;
  // Cópia da data de compra do pedido, gravada no momento da criação do
  // item (o vendedor não tem acesso ao Pedido do comprador diretamente).
  dataCompra?: string;
}

/** PedidoDetalhadoDTO.java — retorno de GET /api/pedidos/detalhe/{id} */
export interface PedidoDetalhado {
  pedido: Pedido;
  itens: ItemPedido[];
  pagamento: Pagamento | null;
}

/** Avaliacao.java — avalia o VENDEDOR (não o produto individualmente) */
export interface Avaliacao {
  id: number;
  idVendedor: number;
  idCliente: number;
  nota: number;
  descricao?: string;
}

/** CartaoCredito.java / CartaoDebito.java (mesmo formato para ambos) */
export interface Cartao {
  id: number;
  idCliente: number;
  nome: string;
  bandeira: string;
  ultimosDigitos: number;
  tokenGateway: string;
  // O getter boolean "isPadrao()" faz o Jackson serializar a propriedade
  // como "padrao" (e não "isPadrao") — confirmado pela convenção do Lombok.
  padrao: boolean;
}

/** ChavePix.java */
export interface ChavePix {
  id: number;
  idCliente: number;
  nome: string;
  tipoChave: string;
  chave: string;
  padrao: boolean;
}

/** LoginDTO.java */
export interface LoginPayload {
  email: string;
  senha: string;
}

/** ItemCheckoutDTO.java */
export interface ItemCheckoutPayload {
  idProduto: number;
  quantidade: number;
}

/** CheckoutRequestDTO.java — corpo de POST /api/pedidos/checkout */
export interface CheckoutPayload {
  itens: ItemCheckoutPayload[];
  metodoPagamento: TipoPagamento;
}
