import { prisma } from "~/db.server";

export type { Schedule } from "@prisma/client";

export function getAllSchedules() {
  return prisma.schedule.findMany({
    select: { id: true, title: true, cadence: true },
    orderBy: { updatedAt: "desc" },
  });
}
