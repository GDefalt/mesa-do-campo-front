import { Suspense } from "react";
import PerfilContent from "../../components/perfil/PerfilContent";

export default function Perfil() {
  return (
    <Suspense fallback={null}>
      <PerfilContent />
    </Suspense>
  );
}
