import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { Transaction, User } from "@/models";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

function getDecoded(req: NextRequest) {
  let token = req.cookies.get("token")?.value;
  if (!token) {
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch (err) {
    return null;
  }
}

// GET - Fetch user transactions
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const decoded = getDecoded(req);

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactions = await Transaction.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

// POST - Create transaction record (called after successful payment)
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const decoded = getDecoded(req);

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, amount, paymentMethod, stripePaymentId } = body;

    if (!courseId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const transaction = await Transaction.create({
      userId: decoded.userId,
      courseId,
      amount,
      paymentMethod: paymentMethod || "stripe",
      stripePaymentId,
      status: "completed",
    });

    return NextResponse.json({ success: true, data: transaction });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 500 }
    );
  }
}
