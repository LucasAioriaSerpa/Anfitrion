import mockData from "../../../backend/database/data/mock_data.json" with { type: "json" };

const funcionarios = (mockData.funcionarios || []).map(
  (funcionario, index) => ({
    ...funcionario,
    id_funcionario: funcionario.id_funcionario || index + 1,
    id_hospede: funcionario.id_hospede || index + 1,
  }),
);

const hospedes = (mockData.hospedes || []).map((hospede, index) => ({
  ...hospede,
  id_hospede: hospede.id_hospede || funcionarios.length + index + 1,
}));

export const mockHoteis = (mockData.hoteis || []).map((hotel) => ({
  ...hotel,
}));

export const mockQuartos = (mockData.quartos || []).map((quarto) => ({
  ...quarto,
}));

const hospedeByEmail = new Map(
  hospedes.map((hospede) => [hospede.email.toLowerCase(), hospede]),
);

const quartoByHotelAndNumber = new Map(
  mockQuartos.map((quarto) => [
    `${quarto.id_hotel}:${quarto.num_quarto}`,
    quarto,
  ]),
);

export const allMockUsers = [...funcionarios, ...hospedes];

export const mockReservas = (mockData.reservas || []).map((reserva) => {
  const quarto = quartoByHotelAndNumber.get(
    `${reserva.id_hotel}:${reserva.quarto_num}`,
  );
  const hospede = hospedeByEmail.get(reserva.hospede_email?.toLowerCase());
  const noites = Math.max(
    1,
    Math.ceil(
      (new Date(reserva.check_out) - new Date(reserva.check_in)) /
        (1000 * 60 * 60 * 24),
    ),
  );
  const taxaCafe = Number(reserva.taxa_cafe_manha) || 0;
  const taxaPet = Number(reserva.taxa_pet) || 0;
  const taxaRefeicao = Number(reserva.taxa_refeicao) || 0;
  const taxaAlmoco = Number(reserva.taxa_almoco) || 0;
  const taxaJantar = Number(reserva.taxa_jantar) || 0;
  const diaria = Number(reserva.diaria) || 0;

  return {
    ...reserva,
    id_quarto: quarto?.id_quarto || null,
    id_hospede: hospede?.id_hospede || null,
    check_in: reserva.check_in,
    check_out: reserva.check_out,
    valor_total:
      diaria * noites +
      taxaCafe * noites +
      taxaPet +
      taxaRefeicao +
      taxaAlmoco * noites +
      taxaJantar * noites,
    status: "Confirmada",
    cafe_da_manha: taxaCafe > 0,
    pet: taxaPet > 0,
    almoco: taxaAlmoco > 0,
    quarto,
    hospede,
  };
});

export const initialQuartos = mockQuartos.map((quarto) => ({ ...quarto }));
export const initialReservas = mockReservas.map((reserva) => ({ ...reserva }));
