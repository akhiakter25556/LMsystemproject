"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Users, BookOpen, CheckCircle, GraduationCap, Layers, DollarSign, RefreshCw, AlertCircle, Loader } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ============================================
// INTERFACES & CONSTANTS
// ============================================

interface DashData {
  totalStudents: number;
  totalCourses: number;
  completionRate: number;
  totalEarnings: number;
  totalLessons: number;
  publishedCourses: number;
  recentStudents: { name: string; photoURL?: string; courseName: string; enrolledAt: string }[];
  activeCourses: { _id: string; title: string; enrolledCount: number; pricing: any; status: string }[];
  monthlyChart: { name: string; v: number }[];
}

interface Student {
  _id: string;
  studentData?: {
    name: string;
    email: string;
    photoURL?: string;
  };
  courseName?: string;
  enrolledAt?: string;
  status?: string;
  completedAt?: string;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const COLORS: Record<string, string> = {
  purple: '#6710C2',
  pink: '#FF0F7B',
  green: '#00C48C',
  indigo: '#6366F1',
  cyan: '#0EA5E9',
  orange: '#F89B29',
};

// ============================================
// DASHBOARD - STAT CARD COMPONENT
// ============================================
function StatCard({
  icon,
  label,
  value,
  color,
  trend,
  loading,
}: {
  icon: React.ReactElement;
  label: string;
  value: string;
  color: string;
  trend: string;
  loading?: boolean;
}) {
  const c = COLORS[color];
  return (
    <div className="bg-base-100 border border-base-300 p-5 rounded-2xl hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden">
      <div
        className="absolute -top-4 -right-4 w-14 h-14 rounded-full opacity-10"
        style={{ backgroundColor: c }}
      />
      <div className="flex justify-between items-center mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: c + '18', color: c }}
        >
          {React.cloneElement(icon, { size: 17 } as any)}
        </div>
        <span
          className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${
            trend.startsWith('+')
              ? 'bg-success/10 text-success'
              : 'bg-base-200 opacity-50'
          }`}
        >
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-black opacity-30 uppercase tracking-widest">
        {label}
      </p>
      <h4 className="text-xl font-black mt-0.5" style={{ color: c }}>
        {loading ? (
          <span className="loading loading-spinner loading-sm" style={{ color: c }} />
        ) : (
          value
        )}
      </h4>
    </div>
  );
}

// ============================================
// DASHBOARD PAGE COMPONENT
// ============================================
function InstructorDashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartYear, setChartYear] = useState(new Date().getFullYear());

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      let instructorId = '';
      try {
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        instructorId = u?._id || u?.id || '';
      } catch {}

      // FETCH COURSES
      const cRes = await fetch('/api/courses?mine=true&limit=200', {
        credentials: 'include',
        headers,
      });
      const cData = await cRes.json();
      const courses: any[] = cData.courses || [];

      const totalLessons = courses.reduce(
        (sum: number, c: any) =>
          sum +
          (c.modules?.reduce(
            (s: number, m: any) => s + (m.lessons?.length || 0),
            0
          ) || 0),
        0
      );
      const publishedCourses = courses.filter(
        (c: any) => c.status === 'published'
      ).length;

      // FETCH ENROLLMENTS
      const eUrl = instructorId
        ? `/api/enrollments?instructorId=${instructorId}&populate=student&limit=500`
        : `/api/enrollments?mine=true&populate=student&limit=500`;

      const eRes = await fetch(eUrl, {
        credentials: 'include',
        headers,
      });
      const eData = await eRes.json();
      const enrollments: any[] = eData.enrollments || [];

      // CALCULATE STATS
      const totalStudents = new Set(
        enrollments.map((e: any) => e.studentId?.toString())
      ).size;

      const completed = enrollments.filter(
        (e: any) => e.status === 'completed'
      ).length;
      const completionRate =
        enrollments.length > 0
          ? Math.round((completed / enrollments.length) * 100)
          : 0;

      const courseMap = new Map(
        courses.map((c: any) => [c._id.toString(), c])
      );
      const totalEarnings = enrollments.reduce((sum: number, e: any) => {
        const course = courseMap.get(e.courseId?.toString() || '');
        if (!course) return sum;
        return (
          sum +
          (course.pricing?.type === 'free'
            ? 0
            : course.pricing?.discountPrice || course.pricing?.price || 0)
        );
      }, 0);

      // RECENT STUDENTS
      const recentStudents = [...enrollments]
        .sort(
          (a: any, b: any) =>
            new Date(b.enrolledAt).getTime() -
            new Date(a.enrolledAt).getTime()
        )
        .slice(0, 5)
        .map((e: any) => {
          const student = e.studentData || {};
          const course = courseMap.get(e.courseId?.toString() || '');
          return {
            name: student.name || 'Unknown',
            photoURL: student.photoURL || '',
            courseName: course?.title || e.courseName || 'Unknown Course',
            enrolledAt: e.enrolledAt,
          };
        });

      // ACTIVE COURSES
      const activeCourses = [...courses]
        .sort(
          (a: any, b: any) => (b.enrolledCount || 0) - (a.enrolledCount || 0)
        )
        .slice(0, 5)
        .map((c: any) => ({
          _id: c._id,
          title: c.title,
          enrolledCount: c.enrolledCount || 0,
          pricing: c.pricing,
          status: c.status,
        }));

      // MONTHLY CHART
      const monthlyMap = new Map<number, number>();
      for (let i = 0; i < 12; i++) monthlyMap.set(i, 0);

      for (const e of enrollments) {
        const d = new Date(e.enrolledAt);
        if (d.getFullYear() !== chartYear) continue;
        const month = d.getMonth();
        const course = courseMap.get(e.courseId?.toString() || '');
        const price =
          course?.pricing?.type === 'free'
            ? 0
            : course?.pricing?.discountPrice || course?.pricing?.price || 0;
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + price);
      }

      const monthlyChart = Array.from(monthlyMap.entries()).map(
        ([month, v]) => ({
          name: MONTH_NAMES[month],
          v,
        })
      );

      setData({
        totalStudents,
        totalCourses: courses.length,
        completionRate,
        totalEarnings,
        totalLessons,
        publishedCourses,
        recentStudents,
        activeCourses,
        monthlyChart,
      });
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [chartYear]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const fmtPrice = (pricing: any) => {
    if (!pricing || pricing.type === 'free') return 'Free';
    const p = pricing.discountPrice || pricing.price || 0;
    return `$${p}`;
  };

  const stats = [
    {
      icon: <GraduationCap />,
      label: 'Students',
      value: data ? data.totalStudents.toLocaleString() : '0',
      color: 'purple',
      trend: '+12%',
    },
    {
      icon: <BookOpen />,
      label: 'Courses',
      value: data ? data.totalCourses.toString() : '0',
      color: 'pink',
      trend: `${data?.publishedCourses || 0} Live`,
    },
    {
      icon: <CheckCircle />,
      label: 'Completion',
      value: data ? `${data.completionRate}%` : '0%',
      color: 'green',
      trend: '+5%',
    },
    {
      icon: <Users />,
      label: 'Followers',
      value: '—',
      color: 'indigo',
      trend: 'N/A',
    },
    {
      icon: <Layers />,
      label: 'Lessons',
      value: data ? data.totalLessons.toString() : '0',
      color: 'cyan',
      trend: 'Total',
    },
    {
      icon: <DollarSign />,
      label: 'Earnings',
      value: data ? `$${data.totalEarnings.toLocaleString()}` : '$0',
      color: 'orange',
      trend: 'All time',
    },
  ];

  return (
    <div className="min-h-screen space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-0.5">
            Instructor Panel
          </p>
          <h1 className="text-xl font-black">Dashboard</h1>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="btn btn-sm btn-ghost gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span className="text-xs">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 bg-base-100 border border-base-300 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="font-black text-sm">Revenue Analytics</p>
              <p className="text-xs opacity-40 mt-0.5">
                Monthly income ({chartYear})
              </p>
            </div>
            <select
              className="select select-xs bg-base-200 border-base-300 rounded-lg font-bold focus:outline-none cursor-pointer"
              value={chartYear}
              onChange={(e) => setChartYear(Number(e.target.value))}
            >
              {[2026, 2025, 2024].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-[220px]">
              <span
                className="loading loading-spinner loading-lg"
                style={{ color: '#6710C2' }}
              />
            </div>
          ) : (
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.monthlyChart || []} barSize={18}>
                  <defs>
                    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6710C2" />
                      <stop offset="100%" stopColor="#FF0F7B" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="oklch(var(--b3))"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'oklch(var(--bc) / 0.4)' }}
                    dy={6}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: 'oklch(var(--bc) / 0.4)' }}
                    tickFormatter={(v) =>
                      v >= 1000 ? `$${v / 1000}k` : `$${v}`
                    }
                  />
                  <Tooltip
                    cursor={{ fill: 'oklch(var(--b2))' }}
                    contentStyle={{
                      borderRadius: 12,
                      border: 'none',
                      backgroundColor: 'oklch(var(--b1))',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      fontSize: 12,
                    }}
                    formatter={(value: any) => [`$${value || 0}`, 'Earnings']}
                  />
                  <Bar dataKey="v" fill="url(#bg)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-base-100 border border-base-300 rounded-2xl p-5">
          <p className="font-black text-sm mb-4">Recent Enrolled</p>
          {loading ? (
            <div className="flex justify-center py-8">
              <span
                className="loading loading-spinner loading-md"
                style={{ color: '#6710C2' }}
              />
            </div>
          ) : !data || data.recentStudents.length === 0 ? (
            <div className="text-center py-8 opacity-40 text-sm">
              No enrollments yet
            </div>
          ) : (
            <div className="space-y-0">
              {data.recentStudents.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 border-b border-base-300 last:border-0"
                >
                  {s.photoURL ? (
                    <img
                      src={s.photoURL}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                      alt=""
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                      style={{
                        background:
                          'linear-gradient(135deg,#6710C2,#FF0F7B)',
                      }}
                    >
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold leading-none truncate">
                      {s.name}
                    </p>
                    <p className="text-xs opacity-40 mt-0.5 truncate">
                      {s.courseName}
                    </p>
                  </div>
                  <span className="text-[10px] opacity-30 font-bold whitespace-nowrap">
                    {timeAgo(s.enrolledAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
          <button className="w-full mt-3 py-2 rounded-xl border-2 border-dashed border-base-300 text-xs font-black opacity-40 hover:opacity-70 hover:border-[#6710C2] hover:text-[#6710C2] transition-all cursor-pointer">
            View All
          </button>
        </div>
      </div>

      <div className="bg-base-100 border border-base-300 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-base-300 flex justify-between items-center">
          <div>
            <p className="font-black text-sm">Active Courses</p>
            <p className="text-xs opacity-40 mt-0.5">By enrollment count</p>
          </div>
          <button
            className="text-xs font-black px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-70"
            style={{
              color: '#6710C2',
              backgroundColor: '#6710C215',
            }}
          >
            Manage All
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <span
              className="loading loading-spinner loading-lg"
              style={{ color: '#6710C2' }}
            />
          </div>
        ) : !data || data.activeCourses.length === 0 ? (
          <div className="text-center py-10 opacity-40 text-sm">
            No courses yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-base-200/60">
                  {['Course', 'Enrolled', 'Price', 'Status'].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={`px-6 py-3 text-[10px] font-black opacity-40 uppercase tracking-widest ${
                          i > 0 ? 'text-center' : ''
                        } ${i === 3 ? 'text-right' : ''}`}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {data.activeCourses.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t border-base-300 hover:bg-base-200/40 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-bold max-w-[220px] truncate">
                      {c.title}
                    </td>
                    <td className="px-6 py-4 text-center text-sm opacity-50 font-semibold">
                      {c.enrolledCount}
                    </td>
                    <td
                      className="px-6 py-4 text-center text-sm font-black"
                      style={{ color: '#00C48C' }}
                    >
                      {fmtPrice(c.pricing)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          c.status === 'published'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {c.status === 'published' ? 'Live' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// STUDENTS PAGE COMPONENT
// ============================================
function InstructorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const instructorId = user?.id || user?._id;

      if (!instructorId) {
        setError('Instructor ID not found. Please login again.');
        setLoading(false);
        return;
      }

      console.log('📡 Fetching students for instructor:', instructorId);

      const url = `/api/enrollments?instructorId=${instructorId}&populate=student&limit=500`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      console.log('📨 API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `API Error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.enrollments)) {
        console.log('✅ Students loaded:', data.enrollments.length);
        setStudents(data.enrollments);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('❌ Fetch error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-bold text-red-800">Error Loading Students</h2>
          </div>
          <p className="text-red-700 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={fetchStudents}
            className="w-full px-4 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20H9m6 0h6v-2a9 9 0 00-18 0v2h6z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Students Yet</h3>
          <p className="text-gray-600 mb-6">When students enroll in your courses, they will appear here.</p>
          <button
            onClick={fetchStudents}
            className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Students</h1>
            <p className="text-gray-600 mt-1">
              {students.length} student{students.length !== 1 ? 's' : ''} enrolled
            </p>
          </div>
          <button
            onClick={fetchStudents}
            className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div
              key={student._id}
              className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                {student.studentData?.photoURL ? (
                  <img
                    src={student.studentData.photoURL}
                    alt={student.studentData.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #6710C2, #FF0F7B)',
                    }}
                  >
                    {(student.studentData?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">
                    {student.studentData?.name || 'Unknown Student'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {student.studentData?.email || 'No email'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                    Course
                  </p>
                  <p className="text-sm font-semibold text-gray-800 mt-1">
                    {student.courseName || 'Unknown Course'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      Status
                    </p>
                    <div className="mt-1">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                          student.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : student.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {student.status || 'pending'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                      Enrolled
                    </p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">
                      {student.enrolledAt
                        ? new Date(student.enrolledAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full px-4 py-2 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition-colors text-sm">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// EXPORTS
// ============================================
export default InstructorDashboard;