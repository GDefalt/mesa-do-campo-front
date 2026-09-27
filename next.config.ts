import type { NextConfig } from "next";

// URL do back-end Spring Boot (branch dev). Pode ser sobrescrita via variável
// de ambiente BACKEND_URL (ex: em produção, apontando para o servidor real).
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Tudo que o front chamar em /api/* é repassado para o back-end.
        // Isso evita problemas de CORS, já que o back-end (branch dev) não
        // possui nenhuma configuração de CORS liberando o front separadamente.
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
