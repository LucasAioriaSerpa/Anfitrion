/**
 * Plugin do Vite que atende requisições à rota /api localmente no servidor de desenvolvimento.
 * Utiliza o módulo centralizado de dados mock em src/data/mockData.js.
 */
import {
  mockHoteis,
  mockQuartos,
  mockReservas,
  allMockUsers,
} from "./src/data/mockData.js";

export function apiDevPlugin() {
  const users = [...allMockUsers];
  const hoteis = [...mockHoteis];
  const quartos = [...mockQuartos];
  const reservas = [...mockReservas];

  function sendJson(res, statusCode, data) {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(data));
  }

  function readBody(req) {
    return new Promise((resolve) => {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve({});
        }
      });
      req.on("error", () => resolve({}));
    });
  }

  return {
    name: "anfitrion-api-dev-plugin",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = new URL(req.url, "http://localhost");
        const pathname = parsedUrl.pathname;

        if (!pathname.startsWith("/api")) {
          return next();
        }

        const method = (req.method || "GET").toUpperCase();

        // 1. Auth: Login
        if (pathname === "/api/auth/login" && method === "POST") {
          const body = await readBody(req);
          const email = String(body.email || "")
            .trim()
            .toLowerCase();
          const senha = String(body.senha || "");

          if (!email || !senha) {
            return sendJson(res, 400, {
              success: false,
              message: "E-mail e senha são obrigatórios",
            });
          }

          const user = users.find((u) => u.email.toLowerCase() === email);
          if (!user || user.senha !== senha) {
            return sendJson(res, 401, {
              success: false,
              message: "Credenciais inválidas",
            });
          }

          return sendJson(res, 200, {
            success: true,
            message: "Login realizado com sucesso!",
            user: {
              id_hospede: user.id_hospede,
              nome: user.nome,
              email: user.email,
              telefone: user.telefone,
              role: user.role,
              cargo: user.cargo || null,
              id_hotel: user.id_hotel || null,
              id_funcionario: user.id_funcionario || null,
            },
          });
        }

        // 2. Auth: Register (Somente hóspedes permitidos)
        if (pathname === "/api/auth/register" && method === "POST") {
          const body = await readBody(req);
          const email = String(body.email || "")
            .trim()
            .toLowerCase();
          const senha = String(body.senha || "");
          const nome = String(body.nome || "").trim() || email.split("@")[0];
          const telefone = String(body.telefone || "(00) 00000-0000");
          const requestedRole = String(body.role || "hospede").toLowerCase();

          // Regra de negócio: Apenas hóspedes podem criar conta própria
          if (requestedRole === "funcionario" || body.codigoAcesso) {
            return sendJson(res, 403, {
              success: false,
              message:
                "Apenas hóspedes podem criar suas próprias contas. Contas de funcionários são cadastradas pela administração do hotel.",
            });
          }

          if (!email || !senha) {
            return sendJson(res, 400, {
              success: false,
              message: "E-mail e senha são obrigatórios",
            });
          }

          const exists = users.find((u) => u.email.toLowerCase() === email);
          if (exists) {
            return sendJson(res, 409, {
              success: false,
              message: "Este e-mail já está cadastrado",
            });
          }

          const newUser = {
            id_hospede: Date.now(),
            nome,
            email,
            senha,
            telefone,
            role: "hospede",
          };
          users.push(newUser);

          return sendJson(res, 201, {
            success: true,
            message: "Conta de hóspede criada com sucesso!",
            user: {
              id_hospede: newUser.id_hospede,
              nome: newUser.nome,
              email: newUser.email,
              role: "hospede",
            },
          });
        }

        // 3. Auth: Logout
        if (pathname === "/api/auth/logout" && method === "POST") {
          return sendJson(res, 200, {
            success: true,
            message: "Logout realizado com sucesso",
          });
        }

        // 4. Auth: Stats
        if (
          pathname === "/api/auth/stats" ||
          pathname === "/api/auth/estatisticas"
        ) {
          const totalHospedes = users.filter(
            (u) => u.role === "hospede",
          ).length;
          const totalFuncionarios = users.filter(
            (u) => u.role === "funcionario",
          ).length;
          return sendJson(res, 200, {
            success: true,
            stats: {
              totalHospedes,
              totalFuncionarios,
              totalHoteis: hoteis.length,
              totalQuartos: quartos.length,
              totalReservas: reservas.length,
              totalUsuarios: users.length,
            },
          });
        }

        // 5. CRUD Hospede
        if (pathname === "/api/hospede") {
          if (method === "GET") {
            return sendJson(
              res,
              200,
              users.filter((u) => u.role === "hospede"),
            );
          }
          if (method === "POST") {
            const body = await readBody(req);
            const newHosp = {
              id_hospede: Date.now(),
              ...body,
              role: "hospede",
            };
            users.push(newHosp);
            return sendJson(res, 201, newHosp);
          }
        }

        // 6. CRUD Hotel
        if (pathname === "/api/hotel") {
          return sendJson(res, 200, hoteis);
        }

        // 7. CRUD Quarto (com Diárias)
        if (pathname === "/api/quarto") {
          return sendJson(res, 200, quartos);
        }

        // 8. CRUD Funcionario (Administrador, Gerente, Subgerente, Recepcionista, Governanta, Camareira)
        if (pathname === "/api/funcionario") {
          return sendJson(
            res,
            200,
            users.filter((u) => u.role === "funcionario"),
          );
        }

        // 9. CRUD Reserva
        if (pathname === "/api/reserva") {
          return sendJson(res, 200, reservas);
        }

        // Rota padrão para /api não mapeada
        return sendJson(res, 404, {
          success: false,
          message: `Endpoint ${pathname} não encontrado no servidor simulado`,
        });
      });
    },
  };
}
