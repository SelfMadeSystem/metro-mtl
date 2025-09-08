import { defineCollection, z, reference } from "astro:content";
import { file } from "astro/loaders";

// Define exit schema
const exitSchema = z.object({
  id: z.string().min(1),
  line: reference("lines").optional(), // Line ID (for transfer stations)
  name: z.string().min(1), // e.g., "Saint-Joseph - Gilford", "Main Exit"
  address: z.string().min(1).optional(), // e.g., "495, rue Gilford"
  optimalBoarding: reference("stations").optional(), // Optimal boarding direction (e.g., "towards Snowdon", "middle of train")
  description: z.string().optional(), // Additional details
});

export type Exit = z.infer<typeof exitSchema>;

// Define transfer schema
const transferSchema = z.object({
  from: reference("lines"),
  to: reference("lines"),
  fromDirection: reference("stations").optional(), // Station ID for direction on 'from' line
  toDirection: reference("stations").optional(), // Station ID for direction on 'to' line
  optimalBoarding: reference("stations").optional(), // Optimal boarding direction
  description: z.string().optional(), // Additional details
});

export type Transfer = z.infer<typeof transferSchema>;

// Define a schema for station metadata
const stationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  lines: reference("lines").array().min(1), // List of line IDs
  exits: z.array(exitSchema).optional(),
  transfers: z.array(transferSchema).optional(),
  stmId: z.string().optional(), // STM station ID (if different from 'id')
  accessible: z.boolean().optional(),
  parking: z.boolean().optional(),
});

export type Station = z.infer<typeof stationSchema>;
export type StationWithLines = Omit<Station, "lines"> & { lines: Line[] };

// Define a schema for metro lines
const lineSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1).max(2), // Short code like "1", "2", "A", "B"
  name: z.string().min(1),
  color: z.string().min(1), // Hex color code
  textColor: z.string().min(1), // Hex color code for text
  stations: z.array(reference("stations")).min(1), // List of station IDs
});

export type Line = z.infer<typeof lineSchema>;
export type LineWithStations = Omit<Line, "stations"> & { stations: Station[] };

// Define collections
const stationsCollection = defineCollection({
  loader: file("src/data/stations.json"),
  schema: stationSchema,
});

const linesCollection = defineCollection({
  loader: file("src/data/lines.json"),
  schema: lineSchema,
});

// Export collections
export const collections = {
  stations: stationsCollection,
  lines: linesCollection,
};
