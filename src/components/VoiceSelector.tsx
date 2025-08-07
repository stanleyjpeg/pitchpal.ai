"use client";
import { useState } from "react";

export const voiceOptions = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Default (Rachel – Female US)" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Domi (Male US)" },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Bella (British Female)" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Antoni (Polish Male)" },
  { id: "ErXwobaYiN019PkySvjV", name: "Elli (Childish)" },
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
      className="border p-2 rounded text-black"
      value={selected}
      onChange={(e) => onChange(e.target.value)}
    >
      {voiceOptions.map((voice) => (
        <option key={voice.id} value={voice.id}>
          {voice.name}
        </option>
      ))}
    </select>
  );
}

