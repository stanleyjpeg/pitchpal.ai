export const voiceOptions = [
  { id: "en_us_001", label: "Standard Male" },
  { id: "en_us_002", label: "Standard Female" },
  { id: "en_us_ghostface", label: "Ghostface" },
  { id: "en_us_snoopdogg", label: "Snoop Dogg" },
  // Add more voices if needed
];

export default function VoiceSelector({
  selected,
  onChange,
}: {
  selected: string;
  onChange: (id: string) => void;
}) {
  return (
    <select
      value={selected}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-3 py-1 dark:bg-zinc-900"
    >
      {voiceOptions.map((voice) => (
        <option key={voice.id} value={voice.id}>
          {voice.label}
        </option>
      ))}
    </select>
  );
}
