import { Queue, Worker } from "bullmq";
import { connection } from "./queue.service";
import { processSupportBotQuery } from "../modules/supportBot/supportBot.processor";

const QUEUE_NAME = "support-bot";

/**
 * Support-bot answers are built by a BullMQ worker. If Redis is down the queue marks itself
 * unavailable and the same processor runs inline, so the bot keeps answering.
 */
export class SupportBotQueue {
  private static instance: SupportBotQueue;
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private isAvailable = true;

  private constructor() {
    try {
      this.queue = new Queue(QUEUE_NAME, { connection });
      this.queue.on("error", () => {
        if (this.isAvailable) {
          console.warn("⚠️  Support bot queue Redis connection failed. Answers will be built inline.");
          this.isAvailable = false;
        }
      });
    } catch (err: any) {
      console.warn("⚠️  Failed to instantiate support bot queue:", err.message);
      this.isAvailable = false;
    }
  }

  public static getInstance(): SupportBotQueue {
    if (!SupportBotQueue.instance) SupportBotQueue.instance = new SupportBotQueue();
    return SupportBotQueue.instance;
  }

  public startWorker() {
    if (this.worker || !this.isAvailable) return;
    try {
      this.worker = new Worker(QUEUE_NAME, async (job) => processSupportBotQuery(job.data.queryId), {
        connection,
        concurrency: 5,
      });
      this.worker.on("error", () => {
        this.isAvailable = false;
      });
      this.worker.on("failed", (job, err) => console.error(`[SUPPORT BOT] Job ${job?.id} failed:`, err.message));
    } catch (err: any) {
      console.warn("⚠️  Failed to start support bot worker:", err.message);
      this.isAvailable = false;
    }
  }

  /** Queues the answer job; runs it inline when Redis is unavailable. */
  public async enqueue(queryId: string): Promise<void> {
    if (this.isAvailable && this.queue) {
      try {
        await Promise.race([
          this.queue.add("answer", { queryId }, { attempts: 2, removeOnComplete: true, removeOnFail: 100 }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("queue timeout")), 2000)),
        ]);
        return;
      } catch (err: any) {
        console.warn("⚠️  Support bot enqueue failed, answering inline:", err.message);
        this.isAvailable = false;
      }
    }
    await processSupportBotQuery(queryId);
  }
}
