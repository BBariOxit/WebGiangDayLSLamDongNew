import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactQuill from 'react-quill';
import {
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDot,
  GripVertical,
  Image as ImageIcon,
  Layers3,
  ListChecks,
  Loader2,
  Minus,
  Pencil,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  Type,
  Upload,
  X
} from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

import { lessonService, quizManagementService } from '../../../shared/services/managementService';
import apiClient from '../../../shared/services/apiClient';
import { resolveAssetUrl } from '../../../shared/utils/url';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const DIFFICULTY_OPTIONS = ['Cơ bản', 'Trung bình', 'Nâng cao'];
const ASSESSMENT_TYPES = [
  { value: 'mixed', label: 'Kết hợp', description: 'Kết hợp nhiều dạng câu hỏi', accent: 'from-fuchsia-500 to-violet-500' },
  { value: 'quiz', label: '1 đáp án', description: 'Trắc nghiệm 1 đáp án đúng', accent: 'from-indigo-500 to-blue-500' },
  { value: 'multi_choice', label: 'Nhiều đáp án', description: 'Checkbox, nhiều đáp án đúng', accent: 'from-orange-500 to-rose-500' },
  { value: 'fill_blank', label: 'Điền chỗ trống', description: 'Nhập đáp án tự do', accent: 'from-emerald-500 to-teal-500' }
];

const QUESTION_TYPE_OPTIONS = [
  { value: 'single_choice', label: '1 đáp án', icon: CircleDot, hint: 'Chỉ một đáp án đúng' },
  { value: 'multi_select', label: 'Nhiều đáp án', icon: ListChecks, hint: 'Có thể chọn nhiều đáp án đúng' },
  { value: 'fill_blank', label: 'Điền chỗ trống', icon: Type, hint: 'Người học gõ câu trả lời' }
];

const SECTION_PRESETS = [
  {
    type: 'heading',
    label: 'Tiêu đề chương',
    description: 'Mở đầu một phần mới với tiêu đề lớn và lời dẫn.',
    accent: 'from-sky-500 to-indigo-500'
  },
  {
    type: 'text',
    label: 'Đoạn nội dung',
    description: 'Đoạn văn, hình ảnh minh họa bằng trình soạn thảo giàu định dạng.',
    accent: 'from-violet-500 to-purple-500'
  },
  {
    type: 'image_gallery',
    label: 'Thư viện ảnh',
    description: 'Tải nhiều hình ảnh cùng chú thích ngắn.',
    accent: 'from-pink-500 to-rose-500'
  },
  {
    type: 'video',
    label: 'Video / Embed',
    description: 'Nhúng video YouTube, Vimeo hoặc file mp4.',
    accent: 'from-amber-500 to-orange-500'
  },
  {
    type: 'divider',
    label: 'Ngăn cách',
    description: 'Tạo khoảng nghỉ giữa các phần.',
    accent: 'from-slate-500 to-slate-700'
  }
];

const uid = () => Math.random().toString(36).slice(2, 10);

const createQuestionTemplate = (questionType = 'single_choice') => {
  if (questionType === 'fill_blank') {
    return {
      id: uid(),
      questionText: '',
      questionType: 'fill_blank',
      acceptedAnswers: [''],
      answers: [],
      explanation: '',
      points: 1
    };
  }

  return {
    id: uid(),
    questionText: '',
    questionType,
    answers: [
      { id: uid(), answerText: '', isCorrect: true },
      { id: uid(), answerText: '', isCorrect: false }
    ],
    acceptedAnswers: [],
    explanation: '',
    points: 1
  };
};

const defaultQuizForm = () => ({
  title: '',
  description: '',
  difficulty: 'Cơ bản',
  timeLimit: 15,
  assessmentType: 'mixed',
  questions: [createQuestionTemplate('single_choice')]
});

const mapQuizDetailToForm = (quiz) => {
  if (!quiz) return defaultQuizForm();
  const normalizeAccepted = (schema) => {
    if (!schema) return [];
    if (Array.isArray(schema.acceptedAnswers)) return schema.acceptedAnswers;
    if (Array.isArray(schema.accepted_answers)) return schema.accepted_answers;
    return [];
  };
  const normalizeCorrectIndexes = (schema) => {
    if (!schema) return [];
    if (Array.isArray(schema.correctIndexes)) return schema.correctIndexes.map(Number);
    if (Array.isArray(schema.correct_indexes)) return schema.correct_indexes.map(Number);
    return [];
  };
  const questions = (quiz.questions || []).map((question) => {
    const questionType = (question.question_type || question.questionType || 'single_choice').toLowerCase();
    const base = {
      id: question.question_id || uid(),
      questionText: question.question_text || question.questionText || '',
      questionType,
      explanation: question.explanation || '',
      points: Number(question.points) > 0 ? Number(question.points) : 1
    };
    if (questionType === 'fill_blank') {
      const acceptedAnswers = normalizeAccepted(question.answer_schema);
      return {
        ...base,
        acceptedAnswers: acceptedAnswers.length ? acceptedAnswers : [''],
        answers: []
      };
    }
    const options = Array.isArray(question.options) ? question.options : [];
    const correctIndexes =
      questionType === 'multi_select'
        ? normalizeCorrectIndexes(question.answer_schema)
        : [typeof question.correct_index === 'number' ? question.correct_index : -1];
    const answers =
      options.length > 0
        ? options.map((text, idx) => ({
            id: `${question.question_id || base.id}-${idx}`,
            answerText: text,
            isCorrect: questionType === 'multi_select' ? correctIndexes.includes(idx) : idx === correctIndexes[0]
          }))
        : [
            { id: uid(), answerText: '', isCorrect: true },
            { id: uid(), answerText: '', isCorrect: false }
          ];
    if (answers.length === 1) {
      answers.push({ id: uid(), answerText: '', isCorrect: false });
    }
    if (questionType === 'single_choice' && !answers.some((ans) => ans.isCorrect)) {
      answers[0].isCorrect = true;
    }
    return {
      ...base,
      answers,
      acceptedAnswers: []
    };
  });

  return {
    title: quiz.title || '',
    description: quiz.description || '',
    difficulty: quiz.difficulty || 'Cơ bản',
    timeLimit: quiz.time_limit || quiz.timeLimit || 10,
    assessmentType: quiz.assessment_type || quiz.assessmentType || 'quiz',
    questions: questions.length ? questions : defaultQuizForm().questions
  };
};

const LessonsManagement = () => {
  const { user, isTeacher, isAdmin } = useAuth();
  const buildDefaultLesson = useCallback(() => ({
    title: '',
    summary: '',
    contentHtml: '',
    isPublished: true,
    instructor: isTeacher && user?.name ? user.name : 'Nhóm biên soạn địa phương',
    duration: '25 phút',
    difficulty: 'Cơ bản',
    category: 'Lịch sử địa phương',
    tags: [],
    images: [],
    sections: []
  }), [isTeacher, user?.name]);

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState(() => buildDefaultLesson());
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attachedQuizzes, setAttachedQuizzes] = useState([]);
  const [createQuiz, setCreateQuiz] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [quizForm, setQuizForm] = useState(defaultQuizForm);
  const [listRefreshing, setListRefreshing] = useState(false);

  const coverInputRef = useRef(null);
  const sectionImageInputRef = useRef(null);
  const sectionUploadIndexRef = useRef(null);

  useEffect(() => {
    loadLessons();
  }, []);

  const canManageLesson = useCallback((lesson) => {
    if (!lesson) return false;
    if (isAdmin) return true;
    if (isTeacher && user?.id) {
      const createdBy = lesson.created_by ?? lesson.createdBy ?? lesson.CreatedBy ?? null;
      return Number(createdBy) === Number(user.id);
    }
    return false;
  }, [isAdmin, isTeacher, user?.id]);

  async function loadLessons() {
    try {
      setLoading(true);
      const res = await lessonService.list();
      setLessons(res.data || []);
    } catch (e) {
      setError('Không thể tải danh sách bài học: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  const resetComposer = useCallback(() => {
    setFormData(buildDefaultLesson());
    setQuizForm(defaultQuizForm());
    setTagInput('');
    setCreateQuiz(false);
    setEditingQuizId(null);
    setAttachedQuizzes([]);
    setEditingLesson(null);
    setActiveTab('overview');
    sectionUploadIndexRef.current = null;
    if (coverInputRef.current) coverInputRef.current.value = '';
    if (sectionImageInputRef.current) sectionImageInputRef.current.value = '';
  }, [buildDefaultLesson]);

  const handleOpenCreate = () => {
    resetComposer();
    setComposerOpen(true);
  };

  const handleOpenEdit = async (lesson) => {
    if (!canManageLesson(lesson)) {
      setError('Bạn chỉ có thể chỉnh sửa bài học do bạn tạo.');
      return;
    }
    try {
      setListRefreshing(true);
      const res = await lessonService.getById(lesson.lesson_id);
      const data = res.data || res;
      setFormData({
        title: data.title || '',
        summary: data.summary || '',
        contentHtml: data.content_html || '',
        isPublished: data.is_published || false,
        instructor: data.instructor || (isTeacher && user?.name ? user.name : ''),
        duration: data.duration || '25 phút',
        difficulty: data.difficulty || 'Cơ bản',
        category: data.category || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        images: parseImages(data.images),
        sections: Array.isArray(data.sections)
          ? data.sections
              .map((section, idx) => {
                let sectionData = section.data;
                if (typeof sectionData === 'string') {
                  try {
                    sectionData = JSON.parse(sectionData);
                  } catch {
                    sectionData = {};
                  }
                }
                return {
                  type: section.type || 'text',
                  title: section.title || '',
                  contentHtml: section.contentHtml ?? section.content_html ?? '',
                  data: sectionData || {},
                  orderIndex: Number(section.orderIndex ?? section.order_index ?? idx)
                };
              })
              .sort((a, b) => a.orderIndex - b.orderIndex)
          : []
      });
      let fetchedQuizzes = [];
      try {
        const qres = await quizManagementService.list({ lessonId: data.lesson_id });
        fetchedQuizzes = qres.data || qres || [];
        setAttachedQuizzes(fetchedQuizzes);
      } catch {
        fetchedQuizzes = [];
        setAttachedQuizzes([]);
      }
      if (fetchedQuizzes.length > 0) {
        const primaryQuizId = fetchedQuizzes[0]?.quiz_id;
        if (primaryQuizId) {
          try {
            const detailRes = await quizManagementService.getById(primaryQuizId);
            const detail = detailRes.data || detailRes;
            setQuizForm(mapQuizDetailToForm(detail));
            setCreateQuiz(true);
            setEditingQuizId(primaryQuizId);
          } catch {
            setQuizForm(defaultQuizForm());
            setCreateQuiz(false);
            setEditingQuizId(null);
          }
        } else {
          setEditingQuizId(null);
          setQuizForm(defaultQuizForm());
          setCreateQuiz(false);
        }
      } else {
        setEditingQuizId(null);
        setQuizForm(defaultQuizForm());
        setCreateQuiz(false);
      }
      setEditingLesson(data);
      setComposerOpen(true);
    } catch (e) {
      setError('Không thể tải bài học: ' + e.message);
    } finally {
      setListRefreshing(false);
    }
  };

  const parseImages = (images) => {
    if (Array.isArray(images)) return images;
    if (!images) return [];
    try {
      const parsed = typeof images === 'string' ? JSON.parse(images) : images;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const handleCloseComposer = (open) => {
    if (!open) {
      resetComposer();
    }
    setComposerOpen(open);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (formData.tags.includes(tagInput.trim())) {
      setTagInput('');
      return;
    }
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
    setTagInput('');
  };

  const handleRemoveTag = (tag) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleCoverSelect = () => {
    sectionUploadIndexRef.current = null;
    coverInputRef.current?.click();
  };

  const handleSectionImageSelect = (idx) => {
    sectionUploadIndexRef.current = idx;
    sectionImageInputRef.current?.click();
  };

  const uploadImage = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await apiClient.post('/uploads/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data?.data?.url;
  };

  const handleCoverChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      if (url) {
        if (sectionUploadIndexRef.current !== null && sectionUploadIndexRef.current !== undefined) {
          setFormData((prev) => {
            const sections = [...prev.sections];
            const idx = sectionUploadIndexRef.current;
            const images = [...(sections[idx]?.data?.images || [])];
            images.push({ url, caption: '' });
            sections[idx] = {
              ...sections[idx],
              data: { ...(sections[idx].data || {}), images }
            };
            return { ...prev, sections };
          });
        } else {
          setFormData((prev) => ({ ...prev, images: [...prev.images, { url, caption: '' }] }));
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Tải ảnh thất bại');
    } finally {
      if (coverInputRef.current) coverInputRef.current.value = '';
      sectionUploadIndexRef.current = null;
    }
  };

  const handleSectionImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImage(file);
      if (url && (sectionUploadIndexRef.current || sectionUploadIndexRef.current === 0)) {
        const idx = sectionUploadIndexRef.current;
        setFormData((prev) => {
          const sections = [...prev.sections];
          const images = [...(sections[idx]?.data?.images || [])];
          images.push({ url, caption: '' });
          sections[idx] = {
            ...sections[idx],
            data: { ...(sections[idx].data || {}), images }
          };
          return { ...prev, sections };
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Tải ảnh thất bại');
    } finally {
      if (sectionImageInputRef.current) sectionImageInputRef.current.value = '';
      sectionUploadIndexRef.current = null;
    }
  };

  const removeCoverImage = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, imageIdx) => imageIdx !== idx)
    }));
  };

  const addSection = (type) => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        createSectionPayload(type, prev.sections.length)
      ]
    }));
    setActiveTab('sections');
  };

  const createSectionPayload = (type, orderIndex) => {
    switch (type) {
      case 'heading':
        return { type, title: 'Tiêu đề chương mới', contentHtml: '', orderIndex };
      case 'text':
        return { type, title: '', contentHtml: '<p>Nội dung chính...</p>', orderIndex };
      case 'image_gallery':
        return { type, title: '', data: { images: [] }, orderIndex };
      case 'video':
        return { type, title: '', data: { url: '', description: '' }, orderIndex };
      case 'divider':
      default:
        return { type: 'divider', orderIndex };
    }
  };

  const updateSection = (idx, patch) => {
    setFormData((prev) => {
      const sections = [...prev.sections];
      sections[idx] = { ...sections[idx], ...patch };
      return { ...prev, sections };
    });
  };

  const removeSection = (idx) => {
    setFormData((prev) => {
      const sections = prev.sections.filter((_, i) => i !== idx).map((section, orderIndex) => ({
        ...section,
        orderIndex
      }));
      return { ...prev, sections };
    });
  };

  const moveSection = (idx, direction) => {
    setFormData((prev) => {
      const sections = [...prev.sections];
      const nextIdx = idx + direction;
      if (nextIdx < 0 || nextIdx >= sections.length) return prev;
      [sections[idx], sections[nextIdx]] = [sections[nextIdx], sections[idx]];
      return {
        ...prev,
        sections: sections.map((section, orderIndex) => ({ ...section, orderIndex }))
      };
    });
  };

  const handleSave = async () => {
    try {
      setError('');
      if (!formData.title.trim()) {
        setError('Vui lòng nhập tiêu đề bài học');
        setActiveTab('overview');
        return;
      }
      const payload = {
        ...formData,
        sections: formData.sections.map((section, idx) => ({
          type: section.type,
          title: section.title ?? null,
          contentHtml: section.contentHtml ?? section.content_html ?? null,
          data: section.data ?? {},
          orderIndex: Number(section.orderIndex ?? idx)
        }))
      };

      let savedLesson;
      if (editingLesson) {
        const res = await lessonService.update(editingLesson.lesson_id, payload);
        savedLesson = res.data || res;
        setSuccess('Cập nhật bài học thành công');
      } else {
        const res = await lessonService.create(payload);
        savedLesson = res.data || res;
        setSuccess('Tạo bài học thành công');
      }

      const effectiveLessonId = savedLesson?.lesson_id || editingLesson?.lesson_id;
      if (createQuiz && effectiveLessonId) {
        const quizPayload = buildQuizPayload(effectiveLessonId);
        if (quizPayload.questions.length) {
          if (editingLesson && editingQuizId) {
            await quizManagementService.update(editingQuizId, quizPayload);
            setSuccess('Cập nhật bài kiểm tra thành công');
          } else {
            await quizManagementService.create(quizPayload);
            setSuccess(editingLesson ? 'Đã tạo bài kiểm tra mới cho bài học' : 'Tạo bài học và bài kiểm tra đi kèm thành công');
          }
        }
      }

      await loadLessons();
      resetComposer();
      setComposerOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Đã xảy ra lỗi khi lưu bài học');
    }
  };

  const buildQuizPayload = (lessonId) => {
    const normalized = quizForm.questions
      .map((question) => {
        const base = {
          questionText: question.questionText?.trim(),
          questionType: question.questionType,
          points: Number(question.points) > 0 ? Number(question.points) : 1,
          explanation: question.explanation?.trim() || ''
        };

        if (!base.questionText) return null;

        if (question.questionType === 'fill_blank') {
          const acceptedAnswers = (question.acceptedAnswers || [])
            .map((ans) => (ans || '').trim())
            .filter(Boolean);
          if (!acceptedAnswers.length) return null;
          return {
            ...base,
            acceptedAnswers
          };
        }

        const answers = (question.answers || [])
          .map((answer) => ({
            id: answer.id || uid(),
            answerText: answer.answerText?.trim() || '',
            isCorrect: Boolean(answer.isCorrect)
          }))
          .filter((answer) => answer.answerText);

        if (answers.length < 2) return null;
        if (!answers.some((ans) => ans.isCorrect)) {
          answers[0] = { ...answers[0], isCorrect: true };
        }

        return {
          ...base,
          answers
        };
      })
      .filter(Boolean);

    return {
      title: quizForm.title?.trim() || `Quiz cho ${formData.title}`,
      description: quizForm.description || '',
      difficulty: quizForm.difficulty,
      timeLimit: Number(quizForm.timeLimit) || 10,
      assessmentType: quizForm.assessmentType,
      lessonId,
      questions: normalized
    };
  };

  const toggleQuizBuilder = (checked) => {
    setCreateQuiz(checked);
    if (checked && quizForm.questions.length === 0) {
      setQuizForm(defaultQuizForm());
    }
  };

  const addQuizQuestion = (preferredType) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: [...prev.questions, createQuestionTemplate(preferredType || resolveQuestionType(prev.assessmentType))]
    }));
  };

  const resolveQuestionType = (assessmentType) => {
    if (assessmentType === 'multi_choice') return 'multi_select';
    if (assessmentType === 'fill_blank') return 'fill_blank';
    return 'single_choice';
  };

  const updateQuizQuestion = (idx, patch) => {
    setQuizForm((prev) => {
      const questions = [...prev.questions];
      questions[idx] = { ...questions[idx], ...patch };
      return { ...prev, questions };
    });
  };

  const removeQuizQuestion = (idx) => {
    setQuizForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, questionIdx) => questionIdx !== idx)
    }));
  };

  const addAnswerOption = (qIdx) => {
    setQuizForm((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIdx] };
      question.answers = [...(question.answers || []), { id: uid(), answerText: '', isCorrect: false }];
      questions[qIdx] = question;
      return { ...prev, questions };
    });
  };

  const updateAnswerOption = (qIdx, ansIdx, patch) => {
    setQuizForm((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIdx] };
      const answers = [...(question.answers || [])];
      answers[ansIdx] = { ...answers[ansIdx], ...patch };
      if (patch.isCorrect && question.questionType === 'single_choice') {
        answers.forEach((answer, idx) => {
          if (idx !== ansIdx) answer.isCorrect = false;
        });
      }
      question.answers = answers;
      questions[qIdx] = question;
      return { ...prev, questions };
    });
  };

  const removeAnswerOption = (qIdx, ansIdx) => {
    setQuizForm((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIdx] };
      question.answers = (question.answers || []).filter((_, idx) => idx !== ansIdx);
      if (question.questionType === 'single_choice' && !question.answers.some((ans) => ans.isCorrect) && question.answers.length) {
        question.answers[0].isCorrect = true;
      }
      questions[qIdx] = question;
      return { ...prev, questions };
    });
  };

  const updateAcceptedAnswer = (qIdx, idx, value) => {
    setQuizForm((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIdx] };
      const acceptedAnswers = [...(question.acceptedAnswers || [])];
      acceptedAnswers[idx] = value;
      question.acceptedAnswers = acceptedAnswers;
      questions[qIdx] = question;
      return { ...prev, questions };
    });
  };

  const addAcceptedAnswer = (qIdx) => {
    setQuizForm((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIdx] };
      question.acceptedAnswers = [...(question.acceptedAnswers || []), ''];
      questions[qIdx] = question;
      return { ...prev, questions };
    });
  };

  const removeAcceptedAnswer = (qIdx, idx) => {
    setQuizForm((prev) => {
      const questions = [...prev.questions];
      const question = { ...questions[qIdx] };
      question.acceptedAnswers = (question.acceptedAnswers || []).filter((_, i) => i !== idx);
      questions[qIdx] = question;
      return { ...prev, questions };
    });
  };

  const handleDeleteLesson = async (lesson) => {
    if (!canManageLesson(lesson)) {
      setError('Bạn chỉ có thể xóa bài học do bạn tạo.');
      return;
    }
    if (!window.confirm('Bạn có chắc muốn xóa bài học này?')) return;
    try {
      await lessonService.delete(lesson.lesson_id);
      setSuccess('Đã xóa bài học');
      await loadLessons();
      setTimeout(() => setSuccess(''), 2000);
    } catch (e) {
      setError('Không thể xóa: ' + (e.response?.data?.error || e.message));
    }
  };

  const renderStatus = (lesson) => {
    if (lesson.is_published) {
      return <Badge variant="success">Đã xuất bản</Badge>;
    }
    return <Badge variant="outline">Nháp</Badge>;
  };

  return (
    <div className="min-h-screen space-y-8 bg-gradient-to-b from-slate-50 via-white to-slate-50 px-4 pb-16 pt-8 sm:px-6 lg:px-12">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white/90 px-6 py-5 shadow-smooth backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500">Quản lý nội dung</p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">Bài học &amp; nội dung số</h1>
          <p className="mt-1 text-sm text-slate-500">Tạo, chỉnh sửa và xuất bản bài học cùng bài kiểm tra đi kèm.</p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-5 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-violet-600"
        >
          <Plus className="h-4 w-4" />
          Tạo bài học mới
        </Button>
      </div>

      {success && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[36px] border border-slate-100 bg-white shadow-smooth">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-8 py-4">Bài học</th>
                <th className="px-8 py-4">Trạng thái</th>
                <th className="px-8 py-4">Ngày tạo</th>
                <th className="px-8 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-400">
                    <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-slate-300" />
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : lessons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-16 text-center text-slate-400">
                    Chưa có bài học nào. Bấm &ldquo;Tạo bài học mới&rdquo; để bắt đầu.
                  </td>
                </tr>
              ) : (
                lessons.map((lesson) => (
                  <tr key={lesson.lesson_id} className="border-b border-slate-50 last:border-0">
                    <td className="px-8 py-6">
                      <p className="text-base font-semibold text-slate-900">{lesson.title}</p>
                      {lesson.summary && (
                        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
                          {lesson.summary}
                        </p>
                      )}
                    </td>
                    <td className="px-8 py-6">{renderStatus(lesson)}</td>
                    <td className="px-8 py-6 text-slate-500">
                      {lesson.created_at ? new Date(lesson.created_at).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                          onClick={() => handleOpenEdit(lesson)}
                          disabled={!canManageLesson(lesson)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Chỉnh sửa</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                          onClick={() => handleDeleteLesson(lesson)}
                          disabled={!canManageLesson(lesson)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Xóa</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={composerOpen} onOpenChange={handleCloseComposer}>
        <SheetContent side="right" className="sm:max-w-5xl">
          <SheetHeader>
            <SheetTitle>{editingLesson ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}</SheetTitle>
            <SheetDescription>
              Thiết kế cấu trúc bài học, thêm nội dung từng phần và tùy chọn gắn bài kiểm tra với 3 dạng câu hỏi phổ biến.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {(listRefreshing || loading) && editingLesson && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                Đang đồng bộ dữ liệu bài học...
              </div>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <input
                type="file"
                accept="image/*"
                ref={coverInputRef}
                onChange={handleCoverChange}
                className="hidden"
              />
              <input
                type="file"
                accept="image/*"
                ref={sectionImageInputRef}
                onChange={handleSectionImageChange}
                className="hidden"
              />
              <TabsList className="w-full justify-between gap-2 rounded-3xl bg-slate-100 p-1">
                <TabsTrigger value="overview" className="flex-1">Tổng quan</TabsTrigger>
                <TabsTrigger value="sections" className="flex-1">Nội dung</TabsTrigger>
                <TabsTrigger value="quiz" className="flex-1">Bài kiểm tra đi kèm</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="space-y-6">
                  <Card className="shadow-none border-slate-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Layers3 className="h-5 w-5 text-indigo-500" />
                        Thông tin chính
                      </CardTitle>
                      <CardDescription>Tên bài học, mô tả ngắn và thông tin mô tả.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Tiêu đề *</Label>
                        <Input value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} placeholder="Tên bài học" />
                      </div>
                      <div className="space-y-2">
                        <Label>Tóm tắt</Label>
                        <Textarea
                          rows={3}
                          value={formData.summary}
                          onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                          placeholder="Mô tả ngắn gọn để hiện ngoài danh sách bài học..."
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Giảng viên / Nhóm biên soạn</Label>
                          <Input value={formData.instructor} onChange={(e) => setFormData((prev) => ({ ...prev, instructor: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>Thời lượng dự kiến</Label>
                          <Input value={formData.duration} onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))} placeholder="Ví dụ: 25 phút" />
                        </div>
                        <div className="space-y-2">
                          <Label>Độ khó</Label>
                          <div className="flex gap-2">
                            {DIFFICULTY_OPTIONS.map((difficulty) => (
                              <button
                                key={difficulty}
                                type="button"
                                onClick={() => setFormData((prev) => ({ ...prev, difficulty }))}
                                className={cn(
                                  'flex-1 rounded-2xl border px-3 py-2 text-sm font-medium transition',
                                  formData.difficulty === difficulty
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                )}
                              >
                                {difficulty}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Danh mục</Label>
                          <Input value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))} placeholder="Ví dụ: Lịch sử địa phương" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Tags</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            placeholder="Nhập tag và nhấn Enter"
                          />
                          <Button type="button" variant="secondary" onClick={handleAddTag}>
                            <Tag className="mr-2 h-4 w-4" />
                            Thêm
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              #{tag}
                              <button className="text-slate-400 hover:text-rose-500" onClick={() => handleRemoveTag(tag)}>
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                          {formData.tags.length === 0 && <p className="text-sm text-slate-400">Chưa có tag nào</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none border-slate-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <ImageIcon className="h-5 w-5 text-pink-500" />
                        Hình ảnh minh họa
                      </CardTitle>
                      <CardDescription>Ảnh bìa và thư viện dùng để giới thiệu bài học.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                        <p className="text-sm text-slate-500">Kéo thả hoặc chọn hình ảnh để tải lên.</p>
                        <Button variant="secondary" className="mt-3" type="button" onClick={handleCoverSelect}>
                          <Upload className="mr-2 h-4 w-4" />
                          Chọn hình
                        </Button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {formData.images.map((img, idx) => (
                          <div key={img.url || idx} className="group relative rounded-2xl border border-slate-200 p-3">
                            <img
                              src={resolveAssetUrl(img.url)}
                              alt={img.caption || `Ảnh ${idx + 1}`}
                              className="h-40 w-full rounded-xl object-cover"
                            />
                            <button
                              className="absolute right-4 top-4 rounded-full bg-white/90 p-1 text-rose-500 opacity-0 shadow group-hover:opacity-100"
                              onClick={() => removeCoverImage(idx)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <Input
                              className="mt-3 text-sm"
                              placeholder="Chú thích ảnh"
                              value={img.caption || ''}
                              onChange={(e) =>
                                setFormData((prev) => {
                                  const images = [...prev.images];
                                  images[idx] = { ...images[idx], caption: e.target.value };
                                  return { ...prev, images };
                                })
                              }
                            />
                          </div>
                        ))}
                        {formData.images.length === 0 && (
                          <div className="rounded-2xl border border-slate-200 p-4 text-center text-sm text-slate-400">
                            Chưa có hình ảnh nào.
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-none border-slate-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="h-5 w-5 text-emerald-500" />
                        Xuất bản
                      </CardTitle>
                      <CardDescription>Chọn trạng thái hiển thị của bài học ngay sau khi lưu.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Xuất bản ngay</p>
                          <p className="text-xs text-slate-500">Bài học sẽ hiển thị cho học viên sau khi lưu.</p>
                        </div>
                        <Switch checked={formData.isPublished} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublished: checked }))} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sections">
                <div className="space-y-6">
                  <Card className="shadow-none border-slate-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpenCheck className="h-5 w-5 text-teal-500" />
                        Thêm mục nội dung
                      </CardTitle>
                      <CardDescription>Kết hợp nhiều loại mục để cấu trúc bài học sinh động.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                      {SECTION_PRESETS.map((preset) => (
                        <button
                          key={preset.type}
                          type="button"
                          onClick={() => addSection(preset.type)}
                          className={cn(
                            'rounded-2xl border border-slate-200 p-4 text-left transition hover:border-transparent hover:shadow-lg',
                            'bg-gradient-to-br from-white to-slate-50'
                          )}
                        >
                          <p className="text-sm font-semibold text-slate-800">{preset.label}</p>
                          <p className="mt-1 text-xs text-slate-500">{preset.description}</p>
                        </button>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="rounded-3xl border border-slate-100">
                    <div className="divide-y divide-slate-100">
                      {formData.sections.length === 0 && (
                        <div className="p-8 text-center text-sm text-slate-400">
                          Chưa có nội dung nào. Hãy chọn loại mục phía trên để bắt đầu biên soạn.
                        </div>
                      )}
                      {formData.sections.map((section, idx) => (
                        <div key={section.section_id || idx} className="flex gap-6 px-6 py-6">
                          <div className="flex flex-col items-center gap-2 text-slate-300">
                            <GripVertical className="h-4 w-4" />
                            <button disabled={idx === 0} onClick={() => moveSection(idx, -1)} className="rounded-full border border-slate-200 p-1 disabled:opacity-40">
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button disabled={idx === formData.sections.length - 1} onClick={() => moveSection(idx, 1)} className="rounded-full border border-slate-200 p-1 disabled:opacity-40">
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex-1 rounded-2xl border border-slate-200 p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs uppercase tracking-wide text-slate-400">Mục {idx + 1}</p>
                                <p className="font-semibold text-slate-800">
                                  {SECTION_PRESETS.find((p) => p.type === section.type)?.label || section.type}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button className="rounded-full border border-slate-200 p-2 text-rose-500" onClick={() => removeSection(idx)}>
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-4 space-y-4">
                              {section.type === 'heading' && (
                                <>
                                  <Input
                                    value={section.title || ''}
                                    onChange={(e) => updateSection(idx, { title: e.target.value })}
                                    placeholder="Tiêu đề mục"
                                  />
                                  <Textarea
                                    rows={3}
                                    value={section.contentHtml || ''}
                                    onChange={(e) => updateSection(idx, { contentHtml: e.target.value })}
                                    placeholder="Lời dẫn (tuỳ chọn)"
                                  />
                                </>
                              )}

                              {section.type === 'text' && (
                                <>
                                  <Input
                                    value={section.title || ''}
                                    onChange={(e) => updateSection(idx, { title: e.target.value })}
                                    placeholder="Tiêu đề nhỏ (tuỳ chọn)"
                                  />
                                  <ReactQuill
                                    theme="snow"
                                    value={section.contentHtml || ''}
                                    onChange={(value) => updateSection(idx, { contentHtml: value })}
                                  />
                                </>
                              )}

                              {section.type === 'image_gallery' && (
                                <>
                                  <Input
                                    value={section.title || ''}
                                    onChange={(e) => updateSection(idx, { title: e.target.value })}
                                    placeholder="Tiêu đề thư mục ảnh (tuỳ chọn)"
                                  />
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    {(section.data?.images || []).map((img, imageIdx) => (
                                      <div key={img.url || imageIdx} className="relative rounded-2xl border border-slate-200 p-3">
                                        <img
                                          src={resolveAssetUrl(img.url)}
                                          alt={img.caption || `Ảnh ${imageIdx + 1}`}
                                          className="h-32 w-full rounded-xl object-cover"
                                        />
                                        <button
                                          className="absolute right-4 top-4 rounded-full bg-white/90 p-1 text-rose-500"
                                          onClick={() =>
                                            updateSection(idx, {
                                              data: {
                                                ...(section.data || {}),
                                                images: section.data.images.filter((_, i) => i !== imageIdx)
                                              }
                                            })
                                          }
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                        <Input
                                          className="mt-2 text-xs"
                                          value={img.caption || ''}
                                          placeholder="Chú thích"
                                          onChange={(e) => {
                                            const images = [...(section.data?.images || [])];
                                            images[imageIdx] = { ...images[imageIdx], caption: e.target.value };
                                            updateSection(idx, { data: { ...(section.data || {}), images } });
                                          }}
                                        />
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => handleSectionImageSelect(idx)}
                                      className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-400"
                                    >
                                      + Thêm ảnh
                                    </button>
                                  </div>
                                </>
                              )}

                              {section.type === 'video' && (
                                <>
                                  <Input
                                    value={section.title || ''}
                                    onChange={(e) => updateSection(idx, { title: e.target.value })}
                                    placeholder="Tiêu đề video (tuỳ chọn)"
                                  />
                                  <Input
                                    value={section.data?.url || ''}
                                    onChange={(e) => updateSection(idx, { data: { ...(section.data || {}), url: e.target.value } })}
                                    placeholder="Link YouTube/Vimeo/mp4"
                                  />
                                  <Textarea
                                    rows={3}
                                    value={section.data?.description || ''}
                                    onChange={(e) => updateSection(idx, { data: { ...(section.data || {}), description: e.target.value } })}
                                    placeholder="Mô tả ngắn"
                                  />
                                </>
                              )}

                              {section.type === 'divider' && (
                                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400">
                                  <Minus className="h-4 w-4" />
                                  Đường phân cách
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="quiz">
                <div className="space-y-6">
                  <Card className="shadow-none border-slate-100">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Layers3 className="h-5 w-5 text-indigo-500" />
                            Bật bài kiểm tra đi kèm
                          </CardTitle>
                          <CardDescription>Thiết kế bài kiểm tra đi kèm với 3 loại câu hỏi phổ biến.</CardDescription>
                        </div>
                        <Switch checked={createQuiz} onCheckedChange={toggleQuizBuilder} />
                      </div>
                    </CardHeader>
                    {createQuiz && (
                      <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Tên quiz</Label>
                            <Input
                              value={quizForm.title}
                              onChange={(e) => setQuizForm((prev) => ({ ...prev, title: e.target.value }))}
                              placeholder="Ví dụ: Ôn tập nhanh"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Thời gian làm (phút)</Label>
                            <Input
                              type="number"
                              min="1"
                              value={quizForm.timeLimit}
                              onChange={(e) => setQuizForm((prev) => ({ ...prev, timeLimit: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Độ khó</Label>
                            <Input
                              value={quizForm.difficulty}
                              onChange={(e) => setQuizForm((prev) => ({ ...prev, difficulty: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Kiểu bài kiểm tra</Label>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {ASSESSMENT_TYPES.map((type) => (
                                <button
                                  key={type.value}
                                  type="button"
                                  onClick={() => {
                                    setQuizForm((prev) => ({
                                      ...prev,
                                      assessmentType: type.value,
                                      questions: prev.questions.length ? prev.questions : [createQuestionTemplate(resolveQuestionType(type.value))]
                                    }));
                                  }}
                                  className={cn(
                                    'rounded-2xl border px-3 py-3 text-left text-sm',
                                    quizForm.assessmentType === type.value
                                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                  )}
                                >
                                  <p className="font-semibold">{type.label}</p>
                                  <p className="text-xs text-slate-400">{type.description}</p>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Mô tả</Label>
                          <Textarea
                            rows={3}
                            value={quizForm.description}
                            onChange={(e) => setQuizForm((prev) => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>

                  {createQuiz && (
                    <div className="space-y-4">
                      {quizForm.questions.map((question, idx) => (
                        <Card key={question.id} className="shadow-none border-slate-100">
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <CardTitle className="flex items-center gap-2 text-base">
                                  Câu hỏi {idx + 1}
                                  <Badge variant="secondary">{QUESTION_TYPE_OPTIONS.find((item) => item.value === question.questionType)?.label}</Badge>
                                </CardTitle>
                                <CardDescription>
                                  {QUESTION_TYPE_OPTIONS.find((item) => item.value === question.questionType)?.hint}
                                </CardDescription>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => removeQuizQuestion(idx)} className="text-rose-500 hover:bg-rose-50">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {QUESTION_TYPE_OPTIONS.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() =>
                                    updateQuizQuestion(idx, {
                                      questionType: option.value,
                                      answers: option.value === 'fill_blank'
                                        ? []
                                        : (question.answers?.length ? question.answers : createQuestionTemplate(option.value).answers),
                                      acceptedAnswers: option.value === 'fill_blank' ? (question.acceptedAnswers?.length ? question.acceptedAnswers : ['']) : []
                                    })
                                  }
                                  className={cn(
                                    'rounded-full border px-3 py-1 text-xs font-medium',
                                    question.questionType === option.value
                                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                      : 'border-slate-200 text-slate-500'
                                  )}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Nội dung câu hỏi</Label>
                              <Textarea
                                rows={3}
                                value={question.questionText}
                                onChange={(e) => updateQuizQuestion(idx, { questionText: e.target.value })}
                              />
                            </div>
                            {question.questionType === 'fill_blank' ? (
                              <div className="space-y-3">
                                <Label>Các đáp án được chấp nhận</Label>
                                {(question.acceptedAnswers || []).map((answer, answerIdx) => (
                                  <div key={`${question.id}-${answerIdx}`} className="flex items-center gap-2">
                                    <Input
                                      value={answer}
                                      onChange={(e) => updateAcceptedAnswer(idx, answerIdx, e.target.value)}
                                      placeholder={`Đáp án ${answerIdx + 1}`}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="text-rose-500 hover:bg-rose-50"
                                      onClick={() => removeAcceptedAnswer(idx, answerIdx)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button type="button" variant="secondary" size="sm" onClick={() => addAcceptedAnswer(idx)} className="rounded-full">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Thêm đáp án
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <Label>Đáp án</Label>
                                {(question.answers || []).map((answer, answerIdx) => (
                                  <div key={answer.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateAnswerOption(idx, answerIdx, { isCorrect: !answer.isCorrect })
                                      }
                                      className={cn(
                                        'h-5 w-5 rounded-full border',
                                        question.questionType === 'multi_select'
                                          ? 'rounded-lg'
                                          : 'rounded-full',
                                        answer.isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-500' : 'border-slate-300'
                                      )}
                                    >
                                      {answer.isCorrect && <CheckCircle2 className="h-4 w-4" />}
                                    </button>
                                    <Input
                                      value={answer.answerText}
                                      onChange={(e) => updateAnswerOption(idx, answerIdx, { answerText: e.target.value })}
                                      placeholder={`Đáp án ${answerIdx + 1}`}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeAnswerOption(idx, answerIdx)}
                                      className="text-rose-500 hover:bg-rose-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button type="button" variant="secondary" size="sm" onClick={() => addAnswerOption(idx)} className="rounded-full">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Thêm đáp án
                                </Button>
                              </div>
                            )}
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label>Điểm</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={question.points}
                                  onChange={(e) => updateQuizQuestion(idx, { points: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Giải thích (tuỳ chọn)</Label>
                                <Textarea
                                  rows={2}
                                  value={question.explanation || ''}
                                  onChange={(e) => updateQuizQuestion(idx, { explanation: e.target.value })}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button type="button" variant="secondary" className="w-full rounded-2xl border border-dashed border-slate-300 py-6 text-slate-500" onClick={() => addQuizQuestion()}>
                        <Plus className="mr-2 h-5 w-5" />
                        Thêm câu hỏi mới
                      </Button>
                    </div>
                  )}

                  {editingLesson && attachedQuizzes.length > 0 && (
                    <Card className="shadow-none border-slate-100">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Calendar className="h-5 w-5 text-indigo-500" />
                          Quiz đã gắn với bài học
                        </CardTitle>
                        <CardDescription>Danh sách bài kiểm tra hiện có liên kết với bài học này.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {attachedQuizzes.map((quiz) => (
                          <div key={quiz.quiz_id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                            <div>
                              <p className="font-semibold text-slate-800">{quiz.title}</p>
                              <p className="text-xs text-slate-400">{quiz.question_count || 0} câu hỏi • {quiz.assessment_type}</p>
                            </div>
                            <Badge variant="secondary">#{quiz.quiz_id}</Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <SheetFooter className="mt-6">
            <Button variant="ghost" className="rounded-full" onClick={() => handleCloseComposer(false)}>
              Huỷ
            </Button>
            <Button className="rounded-full px-6" onClick={handleSave}>
              {editingLesson ? 'Lưu thay đổi' : 'Tạo bài học'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default LessonsManagement;
