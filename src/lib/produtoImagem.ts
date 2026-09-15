import { CategoriaProduto } from "@integracao-backend";

/**
 * O back-end (Produto.java) não tem campo de imagem — só nome, preço,
 * quantidade, categoria e descrição. Como o catálogo precisa de uma imagem
 * para cada card, usamos um mapeamento fixo por categoria com as fotos que
 * já existem em /public.
 */
const IMAGEM_POR_CATEGORIA: Record<CategoriaProduto, string> = {
  FRUTAS: "/ruralp1.jpg",
  VERDURAS: "/ruralp1.jpg",
  LEGUMES: "/rural2.jpg",
  GRAOS: "/rural2.jpg",
  CEREAIS: "/rural2.jpg",
  LATICINIOS: "/icon.png",
  OVOS: "/icon.png",
  OUTROS: "/ruralp3.jpg",
};

export function imagemDoProduto(categoria: CategoriaProduto): string {
  return IMAGEM_POR_CATEGORIA[categoria] ?? "/ruralp3.jpg";
}
