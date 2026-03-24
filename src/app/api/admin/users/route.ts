import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import User from "@/models/User";
import { requireRole } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await connectDB();
    
    // ✅ Standardized auth check
    const user = requireRole(req as any, ["admin"]);
    
    const users = await User.find()
      .select("-password -resetToken -resetTokenExpiry")
      .sort({ createdAt: -1 });
      
    return NextResponse.json({ 
      success: true,
      total: users.length, 
      users 
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
