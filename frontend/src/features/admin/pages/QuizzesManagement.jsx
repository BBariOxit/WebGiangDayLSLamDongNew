import React from 'react';
import AdminCreateQuiz from '../../../pages/admin/AdminCreateQuiz.jsx';

/**
 * View wrapper to keep existing /admin/quizzes route working while
 * reusing the new Tailwind/shadcn-based quiz builder.
 */
const QuizzesManagement = () => {
  return <AdminCreateQuiz />;
};

export default QuizzesManagement;
