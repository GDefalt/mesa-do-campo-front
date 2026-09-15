export function formatarPreco(valor?: number | null): string {
    if (valor === undefined || valor === null || isNaN(valor)) {
        return (0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}