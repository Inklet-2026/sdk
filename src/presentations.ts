import {
  SDK_API_PREFIX,
  encodePathSegment,
  expectInteger,
  expectRecord,
  expectString,
  expectStringArray,
  nullableRecord,
  nullableString,
  type ResourceTransport,
} from "./resource.js";
import { ConfigurationError, InvalidResponseError } from "./errors.js";

export type PresentationState =
  | "preparing"
  | "queued"
  | "published"
  | "confirmed"
  | "expired"
  | "failed";

export type PresentationImageFormat = "png" | "raw2" | "raw4";

export interface PresentationProblem {
  code: string;
  message: string;
  stage: string | null;
  retryable: boolean;
  assetIndex: number | null;
}

export interface PresentationImage {
  url: string;
  format: PresentationImageFormat;
  width: number;
  height: number;
  expiresAt: string;
  updatedAt: string;
}

export interface Presentation {
  id: string;
  displayId: string;
  contentIds: readonly string[];
  mode: "auto" | "manual" | "hardcode" | "";
  state: PresentationState;
  image: PresentationImage | null;
  failure: PresentationProblem | null;
  createdAt: string;
  updatedAt: string;
}

export interface RetrievePresentationOptions {
  format?: PresentationImageFormat;
}

export class PresentationsResource {
  readonly #transport: ResourceTransport;

  constructor(transport: ResourceTransport) {
    this.#transport = transport;
  }

  async retrieve(
    presentationId: string,
    options: RetrievePresentationOptions = {},
  ): Promise<Presentation> {
    const id = encodePathSegment(presentationId, "presentationId");
    const query = formatQuery(options.format);
    const response = await this.#transport.request(
      `${SDK_API_PREFIX}/presentations/${id}${query}`,
    );
    return parsePresentation(expectRecord(response));
  }
}

export function parsePresentation(
  record: Record<string, unknown>,
): Presentation {
  const mode = record.mode;
  if (
    typeof mode !== "string" ||
    (mode !== "" && mode !== "auto" && mode !== "manual" && mode !== "hardcode")
  ) {
    throw new InvalidResponseError();
  }

  const state = expectString(record, "state");
  if (!isPresentationState(state)) {
    throw new InvalidResponseError();
  }

  return {
    id: expectString(record, "id"),
    displayId: expectString(record, "displayId"),
    contentIds: expectStringArray(record.contentIds),
    mode,
    state,
    image: parseImage(nullableRecord(record.image)),
    failure: parseProblem(nullableRecord(record.failure)),
    createdAt: expectString(record, "createdAt"),
    updatedAt: expectString(record, "updatedAt"),
  };
}

export function parsePresentationProblem(
  record: Record<string, unknown> | null,
): PresentationProblem | null {
  return parseProblem(record);
}

function parseImage(
  record: Record<string, unknown> | null,
): PresentationImage | null {
  if (record === null) {
    return null;
  }
  const format = expectString(record, "format");
  if (format !== "png" && format !== "raw2" && format !== "raw4") {
    throw new InvalidResponseError();
  }
  return {
    url: expectString(record, "url"),
    format,
    width: expectInteger(record, "width"),
    height: expectInteger(record, "height"),
    expiresAt: expectString(record, "expiresAt"),
    updatedAt: expectString(record, "updatedAt"),
  };
}

function parseProblem(
  record: Record<string, unknown> | null,
): PresentationProblem | null {
  if (record === null) {
    return null;
  }
  if (typeof record.retryable !== "boolean") {
    throw new InvalidResponseError();
  }
  const assetIndex = record.assetIndex;
  if (
    assetIndex !== null &&
    (typeof assetIndex !== "number" || !Number.isInteger(assetIndex))
  ) {
    throw new InvalidResponseError();
  }
  return {
    code: expectString(record, "code"),
    message: expectString(record, "message"),
    stage: nullableString(record.stage),
    retryable: record.retryable,
    assetIndex,
  };
}

function isPresentationState(value: string): value is PresentationState {
  return [
    "preparing",
    "queued",
    "published",
    "confirmed",
    "expired",
    "failed",
  ].includes(value);
}

export function formatQuery(format: PresentationImageFormat | undefined): string {
  if (format === undefined) {
    return "";
  }
  if (format !== "png" && format !== "raw2" && format !== "raw4") {
    throw new ConfigurationError("format must be png, raw2, or raw4.");
  }
  return `?format=${format}`;
}
