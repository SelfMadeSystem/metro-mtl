import { defineCollection, z, reference } from 'astro:content';
import { file } from 'astro/loaders';

// Define a schema for station metadata
const stationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  lines: reference("lines").array().min(1), // List of line IDs
  exits: z.array(z.string()).optional(), // TODO: Not yet implemented
  accessibility: z.boolean().optional(),
  parking: z.boolean().optional(),
});

// Define a schema for metro lines
const lineSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1), // Hex color code
  stations: z.array(reference("stations")).min(1), // List of station IDs
});

// Define collections
const stationsCollection = defineCollection({
  loader: file('src/data/stations.json'),
  schema: stationSchema,
});

const linesCollection = defineCollection({
  loader: file('src/data/lines.json'),
  schema: lineSchema,
});

// Export collections
export const collections = {
  stations: stationsCollection,
  lines: linesCollection,
};