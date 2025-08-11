import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get("jobId");
    if (!jobId) return NextResponse.json({ error: "Missing jobId" }, { status: 400 });

    const bucket = process.env.S3_BUCKET;
    if (!bucket) return NextResponse.json({ status: "processing" }, { status: 202 });

    const key = `results/${jobId}.json`;
    try {
      const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      // @ts-ignore Node.js runtime body
      const text = await obj.Body?.transformToString?.() ?? await streamToString(obj.Body as any);
      const json = JSON.parse(text);
      return NextResponse.json({ status: "done", result: json });
    } catch (e) {
      // likely NotFound
      return NextResponse.json({ status: "processing" }, { status: 202 });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function streamToString(stream: ReadableStream | NodeJS.ReadableStream): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    (stream as NodeJS.ReadableStream)
      .on("data", (c: Buffer) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
      .once("end", () => resolve(Buffer.concat(chunks).toString("utf-8")))
      .once("error", reject);
  });
}
