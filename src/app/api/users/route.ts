import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import User from "@/models/User";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const role = req.nextUrl.searchParams.get("role");
        const countOnly = req.nextUrl.searchParams.get("countOnly");

        if (countOnly === "true") {
            const count = await User.countDocuments(role ? { role } : {});
            return NextResponse.json({ count });
        }

        const users = await User.find(role ? { role } : {}).select("-password");
        return NextResponse.json({ users });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}