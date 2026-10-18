export type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  unit: string;
  note: string;
  packLabel: string;
  packPrice?: number;
  group: string;
  featured: boolean;
  fontSize: number;
  background: string;
};
export type Group = {
  id: string;
  title: string;
  color: string;
  textColor: string;
  fontSize: number;
  columns: number;
};
export type Campaign = {
  products: Product[];
  groups: Group[];
  background: string;
  accent: string;
  header: string;
  title?: string;
  columns: number;
  fontSize: number;
};
export type StudioData = { campaigns: Record<string, Campaign>; whatsapp: string; invite: string };
export const emptyData: StudioData = {
  campaigns: {},
  whatsapp: "",
  invite: "Entre no nosso grupo de ofertas!",
};
export const newCampaign = (): Campaign => ({
  products: [],
  groups: [],
  background: "#ffffff",
  accent: "#77142a",
  header: "/images/produce.jpg",
  columns: 3,
  fontSize: 20,
});
export const themes = [
  {
    title: "Comece a semana economizando",
    short: "Ofertas da semana",
    subtitle: "Uma nova semana. Muitas oportunidades para economizar.",
    tag: "SEGUNDA DE OFERTAS",
    category: "Ofertas especiais",
  },
  {
    title: "Terça da limpeza",
    short: "Terça da limpeza",
    subtitle: "Casa limpa, economia de verdade.",
    tag: "TERÇA DA LIMPEZA",
    category: "Limpeza",
  },
  {
    title: "Quarta da padaria",
    short: "Quarta da padaria",
    subtitle: "Fresquinho, gostoso e com aquele preço especial.",
    tag: "QUARTA DA PADARIA",
    category: "Padaria",
  },
  {
    title: "Quinta dos congelados",
    short: "Quinta dos congelados",
    subtitle: "Mais praticidade e economia para a sua mesa.",
    tag: "QUINTA DOS CONGELADOS",
    category: "Congelados",
  },
  {
    title: "Sexta de hortifruti",
    short: "Sexta de hortifruti",
    subtitle: "Mais cor, frescor e saúde por menos.",
    tag: "SEXTA DO HORTIFRUTI",
    category: "Hortifruti",
  },
  {
    title: "Fim de semana do açougue",
    short: "Fim de semana do açougue",
    subtitle: "Qualidade e economia para reunir a família.",
    tag: "FESTIVAL DO AÇOUGUE",
    category: "Açougue",
  },
];
export const parseDate = (value: string) => new Date(`${value}T12:00:00`);
export const isoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function campaignInfo(value: string) {
  const date = parseDate(value);
  const day = date.getDay();
  const start = new Date(date);
  const end = new Date(date);
  if (day === 0) start.setDate(start.getDate() - 1);
  if (day === 6) end.setDate(end.getDate() + 1);
  const theme = themes[day === 0 || day === 6 ? 5 : day - 1];
  const fmt = (d: Date) => d.toLocaleDateString("pt-BR");
  return {
    key: isoDate(start),
    start,
    end,
    theme,
    weekend: day === 0 || day === 6,
    period: day === 0 || day === 6 ? `${fmt(start)} e ${fmt(end)}` : fmt(start),
  };
}
export const money = (value: number) =>
  value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export async function imageFile(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Escolha uma imagem PNG, JPG ou WebP.");
  if (file.size > 20 * 1024 * 1024) throw new Error("A imagem deve ter menos de 20 MB.");
  const bitmap = await createImageBitmap(file);
  const ratio = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width * ratio;
  canvas.height = bitmap.height * ratio;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/png");
}
export function download(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}
