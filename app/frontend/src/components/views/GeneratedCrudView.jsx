import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import Button from "../common/Button";
import Modal from "../common/Modal";
import { generatedApi } from "../../services/apiService";

const LABELS = {
  id_hospede: "ID hóspede",
  id_hotel: "ID hotel",
  id_quarto: "ID quarto",
  id_funcionario: "ID funcionário",
  id_reserva: "ID reserva",
  num_quarto: "Número",
  qtd_quartos: "Quantidade de quartos",
  qtd_hospedes: "Quantidade de hóspedes",
  check_in: "Check-in",
  check_out: "Check-out",
};

function labelFor(column) {
  return LABELS[column.name] || column.name.replaceAll("_", " ");
}

function inputType(column) {
  if (column.name.includes("data") || column.name.startsWith("check_")) {
    return "date";
  }
  if (column.python_type === "int" || column.python_type === "float") {
    return "number";
  }
  return "text";
}

export default function GeneratedCrudView() {
  const [resources, setResources] = useState([]);
  const [selected, setSelected] = useState("");
  const [records, setRecords] = useState([]);
  const [draft, setDraft] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const resource = useMemo(
    () => resources.find((item) => item.name === selected),
    [resources, selected],
  );
  const editableColumns = resource?.columns.filter(
    (column) => !column.primary_key && column.name !== "criado_em",
  ) || [];

  async function loadSchema() {
    const response = await generatedApi.getSchema();
    if (!response.ok || !response.data?.success) {
      throw new Error(response.data?.message || "Não foi possível ler o esquema");
    }
    const nextResources = response.data.data || [];
    setResources(nextResources);
    setSelected((current) => current || nextResources[0]?.name || "");
  }

  async function loadRecords(resourceName = selected) {
    if (!resourceName) return;
    setLoading(true);
    const response = await generatedApi.getAll(resourceName);
    setLoading(false);
    if (!response.ok || !response.data?.success) {
      setFeedback(response.data?.message || "Não foi possível carregar os registros.");
      return;
    }
    setRecords(response.data.data || []);
  }

  useEffect(() => {
    // Schema and records are external API state synchronized after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSchema().catch((error) => setFeedback(error.message));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRecords().catch((error) => setFeedback(error.message));
    // The selected resource is the only input that changes this request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  function openCreate() {
    setEditingId(null);
    setDraft({});
    setModalOpen(true);
  }

  function openEdit(record) {
    setEditingId(record[resource.primary_key]);
    setModalOpen(true);
    setDraft(Object.fromEntries(editableColumns.map((column) => [
      column.name,
      record[column.name] ?? "",
    ])));
  }

  async function save(event) {
    event.preventDefault();
    const response = editingId === null
      ? await generatedApi.create(selected, draft)
      : await generatedApi.update(selected, editingId, draft);
    if (!response.ok || !response.data?.success) {
      setFeedback(response.data?.message || "Não foi possível salvar.");
      return;
    }
    setFeedback("Registro salvo.");
    setEditingId(null);
    setModalOpen(false);
    await loadRecords();
  }

  async function remove(record) {
    const id = record[resource.primary_key];
    if (!window.confirm(`Excluir o registro ${id}?`)) return;
    const response = await generatedApi.delete(selected, id);
    setFeedback(response.ok ? "Registro excluído." : response.data?.message || "Não foi possível excluir.");
    if (response.ok) await loadRecords();
  }

  return (
    <section className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-bold text-stone-900">CRUD Database First</h2>
          <p className="text-xs text-stone-500">Telas geradas a partir do esquema SQLite, sem expor campos sensíveis.</p>
        </div>
        <div className="flex gap-2">
          <select value={selected} onChange={(event) => setSelected(event.target.value)} className="rounded-lg border border-stone-200 px-3 py-2 text-xs">
            {resources.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
          </select>
          <Button size="sm" variant="ghost" icon={RefreshCw} onClick={() => loadRecords()}>Atualizar</Button>
          <Button size="sm" variant="primary" icon={Plus} onClick={openCreate}>Novo</Button>
        </div>
      </div>
      {feedback && <p className="rounded-lg bg-stone-50 p-3 text-xs text-stone-600">{feedback}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-stone-700">
          <thead className="border-b border-stone-200 bg-stone-50">
            <tr>{resource?.columns.map((column) => <th className="px-3 py-2 font-semibold" key={column.name}>{labelFor(column)}</th>)}<th className="px-3 py-2">Ações</th></tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {records.map((record) => <tr key={record[resource.primary_key]}>
              {resource.columns.map((column) => <td className="px-3 py-2" key={column.name}>{String(record[column.name] ?? "-")}</td>)}
              <td className="flex gap-1 px-3 py-2">
                <Button size="sm" variant="ghost" icon={Pencil} onClick={() => openEdit(record)}>Editar</Button>
                <Button size="sm" variant="ghost" icon={Trash2} onClick={() => remove(record)}>Excluir</Button>
              </td>
            </tr>)}
            {!loading && records.length === 0 && <tr><td className="px-3 py-6 text-center text-stone-400" colSpan={(resource?.columns.length || 0) + 1}>Nenhum registro.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingId(null); setDraft({}); }} title={editingId === null ? `Novo ${selected}` : `Editar ${selected}`} footer={<><Button variant="ghost" onClick={() => { setModalOpen(false); setEditingId(null); setDraft({}); }}>Cancelar</Button><Button variant="primary" onClick={save}>Salvar</Button></>}>
        <form onSubmit={save} className="space-y-3">
          {editableColumns.map((column) => <label className="block text-xs text-stone-600" key={column.name}>{labelFor(column)}
            <input required={!column.nullable && column.default === null} type={inputType(column)} value={draft[column.name] ?? ""} onChange={(event) => setDraft({ ...draft, [column.name]: event.target.value })} className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm" />
          </label>)}
        </form>
      </Modal>
    </section>
  );
}
