import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import WhatIsVector from '../learning/machine-learning/vector/WhatIsVector';
import WhatIsPoint from '../learning/machine-learning/point/WhatIsPoint';
import WhatIsMinimaMaxima from '../learning/machine-learning/gradient-descent/WhatIsMinimaMaxima';
import WhatIsGradientDescent from '../learning/machine-learning/gradient-descent/WhatIsGradientDescent';
import WhatIsGradientDescentWithMomentum from '../learning/machine-learning/gradient-descent/WhatIsGradientDescentWithMomentum';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/learning/machine-learning/what-is-vector" element={<WhatIsVector />} />
      <Route path="/learning/machine-learning/what-is-point" element={<WhatIsPoint />} />
      <Route
        path="/learning/machine-learning/what-is-minima-maxima"
        element={<WhatIsMinimaMaxima />}
      />
      <Route
        path="/learning/machine-learning/what-is-gradient-descent"
        element={<WhatIsGradientDescent />}
      />
      <Route
        path="/learning/machine-learning/what-is-gradient-descent-with-momentum"
        element={<WhatIsGradientDescentWithMomentum />}
      />
    </Routes>
  );
}

export default AppRoutes;
