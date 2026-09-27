import { Suspense } from "react";
import CatalogoContent from "../../components/catalogo/CatalogoContent";

export default function Catalogo() {
  return (
    <Suspense fallback={null}>
      <CatalogoContent />
    </Suspense>
  );
}
