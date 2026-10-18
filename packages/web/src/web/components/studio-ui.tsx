import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ShoppingBag,
  X,
  Upload,
  ImagePlus,
  Save,
  Trash2,
  Pencil,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  imageFile,
  money,
  type Product,
  type Group,
  type Campaign,
  campaignInfo,
} from "../lib/studio";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand ${light ? "light" : ""}`}>
      <span className="brand-symbol">
        <ShoppingBag size={29} strokeWidth={1.8} />
        <i />
      </span>
      <span className="brand-word">
        miro<small>SUPERMERCADO</small>
      </span>
    </div>
  );
}
export function Modal({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const list = ref.current?.querySelectorAll<HTMLElement>(
          'button,input,select,textarea,[tabindex="0"]',
        );
        if (!list?.length) return;
        const first = list[0],
          last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = old;
      before?.focus();
    };
  }, [onClose]);
  return (
    <div
      role="presentation"
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <dialog
        open
        ref={ref}
        tabIndex={-1}
        aria-modal="true"
        aria-label={title}
        className={`modal ${wide ? "wide" : ""}`}
      >
        <header>
          <div>
            <span className="eyebrow">ESTÚDIO MIRO</span>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="icon-btn" aria-label="Fechar" onClick={onClose}>
            <X size={22} />
          </button>
        </header>
        {children}
      </dialog>
    </div>
  );
}
export function ImageUpload({
  value,
  onChange,
  onError,
}: {
  value: string;
  onChange: (v: string) => void;
  onError: (v: string) => void;
}) {
  return (
    <label className={`image-upload ${value ? "has-image" : ""}`}>
      {value ? <img src={value} alt="Imagem selecionada" /> : <ImagePlus size={32} />}
      <span>
        <strong>{value ? "Trocar imagem" : "Adicionar imagem do produto"}</strong>
        <small>PNG, JPG ou WebP · até 20 MB</small>
      </span>
      <Upload size={19} />
      <input
        aria-label="Imagem do produto"
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f)
            try {
              onChange(await imageFile(f));
            } catch (err) {
              onError((err as Error).message);
            }
        }}
      />
    </label>
  );
}
export function ProductForm({
  product,
  groups,
  featured,
  onSave,
  onClose,
}: {
  product?: Product;
  groups: Group[];
  featured: boolean;
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [image, setImage] = useState(product?.image || "");
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!image) {
          setError("Adicione uma imagem para cadastrar o produto.");
          return;
        }
        const f = new FormData(e.currentTarget);
        const num = (k: string) => Number(String(f.get(k) || "").replace(",", "."));
        if (num("price") <= 0) {
          setError("Informe um preço maior que zero.");
          return;
        }
        onSave({
          id: product?.id || crypto.randomUUID(),
          image,
          name: String(f.get("name")).trim(),
          price: num("price"),
          oldPrice: num("oldPrice") || undefined,
          unit: String(f.get("unit")),
          note: String(f.get("note")),
          packLabel: String(f.get("packLabel")),
          packPrice: num("packPrice") || undefined,
          group: String(f.get("group")),
          featured: !!f.get("featured"),
          fontSize: num("fontSize"),
          background: String(f.get("background")),
        });
      }}
    >
      <ImageUpload value={image} onChange={setImage} onError={setError} />
      <label>
        Nome do produto <span>*</span>
        <input
          aria-label="Nome do produto"
          name="name"
          placeholder="Ex.: Leite integral 1 litro"
          required
          maxLength={100}
          defaultValue={product?.name}
        />
      </label>
      <div className="form-row">
        <label>
          Preço da oferta (R$) <span>*</span>
          <input
            aria-label="Preço da oferta"
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="4,38"
            defaultValue={product?.price}
          />
        </label>
        <label>
          Preço anterior (R$)
          <input
            aria-label="Preço anterior"
            name="oldPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="Opcional"
            defaultValue={product?.oldPrice}
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Medida <span>*</span>
          <select aria-label="Medida" name="unit" required defaultValue={product?.unit || ""}>
            <option value="" disabled>
              Selecione
            </option>
            {["UN", "PCT", "CX", "L", "Quilo"].map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </label>
        <label>
          Grupo de ofertas
          <select aria-label="Grupo de ofertas" name="group" defaultValue={product?.group || ""}>
            <option value="">Sem grupo</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Complemento
        <input
          aria-label="Complemento"
          name="note"
          placeholder="Ex.: Marca, peso ou condição da oferta"
          defaultValue={product?.note}
        />
      </label>
      <fieldset>
        <legend>
          Preço de caixa ou conjunto <small>opcional</small>
        </legend>
        <div className="form-row">
          <label>
            Descrição
            <input
              aria-label="Descrição da caixa"
              name="packLabel"
              placeholder="Caixa com 12 unidades"
              defaultValue={product?.packLabel}
            />
          </label>
          <label>
            Valor total (R$)
            <input
              aria-label="Valor total da caixa"
              name="packPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="52,56"
              defaultValue={product?.packPrice}
            />
          </label>
        </div>
      </fieldset>
      <div className="form-row">
        <label>
          Tamanho do nome
          <select name="fontSize" defaultValue={product?.fontSize || 20}>
            {[16, 20, 24, 28, 32].map((n) => (
              <option key={n} value={n}>
                {n} px
              </option>
            ))}
          </select>
        </label>
        <label>
          Fundo do produto
          <input
            aria-label="Fundo do produto"
            name="background"
            type="color"
            defaultValue={product?.background || "#ffffff"}
          />
        </label>
      </div>
      <label className="checkbox-label">
        <input
          aria-label="Super desconto"
          name="featured"
          type="checkbox"
          defaultChecked={product?.featured ?? featured}
        />
        Destacar como super desconto
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="modal-actions">
        <button className="btn secondary" type="button" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn primary" type="submit">
          <Save size={18} />
          {product ? "Salvar alterações" : "Cadastrar produto"}
        </button>
      </div>
    </form>
  );
}
export function GroupForm({
  group,
  onSave,
  onClose,
}: {
  group?: Group;
  onSave: (g: Group) => void;
  onClose: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        onSave({
          id: group?.id || crypto.randomUUID(),
          title: String(f.get("title")),
          color: String(f.get("color")),
          textColor: String(f.get("textColor")),
          fontSize: Number(f.get("fontSize")),
          columns: Number(f.get("columns")),
        });
      }}
    >
      <label>
        Título do grupo
        <input
          aria-label="Título do grupo"
          name="title"
          required
          defaultValue={group?.title}
          placeholder="Ex.: Ofertas especiais"
        />
      </label>
      <div className="form-row">
        <label>
          Cor de fundo
          <input
            aria-label="Cor de fundo"
            type="color"
            name="color"
            defaultValue={group?.color || "#77142a"}
          />
        </label>
        <label>
          Cor do título
          <input
            aria-label="Cor do título"
            type="color"
            name="textColor"
            defaultValue={group?.textColor || "#ffffff"}
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Tamanho do título
          <select name="fontSize" defaultValue={group?.fontSize || 24}>
            {[18, 24, 30, 36].map((n) => (
              <option key={n} value={n}>
                {n} px
              </option>
            ))}
          </select>
        </label>
        <label>
          Produtos por linha
          <select name="columns" defaultValue={group?.columns || 3}>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "coluna" : "colunas"}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="help-text">
        Para colocar um produto neste grupo, escolha o grupo ao cadastrá-lo ou editá-lo.
      </p>
      <div className="modal-actions">
        <button type="button" className="btn secondary" onClick={onClose}>
          Cancelar
        </button>
        <button className="btn primary">
          <Save size={18} />
          {group ? "Salvar grupo" : "Criar grupo"}
        </button>
      </div>
    </form>
  );
}

function Offer({
  product: p,
  editing,
  onEdit,
  onDelete,
  onMove,
}: {
  product: Product;
  editing: boolean;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: p.id,
    disabled: !editing,
  });
  const [whole, cents] = money(p.price).split(",");
  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        background: p.background,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={`offer ${p.featured ? "featured" : ""}`}
    >
      {editing && (
        <div className="offer-tools" data-editor="true">
          <button
            {...attributes}
            {...listeners}
            aria-label={`Arrastar ${p.name}`}
            className="drag-handle"
          >
            <GripVertical size={16} />
          </button>
          <span />
          <button onClick={() => onMove(p.id, -1)} aria-label="Mover antes">
            <ChevronUp size={15} />
          </button>
          <button onClick={() => onMove(p.id, 1)} aria-label="Mover depois">
            <ChevronDown size={15} />
          </button>
          <button onClick={() => onEdit(p)} aria-label={`Editar ${p.name}`}>
            <Pencil size={15} />
          </button>
          <button onClick={() => onDelete(p.id)} aria-label={`Excluir ${p.name}`}>
            <Trash2 size={15} />
          </button>
        </div>
      )}
      {p.featured && <span className="discount-tag">SUPER DESCONTO</span>}
      <img src={p.image} alt={p.name} />
      <h3 style={{ fontSize: p.fontSize }}>{p.name}</h3>
      {p.note && <p className="offer-note">{p.note}</p>}
      {p.oldPrice && <div className="old-price">de R$ {money(p.oldPrice)}</div>}
      <div className="offer-price">
        <small>R$</small>
        <strong>{whole}</strong>
        <span>
          <b>,{cents}</b>
          <small>/{p.unit}</small>
        </span>
      </div>
      {p.packPrice && (
        <div className="pack-price">
          {p.packLabel || "Caixa / conjunto"}
          <strong>R$ {money(p.packPrice)}</strong>
        </div>
      )}
    </article>
  );
}
export function Flyer({
  campaign: c,
  date,
  editing = false,
  onEdit = () => {},
  onDelete = () => {},
  onReorder = () => {},
  onGroupEdit = () => {},
  onGroupDelete = () => {},
  onGroupMove = () => {},
}: {
  campaign: Campaign;
  date: string;
  editing?: boolean;
  onEdit?: (p: Product) => void;
  onDelete?: (id: string) => void;
  onReorder?: (p: Product[]) => void;
  onGroupEdit?: (g: Group) => void;
  onGroupDelete?: (id: string) => void;
  onGroupMove?: (id: string, d: number) => void;
}) {
  const info = campaignInfo(date);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const move = (id: string, d: number) => {
    const i = c.products.findIndex((p) => p.id === id);
    const j = i + d;
    if (j >= 0 && j < c.products.length) onReorder(arrayMove(c.products, i, j));
  };
  const grid = (products: Product[], columns: number) => (
    <div className="offers-grid" style={{ gridTemplateColumns: `repeat(${Math.min(columns, Math.max(1, products.length))},1fr)` }}>
      <SortableContext items={products.map((p) => p.id)} strategy={rectSortingStrategy}>
        {products.map((p) => (
          <Offer
            key={p.id}
            product={p}
            editing={editing}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={move}
          />
        ))}
      </SortableContext>
    </div>
  );
  return (
    <div
      className="flyer"
      style={{ background: c.background, "--flyer-accent": c.accent } as React.CSSProperties}
    >
      <div
        className="flyer-header"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(6,61,39,.98),rgba(6,61,39,.68)),url("${c.header}")`,
        }}
      >
        <Brand light />
        <span className="flyer-tag">{info.theme.tag}</span>
        <h2>{c.title || info.theme.title}</h2>
        <p>{info.theme.subtitle}</p>
        <div className="flyer-validity">Ofertas válidas em {info.period}</div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id) {
            const a = c.products.findIndex((p) => p.id === active.id),
              b = c.products.findIndex((p) => p.id === over.id);
            if (a >= 0 && b >= 0) onReorder(arrayMove(c.products, a, b));
          }
        }}
      >
        {grid(
          c.products.filter((p) => !p.group || !c.groups.some((g) => g.id === p.group)),
          c.columns,
        )}
        {c.groups.map((g) => (
          <section key={g.id} className="offer-group">
            <div
              className="group-title"
              style={{ background: g.color, color: g.textColor, fontSize: g.fontSize }}
            >
              <strong>{g.title}</strong>
              {editing && (
                <span data-editor="true">
                  <button onClick={() => onGroupMove(g.id, -1)} aria-label="Mover grupo antes">
                    <ChevronUp size={17} />
                  </button>
                  <button onClick={() => onGroupMove(g.id, 1)} aria-label="Mover grupo depois">
                    <ChevronDown size={17} />
                  </button>
                  <button onClick={() => onGroupEdit(g)} aria-label="Editar grupo">
                    <Pencil size={17} />
                  </button>
                  <button onClick={() => onGroupDelete(g.id)} aria-label="Excluir grupo">
                    <Trash2 size={17} />
                  </button>
                </span>
              )}
            </div>
            {grid(
              c.products.filter((p) => p.group === g.id),
              g.columns,
            )}
            {!c.products.some((p) => p.group === g.id) && editing && (
              <p className="group-empty">Selecione este grupo ao cadastrar um produto.</p>
            )}
          </section>
        ))}
      </DndContext>
      <footer className="flyer-footer">
        <strong>miro</strong>
        <span>Economia que faz parte do seu dia.</span>
        <small>
          Ofertas válidas nas datas indicadas, enquanto durarem os estoques. Imagens ilustrativas.
        </small>
      </footer>
    </div>
  );
}
