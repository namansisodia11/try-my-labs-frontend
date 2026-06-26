import { useEffect, useState } from 'react';

function useMathJax() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.MathJax) {
      window.MathJax.typesetPromise().then(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  return ready;
}

export default useMathJax;
