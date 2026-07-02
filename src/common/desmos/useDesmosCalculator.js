import { useEffect, useRef } from 'react';

const DESMOS_SCRIPT_ID = 'desmos-script';
const DESMOS_SCRIPT_SRC =
  'https://www.desmos.com/api/v1.9/calculator.js?apiKey=63bf3722472543709cad20a4196e40c9';

// onReady: (calculator, Desmos) => void, called once the calculator is created
function useDesmosCalculator(containerRef, onReady, options) {
  const calculatorRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    function init() {
      if (cancelled || !window.Desmos || !containerRef.current) return;
      const Desmos = window.Desmos;
      const calculator = Desmos.GraphingCalculator(containerRef.current, {
        expressions: false,
        settingsMenu: false,
        zoomButtons: false,
        lockViewport: false,
        border: false,
        ...options,
      });
      calculatorRef.current = calculator;
      onReady(calculator, Desmos);
    }

    let poll;

    if (window.Desmos) {
      init();
    } else {
      if (!document.getElementById(DESMOS_SCRIPT_ID)) {
        const script = document.createElement('script');
        script.id = DESMOS_SCRIPT_ID;
        script.src = DESMOS_SCRIPT_SRC;
        script.async = true;
        script.onload = init;
        document.head.appendChild(script);
      } else {
        // Script tag exists but hasn't fired onload yet — poll briefly
        poll = setInterval(() => {
          if (window.Desmos) {
            clearInterval(poll);
            init();
          }
        }, 100);
      }
    }

    return () => {
      cancelled = true;
      if (poll) clearInterval(poll);
      if (calculatorRef.current) calculatorRef.current.destroy();
      calculatorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return calculatorRef;
}

export default useDesmosCalculator;
