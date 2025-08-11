import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import OpenAI from 'openai';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegPath);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from worker/.env first
dotenv.config({ path: path.join(__dirname, '.env') });
// Fallback to project root .env.local if still missing keys
if (!process.env.OPENAI_API_KEY || !process.env.AWS_REGION || !process.env.SQS_QUEUE_URL || !process.env.S3_BUCKET) {
  const rootEnvLocal = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(rootEnvLocal)) {
    dotenv.config({ path: rootEnvLocal, override: false });
  }
}

// Diagnostics for env loading
const requiredEnv = {
  AWS_REGION: process.env.AWS_REGION,
  SQS_QUEUE_URL: process.env.SQS_QUEUE_URL,
  S3_BUCKET: process.env.S3_BUCKET,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? '***' : undefined,
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY ? '***' : undefined,
  ELEVENLABS_VOICE_ID: process.env.ELEVENLABS_VOICE_ID,
};
console.log('Worker env summary:', requiredEnv);

const sqs = new SQSClient({ region: process.env.AWS_REGION });
const s3 = new S3Client({ region: process.env.AWS_REGION });

const QUEUE_URL = process.env.SQS_QUEUE_URL;
const BUCKET = process.env.S3_BUCKET;
const DEFAULT_IMAGE_URL = process.env.DEFAULT_IMAGE_URL || 'https://via.placeholder.com/1080x1920.png?text=PitchPal';

if (!QUEUE_URL || !BUCKET) {
  console.error('Missing SQS_QUEUE_URL or S3_BUCKET in env. Ensure worker/.env or project .env.local has these keys. Summary:', requiredEnv);
  process.exit(1);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function downloadToFile(url, outPath) {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  await fs.promises.writeFile(outPath, Buffer.from(res.data));
}

async function synthesizeTTS(pitch, outPath) {
  const elKey = process.env.ELEVENLABS_API_KEY;
  const elVoice = process.env.ELEVENLABS_VOICE_ID;
  if (elKey && elVoice) {
    try {
      const modelId = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
      const stability = Number(process.env.ELEVENLABS_STABILITY ?? 0.5);
      const similarity = Number(process.env.ELEVENLABS_SIMILARITY ?? 0.75);
      const { data } = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(elVoice)}`,
        {
          text: pitch,
          model_id: modelId,
          voice_settings: {
            stability,
            similarity_boost: similarity,
            style: 0,
            use_speaker_boost: true,
          },
        },
        {
          responseType: 'arraybuffer',
          headers: {
            'xi-api-key': elKey,
            'accept': 'audio/mpeg',
            'content-type': 'application/json',
          },
        }
      );
      await fs.promises.writeFile(outPath, Buffer.from(data));
      return;
    } catch (e) {
      console.warn('ElevenLabs TTS failed, falling back to OpenAI:', e?.message || e);
      // fall through to OpenAI
    }
  }

  // OpenAI fallback
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error('No TTS provider configured: set ELEVENLABS_API_KEY/ELEVENLABS_VOICE_ID or OPENAI_API_KEY');
  }
  const openai = new OpenAI({ apiKey: openaiKey });
  const ttsResp = await openai.audio.speech.create({
    model: 'gpt-4o-mini-tts',
    voice: 'alloy',
    input: pitch,
    format: 'mp3'
  });
  const buf = Buffer.from(await ttsResp.arrayBuffer());
  await fs.promises.writeFile(outPath, buf);
}

async function renderVideo(imagePath, audioPath, outPath) {
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(imagePath)
      .loop()
      .input(audioPath)
      .outputOptions([
        '-c:v libx264',
        '-tune stillimage',
        '-c:a aac',
        '-b:a 192k',
        '-pix_fmt yuv420p',
        '-shortest',
        '-movflags +faststart'
      ])
      .size('1080x1920')
      .on('end', resolve)
      .on('error', reject)
      .save(outPath);
  });
}

async function uploadToS3(localPath, key, contentType) {
  const body = fs.createReadStream(localPath);
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
}

async function signGetUrl(key, expiresIn = 3600) {
  const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });
  return url;
}

async function processJob(job) {
  const { jobId, pitch, imageUrl } = job;
  if (!jobId || !pitch) throw new Error('job missing jobId or pitch');
  console.log('Processing job', jobId);

  const tmpDir = path.join(__dirname, 'tmp');
  await fs.promises.mkdir(tmpDir, { recursive: true });
  const audioPath = path.join(tmpDir, `pitch-${jobId}.mp3`);
  const imgPath = path.join(tmpDir, `img-${jobId}.jpg`);
  const outVideo = path.join(tmpDir, `video-${jobId}.mp4`);

  // 1) TTS
  await synthesizeTTS(pitch, audioPath);

  // 2) Image
  try {
    await downloadToFile(imageUrl || DEFAULT_IMAGE_URL, imgPath);
  } catch (e) {
    console.warn('Image download failed, using placeholder', e?.message || e);
    await downloadToFile(DEFAULT_IMAGE_URL, imgPath);
  }

  // 3) FFmpeg render
  await renderVideo(imgPath, audioPath, outVideo);

  // 4) Upload outputs/{jobId}.mp4
  const outKey = `outputs/${jobId}.mp4`;
  await uploadToS3(outVideo, outKey, 'video/mp4');

  // 5) Sign GET and write results/{jobId}.json
  const signed = await signGetUrl(outKey, 3600);
  const resultKey = `results/${jobId}.json`;
  const resultBody = JSON.stringify({ url: signed, createdAt: new Date().toISOString() });
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: resultKey, Body: resultBody, ContentType: 'application/json' }));

  // cleanup
  for (const p of [audioPath, imgPath, outVideo]) {
    try { await fs.promises.unlink(p); } catch {}
  }

  console.log('Done job', jobId);
}

async function poll() {
  console.log('Worker started. Polling SQS...');
  while (true) {
    try {
      const resp = await sqs.send(new ReceiveMessageCommand({
        QueueUrl: QUEUE_URL,
        MaxNumberOfMessages: 1,
        WaitTimeSeconds: 20,
        VisibilityTimeout: 60
      }));
      const messages = resp.Messages || [];
      if (messages.length === 0) {
        await sleep(1000);
        continue;
      }

      for (const m of messages) {
        let payload = null;
        try {
          payload = JSON.parse(m.Body || '{}');
        } catch (e) {
          console.error('Invalid message JSON, deleting', e);
          await sqs.send(new DeleteMessageCommand({ QueueUrl: QUEUE_URL, ReceiptHandle: m.ReceiptHandle }));
          continue;
        }

        try {
          await processJob(payload);
          await sqs.send(new DeleteMessageCommand({ QueueUrl: QUEUE_URL, ReceiptHandle: m.ReceiptHandle }));
        } catch (e) {
          console.error('Job failed, leaving message for retry', e);
          // allow SQS retry / DLQ handling
        }
      }
    } catch (e) {
      console.error('Poll error', e);
      await sleep(5000);
    }
  }
}

poll().catch((e) => { console.error('Worker fatal', e); process.exit(1); });
