import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import WhatIsVector from '../learning/machine-learning/vector/WhatIsVector';
import WhatIsPoint from '../learning/machine-learning/point/WhatIsPoint';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/learning/machine-learning/what-is-vector" element={<WhatIsVector />} />
      <Route path="/learning/machine-learning/what-is-point" element={<WhatIsPoint />} />
    </Routes>
  );
}

export default AppRoutes;
