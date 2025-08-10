// pages/api/pitches.ts
import type { NextApiRequest, NextApiResponse } from "next";

type Pitch = {
  id: string;
  title: string;
  description?: string;
  created_at: string;
};

let pitches: Pitch[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json(pitches);
  }

  if (req.method === "POST") {
    const { title, description } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }

    const newPitch: Pitch = {
      id: Date.now().toString(),
      title,
      description,
      created_at: new Date().toISOString(),
    };

    pitches = [newPitch, ...pitches];

    return res.status(201).json(newPitch);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
