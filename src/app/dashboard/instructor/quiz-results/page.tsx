"use client";

import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  Timer,
  Search,
  Download,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  ArrowUpDown,
  BarChart3,
  LineChart as LineChartIcon,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface QuizResult {
  id: number;
  studentName: string;
  email: string;
  score: number;
  totalMarks: number;
  attempts: number;
  finishTime: string;
  status: 'Passed' | 'Failed';
  avatar: string;
  timeTaken?: string;
  percentage?: number;
}

export default function QuizResultsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [sortBy, setSortBy] = useState('recent');
  const [theme, setTheme] = useState("light");
  const [selectedStudent, setSelectedStudent] = useState<QuizResult | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState('results'); // results | analytics

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const interval = setInterval(() => {
      const currentTheme = localStorage.getItem("theme") || "light";
      if (currentTheme !== theme) {
        setTheme(currentTheme);
        document.documentElement.setAttribute('data-theme', currentTheme);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [theme]);

  const quizInfo = {
    title: "Information About UI/UX Design Degree",
    course: "UI/UX Design Fundamentals",
    questions: 25,
    duration: "30 Minutes",
    totalMarks: 100,
    passMarks: 60,
    thumbnail: "https://img.freepik.com/free-vector/gradient-ui-ux-background_23-2149052117.jpg"
  };

  const resultsData: QuizResult[] = [
    {
      id: 1,
      studentName: "Thompson Hicks",
      email: "thompson.h@email.com",
      score: 75,
      totalMarks: 100,
      attempts: 4,
      finishTime: "2025-08-22T09:00:00",
      status: "Passed",
      avatar: "https://i.pravatar.cc/150?u=11",
      timeTaken: "25 min"
    },
    {
      id: 2,
      studentName: "Jennifer Tovar",
      email: "jennifer.t@email.com",
      score: 50,
      totalMarks: 100,
      attempts: 3,
      finishTime: "2025-08-10T09:15:00",
      status: "Failed",
      avatar: "https://i.pravatar.cc/150?u=12",
      timeTaken: "30 min"
    },
    {
      id: 3,
      studentName: "James Schulte",
      email: "james.s@email.com",
      score: 85,
      totalMarks: 100,
      attempts: 2,
      finishTime: "2025-07-26T14:20:00",
      status: "Passed",
      avatar: "https://i.pravatar.cc/150?u=13",
      timeTaken: "22 min"
    },
    {
      id: 4,
      studentName: "Kristy Cardona",
      email: "kristy.c@email.com",
      score: 68,
      totalMarks: 100,
      attempts: 2,
      finishTime: "2025-07-12T11:40:00",
      status: "Passed",
      avatar: "https://i.pravatar.cc/150?u=14",
      timeTaken: "28 min"
    },
    {
      id: 5,
      studentName: "William Aragon",
      email: "william.a@email.com",
      score: 45,
      totalMarks: 100,
      attempts: 4,
      finishTime: "2025-07-02T16:30:00",
      status: "Failed",
      avatar: "https://i.pravatar.cc/150?u=15",
      timeTaken: "30 min"
    },
    {
      id: 6,
      studentName: "Shirley Lis",
      email: "shirley.l@email.com",
      score: 92,
      totalMarks: 100,
      attempts: 1,
      finishTime: "2025-06-25T08:10:00",
      status: "Passed",
      avatar: "https://i.pravatar.cc/150?u=16",
      timeTaken: "20 min"
    },
    {
      id: 7,
      studentName: "Robert Martinez",
      email: "robert.m@email.com",
      score: 78,
      totalMarks: 100,
      attempts: 3,
      finishTime: "2025-06-20T10:30:00",
      status: "Passed",
      avatar: "https://i.pravatar.cc/150?u=17",
      timeTaken: "26 min"
    },
    {
      id: 8,
      studentName: "Sarah Johnson",
      email: "sarah.j@email.com",
      score: 55,
      totalMarks: 100,
      attempts: 2,
      finishTime: "2025-06-15T15:45:00",
      status: "Failed",
      avatar: "https://i.pravatar.cc/150?u=18",
      timeTaken: "29 min"
    },
  ];

  // Analytics Data
  const analyticsData = [
    { day: 'Mon', attempts: 12, passed: 9, failed: 3 },
    { day: 'Tue', attempts: 15, passed: 12, failed: 3 },
    { day: 'Wed', attempts: 10, passed: 8, failed: 2 },
    { day: 'Thu', attempts: 18, passed: 15, failed: 3 },
    { day: 'Fri', attempts: 22, passed: 19, failed: 3 },
    { day: 'Sat', attempts: 8, passed: 7, failed: 1 },
    { day: 'Sun', attempts: 5, passed: 4, failed: 1 },
  ];

  const scoreDistribution = [
    { range: '90-100', students: 8, fill: '#00C48C' },
    { range: '80-89', students: 15, fill: '#0284C7' },
    { range: '70-79', students: 18, fill: '#F89B29' },
    { range: '60-69', students: 12, fill: '#EA580C' },
    { range: '<60', students: 7, fill: '#FF0F7B' },
  ];

  // Add percentage to results
  const resultsWithPercentage = resultsData.map(r => ({
    ...r,
    percentage: Math.round((r.score / r.totalMarks) * 100)
  }));

  // Filter results
  const filteredResults = resultsWithPercentage
    .filter(result => {
      const matchesSearch =
        result.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === 'All Status' ||
        result.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'highest':
          return b.score - a.score;
        case 'lowest':
          return a.score - b.score;
        case 'recent':
          return b.id - a.id;
        default:
          return 0;
      }
    });

  // Calculate stats
  const stats = {
    totalParticipants: resultsData.length,
    passed: resultsData.filter(r => r.status === 'Passed').length,
    failed: resultsData.filter(r => r.status === 'Failed').length,
    averageScore: Math.round(resultsData.reduce((sum, r) => sum + r.score, 0) / resultsData.length),
    passRate: ((resultsData.filter(r => r.status === 'Passed').length / resultsData.length) * 100).toFixed(1),
    highest: Math.max(...resultsData.map(r => r.score)),
    lowest: Math.min(...resultsData.map(r => r.score))
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (student: QuizResult) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Score', 'Percentage', 'Status', 'Attempts', 'Time Taken', 'Finish Time'];
    const data = filteredResults.map(r => [
      r.studentName,
      r.email,
      r.score,
      `${r.percentage}%`,
      r.status,
      r.attempts,
      r.timeTaken,
      formatDate(r.finishTime)
    ]);

    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-results.csv';
    a.click();
  };

  return (
    <div className="min-h-screen">

      {/* Quiz Info Card */}
      <div className="card bg-base-100 shadow-xl border border-base-300 mb-8">
        <div className="card-body p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Thumbnail */}
            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={quizInfo.thumbnail}
                alt={quizInfo.title}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
            {/* Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{quizInfo.title}</h1>
              <p className="text-sm opacity-60 mb-3">{quizInfo.course}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                <div className="flex items-center gap-2 opacity-70">
                  <span>📝</span>
                  <span>{quizInfo.questions} Questions</span>
                </div>
                <div className="flex items-center gap-2 opacity-70">
                  <span>🕒</span>
                  <span>{quizInfo.duration}</span>
                </div>
                <div className="flex items-center gap-2 opacity-70">
                  <span>📊</span>
                  <span>Pass: {quizInfo.passMarks}/{quizInfo.totalMarks}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div
          className="card bg-base-100 shadow-lg border"
          style={{ borderColor: theme === 'dark' ? '#2a1f35' : '#f3e8ff' }}
        >
          <div className="card-body p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">
                  Total Participants
                </p>
                <h2 className="text-3xl font-bold" style={{ color: '#832388' }}>
                  {stats.totalParticipants}
                </h2>
              </div>
              <Users className="w-6 h-6" style={{ color: '#832388' }} />
            </div>
          </div>
        </div>

        <div
          className="card bg-base-100 shadow-lg border"
          style={{ borderColor: theme === 'dark' ? '#0f2520' : '#d1fae5' }}
        >
          <div className="card-body p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">
                  Passed
                </p>
                <h2 className="text-3xl font-bold" style={{ color: '#00C48C' }}>
                  {stats.passed}
                </h2>
              </div>
              <CheckCircle className="w-6 h-6" style={{ color: '#00C48C' }} />
            </div>
          </div>
        </div>

        <div
          className="card bg-base-100 shadow-lg border"
          style={{ borderColor: theme === 'dark' ? '#2a1520' : '#fce7f3' }}
        >
          <div className="card-body p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">
                  Failed
                </p>
                <h2 className="text-3xl font-bold" style={{ color: '#FF0F7B' }}>
                  {stats.failed}
                </h2>
              </div>
              <XCircle className="w-6 h-6" style={{ color: '#FF0F7B' }} />
            </div>
          </div>
        </div>

        <div
          className="card bg-base-100 shadow-lg border"
          style={{ borderColor: theme === 'dark' ? '#2a1f15' : '#fef3c7' }}
        >
          <div className="card-body p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">
                  Average Score
                </p>
                <h2 className="text-3xl font-bold" style={{ color: '#F89B29' }}>
                  {stats.averageScore}%
                </h2>
              </div>
              <Award className="w-6 h-6" style={{ color: '#F89B29' }} />
            </div>
          </div>
        </div>

        <div
          className="card bg-base-100 shadow-lg border"
          style={{ borderColor: theme === 'dark' ? '#1a2a3a' : '#e0f2fe' }}
        >
          <div className="card-body p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">
                  Pass Rate
                </p>
                <h2 className="text-3xl font-bold" style={{ color: '#0284C7' }}>
                  {stats.passRate}%
                </h2>
              </div>
              <TrendingUp className="w-6 h-6" style={{ color: '#0284C7' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-8">
        <button
          className={`tab tab-bordered cursor-pointer ${activeTab === 'results' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          📊 Results
        </button>
        <button
          className={`tab tab-bordered cursor-pointer ${activeTab === 'analytics' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {/* RESULTS TAB */}
      {activeTab === 'results' && (
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body p-6 md:p-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <h2 className="text-xl font-bold">Student Results</h2>
              <button
                className="btn btn-sm gap-2 cursor-pointer"
                style={{ backgroundColor: '#832388', color: 'white', border: 'none' }}
                onClick={handleExportCSV}
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={18} />
                <input
                  type="text"
                  placeholder="Search by student name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input input-bordered w-full pl-11 bg-base-100"
                />
              </div>

              {/* Status Filter */}
              <select
                className="select select-bordered bg-base-100 cursor-pointer min-w-[180px]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option>All Status</option>
                <option>Passed</option>
                <option>Failed</option>
              </select>

              {/* Sort */}
              <select
                className="select select-bordered bg-base-100 cursor-pointer min-w-[180px]"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Recent</option>
                <option value="highest">Highest Score</option>
                <option value="lowest">Lowest Score</option>
              </select>
            </div>

            {/* Table */}
            {filteredResults.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-2">No Results Found</h3>
                <p className="opacity-60 mb-6">Try adjusting your search or filters</p>
                <button
                  className="btn gap-2 cursor-pointer"
                  style={{ backgroundColor: '#832388', color: 'white', border: 'none' }}
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('All Status');
                    setSortBy('recent');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="text-xs font-bold uppercase tracking-wider opacity-60">Student</th>
                      <th className="text-center text-xs font-bold uppercase tracking-wider opacity-60">Score</th>
                      <th className="text-center text-xs font-bold uppercase tracking-wider opacity-60">Percentage</th>
                      <th className="text-center text-xs font-bold uppercase tracking-wider opacity-60">Attempts</th>
                      <th className="text-center text-xs font-bold uppercase tracking-wider opacity-60">Time Taken</th>
                      <th className="text-center text-xs font-bold uppercase tracking-wider opacity-60">Status</th>
                      <th className="text-center text-xs font-bold uppercase tracking-wider opacity-60">Finish Time</th>
                      <th className="text-right text-xs font-bold uppercase tracking-wider opacity-60">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result) => (
                      <tr key={result.id} className="hover">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-full">
                                <img src={result.avatar} alt={result.studentName} />
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-bold hover:text-[#832388] transition-colors cursor-pointer">
                                {result.studentName}
                              </h4>
                              <p className="text-xs opacity-60">{result.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="text-sm font-bold">
                            {result.score}/{result.totalMarks}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <TrendingUp size={14} className="opacity-60" />
                            <span className="text-sm font-bold" style={{
                              color: result.percentage! >= 60 ? '#00C48C' : '#FF0F7B'
                            }}>
                              {result.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="text-sm font-semibold opacity-70">
                            {result.attempts}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Timer size={14} className="opacity-60" />
                            <span className="text-sm font-semibold opacity-70">
                              {result.timeTaken}
                            </span>
                          </div>
                        </td>
                        <td className="text-center">
                          {result.status === 'Passed' ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
                              style={{
                                backgroundColor: theme === 'dark' ? '#0f2520' : '#d1fae5',
                                color: '#00C48C'
                              }}
                            >
                              <CheckCircle size={12} />
                              Passed
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
                              style={{
                                backgroundColor: theme === 'dark' ? '#2a1520' : '#fce7f3',
                                color: '#FF0F7B'
                              }}
                            >
                              <XCircle size={12} />
                              Failed
                            </div>
                          )}
                        </td>
                        <td className="text-center">
                          <span className="text-xs opacity-60 font-semibold">
                            {formatDate(result.finishTime)}
                          </span>
                        </td>
                        <td>
                          <div className="flex justify-end">
                            <button
                              className="btn btn-ghost btn-sm cursor-pointer"
                              title="View Details"
                              onClick={() => handleViewDetails(result)}
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {filteredResults.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-base-300">
                <p className="text-sm opacity-60">
                  Showing {filteredResults.length} of {resultsData.length} results
                </p>
                <div className="join">
                  <button className="join-item btn btn-sm cursor-pointer">«</button>
                  <button className="join-item btn btn-sm btn-active cursor-pointer">1</button>
                  <button className="join-item btn btn-sm cursor-pointer">2</button>
                  <button className="join-item btn btn-sm cursor-pointer">»</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attempts vs Results */}
            <div className="card bg-base-100 shadow-xl border border-base-300 lg:col-span-2">
              <div className="card-body p-6">
                <h2 className="text-lg font-bold mb-4">Weekly Performance Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="passed" fill="#00C48C" name="Passed" />
                    <Bar dataKey="failed" fill="#FF0F7B" name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Score Distribution */}
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <div className="card-body p-6">
                <h2 className="text-lg font-bold mb-4">Score Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={scoreDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.range}: ${entry.students}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="students"
                    >
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Summary & Insights */}
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body p-6">
              <h2 className="text-lg font-bold mb-4">Quick Summary & Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-bold mb-3 text-green-600">✓ Strengths</h3>
                  <ul className="text-sm space-y-2 opacity-70">
                    <li>• High pass rate ({stats.passRate}%)</li>
                    <li>• Consistent student engagement</li>
                    <li>• {stats.passed} students passed successfully</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-orange-600">⚠️ Areas to Improve</h3>
                  <ul className="text-sm space-y-2 opacity-70">
                    <li>• {stats.failed} students need support</li>
                    <li>• Score range: {stats.lowest}% to {stats.highest}%</li>
                    <li>• Average score: {stats.averageScore}%</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold mb-3 text-blue-600">💡 Recommendations</h3>
                  <ul className="text-sm space-y-2 opacity-70">
                    <li>• Provide extra support for low scorers</li>
                    <li>• Review difficult topics in class</li>
                    <li>• Schedule review sessions for failed students</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedStudent && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-base-300">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.studentName}
                className="w-16 h-16 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg">{selectedStudent.studentName}</h3>
                <p className="text-sm opacity-60">{selectedStudent.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs font-bold uppercase opacity-60 mb-1">Score</p>
                <p className="text-2xl font-bold" style={{ color: '#832388' }}>
                  {selectedStudent.score}/100
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase opacity-60 mb-1">Percentage</p>
                <p className="text-2xl font-bold" style={{ color: '#F89B29' }}>
                  {selectedStudent.percentage}%
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase opacity-60 mb-1">Attempts</p>
                <p className="text-2xl font-bold">{selectedStudent.attempts}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase opacity-60 mb-1">Time Taken</p>
                <p className="text-2xl font-bold">{selectedStudent.timeTaken}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase opacity-60 mb-1">Status</p>
                <p
                  className="text-xl font-bold"
                  style={{ color: selectedStudent.status === 'Passed' ? '#00C48C' : '#FF0F7B' }}
                >
                  {selectedStudent.status}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase opacity-60 mb-1">Finish Time</p>
                <p className="text-sm">{formatDate(selectedStudent.finishTime)}</p>
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost cursor-pointer"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </button>
              <button
                className="btn text-white border-0 cursor-pointer"
                style={{ backgroundColor: '#832388' }}
              >
                Download Report
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}></div>
        </div>
      )}
    </div>
  );
}