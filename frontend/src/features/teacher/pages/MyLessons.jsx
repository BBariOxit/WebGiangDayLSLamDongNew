import React from 'react';
import LessonsManagement from '../../admin/pages/LessonsManagement';

// Teacher sử dụng cùng component với Admin
// Backend đã filter theo created_by cho Teacher role
const MyLessons = () => {
  return <LessonsManagement />;
};

export default MyLessons;
