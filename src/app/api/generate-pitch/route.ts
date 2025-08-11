import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import OpenAI from "openai";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { randomUUID } from "crypto";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const sqs = new SQSClient({ region: process.env.AWS_REGION });

export async function POST(req: NextRequest) {
  try {
    const { product, audience, tone = "casual", platform = "TikTok", imageUrl } = await req.json();
    if (!product || !audience) {
      return NextResponse.json({ error: "Missing product or audience" }, { status: 400 });
    }

    const prompt = `Write a ${tone} marketing pitch for a ${product} targeting ${audience} on ${platform}. Make it engaging and under 40 words.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
      temperature: 0.8,
    });

    const pitch = completion.choices?.[0]?.message?.content?.trim() || "";
    const jobId = randomUUID();

    const messageBody = JSON.stringify({ jobId, pitch, imageUrl: imageUrl || null, createdAt: new Date().toISOString() });
    const queueUrl = process.env.SQS_QUEUE_URL;
    if (!queueUrl) {
      // If SQS not configured, still return pitch and jobId for UI; worker won't run
      return NextResponse.json({ jobId, pitch, queued: false });
    }

    await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: messageBody }));
    return NextResponse.json({ jobId, pitch, queued: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
