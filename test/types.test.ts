import {
  Inklet,
  type InkletClientOptions,
  type InkletRequestOptions,
} from "@inklethq/sdk";

const options = {
  secretKey: "inklet_pat_typecheck",
  baseUrl: "http://127.0.0.1:8787/v1",
  fetch: async () => Response.json({ ok: true }),
} satisfies InkletClientOptions;

const client = new Inklet(options);
const requestOptions = {
  method: "POST",
  json: { text: "Hello, Inklet" },
} satisfies InkletRequestOptions;

void client.request<{ ok: boolean }>("/typecheck", requestOptions);
