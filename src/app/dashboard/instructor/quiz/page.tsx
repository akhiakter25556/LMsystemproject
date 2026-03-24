"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  MessageSquare,
  Clock,
  Eye,
  Award,
  CheckCircle,
  Search,
  MoreVertical,
  Copy,
  Settings
} from 'lucide-react';

interface Quiz {
  id: number;
  title: string;
  course: string;
  questions: number;
  duration: string;
  totalMarks: number;
  passMarks: number;
  status: 'Published' | 'Draft';
  attempts?: number;
  description?: string;
  createdDate?: string;
}

export default function InstructorQuizPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [theme, setTheme] = useState("light");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    course: '',
    title: '',
    description: '',
    questions: '',
    totalMarks: '',
    passMarks: '',
    duration: '00:30'
  });

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

  // Initialize quizzes
  useEffect(() => {
    const initialQuizzes: Quiz[] = [
      {
        id: 1,
        title: "Information About UI/UX Design Degree",
        course: "UI/UX Design Fundamentals",
        questions: 25,
        duration: "30 Minutes",
        totalMarks: 100,
        passMarks: 60,
        status: "Published",
        attempts: 45,
        description: "Comprehensive UI/UX design assessment",
        createdDate: "2025-08-20"
      },
      {
        id: 2,
        title: "Learn JavaScript and Express to become a Expert",
        course: "JavaScript Development",
        questions: 15,
        duration: "25 Minutes",
        totalMarks: 75,
        passMarks: 45,
        status: "Published",
        attempts: 32,
        description: "JavaScript and Express fundamentals",
        createdDate: "2025-08-18"
      },
      {
        id: 3,
        title: "Introduction to Python Programming",
        course: "Python Basics",
        questions: 22,
        duration: "15 Minutes",
        totalMarks: 50,
        passMarks: 30,
        status: "Draft",
        attempts: 0,
        description: "Basic Python programming concepts",
        createdDate: "2025-08-15"
      },
      {
        id: 4,
        title: "Build Responsive Websites with HTML5 and CSS3",
        course: "Web Development",
        questions: 30,
        duration: "50 Minutes",
        totalMarks: 150,
        passMarks: 90,
        status: "Published",
        attempts: 68,
        description: "Responsive web design with HTML5 and CSS3",
        createdDate: "2025-08-10"
      },
      {
        id: 5,
        title: "Information About Photoshop Design Degree",
        course: "Graphic Design",
        questions: 20,
        duration: "20 Minutes",
        totalMarks: 80,
        passMarks: 48,
        status: "Published",
        attempts: 28,
        description: "Photoshop design fundamentals",
        createdDate: "2025-08-05"
      },
    ];
    setQuizzes(initialQuizzes);
  }, []);

  // Filter quizzes
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'All Status' ||
      quiz.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Count stats
  const stats = {
    total: quizzes.length,
    published: quizzes.filter(q => q.status === 'Published').length,
    draft: quizzes.filter(q => q.status === 'Draft').length,
    totalAttempts: quizzes.reduce((sum, q) => sum + (q.attempts || 0), 0),
  };

  // Handle Delete
  const handleDelete = (id: number) => {
    setQuizzes(quizzes.filter(q => q.id !== id));
    setShowDeleteConfirm(null);
    alert('Quiz deleted successfully!');
  };

  // Handle Edit
  const handleEdit = (quiz: Quiz) => {
    setFormData({
      course: quiz.course,
      title: quiz.title,
      description: quiz.description || '',
      questions: quiz.questions.toString(),
      totalMarks: quiz.totalMarks.toString(),
      passMarks: quiz.passMarks.toString(),
      duration: quiz.duration.replace(' Minutes', ':00').padStart(5, '0')
    });
    setEditingId(quiz.id);
    setShowCreateModal(true);
  };

  // Handle Duplicate
  const handleDuplicate = (quiz: Quiz) => {
    const newQuiz: Quiz = {
      ...quiz,
      id: Math.max(...quizzes.map(q => q.id), 0) + 1,
      title: `${quiz.title} (Copy)`,
      status: 'Draft',
      attempts: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };
    setQuizzes([...quizzes, newQuiz]);
    alert('Quiz duplicated successfully!');
  };

  // Handle Submit
  const handleSubmit = () => {
    if (!formData.title || !formData.course || !formData.questions) {
      alert('Please fill all required fields');
      return;
    }

    if (editingId) {
      // Update existing quiz
      setQuizzes(quizzes.map(q => 
        q.id === editingId 
          ? {
              ...q,
              title: formData.title,
              course: formData.course,
              description: formData.description,
              questions: parseInt(formData.questions),
              totalMarks: parseInt(formData.totalMarks),
              passMarks: parseInt(formData.passMarks),
              duration: `${parseInt(formData.duration.split(':')[0])} Minutes`
            }
          : q
      ));
      alert('Quiz updated successfully!');
    } else {
      // Create new quiz
      const newQuiz: Quiz = {
        id: Math.max(...quizzes.map(q => q.id), 0) + 1,
        title: formData.title,
        course: formData.course,
        description: formData.description,
        questions: parseInt(formData.questions),
        totalMarks: parseInt(formData.totalMarks),
        passMarks: parseInt(formData.passMarks),
        duration: `${parseInt(formData.duration.split(':')[0])} Minutes`,
        status: 'Draft',
        attempts: 0,
        createdDate: new Date().toISOString().split('T')[0]
      };
      setQuizzes([...quizzes, newQuiz]);
      alert('Quiz created successfully!');
    }

    resetForm();
    setShowCreateModal(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      course: '',
      title: '',
      description: '',
      questions: '',
      totalMarks: '',
      passMarks: '',
      duration: '00:30'
    });
    setEditingId(null);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowCreateModal(false);
    resetForm();
  };

  return (
    <div className="min-h-screen">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div
          className="card bg-base-100 shadow-lg border"
          style={{ borderColor: theme === 'dark' ? '#2a1f35' : '#f3e8ff' }}
        >
          <div className="card-body p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">
                  Total Quizzes
                </p>
                <h2 className="text-3xl font-bold" style={{ color: '#832388' }}>
                  {stats.total}
                </h2>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: theme === 'dark' ? '#2a1f35' : '#f3e8ff' }}
              >
                <MessageSquare className="w-6 h-6" style={{ color: '#832388' }} />
              </div>
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
                  Published
                </p>
                <h2 className="text-3xl font-bold" style={{ color: '#00C48C' }}>
                  {stats.published}
                </h2>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: theme === 'dark' ? '#0f2520' : '#d1fae5' }}
              >
                <CheckCircle className="w-6 h-6" style={{ color: '#00C48C' }} />
              </div>
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
                  Drafts
                </p>
                <h2 className="text-3xl font-bold" style={{ color: '#F89B29' }}>
                  {stats.draft}
                </h2>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: theme === 'dark' ? '#2a1f15' : '#fef3c7' }}
              >
                <Edit2 className="w-6 h-6" style={{ color: '#F89B29' }} />
              </div>
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
                  Total Attempts
                </p>
                <h2 className="text-3xl font-bold" style={{ color: '#FF0F7B' }}>
                  {stats.totalAttempts}
                </h2>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: theme === 'dark' ? '#2a1520' : '#fce7f3' }}
              >
                <Award className="w-6 h-6" style={{ color: '#FF0F7B' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body p-6 md:p-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="text-2xl font-bold">Quiz Management</h1>
            <button
              className="btn gap-2 text-white border-0 cursor-pointer hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #832388, #E3436B, #F89B29)' }}
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
            >
              <Plus size={20} />
              Add Quiz
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={18} />
              <input
                type="text"
                placeholder="Search quizzes or courses..."
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
              <option>Published</option>
              <option>Draft</option>
            </select>
          </div>

          {/* Table */}
          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">No Quizzes Found</h3>
              <p className="opacity-60 mb-6">Try adjusting your search or filters</p>
              <button
                className="btn gap-2 cursor-pointer"
                style={{ backgroundColor: '#832388', color: 'white', border: 'none' }}
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('All Status');
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
                    <th className="text-xs font-bold uppercase tracking-wider opacity-60">Quiz Details</th>
                    <th className="text-center text-xs font-bold uppercase tracking-wider opacity-60">Questions</th>
                    <th className="text-center text-xs font-bold uppercase tracking-wider opacity-60">Duration</th>
                    <th className="text-center text-xs font-bold uppercase tracking-wider opacity-60">Marks</th>
                    <th className="text-center text-xs font-bold uppercase tracking-wider opacity-60">Attempts</th>
                    <th className="text-center text-xs font-bold uppercase tracking-wider opacity-60">Status</th>
                    <th className="text-right text-xs font-bold uppercase tracking-wider opacity-60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map((quiz) => (
                    <tr key={quiz.id} className="hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: theme === 'dark' ? '#2a1f35' : '#f3e8ff'
                            }}
                          >
                            <MessageSquare className="w-6 h-6" style={{ color: '#832388' }} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold mb-1 hover:text-[#832388] transition-colors cursor-pointer">
                              {quiz.title}
                            </h4>
                            <p className="text-xs opacity-60">
                              {quiz.course}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MessageSquare size={14} className="opacity-60" />
                          <span className="text-sm font-bold">{quiz.questions}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock size={14} className="opacity-60" />
                          <span className="text-sm font-semibold">{quiz.duration}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="text-sm">
                          <span className="font-bold">{quiz.totalMarks}</span>
                          <span className="opacity-60"> / </span>
                          <span className="text-xs opacity-60">Pass: {quiz.passMarks}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="text-sm font-bold" style={{ color: '#FF0F7B' }}>
                          {quiz.attempts || 0}
                        </span>
                      </td>
                      <td className="text-center">
                        {quiz.status === 'Published' ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
                            style={{
                              backgroundColor: theme === 'dark' ? '#0f2520' : '#d1fae5',
                              color: '#00C48C'
                            }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00C48C' }}></span>
                            Published
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
                            style={{
                              backgroundColor: theme === 'dark' ? '#2a1f15' : '#fef3c7',
                              color: '#F89B29'
                            }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#F89B29' }}></span>
                            Draft
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="flex justify-end gap-2">
                          <Link
                            href="/dashboard/instructor/quiz-results"
                            className="btn btn-ghost btn-sm cursor-pointer"
                            title="View Results"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            className="btn btn-ghost btn-sm cursor-pointer"
                            title="Edit"
                            onClick={() => handleEdit(quiz)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <div className="dropdown dropdown-end">
                            <button className="btn btn-ghost btn-sm cursor-pointer">
                              <MoreVertical size={16} />
                            </button>
                            <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                              <li><a onClick={() => handleDuplicate(quiz)}>
                                <Copy size={16} /> Duplicate
                              </a></li>
                              <li><a onClick={() => setShowDeleteConfirm(quiz.id)}>
                                <Trash2 size={16} /> Delete
                              </a></li>
                              <li><a>
                                <Settings size={16} /> Settings
                              </a></li>
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {filteredQuizzes.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-base-300">
              <p className="text-sm opacity-60">
                Showing {filteredQuizzes.length} of {quizzes.length} quizzes
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

      {/* Create/Edit Quiz Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-6">{editingId ? 'Edit Quiz' : 'Add New Quiz'}</h3>

            <div className="space-y-4">
              {/* Course Selection */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Course <span className="text-error">*</span>
                  </span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                >
                  <option value="">Select Course</option>
                  <option>UI/UX Design Fundamentals</option>
                  <option>JavaScript Development</option>
                  <option>Python Basics</option>
                  <option>Web Development</option>
                  <option>Graphic Design</option>
                </select>
              </div>

              {/* Quiz Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Quiz Title <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Enter quiz title"
                  className="input input-bordered"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Description</span>
                </label>
                <textarea
                  placeholder="Enter quiz description"
                  className="textarea textarea-bordered"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Questions & Total Marks */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      No of Questions <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="25"
                    className="input input-bordered"
                    value={formData.questions}
                    onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Total Marks <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="100"
                    className="input input-bordered"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                  />
                </div>
              </div>

              {/* Pass Marks & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Pass Mark <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="60"
                    className="input input-bordered"
                    value={formData.passMarks}
                    onChange={(e) => setFormData({ ...formData, passMarks: e.target.value })}
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">
                      Duration (Minutes) <span className="text-error">*</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    placeholder="30"
                    className="input input-bordered"
                    value={formData.duration.split(':')[0]}
                    onChange={(e) => setFormData({ ...formData, duration: `${e.target.value}:00` })}
                  />
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn btn-ghost cursor-pointer"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className="btn text-white border-0 cursor-pointer"
                style={{ backgroundColor: '#832388' }}
                onClick={handleSubmit}
              >
                {editingId ? 'Update Quiz' : 'Add Quiz'}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-4">Delete Quiz</h3>
            <p className="mb-6">Are you sure you want to delete this quiz? This action cannot be undone.</p>
            <div className="modal-action">
              <button
                className="btn btn-ghost cursor-pointer"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn text-white border-0 cursor-pointer"
                style={{ backgroundColor: '#FF0F7B' }}
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(null)}></div>
        </div>
      )}
    </div>
  );
}