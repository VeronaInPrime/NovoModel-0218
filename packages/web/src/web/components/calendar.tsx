import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, CalendarDays, Check } from "lucide-react";
import { campaignInfo, isoDate, parseDate } from "../lib/studio";

export function Calendar({
  value,
  onChange,
  onEnter,
  compact = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onEnter: () => void;
  compact?: boolean;
}) {
  const [month, setMonth] = useState(
    () => new Date(parseDate(value).getFullYear(), parseDate(value).getMonth(), 1),
  );
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (month.getDay() + 6) % 7;
  const info = campaignInfo(value);
  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  return (
    <div className={`calendar-panel ${compact ? "compact" : ""}`}>
      <div className="calendar-heading">
        <div className="icon-box">
          <CalendarDays size={23} />
        </div>
        <div>
          <h2>Quando vamos economizar?</h2>
          <p>Escolha a data da sua campanha.</p>
        </div>
      </div>
      <div className="month-nav">
        <button aria-label="Mês anterior" onClick={() => shift(-1)}>
          <ChevronLeft size={20} />
        </button>
        <strong>{month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</strong>
        <button aria-label="Próximo mês" onClick={() => shift(1)}>
          <ChevronRight size={20} />
        </button>
      </div>
      <div className="calendar-grid">
        <div className="weekdays">
          {["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="calendar-days">
          {Array.from({ length: offset }, (_, i) => (
            <span key={`empty-${i}`} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const date = isoDate(new Date(month.getFullYear(), month.getMonth(), i + 1));
            const selected = date === value;
            const paired = info.weekend && campaignInfo(date).key === info.key;
            return (
              <button
                key={date}
                aria-label={`Selecionar ${i + 1} de ${month.toLocaleDateString("pt-BR", { month: "long" })}`}
                aria-pressed={selected}
                className={`${selected ? "selected" : paired ? "paired" : ""} ${date === "2026-10-18" ? "today" : ""}`}
                onClick={() => onChange(date)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
      <div className="date-manual">
        <CalendarDays size={15} />
        <span>Ou selecione outra data</span>
        <input
          type="date"
          aria-label="Data da campanha"
          value={value}
          required
          onChange={(e) => {
            if (e.target.value) {
              onChange(e.target.value);
              const d = parseDate(e.target.value);
              setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
            }
          }}
        />
      </div>
      <div className="campaign-match">
        <span className="match-dot" />
        <div>
          <span>CAMPANHA DO DIA</span>
          <strong>{info.theme.short}</strong>
          <small>
            {info.period}
            {info.weekend && " · sábado e domingo"}
          </small>
        </div>
        <Check size={18} />
      </div>
      <button className="btn primary calendar-enter" onClick={onEnter}>
        Criar minhas ofertas <ArrowRight size={19} />
      </button>
      <p className="calendar-note">Tudo pronto para transformar preços em boas ofertas.</p>
    </div>
  );
}
