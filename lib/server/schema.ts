import { z } from "zod";
import { todayIndia } from "@/lib/date";

const shortText = z.string().trim().min(1).max(100);
const area = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      (Number.isFinite(Number(value)) &&
        Number(value) > 0 &&
        Number(value) <= 100000),
    "Enter a valid area in acres",
  );

export const registerSchema = z.object({
  name: shortText,
  phone: z.string().trim().min(10).max(25),
  password: z.string().min(8).max(128),
  village: shortText,
  district: shortText,
  state: shortText,
  area: area.refine((value) => value !== "", "Enter your farm area."),
  tenure: z.enum(["owned", "leased", "other"]),
});

export const loginSchema = z.object({
  phone: z.string().trim().min(10).max(25),
  password: z.string().min(1),
});

export const farmUpdateSchema = z
  .object({
    name: z.string().trim().max(100),
    village: z.string().trim().max(100),
    district: z.string().trim().max(100),
    state: z.string().trim().max(100),
    area,
    tenure: z.enum(["owned", "leased", "other", ""]),
    gps: z.boolean(),
    landProof: z.boolean(),
    tillage: z.enum(["conventional", "reduced", "zero"]),
    coverCrops: z.boolean(),
    cropRotation: z.boolean(),
    mulching: z.boolean(),
    agroforestry: z.boolean(),
    residueBurning: z.boolean().nullable(),
    fertilizerRecords: z.boolean(),
    manure: z.boolean(),
    inputBills: z.boolean(),
    irrigation: z.enum(["flood", "sprinkler", "drip", "rainfed"]),
    waterRecords: z.boolean(),
    soilTest: z.boolean(),
    soilCarbon: z.boolean(),
    fieldPhotos: z.boolean(),
    fpo: z.boolean(),
  })
  .partial();

export const cropRecordSchema = z.object({
  year: z
    .number()
    .int()
    .min(2000)
    .max(new Date().getFullYear() + 1),
  season: z.enum(["Kharif", "Rabi", "Zaid", "Other"]),
  crop: shortText,
  tillage: z.enum(["conventional", "reduced", "zero"]),
  irrigation: z.enum(["flood", "sprinkler", "drip", "rainfed"]),
  inputNotes: z.string().trim().max(1000),
  waterNotes: z.string().trim().max(1000),
});

export const groupSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create"), name: shortText }),
  z.object({
    action: z.literal("join"),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-F0-9]{12}$/),
  }),
]);

const optionalText = z.string().trim().max(500);
const eventDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.")
  .refine(
    (value) =>
      !Number.isNaN(Date.parse(value)) &&
      new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value &&
      value <= todayIndia(),
    "Date cannot be in the future.",
  );
const evidenceDocumentId = z.string().uuid().nullable().optional();

export const plotSchema = z.object({
  name: shortText,
  areaAcres: z.number().finite().positive().max(100000),
  tenure: z.enum(["owned", "leased", "other"]),
  village: shortText,
  parcelReference: z.string().trim().max(100),
  notes: optionalText,
});

export const mrvSchema = z.object({
  eventDate,
  practice: z.enum([
    "tillage",
    "cover_crop",
    "residue",
    "fertilizer",
    "irrigation",
    "soil_sample",
    "field_photo",
    "other",
  ]),
  details: z.string().trim().min(3).max(500),
  evidenceDocumentId,
});

export const financeSchema = z.object({
  entryDate: eventDate,
  kind: z.enum(["expense", "income"]),
  category: shortText,
  amountRupees: z.number().finite().min(0.01).max(100000000),
  note: optionalText,
  evidenceDocumentId,
});

export const creditSchema = z.object({
  entryDate: eventDate,
  action: z.enum(["issued", "retired"]),
  quantity: z.number().finite().min(0.001).max(100000000),
  registry: shortText,
  reference: shortText,
  note: optionalText,
});
