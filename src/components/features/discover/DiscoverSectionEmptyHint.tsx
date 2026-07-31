type DiscoverSectionEmptyHintProps = {
  message: string;
};

export default function DiscoverSectionEmptyHint({ message }: DiscoverSectionEmptyHintProps) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-xs text-slate-500">
      {message}
    </p>
  );
}
