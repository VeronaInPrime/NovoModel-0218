import { useCallback, useEffect, useRef, useState } from "react";
import { get, set } from "idb-keyval";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FolderPlus,
  Image,
  Leaf,
  Menu,
  Monitor,
  MousePointer2,
  Palette,
  Plus,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  X,
  HelpCircle,
  ShoppingBag,
} from "lucide-react";
import { Calendar } from "../components/calendar";
import { Brand, Modal, ProductForm, GroupForm, Flyer, ImageUpload } from "../components/studio-ui";
import { ExportPanel, PlatesPanel, QRPanel } from "../components/exports";
import {
  campaignInfo,
  emptyData,
  newCampaign,
  themes,
  type Campaign,
  type Product,
  type Group,
  type StudioData,
} from "../lib/studio";

type Dialog =
  | "product"
  | "group"
  | "export"
  | "plates"
  | "qr"
  | "date"
  | "header"
  | "clear"
  | "all"
  | "deleteProduct"
  | "deleteGroup"
  | "help"
  | null;
export default function Studio() {
  const [data, setData] = useState<StudioData>(emptyData);
  const [loaded, setLoaded] = useState(false);
  const [saveState, setSaveState] = useState("Carregando");
  const [storageError, setStorageError] = useState("");
  const [date, setDate] = useState("2026-10-18");
  const [entered, setEntered] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [menu, setMenu] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product>();
  const [editingGroup, setEditingGroup] = useState<Group>();
  const [featured, setFeatured] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [toast, setToast] = useState("");
  const [mode, setMode] = useState("edit");
  const [mobilePanel, setMobilePanel] = useState(false);
  const [headerDraft, setHeaderDraft] = useState("");
  const [uploadError, setUploadError] = useState("");
  const persist = useRef(Promise.resolve());
  useEffect(() => {
    get<StudioData>("miro-studio-v1")
      .then((value) => {
        if (value?.campaigns) setData(value);
        setLoaded(true);
        setSaveState("Tudo salvo");
      })
      .catch(() => {
        setLoaded(true);
        setStorageError(
          "O armazenamento do navegador não está disponível. Seus dados não serão preservados.",
        );
        setSaveState("Não salvo");
      });
  }, []);
  useEffect(() => {
    if (!loaded) return;
    setSaveState("Salvando…");
    persist.current = persist.current
      .catch(() => {})
      .then(() => set("miro-studio-v1", data))
      .then(() => {
        setSaveState("Tudo salvo");
        setStorageError("");
      })
      .catch(() => {
        setSaveState("Falha ao salvar");
        setStorageError(
          "Não foi possível salvar. Verifique o espaço e as permissões do navegador antes de fechar.",
        );
      });
  }, [data, loaded]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  const close = useCallback(() => setDialog(null), []);
  const info = campaignInfo(date);
  const campaign = data.campaigns[info.key] || newCampaign();
  const update = (change: Partial<Campaign>) =>
    setData((old) => ({
      ...old,
      campaigns: {
        ...old.campaigns,
        [info.key]: { ...(old.campaigns[info.key] || newCampaign()), ...change },
      },
    }));
  const open = (d: Dialog) => {
    setMenu(false);
    setDialog(d);
  };
  const addProduct = (special = false) => {
    setEditingProduct(undefined);
    setFeatured(special);
    open("product");
  };
  const enter = () => {
    setEntered(true);
    setDialog(null);
  };
  const actions = [
    {
      icon: Plus,
      label: "Cadastrar produto",
      description: "Nome, imagem e preço",
      run: () => addProduct(),
    },
    {
      icon: Star,
      label: "Super desconto",
      description: "Dê destaque à sua oferta",
      run: () => addProduct(true),
    },
    {
      icon: FolderPlus,
      label: "Criar grupo de ofertas",
      description: "Organize seus produtos",
      run: () => {
        setEditingGroup(undefined);
        open("group");
      },
    },
    {
      icon: Image,
      label: "Pré-visualizar e exportar",
      description: "Imagem PNG para compartilhar",
      run: () => open("export"),
    },
    {
      icon: Printer,
      label: "Gerar placas",
      description: "Impressão em folha A4",
      run: () => open("plates"),
    },
    {
      icon: QrCode,
      label: "QR Code do WhatsApp",
      description: "Convide para seu grupo",
      run: () => open("qr"),
    },
  ];
  const menuContent = (
    <>
      <div className="drawer-title">
        <Brand />
        <button className="icon-btn" aria-label="Fechar menu" onClick={() => setMenu(false)}>
          <X size={23} />
        </button>
      </div>
      <span className="sidebar-label">SUAS FERRAMENTAS</span>
      {actions.map((a) => (
        <button key={a.label} className="tool-button" onClick={a.run}>
          <a.icon size={21} />
          <span>
            <strong>{a.label}</strong>
            <small>{a.description}</small>
          </span>
          <ChevronRight size={16} />
        </button>
      ))}
      <hr />
      <button className="tool-button" onClick={() => open("date")}>
        <CalendarDays size={21} />
        <span>
          <strong>Alterar data</strong>
          <small>{info.period}</small>
        </span>
      </button>
      <button
        className="tool-button"
        onClick={() => {
          setHeaderDraft(campaign.header);
          setUploadError("");
          open("header");
        }}
      >
        <Image size={21} />
        <span>
          <strong>Imagem do cabeçalho</strong>
          <small>Personalize sua campanha</small>
        </span>
      </button>
      <hr />
      <button className="tool-button danger" onClick={() => open("clear")}>
        <Trash2 size={20} />
        <span>
          <strong>Limpar produtos do dia</strong>
        </span>
      </button>
      <button className="tool-button danger" onClick={() => open("all")}>
        <Trash2 size={20} />
        <span>
          <strong>Apagar todos os dados</strong>
        </span>
      </button>
      <div className="local-note">
        <ShieldCheck size={20} />
        <p>
          Seus dados ficam salvos
          <br />
          <strong>neste navegador.</strong>
        </p>
      </div>
    </>
  );
  return (
    <div className={entered ? "studio-app" : "welcome-app"}>
      <header className="app-header">
        <div className="header-left">
          {entered && (
            <button
              className="icon-btn hamburger"
              aria-label="Abrir menu"
              onClick={() => setMenu(true)}
            >
              <Menu size={23} />
            </button>
          )}
          <Brand />
          <span className="header-divider" />
          <span className="header-title">Estúdio de ofertas</span>
        </div>
        <div className="header-right">
          <span className="save-indicator">
            <span />
            {entered ? saveState : "Feito para facilitar o seu dia"}
          </span>
          <button className="help-button" onClick={() => open("help")}>
            <HelpCircle size={18} />
            <span>Como funciona</span>
          </button>
          {entered && (
            <button className="btn primary small export-top" onClick={() => open("export")}>
              <Download size={16} />
              Exportar encarte
            </button>
          )}
        </div>
      </header>
      {!entered ? (
        <>
          <main className="welcome-main">
            <section className="welcome-copy">
              <div className="eyebrow">
                <span className="tiny-leaf">
                  <Leaf size={15} />
                </span>
                BOAS OFERTAS COMEÇAM AQUI
              </div>
              <h1>
                Sua economia
                <br />
                merece{" "}
                <span>
                  ganhar
                  <br className="desktop-break" /> destaque.
                </span>
                <svg viewBox="0 0 330 20" aria-hidden="true">
                  <path d="M4 14Q140 -5 322 10" />
                </svg>
              </h1>
              <p>
                Crie ofertas que chamam a atenção.
                <br />
                Organize seus produtos e compartilhe com
                <br className="desktop-break" /> seus clientes, de um jeito simples e bonito.
              </p>
              <div className="welcome-features">
                <span>
                  <CheckCircle2 size={18} />
                  Ofertas organizadas por dia
                </span>
                <span>
                  <CheckCircle2 size={18} />
                  Prontas para o WhatsApp
                </span>
                <span>
                  <CheckCircle2 size={18} />
                  Salvas automaticamente
                </span>
              </div>
              <div className="welcome-trust">
                <span className="trust-icon">
                  <ShoppingBag size={22} />
                </span>
                <div>
                  <strong>Mais tempo para cuidar do que importa.</strong>
                  <small>O seu mercado. Os seus clientes.</small>
                </div>
              </div>
            </section>
            <section className="welcome-calendar">
              <Calendar value={date} onChange={setDate} onEnter={enter} />
              <div className="calendar-bottom">
                <ShieldCheck size={15} />
                <span>Sem complicação. Sem perder suas ofertas.</span>
              </div>
            </section>
          </main>
          <div className="week-strip">
            <div className="week-intro">
              <span className="icon-box">
                <CalendarDays size={23} />
              </span>
              <div>
                <strong>
                  Cada dia, uma
                  <br />
                  boa oportunidade.
                </strong>
                <small>A campanha certa, automaticamente.</small>
              </div>
            </div>
            <div className="week-items">
              {themes.map((t, i) => (
                <div className={`week-item ${i === 5 ? "week-active" : ""}`} key={t.tag}>
                  <span>{["SEG", "TER", "QUA", "QUI", "SEX", "SÁB + DOM"][i]}</span>
                  <strong>{t.category}</strong>
                  {i === 5 && <span className="week-dot" />}
                </div>
              ))}
            </div>
          </div>
          <footer className="welcome-footer">
            <span>© 2026 Supermercado Miro</span>
            <span>Feito com cuidado. Pensado para todos.</span>
            <span>
              <Monitor size={15} />
              Funciona no computador e no celular
            </span>
          </footer>
        </>
      ) : (
        <div className="workspace">
          <aside className="sidebar">{menuContent}</aside>
          <main className="editor-main">
            <div className="workspace-heading">
              <div>
                <span className="eyebrow">SUA CAMPANHA</span>
                <h1>{info.theme.short}</h1>
                <button className="date-link" onClick={() => open("date")}>
                  <CalendarDays size={16} />
                  {info.period}
                  <ChevronRight size={15} />
                </button>
              </div>
              <button className="btn primary" onClick={() => addProduct()}>
                <Plus size={19} />
                Novo produto
              </button>
            </div>
            <div className="editor-toolbar">
              <div className="mode-toggle">
                <button className={mode === "edit" ? "active" : ""} onClick={() => setMode("edit")}>
                  <MousePointer2 size={15} />
                  Editar
                </button>
                <button
                  className={mode === "preview" ? "active" : ""}
                  onClick={() => setMode("preview")}
                >
                  <Image size={15} />
                  Visualizar
                </button>
              </div>
              <span>{campaign.products.length} produto(s) · 1080 px</span>
              <button className="appearance-toggle" onClick={() => setMobilePanel(!mobilePanel)}>
                <Palette size={18} />
                Aparência
              </button>
            </div>
            {storageError && (
              <div className="storage-error" role="alert">
                {storageError}
              </div>
            )}
            <div className="canvas-scroll">
              <div className="canvas-area">
                <Flyer
                  campaign={campaign}
                  date={date}
                  editing={mode === "edit"}
                  onEdit={(p) => {
                    setEditingProduct(p);
                    open("product");
                  }}
                  onDelete={(id) => {
                    setDeleteId(id);
                    open("deleteProduct");
                  }}
                  onReorder={(products) => update({ products })}
                  onGroupEdit={(g) => {
                    setEditingGroup(g);
                    open("group");
                  }}
                  onGroupDelete={(id) => {
                    setDeleteId(id);
                    open("deleteGroup");
                  }}
                  onGroupMove={(id, d) => {
                    const groups = [...campaign.groups];
                    const i = groups.findIndex((g) => g.id === id),
                      j = i + d;
                    if (j >= 0 && j < groups.length) {
                      [groups[i], groups[j]] = [groups[j], groups[i]];
                      update({ groups });
                    }
                  }}
                />
                {campaign.products.length === 0 && mode === "edit" && (
                  <div className="empty-campaign">
                    <span className="empty-icon">
                      <Image size={29} />
                      <Plus size={13} />
                    </span>
                    <h2>Sua próxima oferta começa aqui</h2>
                    <p>
                      Adicione o primeiro produto e transforme
                      <br />
                      esta campanha em um encarte de destaque.
                    </p>
                    <button className="btn primary" onClick={() => addProduct()}>
                      <Plus size={18} />
                      Cadastrar primeiro produto
                    </button>
                    <small>Imagem, nome, preço e medida. Simples assim.</small>
                  </div>
                )}
              </div>
            </div>
            <p className="canvas-help">
              <MousePointer2 size={14} />
              Arraste pela alça para organizar. Use os ícones para editar ou excluir.
            </p>
          </main>
          <aside className={`appearance-panel ${mobilePanel ? "mobile-open" : ""}`}>
            <div className="appearance-heading">
              <Palette size={19} />
              <h2>Aparência do encarte</h2>
              <button
                className="icon-btn"
                onClick={() => setMobilePanel(false)}
                aria-label="Fechar aparência"
              >
                <X size={18} />
              </button>
            </div>
            <p>Seu jeito de dar destaque.</p>
            <label>
              Título da campanha
              <input
                aria-label="Título da campanha"
                value={campaign.title ?? info.theme.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </label>
            <label htmlFor="accent-color">Cor de destaque</label>
            <div className="color-swatches">
              {["#77142a", "#063d27", "#085b37", "#d4af37", "#c24b00"].map((color) => (
                <button
                  aria-label={`Usar cor ${color}`}
                  aria-pressed={campaign.accent === color}
                  key={color}
                  onClick={() => update({ accent: color })}
                  style={{ background: color }}
                >
                  {campaign.accent === color && <Check size={16} />}
                </button>
              ))}
              <input
                id="accent-color"
                aria-label="Cor personalizada"
                type="color"
                value={campaign.accent}
                onChange={(e) => update({ accent: e.target.value })}
              />
            </div>
            <label>
              Fundo do encarte
              <input
                aria-label="Fundo do encarte"
                type="color"
                value={campaign.background}
                onChange={(e) => update({ background: e.target.value })}
              />
            </label>
            <label>
              Produtos por linha
              <select
                value={campaign.columns}
                onChange={(e) => update({ columns: Number(e.target.value) })}
              >
                {[1, 2, 3, 4].map((n) => (
                  <option value={n} key={n}>
                    {n} {n === 1 ? "coluna" : "colunas"}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="btn secondary full"
              onClick={() => {
                setHeaderDraft(campaign.header);
                setUploadError("");
                open("header");
              }}
            >
              <Image size={17} />
              Alterar cabeçalho
            </button>
            <hr />
            <div className="design-tip">
              <Sparkles size={21} />
              <strong>Uma boa oferta é fácil de ler.</strong>
              <p>Prefira fotos com fundo transparente, nomes curtos e preços em destaque.</p>
            </div>
            <button className="text-button" onClick={() => open("help")}>
              Dicas para começar <ArrowRight size={16} />
            </button>
          </aside>
        </div>
      )}
      {menu && (
        <div className="drawer-backdrop">
          <button
            className="drawer-close-area"
            aria-label="Fechar menu"
            onClick={() => setMenu(false)}
          />
          <aside className="drawer">{menuContent}</aside>
        </div>
      )}
      {toast && (
        <output className="toast">
          <CheckCircle2 size={19} />
          {toast}
        </output>
      )}
      {dialog && (
        <Modal
          title={
            (
              {
                product: editingProduct
                  ? "Editar produto"
                  : featured
                    ? "Cadastrar super desconto"
                    : "Cadastrar produto",
                group: editingGroup ? "Editar grupo" : "Criar grupo de ofertas",
                export: "Seu encarte, pronto para compartilhar",
                plates: "Placas de oferta",
                qr: "Conecte seus clientes às ofertas",
                date: "Escolha outra data",
                header: "Personalize o cabeçalho",
                clear: "Limpar esta campanha?",
                all: "Apagar todos os dados?",
                deleteProduct: "Excluir este produto?",
                deleteGroup: "Excluir este grupo?",
                help: "Boas ofertas, sem complicação",
              } as Record<string, string>
            )[dialog]
          }
          subtitle={
            dialog === "product"
              ? "Preencha os detalhes. Os campos com * são obrigatórios."
              : dialog === "group"
                ? "Organize as ofertas em uma seção com a sua identidade."
                : undefined
          }
          onClose={close}
          wide={["export", "plates"].includes(dialog)}
        >
          {dialog === "product" && (
            <ProductForm
              product={editingProduct}
              groups={campaign.groups}
              featured={featured}
              onClose={close}
              onSave={(p) => {
                update({
                  products: editingProduct
                    ? campaign.products.map((item) => (item.id === p.id ? p : item))
                    : [...campaign.products, p],
                });
                close();
                setToast(editingProduct ? "Produto atualizado" : "Produto cadastrado");
              }}
            />
          )}
          {dialog === "group" && (
            <GroupForm
              group={editingGroup}
              onClose={close}
              onSave={(g) => {
                update({
                  groups: editingGroup
                    ? campaign.groups.map((item) => (item.id === g.id ? g : item))
                    : [...campaign.groups, g],
                });
                close();
                setToast("Grupo salvo");
              }}
            />
          )}
          {dialog === "export" && <ExportPanel campaign={campaign} date={date} />}
          {dialog === "plates" && <PlatesPanel products={campaign.products} />}
          {dialog === "qr" && (
            <QRPanel
              link={data.whatsapp}
              invite={data.invite}
              onSave={(whatsapp, invite) => setData((old) => ({ ...old, whatsapp, invite }))}
            />
          )}
          {dialog === "date" && (
            <Calendar value={date} onChange={setDate} onEnter={enter} compact />
          )}
          {dialog === "header" && (
            <>
              <ImageUpload value={headerDraft} onChange={setHeaderDraft} onError={setUploadError} />
              <p className="help-text">
                A imagem recebe uma camada verde para manter o título legível.
              </p>
              {uploadError && <p className="form-error">{uploadError}</p>}
              <div className="modal-actions">
                <button
                  className="btn secondary"
                  onClick={() => setHeaderDraft("/images/produce.jpg")}
                >
                  Usar imagem original
                </button>
                <button
                  className="btn primary"
                  onClick={() => {
                    update({ header: headerDraft });
                    close();
                    setToast("Cabeçalho atualizado");
                  }}
                >
                  Salvar cabeçalho
                </button>
              </div>
            </>
          )}
          {["clear", "all", "deleteProduct", "deleteGroup"].includes(dialog) && (
            <>
              <p className="confirm-copy">
                {dialog === "all"
                  ? "Isso apaga todas as campanhas, produtos, grupos e o link do WhatsApp deste navegador. A ação não pode ser desfeita."
                  : dialog === "clear"
                    ? `Todos os produtos de ${info.period} serão excluídos. Outras datas serão mantidas.`
                    : dialog === "deleteGroup"
                      ? "O grupo será excluído, mas seus produtos continuarão no encarte, sem grupo."
                      : "O produto será removido desta campanha. A ação não pode ser desfeita."}
              </p>
              <div className="modal-actions">
                <button className="btn secondary" onClick={close}>
                  Cancelar
                </button>
                <button
                  className="btn destructive"
                  onClick={() => {
                    if (dialog === "all") {
                      setData({ ...emptyData, campaigns: {} });
                      setEntered(false);
                    } else if (dialog === "clear") update({ products: [] });
                    else if (dialog === "deleteProduct")
                      update({ products: campaign.products.filter((p) => p.id !== deleteId) });
                    else
                      update({
                        groups: campaign.groups.filter((g) => g.id !== deleteId),
                        products: campaign.products.map((p) =>
                          p.group === deleteId ? { ...p, group: "" } : p,
                        ),
                      });
                    close();
                    setToast("Dados excluídos");
                  }}
                >
                  <Trash2 size={17} />
                  Confirmar exclusão
                </button>
              </div>
            </>
          )}
          {dialog === "help" && (
            <div className="help-content">
              {[
                {
                  n: "01",
                  title: "Escolha o dia",
                  text: "A campanha acompanha a data. Sábado e domingo compartilham o mesmo encarte; as outras datas têm produtos separados.",
                },
                {
                  n: "02",
                  title: "Cadastre e organize",
                  text: "Adicione foto, nome, preço e medida. Crie grupos, destaque super descontos e arraste as ofertas pela alça. As setas também permitem reordenar.",
                },
                {
                  n: "03",
                  title: "Compartilhe sua economia",
                  text: "Exporte o encarte em PNG com 1080 px, gere placas A4 ou um convite com QR Code para o WhatsApp.",
                },
              ].map((s) => (
                <div className="help-step" key={s.n}>
                  <span>{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </div>
              ))}
              <div className="local-note">
                <ShieldCheck size={22} />
                <p>
                  Os dados são salvos neste navegador, mesmo após fechar a página. Limpar dados do
                  navegador ou usar outro dispositivo não mantém as campanhas. Não há sincronização
                  entre dispositivos.
                </p>
              </div>
              <button className="btn primary full" onClick={close}>
                Entendi, vamos começar <ArrowRight size={17} />
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
