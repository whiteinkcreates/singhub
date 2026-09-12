type DailyMicQuestionOption = {
  id: string;
  label: string;
};

type DailyMicQuestionPanelProps = {
  question: string;
  helper?: string;
  options: DailyMicQuestionOption[];
  selectedOptionId?: string | null;
  voting?: boolean;
  onVote?: (optionId: string) => void;
  className?: string;
};

export function DailyMicQuestionPanel({
  question,
  helper,
  options,
  selectedOptionId,
  voting = false,
  onVote,
  className = "",
}: DailyMicQuestionPanelProps) {
  const interactive = Boolean(onVote);

  return (
    <div className={`rounded-3xl border border-white/10 bg-black/20 p-5 md:p-6 ${className}`}>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
        Today&apos;s argument
      </p>
      <h3 className="mt-3 max-w-2xl text-2xl font-black leading-tight text-white md:text-3xl">
        {question}
      </h3>
      {helper && <p className="mt-2 text-sm leading-6 text-slate-400">{helper}</p>}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              disabled={!interactive || Boolean(selectedOptionId) || voting}
              onClick={interactive ? () => onVote?.(option.id) : undefined}
              className={`min-h-16 rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
                isSelected
                  ? "border-fuchsia-300/70 bg-fuchsia-400/20 text-white shadow-[0_0_28px_rgba(217,70,239,0.16)]"
                  : "border-white/12 bg-white/[0.035] text-slate-100 hover:-translate-y-0.5 hover:border-cyan-300/45 hover:bg-cyan-300/[0.06]"
              } disabled:cursor-default`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
