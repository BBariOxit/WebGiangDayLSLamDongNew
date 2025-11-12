import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CheckSquare, Circle, CircleDot, Layers3, ListChecks, Loader2, Pencil, Plus, Sparkles, Trash2, Type } from 'lucide-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { lessonsData } from '@shared/constants/lessonsData';
import { quizManagementService, lessonService } from '@shared/services/managementService';

const DIFFICULTY_OPTIONS = ['Cơ bản', 'Trung bình', 'Nâng cao'];

const ASSESSMENT_TYPES = [
  {
    value: 'mixed',
    label: 'Kiểu hỗn hợp',
    description: 'Kết hợp linh hoạt nhiều dạng câu hỏi trong cùng một bài kiểm tra.',
    icon: Sparkles,
    accentColor: '#c026d3',
    accentBg: 'rgba(192, 38, 211, 0.12)',
    accentBorder: 'rgba(192, 38, 211, 0.35)'
  },
  {
    value: 'quiz',
    label: 'Trắc nghiệm 1 đáp án',
    description: 'Mỗi câu hỏi chỉ có duy nhất một đáp án đúng.',
    icon: CircleDot,
    accentColor: '#2563eb',
    accentBg: 'rgba(37, 99, 235, 0.12)',
    accentBorder: 'rgba(37, 99, 235, 0.35)'
  },
  {
    value: 'multi_choice',
    label: 'Trắc nghiệm nhiều đáp án',
    description: 'Cho phép chọn nhiều đáp án đúng với dạng checkbox.',
    icon: ListChecks,
    accentColor: '#f97316',
    accentBg: 'rgba(249, 115, 22, 0.12)',
    accentBorder: 'rgba(249, 115, 22, 0.35)'
  },
  {
    value: 'fill_blank',
    label: 'Điền vào chỗ trống',
    description: 'Học sinh tự nhập đáp án, hỗ trợ nhiều cách viết đúng.',
    icon: Type,
    accentColor: '#059669',
    accentBg: 'rgba(5, 150, 105, 0.12)',
    accentBorder: 'rgba(5, 150, 105, 0.35)'
  }
];

const QUESTION_TYPE_OPTIONS = [
  { value: 'single_choice', label: '1 đáp án', icon: CircleDot, hint: 'Chỉ một đáp án đúng' },
  { value: 'multi_select', label: 'Nhiều đáp án', icon: ListChecks, hint: 'Chọn nhiều đáp án đúng' },
  { value: 'fill_blank', label: 'Điền chỗ trống', icon: Type, hint: 'Người học nhập câu trả lời' }
];

const ASSESSMENT_LABELS = {
  mixed: 'Kiểu hỗn hợp',
  quiz: '1 đáp án',
  multi_choice: 'Nhiều đáp án',
  fill_blank: 'Điền chỗ trống'
};

const QUESTION_TYPE_LABELS = {
  single_choice: 'Trắc nghiệm 1 đáp án',
  multi_select: 'Trắc nghiệm nhiều đáp án',
  fill_blank: 'Điền chỗ trống'
};

const uid = () => `tmp_${Math.random().toString(36).slice(2, 9)}`;

const defaultFormState = () => ({
  title: '',
  description: '',
  difficulty: 'Cơ bản',
  timeLimit: 15,
  lessonId: '',
  assessmentType: 'mixed',
  questions: [createQuestionTemplate('mixed')]
});

function createQuestionTemplate(assessmentType, forcedType) {
  const actualType = forcedType || resolveQuestionType(assessmentType);
  if (actualType === 'fill_blank') {
    return {
      id: uid(),
      questionText: '',
      questionType: 'fill_blank',
      acceptedAnswers: [''],
      answers: [],
      points: 1,
      explanation: ''
    };
  }

  return {
    id: uid(),
    questionText: '',
    questionType: actualType,
    answers: [
      { id: uid(), answerText: '', isCorrect: true },
      { id: uid(), answerText: '', isCorrect: false }
    ],
    acceptedAnswers: [],
    points: 1,
    explanation: ''
  };
}

function resolveQuestionType(assessmentType) {
  if (assessmentType === 'multi_choice') return 'multi_select';
  if (assessmentType === 'fill_blank') return 'fill_blank';
  return 'single_choice';
}

function sanitizeAnswers(answers = [], enforceSingleCorrect = true) {
  const normalized = Array.isArray(answers) && answers.length
    ? answers.map((answer, idx) => ({
        id: answer.id || uid(),
        answerText: answer.answerText ?? answer.text ?? '',
        isCorrect: enforceSingleCorrect ? idx === 0 : Boolean(answer.isCorrect)
      }))
    : [];

  while (normalized.length < 2) {
    normalized.push({ id: uid(), answerText: '', isCorrect: normalized.length === 0 });
  }

  if (enforceSingleCorrect) {
    let correctIdx = normalized.findIndex((ans) => ans.isCorrect);
    if (correctIdx === -1) correctIdx = 0;
    normalized.forEach((ans, idx) => {
      ans.isCorrect = idx === correctIdx;
    });
  } else if (!normalized.some((ans) => ans.isCorrect)) {
    normalized[0].isCorrect = true;
  }

  return normalized;
}

function convertQuestionForType(question, targetType) {
  if (targetType === 'fill_blank') {
    const accepted = Array.isArray(question.acceptedAnswers) && question.acceptedAnswers.length
      ? question.acceptedAnswers
      : (Array.isArray(question.answers)
        ? question.answers.filter((ans) => ans.isCorrect).map((ans) => ans.answerText || '').filter(Boolean)
        : []);
    return {
      ...question,
      questionType: 'fill_blank',
      acceptedAnswers: accepted.length ? accepted : [''],
      answers: []
    };
  }

  return {
    ...question,
    questionType: targetType,
    acceptedAnswers: [],
    answers: sanitizeAnswers(question.answers, targetType === 'single_choice')
  };
}

function deriveQuestionType(question, assessmentType) {
  const qType = (question?.questionType || '').toLowerCase();
  if (['single_choice', 'multi_select', 'fill_blank'].includes(qType)) return qType;
  return resolveQuestionType(assessmentType);
}

function mapQuizDetailToForm(detail) {
  const assessment = (detail?.assessment_type || detail?.assessmentType || 'quiz').toLowerCase();
  const questions = Array.isArray(detail?.questions) && detail.questions.length
    ? detail.questions.map((q) => hydrateQuestionFromApi(q))
    : [createQuestionTemplate(assessment)];

  return {
    title: detail?.title || '',
    description: detail?.description || '',
    difficulty: detail?.difficulty || 'Cơ bản',
    timeLimit: detail?.time_limit || detail?.timeLimit || 15,
    lessonId: detail?.lesson_id ? String(detail.lesson_id) : detail?.lessonId ? String(detail.lessonId) : '',
    assessmentType: assessment,
    questions
  };
}

function hydrateQuestionFromApi(questionRow) {
  const questionType = (questionRow?.question_type || questionRow?.questionType || 'single_choice').toLowerCase();
  if (questionType === 'fill_blank') {
    const accepted = Array.isArray(questionRow?.answer_schema?.acceptedAnswers)
      ? questionRow.answer_schema.acceptedAnswers
      : [];
    return {
      id: questionRow?.question_id || uid(),
      questionText: questionRow?.question_text || questionRow?.questionText || '',
      questionType: 'fill_blank',
      acceptedAnswers: accepted.length ? accepted : [''],
      answers: [],
      points: questionRow?.points || 1,
      explanation: questionRow?.explanation || ''
    };
  }

  const options = Array.isArray(questionRow?.options) ? questionRow.options : [];
  const answerSchema = questionRow?.answer_schema || questionRow?.answerSchema || {};
  const correctIndexes = Array.isArray(answerSchema.correctIndexes)
    ? answerSchema.correctIndexes.map(Number)
    : [];
  const fallbackCorrect = typeof questionRow?.correct_index === 'number' ? questionRow.correct_index : 0;

  const answers = options.length
    ? options.map((text, idx) => ({
        id: uid(),
        answerText: text,
        isCorrect: questionType === 'multi_select' ? correctIndexes.includes(idx) : idx === fallbackCorrect
      }))
    : sanitizeAnswers([], questionType !== 'multi_select');

  return {
    id: questionRow?.question_id || uid(),
    questionText: questionRow?.question_text || questionRow?.questionText || '',
    questionType,
    acceptedAnswers: [],
    answers,
    points: questionRow?.points || 1,
    explanation: questionRow?.explanation || ''
  };
}

function buildPayloadQuestions(questions, assessmentType) {
  return questions.map((question) => {
    const questionType = deriveQuestionType(question, assessmentType);
    const base = {
      questionText: question.questionText.trim(),
      explanation: question.explanation?.trim() || null,
      points: Number(question.points) > 0 ? Number(question.points) : 1,
      questionType
    };

    if (questionType === 'fill_blank') {
      const acceptedAnswers = (question.acceptedAnswers || []).map((ans) => ans.trim()).filter(Boolean);
      return {
        ...base,
        answerSchema: { acceptedAnswers }
      };
    }

    const answers = (question.answers || []).map((ans) => ({
      answerText: (ans.answerText || '').trim(),
      isCorrect: Boolean(ans.isCorrect)
    })).filter((ans) => ans.answerText);

    const options = answers.map((ans) => ans.answerText);

    if (questionType === 'multi_select') {
      const correctIndexes = answers.reduce((acc, ans, idx) => {
        if (ans.isCorrect) acc.push(idx);
        return acc;
      }, []);
      return {
        ...base,
        options,
        answerSchema: { correctIndexes: correctIndexes.length ? correctIndexes : [0] }
      };
    }

    let correctIndex = answers.findIndex((ans) => ans.isCorrect);
    if (correctIndex < 0) correctIndex = 0;
    return {
      ...base,
      options,
      correctIndex
    };
  });
}

const INITIAL_VISIBLE_QUIZZES = 8;

const AdminCreateQuiz = () => {
  useAuth();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState(lessonsData);
  const [form, setForm] = useState(defaultFormState);
  const [existingQuizzes, setExistingQuizzes] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [detailLoadingId, setDetailLoadingId] = useState(null);
  const [visibleQuizzes, setVisibleQuizzes] = useState(INITIAL_VISIBLE_QUIZZES);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [lessonResp, quizResp] = await Promise.allSettled([
          lessonService.list(),
          quizManagementService.list()
        ]);

        if (!mounted) return;

        if (lessonResp.status === 'fulfilled' && Array.isArray(lessonResp.value?.data)) {
          setLessons(lessonResp.value.data);
        }
        if (quizResp.status === 'fulfilled') {
          const rows = Array.isArray(quizResp.value?.data) ? quizResp.value.data : [];
          setExistingQuizzes(rows.map((quiz) => normalizeQuizRow(quiz)));
          setVisibleQuizzes(INITIAL_VISIBLE_QUIZZES);
          setListError('');
        } else if (quizResp.status === 'rejected') {
          setListError(quizResp.reason?.response?.data?.error || quizResp.reason?.message || 'Không thể tải danh sách quiz');
        }
      } catch (err) {
        if (!mounted) return;
        setListError(err.message || 'Không thể tải dữ liệu');
      } finally {
        if (mounted) setListLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const totalPoints = useMemo(() => {
    return form.questions.reduce((sum, q) => sum + (Number(q.points) > 0 ? Number(q.points) : 1), 0);
  }, [form.questions]);

  const summaryChips = useMemo(() => ([
    `${form.questions.length} câu hỏi`,
    `${totalPoints} điểm`,
    form.timeLimit ? `${form.timeLimit} phút` : 'Không giới hạn',
    ASSESSMENT_LABELS[form.assessmentType] || '1 đáp án'
  ]), [form.questions.length, totalPoints, form.timeLimit, form.assessmentType]);

  const lessonOptions = useMemo(() => {
    const seen = new Set();
    return lessons
      .map((lesson) => {
        const lessonId = lesson.id ?? lesson.lesson_id ?? lesson.lessonId;
        if (!lessonId || seen.has(lessonId)) return null;
        seen.add(lessonId);
        const label =
          lesson.title ||
          lesson.lesson_title ||
          lesson.name ||
          lesson.lessonName ||
          `Bài học #${lessonId}`;
        return { value: String(lessonId), label };
      })
      .filter(Boolean);
  }, [lessons]);

  const handleAssessmentChange = (value) => {
    setForm((prev) => ({
      ...prev,
      assessmentType: value,
      questions: prev.questions.length
        ? prev.questions.map((question) => convertQuestionForType(
            question,
            value === 'mixed' ? deriveQuestionType(question, 'mixed') : resolveQuestionType(value)
          ))
        : [createQuestionTemplate(value)]
    }));
  };

  const handleQuestionField = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, idx) => (
        idx === index ? { ...question, [field]: value } : question
      ))
    }));
  };

  const addAnswer = (questionIndex) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, idx) => {
        if (idx !== questionIndex) return question;
        if (!Array.isArray(question.answers)) {
          return { ...question, answers: sanitizeAnswers([], question.questionType !== 'multi_select') };
        }
        return {
          ...question,
          answers: [
            ...question.answers,
            { id: uid(), answerText: '', isCorrect: false }
          ]
        };
      })
    }));
  };

  const removeAnswer = (questionIndex, answerIndex) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, idx) => {
        if (idx !== questionIndex) return question;
        if (question.answers.length <= 2) return question;
        const nextAnswers = question.answers.filter((_, ansIdx) => ansIdx !== answerIndex);
        if (!nextAnswers.some((ans) => ans.isCorrect)) {
          nextAnswers[0].isCorrect = true;
        }
        return { ...question, answers: nextAnswers };
      })
    }));
  };

  const toggleCorrect = (questionIndex, answerIndex) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, idx) => {
        if (idx !== questionIndex) return question;
        if (question.questionType === 'multi_select') {
          const answers = question.answers.map((ans, ansIdx) => (
            ansIdx === answerIndex ? { ...ans, isCorrect: !ans.isCorrect } : ans
          ));
          if (!answers.some((ans) => ans.isCorrect)) {
            answers[answerIndex] = { ...answers[answerIndex], isCorrect: true };
          }
          return { ...question, answers };
        }
        const answers = question.answers.map((ans, ansIdx) => ({
          ...ans,
          isCorrect: ansIdx === answerIndex
        }));
        return { ...question, answers };
      })
    }));
  };

  const addAcceptedAnswer = (questionIndex) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, idx) => {
        if (idx !== questionIndex) return question;
        return {
          ...question,
          acceptedAnswers: [...(question.acceptedAnswers || []), '']
        };
      })
    }));
  };

  const removeAcceptedAnswer = (questionIndex, answerIndex) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((question, idx) => {
        if (idx !== questionIndex) return question;
        if ((question.acceptedAnswers || []).length <= 1) return question;
        const next = question.acceptedAnswers.filter((_, i) => i !== answerIndex);
        return { ...question, acceptedAnswers: next };
      })
    }));
  };

  const handleAddQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, createQuestionTemplate(prev.assessmentType)]
    }));
  };

  const handleRemoveQuestion = (index) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== index)
    }));
  };

  const validateForm = () => {
    if (!form.title.trim()) return 'Vui lòng nhập tiêu đề bài kiểm tra';
    if (!form.questions.length) return 'Cần ít nhất 1 câu hỏi';
    for (let i = 0; i < form.questions.length; i += 1) {
      const question = form.questions[i];
      if (!question.questionText.trim()) {
        return `Câu hỏi ${i + 1} chưa có nội dung`;
      }
      const qType = deriveQuestionType(question, form.assessmentType);
      if (qType === 'fill_blank') {
        const answers = (question.acceptedAnswers || []).map((ans) => ans.trim()).filter(Boolean);
        if (!answers.length) return `Câu hỏi ${i + 1} cần ít nhất một đáp án hợp lệ`;
      } else {
        const answers = (question.answers || []).map((ans) => ans.answerText?.trim()).filter(Boolean);
        if (answers.length < 2) return `Câu hỏi ${i + 1} cần tối thiểu 2 đáp án`;
        const hasCorrect = (question.answers || []).some((ans) => ans.isCorrect);
        if (!hasCorrect) return `Câu hỏi ${i + 1} cần đánh dấu đáp án đúng`;
      }
    }
    return null;
  };

  const loadQuizzes = async () => {
    try {
      setListLoading(true);
      const response = await quizManagementService.list();
      const rows = Array.isArray(response?.data) ? response.data : [];
      setExistingQuizzes(rows.map((quiz) => normalizeQuizRow(quiz)));
      setVisibleQuizzes(INITIAL_VISIBLE_QUIZZES);
      setListError('');
    } catch (err) {
      setListError(err.response?.data?.error || err.message || 'Không thể tải danh sách quiz');
    } finally {
      setListLoading(false);
    }
  };

  const handleSave = async () => {
    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      difficulty: form.difficulty,
      timeLimit: Number(form.timeLimit) > 0 ? Number(form.timeLimit) : null,
      lessonId: form.lessonId ? Number(form.lessonId) : null,
      assessmentType: form.assessmentType,
      questions: buildPayloadQuestions(form.questions, form.assessmentType)
    };

    try {
      setSaving(true);
      setFormError('');
      if (editingQuizId) {
        await quizManagementService.update(editingQuizId, payload);
        setSuccess('Đã cập nhật bài kiểm tra.');
      } else {
        await quizManagementService.create(payload);
        setSuccess('Đã tạo bài kiểm tra mới.');
      }
      setForm(defaultFormState());
      setEditingQuizId(null);
      loadQuizzes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Không thể lưu bài kiểm tra');
    } finally {
      setSaving(false);
    }
  };

  const handleEditQuiz = async (quizId) => {
    try {
      setDetailLoadingId(quizId);
      const response = await quizManagementService.getById(quizId);
      const detail = response?.data;
      if (!detail) throw new Error('Không tìm thấy dữ liệu bài kiểm tra');
      setForm(mapQuizDetailToForm(detail));
      setEditingQuizId(quizId);
      setFormError('');
      setSuccess('');
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Không thể tải chi tiết bài kiểm tra');
    } finally {
      setDetailLoadingId(null);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    const quiz = existingQuizzes.find((q) => q.id === quizId);
    if (!window.confirm(`Xóa "${quiz?.title || 'quiz'}"? Thao tác này không thể hoàn tác.`)) return;
    try {
      await quizManagementService.delete(quizId);
      if (editingQuizId === quizId) {
        setEditingQuizId(null);
        setForm(defaultFormState());
      }
      loadQuizzes();
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Không thể xóa bài kiểm tra');
    }
  };

  const handleCancelEdit = () => {
    setForm(defaultFormState());
    setEditingQuizId(null);
    setFormError('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 rounded-full border border-slate-200 bg-white px-4 text-slate-600 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">Quản trị quiz</p>
              <h1 className="text-2xl font-semibold text-slate-900">Tạo bài kiểm tra mới</h1>
            </div>
          </div>
          {editingQuizId && (
            <Badge className="rounded-full bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-700">
              Đang chỉnh sửa #{editingQuizId}
            </Badge>
          )}
        </div>

        {success && (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-emerald-800">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </p>
          </div>
        )}
        {formError && (
          <div className="mb-6 rounded-3xl border border-rose-200 bg-rose-50 px-5 py-3 text-rose-800">
            <p className="text-sm font-semibold">{formError}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          <div className="space-y-6">
            <Card className="rounded-3xl shadow-smooth">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  Thông tin chung
                </CardTitle>
                <CardDescription>
                  Đặt tên, mô tả và liên kết bài kiểm tra với bài học phù hợp.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Tiêu đề bài kiểm tra"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
                <Textarea
                  rows={4}
                  placeholder="Mô tả ngắn gọn mục tiêu, phạm vi bài kiểm tra..."
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Độ khó</p>
                    <div className="flex gap-2">
                      {DIFFICULTY_OPTIONS.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, difficulty: option }))}
                          className={cn(
                            'flex-1 rounded-2xl border px-4 py-2 text-sm font-medium transition',
                            form.difficulty === option
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-600">Thời gian làm bài (phút)</p>
                    <Input
                      type="number"
                      min={0}
                      value={form.timeLimit}
                      onChange={(event) => setForm((prev) => ({ ...prev, timeLimit: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Gắn với bài học</p>
                  <div className="relative">
                    <select
                      value={form.lessonId}
                      onChange={(event) => setForm((prev) => ({ ...prev, lessonId: event.target.value }))}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    >
                      <option value="">Bài kiểm tra độc lập</option>
                      {lessonOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Layers3 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-smooth">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ListChecks className="h-5 w-5 text-violet-500" />
                  Kiểu bài kiểm tra
                </CardTitle>
                <CardDescription>
                  Chọn cách thức chấm điểm. Kiểu hỗn hợp cho phép bạn thiết kế từng câu hỏi với dạng riêng.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {ASSESSMENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      type="button"
                      key={type.value}
                      onClick={() => handleAssessmentChange(type.value)}
                      className={cn(
                        'rounded-3xl border p-4 text-left transition hover:-translate-y-0.5',
                      form.assessmentType === type.value
                        ? 'border-slate-900 bg-white shadow-lg'
                        : 'border-slate-200 bg-white'
                    )}
                  >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold text-slate-900">{type.label}</p>
                          <p className="mt-1 text-sm text-slate-500">{type.description}</p>
                        </div>
                        <div
                          className="flex h-11 w-11 items-center justify-center rounded-2xl border"
                          style={{
                            backgroundColor: type.accentBg,
                            color: type.accentColor,
                            borderColor: type.accentBorder,
                          }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-smooth">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Type className="h-5 w-5 text-sky-500" />
                  Câu hỏi ({form.questions.length})
                </CardTitle>
                <CardDescription>
                  Mỗi câu hỏi cần tối thiểu 2 đáp án (đối với trắc nghiệm) hoặc 1 đáp án đúng được chấp nhận (đối với điền chỗ trống).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {form.questions.map((question, index) => {
                  const currentType = deriveQuestionType(question, form.assessmentType);
                  return (
                    <div key={question.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-500">
                            Câu hỏi {index + 1}
                          </p>
                          <p className="text-xs text-slate-400">
                            {QUESTION_TYPE_LABELS[currentType]}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-1 text-sm text-slate-600">
                            <span>Điểm</span>
                            <input
                              type="number"
                              min={1}
                              value={question.points}
                              onChange={(event) => handleQuestionField(index, 'points', Number(event.target.value))}
                              className="w-16 rounded-xl border border-slate-200 px-2 py-1 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                            />
                          </div>
                          {form.questions.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-rose-500 hover:text-rose-600"
                              onClick={() => handleRemoveQuestion(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {form.assessmentType === 'mixed' && (
                        <div className="mb-4 flex flex-wrap gap-2">
                          {QUESTION_TYPE_OPTIONS.map((option) => {
                            const Icon = option.icon;
                            return (
                              <button
                                type="button"
                                key={option.value}
                                onClick={() => handleQuestionField(index, 'questionType', option.value)}
                                className={cn(
                                  'flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition',
                                  currentType === option.value
                                    ? 'border-slate-900 bg-slate-900 text-white'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-400'
                                )}
                              >
                                <Icon className="h-4 w-4" />
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <Textarea
                        rows={3}
                        placeholder="Nhập nội dung câu hỏi..."
                        value={question.questionText}
                        onChange={(event) => handleQuestionField(index, 'questionText', event.target.value)}
                        className="mb-4"
                      />

                      {currentType === 'fill_blank' ? (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-slate-600">Các đáp án chấp nhận</p>
                          {(question.acceptedAnswers || []).map((answer, answerIndex) => (
                            <div key={`${question.id}-accepted-${answerIndex}`} className="flex items-center gap-3">
                              <Input
                                placeholder={`Đáp án ${answerIndex + 1}`}
                                value={answer}
                                onChange={(event) => {
                                  const nextAnswers = [...question.acceptedAnswers];
                                  nextAnswers[answerIndex] = event.target.value;
                                  handleQuestionField(index, 'acceptedAnswers', nextAnswers);
                                }}
                              />
                              {(question.acceptedAnswers || []).length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeAcceptedAnswer(index, answerIndex)}
                                >
                                  <Trash2 className="h-4 w-4 text-rose-500" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button type="button" variant="ghost" size="sm" className="gap-2 text-indigo-600" onClick={() => addAcceptedAnswer(index)}>
                            <Plus className="h-4 w-4" />
                            Thêm đáp án chấp nhận
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-slate-600">Đáp án</p>
                          {(question.answers || []).map((answer, answerIndex) => (
                            <div key={answer.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                              <button
                                type="button"
                                onClick={() => toggleCorrect(index, answerIndex)}
                                className={cn(
                                  'rounded-full border p-1 transition',
                                  answer.isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 text-slate-500'
                                )}
                              >
                                {question.questionType === 'multi_select' ? (
                                  <CheckSquare className="h-4 w-4" />
                                ) : (
                                  answer.isCorrect ? <CircleDot className="h-4 w-4" /> : <Circle className="h-4 w-4" />
                                )}
                              </button>
                              <Input
                                placeholder={`Đáp án ${answerIndex + 1}`}
                                value={answer.answerText}
                                onChange={(event) => {
                                  const answers = [...question.answers];
                                  answers[answerIndex] = { ...answers[answerIndex], answerText: event.target.value };
                                  handleQuestionField(index, 'answers', answers);
                                }}
                              />
                              {question.answers.length > 2 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeAnswer(index, answerIndex)}
                                >
                                  <Trash2 className="h-4 w-4 text-rose-500" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <div className="flex justify-between">
                            <Button type="button" variant="ghost" size="sm" className="gap-2 text-indigo-600" onClick={() => addAnswer(index)}>
                              <Plus className="h-4 w-4" />
                              Thêm đáp án
                            </Button>
                          </div>
                        </div>
                      )}

                      <Textarea
                        rows={2}
                        className="mt-4"
                        placeholder="Giải thích / gợi ý (tuỳ chọn)"
                        value={question.explanation}
                        onChange={(event) => handleQuestionField(index, 'explanation', event.target.value)}
                      />
                    </div>
                  );
                })}

                <Button
                  type="button"
                  variant="secondary"
                  className="w-full justify-center rounded-2xl border border-dashed border-slate-300 py-3 text-slate-600"
                  onClick={handleAddQuestion}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm câu hỏi
                </Button>
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center gap-3">
              {editingQuizId && (
                <Button type="button" variant="ghost" className="rounded-2xl px-6" onClick={handleCancelEdit} disabled={saving}>
                  Hủy chỉnh sửa
                </Button>
              )}
              <Button
                type="button"
                className="rounded-2xl px-10 py-3 text-base font-semibold shadow-lg"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : editingQuizId ? 'Cập nhật bài kiểm tra' : 'Tạo bài kiểm tra'}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-3xl border-0 bg-gradient-to-br from-indigo-500 via-slate-900 to-slate-900 text-white shadow-smooth">
              <CardHeader>
                <CardTitle>Preview nhanh</CardTitle>
                <CardDescription className="text-indigo-100">
                  Tổng quan bài kiểm tra đang xây dựng.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-lg font-semibold">{form.title || 'Chưa đặt tiêu đề'}</p>
                  <p
                    className="text-sm text-indigo-100"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere'
                    }}
                    title={form.description || 'Mô tả sẽ hiển thị ở đây.'}
                  >
                    {form.description || 'Mô tả sẽ hiển thị ở đây.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {summaryChips.map((chip) => (
                    <span key={chip} className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      {chip}
                    </span>
                  ))}
                </div>
                <div className="space-y-2 rounded-2xl bg-white/10 p-4">
                  {form.questions.slice(0, 3).map((question, index) => (
                    <div key={question.id} className="text-sm text-indigo-50">
                      <p className="font-medium">
                        {index + 1}. {question.questionText || 'Nội dung câu hỏi'}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-indigo-200">
                        {QUESTION_TYPE_LABELS[deriveQuestionType(question, form.assessmentType)]}
                      </p>
                    </div>
                  ))}
                  {form.questions.length > 3 && (
                    <p className="text-xs text-indigo-200">... và {form.questions.length - 3} câu hỏi khác</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl shadow-smooth">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <Pencil className="h-5 w-5 text-amber-500" />
                  Bài kiểm tra đã tạo ({existingQuizzes.length})
                </CardTitle>
                <CardDescription>
                  Chọn một bài để chỉnh sửa, nhân bản hoặc xóa.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {listLoading ? (
                  <div className="flex items-center justify-center py-6 text-slate-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải danh sách...
                  </div>
                ) : listError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {listError}
                  </div>
                ) : existingQuizzes.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                    Chưa có bài kiểm tra nào.
                  </div>
                ) : (
                  existingQuizzes.slice(0, visibleQuizzes).map((quiz) => (
                    <div
                      key={quiz.id}
                      className={cn(
                        'rounded-2xl border px-4 py-3 text-sm transition',
                        editingQuizId === quiz.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{quiz.title}</p>
                          <p className="text-xs text-slate-500">{quiz.description || 'Không có mô tả'}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                            <Badge className="bg-slate-100 text-slate-700">{ASSESSMENT_LABELS[quiz.assessmentType]}</Badge>
                            <span>{quiz.questionCount} câu hỏi</span>
                            {quiz.timeLimit ? <span>{quiz.timeLimit} phút</span> : <span>Không giới hạn</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="gap-2 rounded-full text-indigo-600"
                            onClick={() => handleEditQuiz(quiz.id)}
                            disabled={detailLoadingId === quiz.id}
                          >
                            {detailLoadingId === quiz.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Pencil className="h-4 w-4" />
                            )}
                            {editingQuizId === quiz.id ? 'Đang chỉnh sửa' : 'Sửa'}
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="text-rose-500"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {!listLoading && !listError && existingQuizzes.length > INITIAL_VISIBLE_QUIZZES && (
                  <div className="flex justify-center pt-2">
                    {visibleQuizzes < existingQuizzes.length ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full px-6 text-indigo-600"
                        onClick={() => setVisibleQuizzes((prev) => Math.min(prev + 8, existingQuizzes.length))}
                      >
                        Xem thêm ({existingQuizzes.length - visibleQuizzes})
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full px-6 text-slate-600"
                        onClick={() => setVisibleQuizzes(INITIAL_VISIBLE_QUIZZES)}
                      >
                        Thu gọn
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

function normalizeQuizRow(row) {
  return {
    id: row.quiz_id || row.quizId || row.id,
    title: row.title,
    description: row.description,
    assessmentType: (row.assessment_type || row.assessmentType || 'quiz').toLowerCase(),
    questionCount: Number(row.question_count || row.questionCount || row.questions?.length || 0),
    timeLimit: row.time_limit || row.timeLimit,
    difficulty: row.difficulty,
    lessonTitle: row.lesson_title || row.lessonTitle,
    createdAt: row.created_at || row.createdAt
  };
}

export default AdminCreateQuiz;
