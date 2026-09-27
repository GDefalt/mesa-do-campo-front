import ProdutoDetalheContent from "../../../components/produto/ProdutoDetalheContent";

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ProdutoDetalheContent id={Number(id)} />;
}
