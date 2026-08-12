import {
  AuthenticationFailedError,
  Inklet,
  type AutoPushInput,
  type Content,
  type Display,
  type HardcodePushInput,
  type InkletClientOptions,
  type InkletRequestOptions,
  type Presentation,
} from "@inklethq/sdk";

const options = {
  pat: "inklet_pat_typecheck",
  baseUrl: "http://127.0.0.1:8787/v1",
  fetch: async () => Response.json({ ok: true }),
} satisfies InkletClientOptions;

const client = new Inklet(options);
const requestOptions = {
  method: "POST",
  json: { text: "Hello, Inklet" },
} satisfies InkletRequestOptions;

void client.request<{ ok: boolean }>("/typecheck", requestOptions);

const autoInput = {
  idempotencyKey: "typecheck-auto-1",
  assets: [client.assets.text("Hello, Inklet")],
} satisfies AutoPushInput;

const hardcodeInput = {
  displayId: "display_123",
  image: client.assets.image({
    data: new Uint8Array([1, 2, 3]),
    filename: "poster.png",
    contentType: "image/png",
  }),
} satisfies HardcodePushInput;

const displayPromise: Promise<Display> = client.displays.retrieve("display_123");
const currentPromise: Promise<Presentation | null> =
  client.displays.current("display_123");
const contentPromise: Promise<Content> = client.contents.retrieve("content_123");

void client.push.auto(autoInput);
void client.push.hardcode(hardcodeInput);
void client.presentations.retrieve("presentation_123", { format: "raw2" });
void displayPromise;
void currentPromise;
void contentPromise;
void AuthenticationFailedError;
