import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import WhatIsVector from '../learning/machine-learning/vector/WhatIsVector';
import WhatIsPoint from '../learning/machine-learning/point/WhatIsPoint';
import WhatIsMinimaMaxima from '../learning/machine-learning/gradient-descent/WhatIsMinimaMaxima';
import WhatIsMinimaMaximaV2 from '../learning/machine-learning/gradient-descent/WhatIsMinimaMaximaV2';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/learning/machine-learning/what-is-vector" element={<WhatIsVector />} />
      <Route path="/learning/machine-learning/what-is-point" element={<WhatIsPoint />} />
      <Route path="/learning/machine-learning/what-is-minima-maxima" element={<WhatIsMinimaMaxima />} />
      <Route path="/learning/machine-learning/what-is-minima-maxima-v2" element={<WhatIsMinimaMaximaV2 />} />
    </Routes>
  );
}

export default AppRoutes;
