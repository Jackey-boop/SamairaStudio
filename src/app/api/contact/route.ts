import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendContactNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const brand = String(body?.brand || "").trim();
    const message = String(body?.message || "").trim();

    if (!name || !message) {
      return NextResponse.json(
        { error: "Name and a short brief are required." },
        { status: 400 }
      );
    }

    const submission = await prisma.contactSubmission.create({
      data: { name, brand: brand || null, message },
    });

    // Notify admin inbox (non-fatal if email isn't configured).
    await sendContactNotification({ name, brand, message });

    return NextResponse.json({ success: true, id: submission.id });
  } catch (err) {
    console.error("[contact] error:", err);
    return NextResponse.json(
      { error: "Could not send your message. Please try again." },
      { status: 500 }
    );
  }
}
