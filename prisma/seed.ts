import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import setHours from "date-fns/setHours";
import startOfHour from "date-fns/startOfHour";
import addDays from "date-fns/addDays";
import { generateToken } from "~/utils";

const prisma = new PrismaClient();

async function seed() {
  const email = "adrian@example.com";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("password", 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  const schedule = await prisma.schedule.create({
    data: {
      title: "Front Street",
      cadence: "first-wednesdays",
    },
  });

  const member = await prisma.member.create({
    data: {
      phoneNumber: "+15058143896",
      name: "Adrian",
      token: generateToken()
    },
  });

  const event = await prisma.event.create({
    data: {
      scheduleId: schedule.id,
      dateTime: setHours(startOfHour(addDays(new Date(), 4)), 12 + 7),
    },
  });

  await prisma.invitation.create({
    data: {
      eventId: event.id,
      memberId: member.id,
      status: "SENT",
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
