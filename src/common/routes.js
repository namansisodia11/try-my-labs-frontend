import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import WhatIsVector from '../learning/machine-learning/vector/WhatIsVector';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/learning/machine-learning/what-is-vector" element={<WhatIsVector />} />
    </Routes>
  );
}

export default AppRoutes;
