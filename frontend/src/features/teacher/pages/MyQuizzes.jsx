import React from 'react';
import QuizzesManagement from '../../admin/pages/QuizzesManagement';

// Teacher sử dụng cùng component với Admin
// Backend đã filter theo created_by cho Teacher role
const MyQuizzes = () => {
  return <QuizzesManagement />;
};

export default MyQuizzes;
