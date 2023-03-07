import { prisma } from "~/db.server";
import type { Member } from "@prisma/client";

export type { Member } from "@prisma/client";

export function getMemberByPhoneNumber(phoneNumber: string) {
  return prisma.member.findFirst({
    where: { phoneNumber },
  });
}

export async function getLatestInvitation(memberId: Member["id"]) {
  return prisma.invitation.findFirst({
    where: { memberId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllActiveMembers() {
  return prisma.member.findMany()
}
