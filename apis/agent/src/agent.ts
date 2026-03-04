import {
  agent,
  createVolcanoTelemetry,
  llmOpenAI,
  mcp,
  MCPConnectionError,
} from "@volcano.dev/agent";
import { HTTPException } from "hono/http-exception";

const serviceName = process.env.OTEL_SERVICE_NAME || "volcano-sandbox";
const otlpEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4318";

const telemetry = createVolcanoTelemetry({
  serviceName: serviceName,
  endpoint: otlpEndpoint,
  traces: true,
  metrics: true,
});

const gatewayEndpoint = process.env.GATEWAY_ENDPOINT || "http://localhost:8000";

const llm = llmOpenAI({
  apiKey: "set-api-key-via-kong-gateway",
  model: "gpt-4o-mini",
  baseURL: `${gatewayEndpoint}/v1`
});

const catalogueMcp = mcp(`${gatewayEndpoint}/mcp/catalogue`);

export async function runAgent(prompt: string): Promise<string> {
  try {
    const result = await agent({
      name: "gorilla-store-agent",
      llm,
      telemetry,
      instructions:
        "あなたは、ゴリラストアの顧客の手伝いをするアシスタントです。取り扱っている商品についてユーザーの質問に答えてください。扱っていない商品について問い合わせがあった場合は、類似な商品を例に出して回答を作成してください。",
    })
      .then({
        prompt,
        mcps: [catalogueMcp],
      })
      .run();
    const output = result[result.length - 1]?.llmOutput;
    if (output === undefined) {
      return "適切な回答が「ゴリラエージェント」から得られませんでした。";
    }
    return output;
  } catch (e) {
    if (e instanceof MCPConnectionError) {
      throw new HTTPException(503, {
        message: "MCP server is unavailable. Please check Kong Gateway is running.",
      });
    }
    console.error("[runAgent] unexpected error:", e);
    throw new HTTPException(500, {
      message: "Unexpected error occured.",
    });
  }
}
