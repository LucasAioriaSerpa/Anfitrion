/**
 * Plugin do Vite que atende requisições à rota /api localmente no servidor de desenvolvimento.
 * Mantém o estado em arquivo para que cadastros e alterações de quarto persistam entre reinícios.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  mockHoteis,
  mockQuartos,
  mockReservas,
  allMockUsers,
} from "./src/data/mockData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_PATH = path.resolve(
  __dirname,
  "src/data/dev-persisted-state.json",
);

function createSeedState() {
  return {
    users: [...allMockUsers],
    hoteis: [...mockHoteis],
    quartos: [...mockQuartos],
    reservas: [...mockReservas],
  };
}

function loadPersistedState() {
  try {
    if (!fs.existsSync(STORAGE_PATH)) {
      const seed = createSeedState();
      fs.writeFileSync(STORAGE_PATH, JSON.stringify(seed, null, 2), "utf8");
      return seed;
    }

    const raw = fs.readFileSync(STORAGE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.users) && Array.isArray(parsed?.quartos)) {
      return {
        users: parsed.users,
        hoteis: Array.isArray(parsed.hoteis) ? parsed.hoteis : [...mockHoteis],
        quartos: parsed.quartos,
        reservas: Array.isArray(parsed.reservas)
          ? parsed.reservas
          : [...mockReservas],
      };
    }
  } catch (error) {
    console.warn(
      "[vite-api-plugin] Falha ao carregar estado persistido, usando seed inicial.",
      error,
    );
  }

  const seed = createSeedState();
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(seed, null, 2), "utf8");
  return seed;
}

function savePersistedState(state) {
  try {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(state, null, 2), "utf8");
  } catch (error) {
    console.warn("[vite-api-plugin] Falha ao salvar estado persistido.", error);
  }
}

function getDevUser(req, users) {
  const authorization = req.headers.authorization || "";
  if (!authorization.startsWith("Bearer dev:")) {
    return null;
  }

  let email;
  try {
    email = decodeURIComponent(
      authorization.slice("Bearer dev:".length),
    ).toLowerCase();
  } catch {
    return null;
  }

  return users.find((user) => user.email.toLowerCase() === email) || null;
}

function isEmployee(user) {
  return user?.role === "funcionario" && Boolean(user?.id_hotel);
}

function belongsToEmployeeHotel(entity, record, employee, quartos, reservas) {
  const hotelId = Number(employee.id_hotel);
  if (entity === "reserva") {
    const room = quartos.find(
      (quarto) => Number(quarto.id_quarto) === Number(record.id_quarto),
    );
    return Number(room?.id_hotel) === hotelId;
  }

  if (entity === "hospede") {
    return reservas.some(
      (reserva) =>
        Number(reserva.id_hospede) === Number(record.id_hospede) &&
        belongsToEmployeeHotel("reserva", reserva, employee, quartos, reservas),
    );
  }

  return Number(record.id_hotel) === hotelId;
}

function canAccessRecord(entity, record, user, quartos, reservas) {
  if (!user) return false;
  if (!isEmployee(user)) {
    if (entity === "hotel" || entity === "quarto") return true;
    if (entity === "hospede" || entity === "reserva") {
      return Number(record.id_hospede) === Number(user.id_hospede);
    }
    return false;
  }
  return belongsToEmployeeHotel(entity, record, user, quartos, reservas);
}

function roomDisponivel(room) {
  const status = String(room?.status || "").toLowerCase();
  return status === "disponível" || status === "disponivel";
}

function nextNumericId(items, key) {
  const ids = items.map((item) => Number(item[key] ?? item.id) || 0);
  return (ids.length ? Math.max(...ids) : 0) + 1;
}

function enrichReserva(reserva, quartos, users) {
  const room = quartos.find(
    (quarto) => Number(quarto.id_quarto ?? quarto.id) === Number(reserva.id_quarto),
  );
  const hospede = users.find(
    (user) => Number(user.id_hospede) === Number(reserva.id_hospede),
  );
  return {
    ...reserva,
    id: reserva.id_reserva ?? reserva.id,
    id_hotel: reserva.id_hotel ?? room?.id_hotel ?? null,
    quarto_numero: reserva.quarto_numero ?? room?.num_quarto ?? null,
    quarto_tipo: reserva.quarto_tipo ?? room?.tipo ?? null,
    quarto_diaria: reserva.quarto_diaria ?? room?.diaria ?? null,
    hospede_nome: hospede?.nome ?? null,
    hospede_email: hospede?.email ?? null,
  };
}

export function apiDevPlugin() {
  const state = loadPersistedState();
  const users = state.users;
  const hoteis = state.hoteis;
  const quartos = state.quartos;
  const reservas = state.reservas;

  function persist() {
    savePersistedState({ users, hoteis, quartos, reservas });
  }

  function sendJson(res, statusCode, data) {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify(data));
  }

  function sendList(res, records) {
    return sendJson(res, 200, {
      success: true,
      data: records,
      total: records.length,
      message: `${records.length} registros encontrados`,
    });
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
        const pathname = parsedUrl.pathname.replace(/\/$/, "") || "/";

        if (!pathname.startsWith("/api")) {
          return next();
        }

        const method = (req.method || "GET").toUpperCase();
        const isAuthRoute = pathname.startsWith("/api/auth/");
        const currentUser = isAuthRoute ? null : getDevUser(req, users);

        if (!isAuthRoute && !currentUser) {
          return sendJson(res, 401, {
            success: false,
            message: "Autenticação obrigatória ou credencial inválida",
          });
        }

        const scoped = (entity, records) =>
          records.filter((record) =>
            canAccessRecord(entity, record, currentUser, quartos, reservas),
          );

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
            access_token: `dev:${encodeURIComponent(user.email)}`,
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

          if (requestedRole === "funcionario") {
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
          persist();

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
          const statsUser = getDevUser(req, users);
          if (!isEmployee(statsUser)) {
            return sendJson(res, 401, {
              success: false,
              message: "Autenticação de funcionário obrigatória",
            });
          }
          const hotelRooms = quartos.filter((room) =>
            belongsToEmployeeHotel(
              "quarto",
              room,
              statsUser,
              quartos,
              reservas,
            ),
          );
          const hotelReservations = reservas.filter((reserva) =>
            belongsToEmployeeHotel(
              "reserva",
              reserva,
              statsUser,
              quartos,
              reservas,
            ),
          );
          const totalHospedes = users.filter(
            (user) =>
              user.role === "hospede" &&
              belongsToEmployeeHotel(
                "hospede",
                user,
                statsUser,
                quartos,
                reservas,
              ),
          ).length;
          const totalFuncionarios = users.filter(
            (user) =>
              user.role === "funcionario" &&
              belongsToEmployeeHotel(
                "funcionario",
                user,
                statsUser,
                quartos,
                reservas,
              ),
          ).length;
          return sendJson(res, 200, {
            success: true,
            stats: {
              totalHospedes,
              totalFuncionarios,
              totalHoteis: 1,
              totalQuartos: hotelRooms.length,
              totalReservas: hotelReservations.length,
              totalUsuarios: totalHospedes + totalFuncionarios,
            },
          });
        }

        // 5. CRUD Hóspede
        if (pathname === "/api/hospede") {
          if (method === "GET") {
            return sendList(
              res,
              scoped(
                "hospede",
                users.filter((user) => user.role === "hospede"),
              ),
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
            persist();
            return sendJson(res, 201, {
              success: true,
              data: newHosp,
              message: "Hóspede criado com sucesso",
            });
          }
        }

        // 6. CRUD Hotel
        if (pathname === "/api/hotel" && method === "GET") {
          return sendList(res, scoped("hotel", hoteis));
        }

        // 7. CRUD Quarto
        if (pathname === "/api/quarto" && method === "GET") {
          const hotelFilter = parsedUrl.searchParams.get("id_hotel");
          const statusFilter = parsedUrl.searchParams.get("status");
          let rooms = scoped("quarto", quartos);
          if (hotelFilter) {
            rooms = rooms.filter(
              (room) => Number(room.id_hotel) === Number(hotelFilter),
            );
          }
          if (statusFilter) {
            rooms = rooms.filter(
              (room) =>
                String(room.status).toLowerCase() ===
                String(statusFilter).toLowerCase(),
            );
          }
          return sendList(res, rooms);
        }

        if (pathname.startsWith("/api/quarto/")) {
          const roomId = Number(pathname.split("/").pop());
          const room = quartos.find(
            (q) => Number(q.id_quarto ?? q.id) === roomId,
          );

          if (
            !room ||
            !canAccessRecord("quarto", room, currentUser, quartos, reservas)
          ) {
            return sendJson(res, 404, {
              success: false,
              message: "Quarto não encontrado",
            });
          }

          if (method === "GET") {
            return sendJson(res, 200, {
              success: true,
              data: room,
            });
          }

          if (method === "PUT" || method === "PATCH") {
            const body = await readBody(req);
            if (body.status) room.status = body.status;
            if (body.diaria !== undefined) room.diaria = Number(body.diaria);
            if (body.tipo) room.tipo = body.tipo;
            if (body.num_quarto) room.num_quarto = Number(body.num_quarto);
            persist();

            return sendJson(res, 200, {
              success: true,
              message: "Status do quarto atualizado com sucesso",
              data: room,
            });
          }
        }

        // 8. CRUD Funcionário
        if (pathname === "/api/funcionario" && method === "GET") {
          return sendList(
            res,
            scoped(
              "funcionario",
              users.filter((user) => user.role === "funcionario"),
            ),
          );
        }

        // 9. CRUD Reserva
        if (pathname === "/api/reserva") {
          if (method === "GET") {
            return sendList(
              res,
              scoped("reserva", reservas).map((reserva) =>
                enrichReserva(reserva, quartos, users),
              ),
            );
          }

          if (method === "POST") {
            const body = await readBody(req);
            if (
              !isEmployee(currentUser) &&
              Number(body.id_hospede) !== Number(currentUser.id_hospede)
            ) {
              return sendJson(res, 403, {
                success: false,
                message: "Reserva fora do hóspede autenticado",
                data: null,
              });
            }

            const room = quartos.find(
              (quarto) =>
                Number(quarto.id_quarto ?? quarto.id) === Number(body.id_quarto),
            );
            if (!room) {
              return sendJson(res, 400, {
                success: false,
                message: "Quarto não encontrado",
                data: null,
              });
            }

            if (!isEmployee(currentUser) && !roomDisponivel(room)) {
              return sendJson(res, 403, {
                success: false,
                message: "Quarto indisponível para reserva",
                data: null,
              });
            }

            if (
              isEmployee(currentUser) &&
              Number(room.id_hotel) !== Number(currentUser.id_hotel)
            ) {
              return sendJson(res, 403, {
                success: false,
                message: "Reserva fora do hotel autorizado",
                data: null,
              });
            }

            const nova = {
              id_reserva: nextNumericId(reservas, "id_reserva"),
              id_quarto: Number(body.id_quarto),
              id_hospede: Number(body.id_hospede),
              id_hotel: room.id_hotel,
              check_in: body.check_in,
              check_out: body.check_out,
              qtd_hospedes: Number(body.qtd_hospedes) || 1,
              taxa_pet: Number(body.taxa_pet) || 0,
              taxa_refeicao: Number(body.taxa_refeicao) || 0,
              taxa_cafe_manha: Number(body.taxa_cafe_manha) || 0,
              taxa_almoco: Number(body.taxa_almoco) || 0,
              taxa_jantar: Number(body.taxa_jantar) || 0,
              status: "Confirmada",
            };
            reservas.push(nova);
            room.status = "Ocupado";
            persist();

            return sendJson(res, 201, {
              success: true,
              data: enrichReserva(nova, quartos, users),
              message: "Reserva criada com sucesso",
            });
          }
        }

        if (pathname.startsWith("/api/reserva/")) {
          const reservaId = Number(pathname.split("/").pop());
          const reserva = reservas.find(
            (item) => Number(item.id_reserva ?? item.id) === reservaId,
          );

          if (
            !reserva ||
            !canAccessRecord("reserva", reserva, currentUser, quartos, reservas)
          ) {
            return sendJson(res, 404, {
              success: false,
              message: "Reserva não encontrada",
              data: null,
            });
          }

          if (method === "GET") {
            return sendJson(res, 200, {
              success: true,
              data: enrichReserva(reserva, quartos, users),
            });
          }

          if (method === "PUT" || method === "PATCH") {
            const body = await readBody(req);
            if (body.check_in) reserva.check_in = body.check_in;
            if (body.check_out) reserva.check_out = body.check_out;
            if (body.qtd_hospedes !== undefined) {
              reserva.qtd_hospedes = Number(body.qtd_hospedes) || 1;
            }
            for (const taxa of [
              "taxa_pet",
              "taxa_refeicao",
              "taxa_cafe_manha",
              "taxa_almoco",
              "taxa_jantar",
            ]) {
              if (body[taxa] !== undefined) reserva[taxa] = Number(body[taxa]) || 0;
            }
            persist();
            return sendJson(res, 200, {
              success: true,
              data: enrichReserva(reserva, quartos, users),
              message: "Reserva atualizada com sucesso",
            });
          }

          if (method === "DELETE") {
            const room = quartos.find(
              (quarto) =>
                Number(quarto.id_quarto ?? quarto.id) === Number(reserva.id_quarto),
            );
            const index = reservas.findIndex(
              (item) => Number(item.id_reserva ?? item.id) === reservaId,
            );
            if (index >= 0) reservas.splice(index, 1);
            if (room) room.status = "Disponível";
            persist();
            return sendJson(res, 200, {
              success: true,
              data: null,
              message: "Reserva excluída com sucesso",
            });
          }
        }

        return sendJson(res, 404, {
          success: false,
          message: `Endpoint ${pathname} não encontrado no servidor simulado`,
        });
      });
    },
  };
}
