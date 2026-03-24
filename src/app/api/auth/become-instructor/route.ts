// src/app/api/auth/become-instructor/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, email, phone, password, provider = "credentials" } = body;

    // ✅ Validation
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CASE 1: User already exists
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (existingUser) {
      // Check if already an instructor
      if (existingUser.role === "instructor") {
        return NextResponse.json(
          { error: "আপনি ইতিমধ্যে instructor হিসেবে registered আছেন!" },
          { status: 400 }
        );
      }

      // Check if admin (admins can't become instructors)
      if (existingUser.role === "admin") {
        return NextResponse.json(
          { error: "Admin account কে instructor করা যাবে না!" },
          { status: 400 }
        );
      }

      // ✅ Update student → instructor
      existingUser.role = "instructor";
      
      // Update other fields if provided
      if (name?.trim()) existingUser.name = name.trim();
      if (phone?.trim()) existingUser.phone = phone.trim();
      
      await existingUser.save();

      // Generate new token with updated role
      const token = jwt.sign(
        { 
          userId: existingUser._id, 
          email: existingUser.email, 
          role: "instructor" 
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return NextResponse.json({
        success: true,
        message: "🎉 আপনি এখন instructor!",
        user: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          photoURL: existingUser.photoURL,
          role: existingUser.role,
          provider: existingUser.provider,
        },
        token,
        requireOtp: false, // No OTP needed for existing users
      }, { status: 200 });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CASE 2: New user - Create as instructor
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Social login (Google/GitHub) - No password required
    if (provider === "google" || provider === "github") {
      const newUser = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        photoURL: body.photoURL || "",
        role: "instructor",
        provider,
      });

      const token = jwt.sign(
        { userId: newUser._id, email: newUser.email, role: "instructor" },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return NextResponse.json({
        success: true,
        message: "🎉 Instructor account created!",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          photoURL: newUser.photoURL,
          role: newUser.role,
          provider: newUser.provider,
        },
        token,
        requireOtp: false,
      }, { status: 201 });
    }

    // Email/Password registration - Password required
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      password: hashedPassword,
      role: "instructor",
      provider: "credentials",
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful! Please verify your email.",
      requireOtp: true, // OTP verification needed for email/password
      email: newUser.email,
    }, { status: 201 });

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "এই email দিয়ে আগেই account আছে" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}