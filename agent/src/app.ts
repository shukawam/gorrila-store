import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { runAgent } from "./agent.js";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const agentRequestSchema = z
  .object({
    prompt: z.string().optional(),
    messages: z.array(messageSchema).min(1).optional(),
  })
  .refine((data) => data.prompt !== undefined || data.messages !== undefined, {
    message: "Either prompt or messages must be provided",
  });

const app = new Hono();

app
  .get("/", (c) => {
    return c.json({ message: "Hello world" });
  })
  .post("/agent", zValidator("json", agentRequestSchema), async (c) => {
    const body = c.req.valid("json");

    let prompt: string;
    if (body.messages) {
      prompt = body.messages
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");
    } else {
      prompt = body.prompt!;
    }

    const response = await runAgent(prompt);
    return c.json({ response });
  });

export default app;
