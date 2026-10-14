/* =========================================================
   CONFIGURAÇÃO — troque aqui os dados da sua empresa
   ========================================================= */
const CONFIG = {
  empresa: "Demão Reformas e Pintura",
  whatsapp: "5500900000000",       // DDI + DDD + número, só dígitos
  telefoneExibido: "(00) 90000-0000"
};

/* Serviços: preço de mão de obra e de material por m² (valores de exemplo) */
const SERVICOS = [
  { id: "interna",  nome: "Pintura interna",        desc: "Paredes e tetos com tinta acrílica, acabamento fosco ou acetinado.", mo: 18, mat: 9,  m2Dia: 40 },
  { id: "externa",  nome: "Pintura externa",        desc: "Fachadas e muros com tinta resistente a sol e chuva.",                mo: 26, mat: 13, m2Dia: 30 },
  { id: "massa",    nome: "Massa corrida + pintura", desc: "Parede lisa, sem marcas, pronta para acabamento fino.",             mo: 32, mat: 14, m2Dia: 20 },
  { id: "textura",  nome: "Textura e grafiato",     desc: "Acabamento decorativo que também disfarça imperfeições.",            mo: 30, mat: 18, m2Dia: 22 },
  { id: "gesso",    nome: "Gesso e drywall",        desc: "Forros, sancas e divisórias para mudar o ambiente.",                 mo: 45, mat: 40, m2Dia: 15 },
  { id: "reparos",  nome: "Reparos e impermeabilização", desc: "Trincas, infiltrações e mofo tratados na origem.",             mo: 38, mat: 22, m2Dia: 18 }
];

const CORES = [
  { nome: "Sálvia",      hex: "#7f9c8a" },
  { nome: "Areia",       hex: "#d8c7a8" },
  { nome: "Azul névoa",  hex: "#9fb6c8" },
  { nome: "Terracota",   hex: "#b9694b" },
  { nome: "Grafite",     hex: "#4b5157" },
  { nome: "Branco gelo", hex: "#eceeee" }
];

/* ---------- utilitários ---------- */
const $ = (sel) => document.querySelector(sel);
const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/* ---------- leque de cores do hero ---------- */
function montarLeque() {
  const fan = $("#fan");
  const angulos = [-36, -22, -8, 6, 20, 34];
  CORES.forEach((c, i) => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.style.background = c.hex;
    chip.style.transform = "rotate(0deg)";
    chip.textContent = c.hex.toUpperCase();
    fan.appendChild(chip);
    // abre o leque logo depois de carregar (animação de entrada)
    requestAnimationFrame(() => setTimeout(() => chip.style.transform = `rotate(${angulos[i]}deg)`, 80 * i));
  });
}

/* ---------- lista de serviços ---------- */
function montarServicos() {
  $("#services").innerHTML = SERVICOS.map(s => `
    <article class="service">
      <h3>${s.nome}</h3>
      <p>${s.desc}</p>
      <span class="unit">a partir de ${brl(s.mo)}/m² (mão de obra)</span>
    </article>`).join("");

  const opcoes = SERVICOS.map(s => `<option value="${s.id}">${s.nome}</option>`).join("");
  $("#svc").innerHTML = opcoes;
  $("#servicoForm").innerHTML = opcoes;
}

/* ---------- simulador de orçamento ---------- */
let fatorEstado = 1;

function calcular() {
  const s = SERVICOS.find(x => x.id === $("#svc").value);
  const area = Math.max(1, Number($("#area").value) || 0);
  const comMaterial = $("#material").checked;

  const maoDeObra = s.mo * area * fatorEstado;
  const material = comMaterial ? s.mat * area * fatorEstado : 0;
  const total = maoDeObra + material;
  // faixa de ±12% porque cada obra tem particularidades
  const min = total * 0.88, max = total * 1.12;
  const dias = Math.max(1, Math.ceil(area / s.m2Dia * fatorEstado));

  $("#total").textContent = `${brl(min)} – ${brl(max)}`;
  $("#breakdown").innerHTML = `
    <div><span>Mão de obra</span><span>${brl(maoDeObra)}</span></div>
    <div><span>Material</span><span>${comMaterial ? brl(material) : "por sua conta"}</span></div>
    <div><span>Área</span><span>${area} m²</span></div>`;
  $("#prazo").textContent = `Prazo estimado: ${dias} ${dias === 1 ? "dia útil" : "dias úteis"}. Valores de exemplo, ajuste no código.`;
  atualizarMensagem();
}

function ligarSimulador() {
  const range = $("#areaRange"), num = $("#area");
  range.addEventListener("input", () => { num.value = range.value; calcular(); });
  num.addEventListener("input", () => { range.value = Math.min(400, num.value); calcular(); });
  $("#svc").addEventListener("change", () => { $("#servicoForm").value = $("#svc").value; calcular(); });
  $("#material").addEventListener("change", calcular);

  $("#estado").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    $("#estado").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b === btn));
    fatorEstado = Number(btn.dataset.f);
    calcular();
  });

  $("#usarEstimativa").addEventListener("click", () => {
    $("#servicoForm").value = $("#svc").value;
    $("#msg").value = `Área aproximada de ${$("#area").value} m². Estimativa do site: ${$("#total").textContent}.`;
    atualizarMensagem();
  });
}

/* ---------- visualizador de cores ---------- */
let corAtual = CORES[0];

function montarCores() {
  $("#swatches").innerHTML = CORES.map((c, i) => `
    <button type="button" class="swatch" data-i="${i}" aria-pressed="${i === 0}">
      <span class="c" style="background:${c.hex}"></span>
      <b>${c.nome}</b><small>${c.hex.toUpperCase()}</small>
    </button>`).join("");

  $("#swatches").addEventListener("click", (e) => {
    const btn = e.target.closest(".swatch");
    if (!btn) return;
    corAtual = CORES[btn.dataset.i];
    $("#swatches").querySelectorAll(".swatch").forEach(b => b.setAttribute("aria-pressed", b === btn));
    $("#wall").setAttribute("fill", corAtual.hex);
    $("#curColor").textContent = `Cor na parede: ${corAtual.nome} (${corAtual.hex.toUpperCase()})`;
    atualizarMensagem();
  });
  $("#curColor").textContent = `Cor na parede: ${corAtual.nome} (${corAtual.hex.toUpperCase()})`;
}

/* ---------- formulário → mensagem de WhatsApp ---------- */
function montarMensagem() {
  const nome = $("#nome").value.trim() || "(seu nome)";
  const bairro = $("#bairro").value.trim() || "(bairro)";
  const servico = $("#servicoForm").selectedOptions[0]?.textContent || "";
  const extra = $("#msg").value.trim();
  return `Olá! Sou ${nome}, do bairro ${bairro}.\n` +
         `Tenho interesse em: ${servico}.\n` +
         `Cor que gostei: ${corAtual.nome}.\n` +
         (extra ? `${extra}\n` : "") +
         `Podemos agendar uma visita?`;
}

function atualizarMensagem() {
  const texto = montarMensagem();
  $("#preview").textContent = texto;
  $("#waLink").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(texto)}`;
}

function ligarFormulario() {
  ["#nome", "#bairro", "#msg"].forEach(s => $(s).addEventListener("input", atualizarMensagem));
  $("#servicoForm").addEventListener("change", atualizarMensagem);
  $("#form").addEventListener("submit", (e) => e.preventDefault());

  $("#copyBtn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(montarMensagem());
      $("#status").textContent = "Mensagem copiada.";
    } catch {
      // se o navegador bloquear, seleciona o texto para copiar manualmente
      const r = document.createRange(); r.selectNodeContents($("#preview"));
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      $("#status").textContent = "Texto selecionado. Use Ctrl+C para copiar.";
    }
  });
}

/* ---------- inicialização ---------- */
document.title = CONFIG.empresa;
$("#phoneText").textContent = CONFIG.telefoneExibido;
$("#footer").textContent = `© ${new Date().getFullYear()} ${CONFIG.empresa}. Orçamentos sem compromisso.`;
montarLeque();
montarServicos();
ligarSimulador();
montarCores();
ligarFormulario();
calcular();
