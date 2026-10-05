import { randomUUID } from "node:crypto";
import { writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { userFromRequest } from "@/lib/server/auth";
import { getDb } from "@/lib/server/db";
import {
  documentKinds,
  uploadDir,
  type DocumentRecord,
} from "@/lib/server/documents";
import { errorResponse } from "@/lib/server/http";
import { getFarm, saveFarm } from "@/lib/server/farm";

export const runtime = "nodejs";
const types: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};
const maxBytes = 8 * 1024 * 1024;

function matchesFileType(mime: string, bytes: Buffer) {
  if (mime === "application/pdf")
    return bytes.subarray(0, 5).toString() === "%PDF-";
  if (mime === "image/jpeg")
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );
  if (mime === "image/png")
    return bytes.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"));
  if (mime === "image/webp")
    return (
      bytes.subarray(0, 4).toString() === "RIFF" &&
      bytes.subarray(8, 12).toString() === "WEBP"
    );
  return false;
}

export async function GET(request: NextRequest) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  const documents = getDb()
    .prepare(
      `SELECT id, kind, original_name, mime_type, size_bytes, created_at
    FROM documents WHERE user_id = ? ORDER BY created_at DESC`,
    )
    .all(user.id) as Omit<DocumentRecord, "stored_name">[];
  return NextResponse.json(
    { documents },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest) {
  const user = userFromRequest(request);
  if (!user) return errorResponse("Please sign in.", 401);
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("Choose a file and document type.");
  }
  const file = form.get("file");
  const kind = form.get("kind");
  if (
    !(file instanceof File) ||
    typeof kind !== "string" ||
    !documentKinds.includes(kind as (typeof documentKinds)[number])
  ) {
    return errorResponse("Choose a file and document type.");
  }
  const extension = types[file.type];
  if (!extension) return errorResponse("Use a PDF, JPEG, PNG or WebP file.");
  if (file.size < 1 || file.size > maxBytes)
    return errorResponse("File must be smaller than 8 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!matchesFileType(file.type, bytes))
    return errorResponse("The file content does not match its type.");
  const id = randomUUID();
  const storedName = `${id}${extension}`;
  const originalName =
    file.name.replace(/[\\/\r\n]/g, "_").slice(0, 120) ||
    `document${extension}`;
  const path = resolve(uploadDir(), storedName);
  try {
    await writeFile(path, bytes, {
      flag: "wx",
      mode: 0o600,
    });
    const createdAt = new Date().toISOString();
    getDb().transaction(() => {
      getDb()
        .prepare(
          `INSERT INTO documents
      (id, user_id, kind, original_name, stored_name, mime_type, size_bytes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          id,
          user.id,
          kind,
          originalName,
          storedName,
          file.type,
          file.size,
          createdAt,
        );
      const evidenceFlag = {
        land: "landProof",
        soil: "soilTest",
        input: "inputBills",
        photo: "fieldPhotos",
      }[kind] as
        "landProof" | "soilTest" | "inputBills" | "fieldPhotos" | undefined;
      if (evidenceFlag)
        saveFarm(user.id, { ...getFarm(user.id), [evidenceFlag]: true });
    })();
    return NextResponse.json(
      {
        document: {
          id,
          kind,
          original_name: originalName,
          mime_type: file.type,
          size_bytes: file.size,
          created_at: createdAt,
          status: "unverified",
        },
      },
      { status: 201 },
    );
  } catch {
    await unlink(path).catch(() => undefined);
    return errorResponse("Upload failed. Please try again.", 500);
  }
}
