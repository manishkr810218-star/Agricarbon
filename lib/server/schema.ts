import { z } from "zod";

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
