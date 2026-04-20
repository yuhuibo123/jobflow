export function StarSection({ label, letter, content, placeholder }: {
  label: string;
  letter: string;
  content: string;
  placeholder?: string;
}) {
  const isEmpty = !content;
  return (
    <div className={`rounded-xl p-4 border ${isEmpty ? 'bg-[#FFFBEA] border-[#FFE36A]' : 'bg-[#FAFAF9] border-[#F0EBE4]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded bg-[#1C1917] flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px] font-bold">{letter}</span>
        </div>
        <span className="text-[#1C1917] text-sm font-medium">・{label}</span>
      </div>
      {isEmpty ? (
        <p className="text-[#C5BDB5] text-sm italic">{placeholder}</p>
      ) : (
        <p className="text-[#1C1917] text-sm leading-relaxed">{content}</p>
      )}
    </div>
  );
}
