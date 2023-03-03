import { prisma } from "~/db.server";
import type { Event, Schedule } from "@prisma/client";

interface CreateNewEventArgs {
    date: Date
    scheduleId: Schedule['id']
}

export async function createNewEvent({ date, scheduleId } : CreateNewEventArgs) {
    const event = await prisma.event.create({
        data: {
            dateTime: date,
            scheduleId
        }
    })

    return event
}

export async function getUpcomingEvents(){
    return prisma.event.findMany({
        where: {
            dateTime: { gt: new Date() }
        },
        include: {
            schedule: true
        }
    })
}