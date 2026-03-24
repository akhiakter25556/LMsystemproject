import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/connect';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get userId from token (consistent with dashboard route)
    const token =
      request.cookies.get("token")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      userId = decoded.userId;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get enrollments with course details
    const enrollments = await Enrollment.find({ studentId: userId })
      .populate('courseId', 'title description thumbnail pricing instructor enrolledCount')
      .lean();

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        success: true,
        enrollments: [],
      });
    }

    // Format response
    const myClasses = enrollments.map((enrollment: any) => ({
      _id: enrollment._id,
      courseId: enrollment.courseId?._id,
      title: enrollment.courseId?.title || 'Unknown Course',
      description: enrollment.courseId?.description,
      thumbnail: enrollment.courseId?.thumbnail,
      status: enrollment.status || 'in-progress',
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      progress: enrollment.progress || 0,
      instructor: enrollment.courseId?.instructor,
    }));

    return NextResponse.json({
      success: true,
      enrollments: myClasses,
      count: myClasses.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}