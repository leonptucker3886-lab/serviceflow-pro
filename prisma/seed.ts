import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const dbPath = path.resolve("./dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Service-Link demo data...");

  // Clean
  await prisma.review.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.jobFile.deleteMany();
  await prisma.job.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.company.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash("demo123", 10);

  const owner = await prisma.user.create({
    data: { email: "owner@apex.com", name: "Marcus Rivera", passwordHash: hash },
  });
  const admin = await prisma.user.create({
    data: { email: "admin@apex.com", name: "Sarah Chen", passwordHash: hash },
  });
  const tech1 = await prisma.user.create({
    data: { email: "mike@apex.com", name: "Mike Torres", passwordHash: hash },
  });
  const tech2 = await prisma.user.create({
    data: { email: "lisa@apex.com", name: "Lisa Park", passwordHash: hash },
  });
  const custUser1 = await prisma.user.create({
    data: { email: "john.smith@email.com", name: "John Smith", passwordHash: hash },
  });
  const custUser2 = await prisma.user.create({
    data: { email: "emily.jones@email.com", name: "Emily Jones", passwordHash: hash },
  });

  const company = await prisma.company.create({
    data: {
      name: "Apex Home Services",
      slug: "apex-home-services",
      phone: "(555) 234-5678",
      email: "hello@apexhomeservices.com",
      address: "1247 Oak Ridge Blvd, Austin, TX 78701",
      plan: "pro",
      planStatus: "active",
      primaryColor: "#0ea5e9",
      secondaryColor: "#0f172a",
      accentColor: "#22c55e",
      portalWelcome: "Welcome to Apex Home Services",
      supportPhone: "(512) 555-0199",
      supportEmail: "hello@apexhomeservices.com",
      showPoweredBy: true,
    },
  });

  await prisma.membership.createMany({
    data: [
      { userId: owner.id, companyId: company.id, role: "owner" },
      { userId: admin.id, companyId: company.id, role: "admin" },
      { userId: tech1.id, companyId: company.id, role: "technician" },
      { userId: tech2.id, companyId: company.id, role: "technician" },
    ],
  });

  const cust1 = await prisma.customer.create({
    data: {
      companyId: company.id,
      userId: custUser1.id,
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "(555) 111-2222",
      address: "482 Maple Street, Austin, TX 78702",
    },
  });
  const cust2 = await prisma.customer.create({
    data: {
      companyId: company.id,
      userId: custUser2.id,
      name: "Emily Jones",
      email: "emily.jones@email.com",
      phone: "(555) 333-4444",
      address: "901 Cedar Lane, Austin, TX 78704",
    },
  });

  const daysAgo = (d: number) => new Date(Date.now() - d * 86400000);
  const dayStr = (d: number) => daysAgo(d).toISOString().slice(0, 10);

  const job1 = await prisma.job.create({
    data: {
      companyId: company.id,
      customerId: cust1.id,
      title: "AC Unit Repair & Tune-up",
      description: "Customer reports AC not cooling properly. Likely refrigerant or capacitor issue.",
      status: "sold",
      assignedToId: tech1.id,
      estimateAmount: 320,
      invoiceAmount: 385,
      scheduledDate: dayStr(2),
      scheduledTime: "10:00",
      completedAt: daysAgo(1),
      soldAt: daysAgo(2),
      soldById: tech1.id,
      address: "482 Maple Street, Austin, TX 78702",
      notes: "Customer prefers morning appointments. Gate code 4821.",
      privateNotes: "Customer previously complained about pricing – be careful with upsells.",
      timeSpentMinutes: 95,
      files: {
        create: [
          {
            name: "before-ac.jpg",
            url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400",
            isPrivate: false,
            uploadedById: tech1.id,
          },
        ],
      },
    },
  });

  await prisma.job.create({
    data: {
      companyId: company.id,
      customerId: cust2.id,
      title: "Water Heater Replacement",
      description: "50-gallon gas water heater replacement. Old unit is 14 years old and leaking.",
      status: "scheduled",
      assignedToId: tech2.id,
      estimateAmount: 1450,
      scheduledDate: dayStr(-1),
      scheduledTime: "09:00",
      address: "901 Cedar Lane, Austin, TX 78704",
      notes: "Permit already pulled by customer.",
      privateNotes: "High-value lead from Google. Follow up for maintenance plan.",
      soldById: owner.id,
    },
  });

  await prisma.job.create({
    data: {
      companyId: company.id,
      customerId: cust1.id,
      title: "Bathroom Faucet Install",
      description: "Replace kitchen and bathroom faucets. Customer supplied fixtures.",
      status: "estimate",
      estimateAmount: 180,
      address: "482 Maple Street, Austin, TX 78702",
      notes: "Fixtures already purchased – Moen.",
    },
  });

  const job4 = await prisma.job.create({
    data: {
      companyId: company.id,
      customerId: cust2.id,
      title: "Electrical Panel Upgrade 200A",
      description: "Upgrade main panel to 200A service.",
      status: "invoiced",
      assignedToId: tech1.id,
      estimateAmount: 2800,
      invoiceAmount: 2950,
      scheduledDate: dayStr(5),
      completedAt: daysAgo(1),
      soldAt: daysAgo(3),
      soldById: owner.id,
      address: "901 Cedar Lane, Austin, TX 78704",
      notes: "Permit required – we handle.",
      privateNotes: "Good margin job.",
      timeSpentMinutes: 480,
    },
  });

  await prisma.job.create({
    data: {
      companyId: company.id,
      customerId: cust1.id,
      title: "Dryer Vent Cleaning",
      description: "Annual dryer vent cleaning service.",
      status: "paid",
      assignedToId: tech2.id,
      estimateAmount: 149,
      invoiceAmount: 149,
      scheduledDate: dayStr(10),
      completedAt: daysAgo(10),
      soldAt: daysAgo(12),
      soldById: tech2.id,
      address: "482 Maple Street, Austin, TX 78702",
      notes: "Annual service.",
      privateNotes: "Good recurring customer.",
      timeSpentMinutes: 45,
    },
  });

  await prisma.invoice.create({
    data: {
      companyId: company.id,
      jobId: job1.id,
      customerId: cust1.id,
      amount: 385,
      status: "paid",
      dueDate: daysAgo(0),
      paidAt: daysAgo(1),
      lineItems: JSON.stringify([
        { description: "AC diagnostic & refrigerant top-up", amount: 185 },
        { description: "Capacitor replacement", amount: 120 },
        { description: "System tune-up labor", amount: 80 },
      ]),
    },
  });

  await prisma.invoice.create({
    data: {
      companyId: company.id,
      jobId: job4.id,
      customerId: cust2.id,
      amount: 2950,
      status: "sent",
      dueDate: new Date(Date.now() + 7 * 86400000),
      lineItems: JSON.stringify([
        { description: "200A panel upgrade materials", amount: 1450 },
        { description: "Labor (2 techs)", amount: 1200 },
        { description: "Permit & inspection coordination", amount: 300 },
      ]),
    },
  });

  await prisma.review.create({
    data: {
      companyId: company.id,
      jobId: job1.id,
      customerId: cust1.id,
      customerName: "John Smith",
      rating: 5,
      comment: "Mike fixed our AC the same day. Super professional!",
      status: "published",
    },
  });

  await prisma.review.create({
    data: {
      companyId: company.id,
      jobId: job4.id,
      customerId: cust2.id,
      customerName: "Emily Jones",
      rating: 0,
      comment: "",
      status: "pending",
      requestedAt: daysAgo(1),
    },
  });

  console.log("Seed complete. Demo logins (password: demo123):");
  console.log("  owner@apex.com / admin@apex.com / mike@apex.com / lisa@apex.com");
  console.log("  john.smith@email.com / emily.jones@email.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
