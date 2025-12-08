import httpStatus from "http-status-codes";
import { prisma } from "../../../lib/prisma";
import AppError from "../../customizer/AppErrror";
import { Prisma } from "../../../../prisma/generated/prisma/client";


const createEvent = async (hostId: string, payload: Prisma.EventCreateInput) => {
  console.log("payload_host:", payload);

  // Host validation
  const host = await prisma.user.findFirst({
    where: { id: hostId, role: "HOST" },
  });

  if (!host) {
    throw new AppError(httpStatus.FORBIDDEN, "Only hosts can create events");
  }

  const {
    name,
    type,
    date,
    time,
    location,
    minParticipants,
    maxParticipants,
    description,
    image,
    fee,
  } = payload;

  if (minParticipants > maxParticipants) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "minParticipants cannot be greater than maxParticipants"
    );
  }

  const eventDateTime = time
  ? new Date(`${date}T${time}`)
  : new Date(`${date}T00:00`);


  const event = await prisma.event.create({
    data: {
      name,
      type,
      date: eventDateTime,
      time,
      location,
      minParticipants,
      maxParticipants,
      description,
      image,
      fee,
      host: { connect: { id: hostId } },
    },
  });

  return event;
};


const getAllEvents = async () => {
  const events = await prisma.event.findMany();
  return events;
}




export const EventService = {
  createEvent,
  getAllEvents
};