import { useEffect, useRef, useState } from "react";
import { Download, Printer, Share2, Check, ArrowLeft } from "lucide-react";
import { toPng } from "html-to-image";
import QRCode from "qrcode";
import { Flyer, Brand } from "./studio-ui";
import { money, download, type Campaign, type Product } from "../lib/studio";

export async function capture(node: HTMLElement) {
  await document.fonts.ready;
  await Promise.all(
    Array.from(node.querySelectorAll("img")).map((img) => img.decode().catch(() => {})),
  );
  return toPng(node, {
    pixelRatio: 1080 / node.offsetWidth,
    cacheBust: false,
    style: { margin: "0" },
    filter: (node) => !(node instanceof HTMLElement && node.dataset.editor === "true"),
  });
}
export function ExportPanel({ campaign, date }: { campaign: Campaign; date: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const generate = async (share = false) => {
    if (!ref.current) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const url = await capture(ref.current);
      if (share) {
        const blob = await (await fetch(url)).blob();
        const file = new File([blob], `miro-${date}.png`, { type: "image/png" });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: "Ofertas do Supermercado Miro" });
          setSuccess("Compartilhamento concluído.");
        } else {
          download(url, `miro-${date}.png`);
          setSuccess("PNG baixado. Anexe a imagem na conversa do WhatsApp.");
        }
      } else {
        download(url, `miro-${date}.png`);
        setSuccess("Imagem baixada com 1080 px de largura.");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError")
        setError("Não foi possível gerar a imagem. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <div className="export-info">
        <Check size={17} />
        1080 px de largura · pronta para WhatsApp
      </div>
      <div className="preview-scroll">
        <div ref={ref} className="export-capture">
          <Flyer campaign={campaign} date={date} />
        </div>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {success && <output className="success-message">{success}</output>}
      <div className="modal-actions">
        <button className="btn secondary" disabled={busy} onClick={() => generate(true)}>
          <Share2 size={18} />
          Compartilhar
        </button>
        <button className="btn primary" disabled={busy} onClick={() => generate()}>
          <Download size={18} />
          {busy ? "Gerando imagem…" : "Baixar PNG"}
        </button>
      </div>
    </>
  );
}
function printContent(node: HTMLElement, style: string) {
  const win = window.open("", "_blank");
  if (!win) throw new Error("Permita pop-ups neste navegador para imprimir.");
  win.document.write(
    `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>Supermercado Miro — Impressão</title><style>${style}</style></head><body>${node.innerHTML}</body></html>`,
  );
  win.document.close();
  win.onload = () => {
    win.focus();
    win.print();
  };
}
const printStyles = `@page{size:A4;margin:10mm}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:#111}.print-sheet{width:190mm;height:277mm;page-break-after:always;display:flex;flex-direction:column;gap:12mm;padding:8mm}.print-sign{border:2px solid #111;background:#fffce8;position:relative;flex:1;text-align:center;display:flex;flex-direction:column;justify-content:center;padding:15mm;overflow:hidden}.print-sign h2{font-size:34pt;margin:0 0 12mm}.print-sign p{font-size:16pt}.print-sign .sign-price{background:#c24b00;color:#fff;font-size:44pt;font-weight:bold;padding:6mm}.print-sign .sign-tag{color:#77142a;font-size:18pt;font-weight:bold;position:absolute;top:7mm;right:7mm}.print-sign.vertical{background:#fff}.print-sign.vertical .sign-price{font-size:92pt;background:none;color:#c24b00;margin-top:70mm}.print-sign [contenteditable]{outline:none}.print-sheet:last-child{page-break-after:auto}.qr-sheet{text-align:center;height:277mm;padding:20mm;background:#063d27;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;-webkit-print-color-adjust:exact;print-color-adjust:exact}.qr-sheet h2{font-size:34pt}.qr-sheet p{font-size:16pt}.qr-sheet img{width:90mm;height:90mm}.qr-sheet .brand{font-size:30pt}.qr-sheet .brand-symbol{display:none}.qr-sheet small{display:block;font-size:12pt}.qr-sheet .qr-link{word-break:break-all;font-size:10pt}@media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}`;
export function PlatesPanel({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState(products.map((p) => p.id));
  const [format, setFormat] = useState("horizontal");
  const [preview, setPreview] = useState(false);
  const [color, setColor] = useState("#c24b00");
  const [size, setSize] = useState(40);
  const [error, setError] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const chosen = products.filter((p) => selected.includes(p.id));
  const perPage = format === "horizontal" ? 2 : 1;
  const sheets = Array.from({ length: Math.ceil(chosen.length / perPage) }, (_, i) =>
    chosen.slice(i * perPage, (i + 1) * perPage),
  );
  if (preview)
    return (
      <>
        <div className="plate-toolbar">
          <button className="btn secondary" onClick={() => setPreview(false)}>
            <ArrowLeft size={17} />
            Voltar
          </button>
          <label>
            Cor do preço
            <input
              aria-label="Cor do preço"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </label>
          <label>
            Tamanho do nome
            <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
              {[28, 34, 40, 48, 56].map((n) => (
                <option key={n} value={n}>
                  {n} px
                </option>
              ))}
            </select>
          </label>
          <button
            className="btn primary"
            onClick={() => {
              try {
                printContent(ref.current!, printStyles);
              } catch (err) {
                setError((err as Error).message);
              }
            }}
          >
            <Printer size={18} />
            Imprimir / PDF
          </button>
        </div>
        <p className="help-text">
          Clique no nome, complemento ou preço para editar o texto da placa. Essas alterações só
          afetam a impressão.
        </p>
        <div className="plates-scroll">
          <div ref={ref}>
            {sheets.map((sheet, i) => (
              <div className="print-sheet" key={i}>
                {sheet.map((p) => (
                  <div className={`print-sign ${format}`} key={p.id}>
                    <span className="sign-tag" contentEditable suppressContentEditableWarning>
                      OFERTA
                    </span>
                    <h2 style={{ fontSize: size }} contentEditable suppressContentEditableWarning>
                      {p.name}
                    </h2>
                    <p contentEditable suppressContentEditableWarning>
                      {p.note}
                    </p>
                    <div
                      className="sign-price"
                      style={{
                        color: format === "vertical" ? color : "#fff",
                        background: format === "vertical" ? "none" : color,
                      }}
                      contentEditable
                      suppressContentEditableWarning
                    >
                      R$ {money(p.price)} / {p.unit}
                    </div>
                    {p.packPrice && (
                      <p contentEditable suppressContentEditableWarning>
                        {p.packLabel} · R$ {money(p.packPrice)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {error && <p className="form-error">{error}</p>}
      </>
    );
  return (
    <>
      <label>
        Formato da placa
        <select value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="horizontal">Horizontal · 2 placas por folha A4</option>
          <option value="vertical">Vertical · 1 placa A4 com preço grande</option>
        </select>
      </label>
      <div className="product-selection">
        <label className="checkbox-label">
          <input
            aria-label="Selecionar produto"
            type="checkbox"
            checked={selected.length === products.length && products.length > 0}
            onChange={(e) => setSelected(e.target.checked ? products.map((p) => p.id) : [])}
          />
          Selecionar todos os produtos
        </label>
        {products.map((p) => (
          <label key={p.id} className="selection-row">
            <input
              aria-label="Selecionar produto"
              type="checkbox"
              checked={selected.includes(p.id)}
              onChange={(e) =>
                setSelected(
                  e.target.checked ? [...selected, p.id] : selected.filter((id) => id !== p.id),
                )
              }
            />
            <img src={p.image} alt="" />
            <span>{p.name}</span>
            <strong>
              R$ {money(p.price)} / {p.unit}
            </strong>
          </label>
        ))}
        {!products.length && (
          <p className="help-text">Cadastre produtos nesta campanha para gerar as placas.</p>
        )}
      </div>
      <div className="modal-actions">
        <small>{chosen.length} produto(s) selecionado(s)</small>
        <button className="btn primary" disabled={!chosen.length} onClick={() => setPreview(true)}>
          <Printer size={18} />
          Gerar placas
        </button>
      </div>
    </>
  );
}
export function QRPanel({
  link,
  invite,
  onSave,
}: {
  link: string;
  invite: string;
  onSave: (link: string, invite: string) => void;
}) {
  const [url, setUrl] = useState(link);
  const [text, setText] = useState(invite);
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setQr("");
    setError("");
    if (!url) return;
    try {
      const parsed = new URL(url);
      if (
        parsed.protocol !== "https:" ||
        !(
          parsed.hostname === "chat.whatsapp.com" ||
          parsed.hostname === "wa.me" ||
          parsed.hostname === "www.whatsapp.com"
        )
      ) {
        setError("Use um link válido do WhatsApp começando com https://.");
        return;
      }
      let cancelled = false;
      QRCode.toDataURL(url, { width: 600, margin: 3, errorCorrectionLevel: "H" })
        .then((v) => {
          if (!cancelled) setQr(v);
        })
        .catch(() => setError("Não foi possível gerar o QR Code."));
      return () => {
        cancelled = true;
      };
    } catch {
      setError("Informe o link completo do grupo do WhatsApp.");
    }
  }, [url]);
  return (
    <>
      <label>
        Link do grupo do WhatsApp
        <input
          aria-label="Link do grupo do WhatsApp"
          type="url"
          placeholder="https://chat.whatsapp.com/…"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setSuccess("");
          }}
        />
      </label>
      <label>
        Título do convite
        <input
          aria-label="Título do convite"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={120}
        />
      </label>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {qr ? (
        <div className="qr-preview" ref={ref}>
          <div className="qr-sheet">
            <Brand light />
            <span className="eyebrow">ECONOMIZE COM A GENTE</span>
            <h2>{text}</h2>
            <p>As melhores ofertas do Miro, direto no seu WhatsApp.</p>
            <img src={qr} alt="QR Code do grupo de WhatsApp" />
            <strong>Aponte a câmera e participe!</strong>
            <p className="qr-link">{url}</p>
            <small>Supermercado Miro · Economia que faz parte do seu dia.</small>
          </div>
        </div>
      ) : (
        <div className="qr-placeholder">Cole o link do grupo para visualizar seu convite.</div>
      )}
      {success && <output className="success-message">{success}</output>}
      <div className="qr-actions">
        <button
          className="btn secondary"
          disabled={!qr}
          onClick={() => {
            onSave(url, text);
            setSuccess("Link e convite salvos neste navegador.");
          }}
        >
          <Check size={18} />
          Salvar link
        </button>
        <button
          className="btn secondary"
          disabled={!qr}
          onClick={() => {
            try {
              printContent(ref.current!, printStyles);
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        >
          <Printer size={18} />
          Convite A4
        </button>
        <button
          className="btn primary"
          disabled={!qr || busy}
          onClick={async () => {
            setBusy(true);
            try {
              download(await capture(ref.current!), "miro-convite-whatsapp.png");
            } catch {
              setError("Falha ao gerar a imagem.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <Download size={18} />
          {busy ? "Gerando…" : "Baixar convite"}
        </button>
      </div>
    </>
  );
}
