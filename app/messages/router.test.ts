import { prisma } from "~/db.server";
import { getMembershipRequest } from "~/models/membership_request.server";
import { handleMessage } from "./router";
import addDays from "date-fns/addDays";
import { sendInvite } from "~/models/invitation.server";

const phone = "+15555555555";

describe("unrecognized number", () => {
  beforeEach(async () => {
    await prisma.membershipRequest.deleteMany({
      where: { phoneNumber: phone },
    });
    await prisma.member.deleteMany({
      where: { phoneNumber: phone },
    });
  });

  it("should create a membership request", async () => {
    let result = await handleMessage(phone, "Hi");
    expect(result.response).toMatch(/Respond with your name/i);

    result = await handleMessage(phone, "Bobbie");
    expect(result.response).toMatch(/Hello, Bobbie/i);

    const request = await prisma.membershipRequest.findFirst({
      where: {
        phoneNumber: phone,
      },
    });

    expect(request).toBeTruthy();
  });
});

describe("existing member", () => {
  beforeEach(async () => {
    const member = await prisma.member.create({
      data: {
        name: "Bobbie",
        phoneNumber: phone,
        token: "fake-token",
      },
    });

    const schedule = await prisma.schedule.create({
      data: {
        title: "My fake schedule",
        cadence: "fake-cadence",
        events: {
          create: {
            dateTime: addDays(new Date(), 3),
          },
        },
      },
      include: {
        events: true,
      },
    });

    sendInvite({
      memberId: member.id,
      eventId: schedule.events[0].id,
    });

    return async () => {
      await prisma.schedule.delete({ where: { id: schedule.id } });
      await prisma.member.delete({ where: { id: member.id } });
    };
  });

  it("should let you respond YES", async () => {
    let result = await handleMessage(phone, "YES");
    expect(result.response).toMatch(/We look forward to seeing you/i);
    const invite = await prisma.invitation.findFirst({
      where: {
        member: {
          phoneNumber: phone,
        },
      },
    });
    expect(invite?.status).toBe("RESPONDED_YES");
  });

  it("should let you respond NO", async () => {
    let result = await handleMessage(phone, "NO");
    expect(result.response).toMatch(/catch you next time/i);
    const invite = await prisma.invitation.findFirst({
      where: {
        member: {
          phoneNumber: phone,
        },
      },
    });
    expect(invite?.status).toBe("RESPONDED_NO");
  });

  it("should let you respond MAYBE", async () => {
    let result = await handleMessage(phone, "MAYBE");
    expect(result.response).toMatch(/we'll follow up with you in a few days/i);
    const invite = await prisma.invitation.findFirst({
      where: {
        member: {
          phoneNumber: phone,
        },
      },
    });
    expect(invite?.status).toBe("RESPONDED_MAYBE");
  });

  it("should let you add guests after responding YES", async () => {
    let result = await handleMessage(phone, "YES");
    expect(result.response).toMatch(/We look forward to seeing you/i);
    result = await handleMessage(phone, "2");
    expect(result.response).toMatch(
      /thanks for letting us know about your guests/i
    );
    const invite = await prisma.invitation.findFirst({
      where: {
        member: {
          phoneNumber: phone,
        },
      },
    });
    expect(invite?.status).toBe("RESPONDED_YES");
    expect(invite?.guests).toBe(2);
  });

  it("should prevent too few or too many guests", async () => {
    let result = await handleMessage(phone, "YES");
    expect(result.response).toMatch(/We look forward to seeing you/i);
    result = await handleMessage(phone, "-5");
    expect(result.response).toMatch(/negative guests/i);
    result = await handleMessage(phone, "15");
    expect(result.response).toMatch(/you have a lot of friends/i);
    result = await handleMessage(phone, "not a number");
    expect(result.response).toMatch(/Please type a number between 1-10/i);
    const invite = await prisma.invitation.findFirst({
      where: {
        member: {
          phoneNumber: phone,
        },
      },
    });
    expect(invite?.status).toBe("RESPONDED_YES");
    expect(invite?.guests).toBe(null);
  });

  it("should let you change the number of guests", async () => {
    await handleMessage(phone, "YES");
    await handleMessage(phone, "3");
    await handleMessage(phone, "5");
    const invite = await prisma.invitation.findFirst({
      where: {
        member: {
          phoneNumber: phone,
        },
      },
    });
    expect(invite?.guests).toBe(5);
  });

  it("the help command works", async () => {
    const result = await handleMessage(phone, "help");
    expect(result.response).toMatch(
      /Respond with any of the following commands/i
    );
    expect(result.response).toMatch(/HELP/i);
    expect(result.response).toMatch(/INVITATIONS/i);
  });

  it("the invitations command works", async () => {
    const result = await handleMessage(phone, "invitations");
    expect(result.response).toMatch(
      /To view or update invitations and RSVPs, use this link/i
    );
    expect(result.response).toMatch(/\/memberLogin/i);
  });
});
