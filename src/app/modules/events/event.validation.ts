// validators/event.ts
import { date, z } from "zod";

/**
 * Replace these values if your Prisma enum for EventStatus is different.
 * Example Prisma enum: enum EventStatus { OPEN, CLOSED, CANCELLED, COMPLETED }
 */
export const EventStatusEnum = z.enum(["OPEN", "CLOSED", "CANCELLED", "COMPLETED"]);

/**
 * Helper to accept either a JS Date or an ISO string and normalize to Date.
 */
const dateFromString = z.preprocess((arg) => {
  if (typeof arg === "string" || arg instanceof String) {
    const d = new Date(arg as string);
    return isNaN(d.getTime()) ? undefined : d;
  }
  if (arg instanceof Date) return arg;
  return undefined;
}, z.instanceof(Date, { message: "Invalid date" }));

/**
 * Event Create Schema
 * Only includes fields normally provided by client when creating an Event.
 * server-managed fields (id, createdAt, participantCount, status defaults) are optional / omitted.
 */
export const EventCreateSchema = z
  .object({
    name: z.string().min(1, "Event name is required"),
    type: z.string().min(1, "Event type is required"),
    description: z.string().max(2000).optional().nullable(),
    location: z.string().min(1, "Location is required"),
    image: z.string().url().optional().nullable(),
    // Accepts ISO string or Date
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    // time could be a string like "14:30" or free text
    time: z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
  .optional()
  .nullable(),
    minParticipants: z
      .number({ error: "minParticipants must be a number" })
      .int()
      .nonnegative()
      .default(0),
    maxParticipants: z
      .number({ error: "maxParticipants must be a number" })
      .int()
      .nonnegative()
      .default(0),
    // participantCount should normally be server-side; allow optional if needed
    participantCount: z.number().int().nonnegative().optional(),
    fee: z
      .number({ error: "fee must be a number" })
      .nonnegative()
      .optional()
      .default(0),
    status: EventStatusEnum.optional().default("OPEN")
  })
 
export type EventCreateInput = z.infer<typeof EventCreateSchema>;

/**
 * EventParticipant Create Schema
 * For creating a participant entry (a user joining an event).
 */
export const EventParticipantCreateSchema = z.object({
  userId: z.string().uuid("userId must be a valid UUID"),
  eventId: z.string().uuid("eventId must be a valid UUID"),
  paid: z.boolean().optional().default(false),
  joinedAt: dateFromString.optional(),
});

export type EventParticipantCreateInput = z.infer<
  typeof EventParticipantCreateSchema
>;

/* -----------------------
   Usage examples:

// validate event payload
const payload = {
  name: "Picnic in the Park",
  type: "Social",
  location: "Riverside Park",
  date: "2026-05-20T10:00:00.000Z",
  minParticipants: 5,
  maxParticipants: 50,
  hostId: "3d02c1b4-fab2-4700-a026-7846a8c68a8f",
};

const parseResult = EventCreateSchema.safeParse(payload);
if (!parseResult.success) {
  console.error(parseResult.error.format());
  // return 400 with errors
} else {
  const validEventInput: EventCreateInput = parseResult.data;
  // pass validEventInput to Prisma create
  // prisma.event.create({ data: validEventInput })
}

// validate participant payload
const p = { userId: "uuid-1234", eventId: "uuid-5678", paid: true };
const pRes = EventParticipantCreateSchema.safeParse(p);
if (!pRes.success) {
  console.error(pRes.error.format());
} else {
  const participantInput: EventParticipantCreateInput = pRes.data;
  // prisma.eventParticipant.create({ data: participantInput })
}

----------------------- */
