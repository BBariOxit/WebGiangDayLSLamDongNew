import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Switch, FormControlLabel,
  Alert, CircularProgress, Stack, Tooltip, MenuItem, Select, FormControl,
  InputLabel, Grid
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Visibility as VisibilityIcon, Article as ArticleIcon,
  Close as CloseIcon,
  Title as TitleIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  HorizontalRule as DividerIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';
import { lessonService, quizManagementService } from '../../../shared/services/managementService';
import apiClient from '../../../shared/services/apiClient';
import Divider from '@mui/material/Divider';
import { resolveAssetUrl } from '../../../shared/utils/url';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const LessonsManagement = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    contentHtml: '',
    isPublished: true,
    instructor: '',
    duration: '',
    difficulty: 'Cơ bản',
    category: '',
    tags: [],
    images: [],
    sections: []
  });
  const [tagInput, setTagInput] = useState('');
  // Image picking uses upload only; URL input removed
  const fileInputRef = React.useRef(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attachedQuizzes, setAttachedQuizzes] = useState([]);
  const [sectionUploadIndex, setSectionUploadIndex] = useState(null);
  // Create attached quiz toggles and form
  const [createQuiz, setCreateQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    difficulty: 'Cơ bản',
    timeLimit: 10,
    questions: [
      { questionText: '', options: ['', '', '', ''], correctIndex: 0 }
    ]
  });

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const res = await lessonService.list();
      setLessons(res.data || []);
    } catch (e) {
      setError('Không thể tải danh sách bài học: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingLesson(null);
    setFormData({ 
      title: '', 
      summary: '', 
      contentHtml: '', 
      isPublished: true,
      instructor: 'Nhóm biên soạn địa phương',
      duration: '25 phút',
      difficulty: 'Cơ bản',
      category: 'Lịch sử địa phương',
      tags: [],
      images: [],
      sections: []
    });
    setCreateQuiz(false);
    setQuizForm({
      title: '',
      description: '',
      difficulty: 'Cơ bản',
      timeLimit: 10,
      questions: [{ questionText: '', options: ['', '', '', ''], correctIndex: 0 }]
    });
  setTagInput('');
    setOpenDialog(true);
  };

  const handleOpenEdit = async (lesson) => {
    try {
      const res = await lessonService.getById(lesson.lesson_id);
      const data = res.data;
      setEditingLesson(data);
      setFormData({
        title: data.title || '',
        summary: data.summary || '',
        contentHtml: data.content_html || '',
        isPublished: data.is_published || false,
        instructor: data.instructor || 'Nhóm biên soạn địa phương',
        duration: data.duration || '25 phút',
        difficulty: data.difficulty || 'Cơ bản',
        category: data.category || 'Lịch sử địa phương',
        tags: Array.isArray(data.tags) ? data.tags : [],
        images: Array.isArray(data.images) ? data.images : 
    (typeof data.images === 'string' ? JSON.parse(data.images) : []),
  sections: Array.isArray(data.sections) ? data.sections : []
      });
      // Optionally: fetch attached quizzes for this lesson to show quick info
      try {
        const qres = await quizManagementService.list({ lessonId: data.lesson_id });
        setAttachedQuizzes(qres.data || []);
      } catch {}
  setTagInput('');
      setOpenDialog(true);
    } catch (e) {
      setError('Không thể tải bài học: ' + e.message);
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    setEditingLesson(null);
    setFormData({ 
      title: '', 
      summary: '', 
      contentHtml: '', 
      isPublished: true,
      instructor: '',
      duration: '',
      difficulty: 'Cơ bản',
      category: '',
      tags: [],
      images: [],
      sections: []
    });
  setCreateQuiz(false);
  setQuizForm({ title: '', description: '', difficulty: 'Cơ bản', timeLimit: 10, questions: [{ questionText: '', options: ['', '', '', ''], correctIndex: 0 }] });
  setTagInput('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  // Removed URL-based add image

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await apiClient.post('/uploads/image', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const url = res.data?.data?.url;
      if (url) {
        if (sectionUploadIndex !== null && sectionUploadIndex !== undefined) {
          setFormData(prev => {
            const arr = [...prev.sections];
            const imgs = [...(arr[sectionUploadIndex]?.data?.images || [])];
            imgs.push({ url, caption: '' });
            arr[sectionUploadIndex] = { ...arr[sectionUploadIndex], data: { ...(arr[sectionUploadIndex].data || {}), images: imgs } };
            return { ...prev, sections: arr };
          });
          setSectionUploadIndex(null);
        } else {
          setFormData(prev => ({ ...prev, images: [...prev.images, { url, caption: '' }] }));
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Tải ảnh thất bại');
    } finally {
      // reset
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    try {
      setError('');
      if (!formData.title.trim()) {
        setError('Vui lòng nhập tiêu đề');
        return;
      }

      if (editingLesson) {
        await lessonService.update(editingLesson.lesson_id, formData);
        setSuccess('Cập nhật bài học thành công!');
      } else {
        const created = await lessonService.create(formData);
        const lesson = created?.data;
        setSuccess('Tạo bài học thành công!');
        // Optionally create attached quiz
        if (createQuiz && lesson?.lesson_id) {
          // build payload
          const payload = {
            title: quizForm.title?.trim() || `Quiz: ${formData.title}`,
            description: quizForm.description || '',
            lessonId: lesson.lesson_id,
            difficulty: quizForm.difficulty,
            timeLimit: Number(quizForm.timeLimit) || 10,
            questions: (quizForm.questions || [])
              .filter(q => (q.questionText || '').trim() && (q.options || []).some(opt => (opt || '').trim()))
              .map(q => ({
                questionText: q.questionText,
                options: (q.options || []).map(o => o || '').filter(o => o.trim() !== ''),
                correctIndex: Math.max(0, Math.min((q.options || []).length - 1, Number(q.correctIndex) || 0))
              }))
          };
          if (payload.questions.length > 0) {
            await quizManagementService.create(payload);
            setSuccess('Tạo bài học và quiz đi kèm thành công!');
          }
        }
      }

      handleClose();
      loadLessons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  };

  // Quiz form handlers
  const updateQuizQuestion = (idx, patch) => {
    setQuizForm(f => {
      const next = { ...f, questions: [...f.questions] };
      next.questions[idx] = { ...next.questions[idx], ...patch };
      return next;
    });
  };
  const updateQuizOption = (qIdx, optIdx, value) => {
    setQuizForm(f => {
      const qs = [...f.questions];
      const q = { ...qs[qIdx], options: [...qs[qIdx].options] };
      q.options[optIdx] = value;
      qs[qIdx] = q;
      return { ...f, questions: qs };
    });
  };
  const addQuizQuestion = () => {
    setQuizForm(f => ({ ...f, questions: [...f.questions, { questionText: '', options: ['', '', '', ''], correctIndex: 0 }] }));
  };
  const removeQuizQuestion = (idx) => {
    setQuizForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }));
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('Bạn có chắc muốn xóa bài học này?')) return;
    try {
      await lessonService.delete(lessonId);
      setSuccess('Xóa bài học thành công!');
      loadLessons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      setError('Không thể xóa: ' + (e.response?.data?.error || e.message));
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ArticleIcon fontSize="large" color="primary" />
          Quản lý Bài học
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          size="large"
        >
          Tạo Bài học mới
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tiêu đề</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tóm tắt</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ngày tạo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lessons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Chưa có bài học nào</Typography>
                </TableCell>
              </TableRow>
            ) : (
              lessons.map((lesson) => (
                <TableRow key={lesson.lesson_id} hover>
                  <TableCell>{lesson.lesson_id}</TableCell>
                  <TableCell><strong>{lesson.title}</strong></TableCell>
                  <TableCell>{lesson.summary || '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={lesson.is_published ? 'Đã xuất bản' : 'Nháp'}
                      color={lesson.is_published ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(lesson.created_at).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Chỉnh sửa">
                      <IconButton color="primary" onClick={() => handleOpenEdit(lesson)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton color="error" onClick={() => handleDelete(lesson.lesson_id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingLesson ? 'Chỉnh sửa Bài học' : 'Tạo Bài học mới'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Tiêu đề"
              fullWidth
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <TextField
              label="Tóm tắt"
              fullWidth
              multiline
              rows={2}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Giảng viên"
                  fullWidth
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Thời lượng (vd: 25 phút)"
                  fullWidth
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Độ khó</InputLabel>
                  <Select
                    value={formData.difficulty}
                    label="Độ khó"
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  >
                    <MenuItem value="Cơ bản">Cơ bản</MenuItem>
                    <MenuItem value="Trung bình">Trung bình</MenuItem>
                    <MenuItem value="Nâng cao">Nâng cao</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Danh mục"
                  fullWidth
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="vd: Lịch sử địa phương"
                />
              </Grid>
            </Grid>

            {/* Tags */}
            <Box>
              <Typography variant="subtitle2" mb={1}>Tags</Typography>
              <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1}>
                <TextField
                  size="small"
                  placeholder="Nhập tag mới..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  fullWidth
                />
                <Button variant="outlined" onClick={handleAddTag}>Thêm</Button>
              </Stack>
            </Box>

            {/* Images */}
            <Box>
              <Typography variant="subtitle2" mb={1}>Hình ảnh</Typography>
              <Stack spacing={2} mb={2}>
                {formData.images.map((img, index) => (
                  <Paper key={index} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box component="img" src={resolveAssetUrl(img.url)} alt={`image-${index}`} sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1, border: '1px solid #eee' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display:'block' }}>{img.url}</Typography>
                      <TextField
                        size="small"
                        placeholder="Chú thích (tùy chọn)"
                        value={img.caption || ''}
                        onChange={(e)=> setFormData(prev => { const arr=[...prev.images]; arr[index] = { ...arr[index], caption: e.target.value }; return { ...prev, images: arr }; })}
                        fullWidth
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    <IconButton size="small" color="error" onClick={() => handleRemoveImage(index)}>
                      <CloseIcon />
                    </IconButton>
                  </Paper>
                ))}
              </Stack>
              <Stack spacing={1}>
                <Button variant="contained" color="secondary" onClick={handlePickImage} sx={{ alignSelf:'flex-start' }}>Chọn từ máy</Button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" mb={1}>Nội dung</Typography>
              <ReactQuill
                theme="snow"
                value={formData.contentHtml}
                onChange={(content) => setFormData({ ...formData, contentHtml: content })}
                style={{ height: '300px', marginBottom: '60px' }}
              />
            </Box>

            {/* Sections Builder */}
            <Divider sx={{ my: 2 }} />
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="h6">Các mục (Sections)</Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small" startIcon={<TitleIcon />} onClick={() => setFormData(p=>({ ...p, sections:[...p.sections, { type:'heading', title:'Tiêu đề chương', orderIndex:p.sections.length }] }))}>Tiêu đề</Button>
                  <Button variant="outlined" size="small" startIcon={<TextIcon />} onClick={() => setFormData(p=>({ ...p, sections:[...p.sections, { type:'text', contentHtml:'<p>Nội dung...</p>', orderIndex:p.sections.length }] }))}>Đoạn văn</Button>
                  <Button variant="outlined" size="small" startIcon={<ImageIcon />} onClick={() => setFormData(p=>({ ...p, sections:[...p.sections, { type:'image_gallery', data:{ images:[] }, orderIndex:p.sections.length }] }))}>Thư viện ảnh</Button>
                  <Button variant="outlined" size="small" startIcon={<VideoIcon />} onClick={() => setFormData(p=>({ ...p, sections:[...p.sections, { type:'video', data:{ url:'' }, orderIndex:p.sections.length }] }))}>Video</Button>
                  <Button variant="outlined" size="small" startIcon={<DividerIcon />} onClick={() => setFormData(p=>({ ...p, sections:[...p.sections, { type:'divider', orderIndex:p.sections.length }] }))}>Ngăn cách</Button>
                </Stack>
              </Stack>

              {formData.sections.length === 0 ? (
                <Typography variant="body2" color="text.secondary">Chưa có mục nào. Hãy thêm mục để cấu trúc bài học theo chương/phần.</Typography>
              ) : (
                <Stack spacing={2}>
                  {formData.sections.map((s, idx) => (
                    <Paper key={idx} variant="outlined" sx={{ p:2 }}>
                      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                        <Typography fontWeight={600}>#{idx+1} · {s.type}</Typography>
                        <Stack direction="row" spacing={1}>
                          <IconButton size="small" disabled={idx===0} onClick={()=> setFormData(p=>{ const arr=[...p.sections]; [arr[idx-1],arr[idx]]=[arr[idx],arr[idx-1]]; return { ...p, sections: arr.map((x,i)=> ({ ...x, orderIndex:i })) }; })}><ArrowUpIcon fontSize="small" /></IconButton>
                          <IconButton size="small" disabled={idx===formData.sections.length-1} onClick={()=> setFormData(p=>{ const arr=[...p.sections]; [arr[idx+1],arr[idx]]=[arr[idx],arr[idx+1]]; return { ...p, sections: arr.map((x,i)=> ({ ...x, orderIndex:i })) }; })}><ArrowDownIcon fontSize="small" /></IconButton>
                          <IconButton size="small" color="error" onClick={()=> setFormData(p=> ({ ...p, sections: p.sections.filter((_,i)=> i!==idx).map((x,i)=> ({ ...x, orderIndex:i })) }))}><CloseIcon fontSize="small" /></IconButton>
                        </Stack>
                      </Stack>

                      {s.type === 'heading' && (
                        <Stack spacing={1}>
                          <TextField fullWidth label="Tiêu đề" value={s.title||''} onChange={(e)=> setFormData(p=>{ const arr=[...p.sections]; arr[idx]={ ...arr[idx], title:e.target.value }; return { ...p, sections:arr }; })} />
                          <Typography variant="caption" color="text.secondary">Nội dung ngắn bên dưới tiêu đề (tuỳ chọn)</Typography>
                          <ReactQuill theme="snow" value={s.contentHtml||''} onChange={(val)=> setFormData(p=>{ const arr=[...p.sections]; arr[idx]={ ...arr[idx], contentHtml:val }; return { ...p, sections:arr }; })} style={{ height: 140 }} />
                          <Box sx={{ height: 8 }} />
                        </Stack>
                      )}

                      {s.type === 'text' && (
                        <Box>
                          <TextField fullWidth label="Tiêu đề mục (tuỳ chọn)" value={s.title||''} onChange={(e)=> setFormData(p=>{ const arr=[...p.sections]; arr[idx]={ ...arr[idx], title:e.target.value }; return { ...p, sections:arr }; })} sx={{ mb:1 }} />
                          <ReactQuill theme="snow" value={s.contentHtml||''} onChange={(val)=> setFormData(p=>{ const arr=[...p.sections]; arr[idx]={ ...arr[idx], contentHtml:val }; return { ...p, sections:arr }; })} style={{ height: 180 }} />
                          <Box sx={{ height: 12 }} />
                        </Box>
                      )}

                      {s.type === 'image_gallery' && (
                        <Box>
                          <TextField fullWidth label="Tiêu đề thư viện (tuỳ chọn)" value={s.title||''} onChange={(e)=> setFormData(p=>{ const arr=[...p.sections]; arr[idx]={ ...arr[idx], title:e.target.value }; return { ...p, sections:arr }; })} sx={{ mb:1 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ mb:1 }}>Thêm ảnh cho thư viện</Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {(s.data?.images||[]).map((img, ii) => (
                              <Box key={ii} sx={{ position:'relative', mr:1, mb:1 }}>
                                <Box component="img" src={resolveAssetUrl(img.url)} sx={{ width:120, height:80, objectFit:'cover', borderRadius:1, border:'1px solid #eee' }} />
                                <IconButton size="small" color="error" sx={{ position:'absolute', top:0, right:0 }} onClick={()=> setFormData(p=>{ const arr=[...p.sections]; const imgs=[...(arr[idx].data?.images||[])]; imgs.splice(ii,1); arr[idx]={ ...arr[idx], data:{ ...(arr[idx].data||{}), images: imgs } }; return { ...p, sections:arr }; })}><CloseIcon fontSize="small" /></IconButton>
                                <TextField size="small" placeholder="Chú thích" value={img.caption||''} onChange={(e)=> setFormData(p=>{ const arr=[...p.sections]; const imgs=[...(arr[idx].data?.images||[])]; imgs[ii] = { ...imgs[ii], caption: e.target.value }; arr[idx] = { ...arr[idx], data: { ...(arr[idx].data||{}), images: imgs } }; return { ...p, sections: arr }; })} sx={{ mt:0.5, width:120 }} />
                              </Box>
                            ))}
                          </Stack>
                          <Button variant="outlined" size="small" onClick={()=> { setSectionUploadIndex(idx); fileInputRef.current?.click(); }}>Thêm ảnh</Button>
                        </Box>
                      )}

                      {s.type === 'video' && (
                        <Stack spacing={1}>
                          <TextField fullWidth label="Tiêu đề video (tuỳ chọn)" value={s.title||''} onChange={(e)=> setFormData(p=>{ const arr=[...p.sections]; arr[idx]={ ...arr[idx], title:e.target.value }; return { ...p, sections:arr }; })} />
                          <TextField fullWidth label="Link video (YouTube/Vimeo/mp4)" value={s.data?.url||''} onChange={(e)=> setFormData(p=>{ const arr=[...p.sections]; arr[idx]={ ...arr[idx], data:{ ...(arr[idx].data||{}), url:e.target.value } }; return { ...p, sections:arr }; })} />
                        </Stack>
                      )}
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                />
              }
              label="Xuất bản ngay"
            />

            {editingLesson && (
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>Quiz liên quan</Typography>
                {attachedQuizzes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Chưa có quiz gắn với bài học này.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {attachedQuizzes.map(q => (
                      <Paper key={q.quiz_id} sx={{ p:1.5, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <Box>
                          <Typography fontWeight={600}>{q.title}</Typography>
                          <Typography variant="caption" color="text.secondary">ID: {q.quiz_id} • Thời lượng: {q.time_limit || 0} phút • {q.difficulty || '—'}</Typography>
                        </Box>
                        <Button size="small" variant="outlined" onClick={()=> window.open('/admin/quizzes', '_blank')}>Quản lý Quiz</Button>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            )}

            {/* Attached Quiz Section */}
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Tạo quiz đi kèm (tùy chọn)</Typography>
              <FormControlLabel
                control={<Switch checked={createQuiz} onChange={(e)=> setCreateQuiz(e.target.checked)} />}
                label={createQuiz ? 'Có' : 'Không'}
              />
            </Stack>
            {createQuiz && (
              <Box sx={{ p:2, border: '1px solid #eee', borderRadius: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Tiêu đề Quiz"
                      fullWidth
                      value={quizForm.title}
                      onChange={(e)=> setQuizForm({ ...quizForm, title: e.target.value })}
                      placeholder={`Quiz: ${formData.title}`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Thời lượng (phút)"
                      fullWidth
                      type="number"
                      value={quizForm.timeLimit}
                      onChange={(e)=> setQuizForm({ ...quizForm, timeLimit: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Mô tả Quiz"
                      fullWidth
                      multiline
                      minRows={2}
                      value={quizForm.description}
                      onChange={(e)=> setQuizForm({ ...quizForm, description: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Độ khó</InputLabel>
                      <Select
                        value={quizForm.difficulty}
                        label="Độ khó"
                        onChange={(e)=> setQuizForm({ ...quizForm, difficulty: e.target.value })}
                      >
                        <MenuItem value="Cơ bản">Cơ bản</MenuItem>
                        <MenuItem value="Trung bình">Trung bình</MenuItem>
                        <MenuItem value="Nâng cao">Nâng cao</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Typography variant="subtitle1" sx={{ mt:2, mb:1 }}>Câu hỏi</Typography>
                <Stack spacing={2}>
                  {quizForm.questions.map((q, qi) => (
                    <Paper key={qi} variant="outlined" sx={{ p:2 }}>
                      <Stack spacing={1}>
                        <TextField
                          label={`Câu hỏi ${qi+1}`}
                          fullWidth
                          value={q.questionText}
                          onChange={(e)=> updateQuizQuestion(qi, { questionText: e.target.value })}
                        />
                        <Grid container spacing={1}>
                          {q.options.map((opt, oi) => (
                            <Grid item xs={12} sm={6} key={oi}>
                              <TextField
                                size="small"
                                label={`Đáp án ${oi+1}`}
                                fullWidth
                                value={opt}
                                onChange={(e)=> updateQuizOption(qi, oi, e.target.value)}
                              />
                            </Grid>
                          ))}
                        </Grid>
                        <FormControl fullWidth size="small" sx={{ mt:1 }}>
                          <InputLabel>Đáp án đúng</InputLabel>
                          <Select
                            value={q.correctIndex}
                            label="Đáp án đúng"
                            onChange={(e)=> updateQuizQuestion(qi, { correctIndex: Number(e.target.value) })}
                          >
                            {q.options.map((_, oi) => (
                              <MenuItem key={oi} value={oi}>{`Đáp án ${oi+1}`}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ mt:1 }}>
                          <Button color="error" onClick={()=> removeQuizQuestion(qi)} disabled={quizForm.questions.length <= 1}>Xóa câu hỏi</Button>
                          <Button onClick={addQuizQuestion}>Thêm câu hỏi</Button>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingLesson ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inline Quiz Builder inside Dialog Content (inserted above actions) */}
    </Container>
  );
};

export default LessonsManagement;
