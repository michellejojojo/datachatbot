import { useState, useEffect, useRef } from 'react';

/**
 * 요소가 뷰포트에 진입했는지 감지하는 커스텀 훅
 * 
 * @param {Object} options - IntersectionObserver 옵션
 * @param {number} options.threshold - 트리거 비율 (0 ~ 1) [Optional, 기본값: 0.3]
 * @param {boolean} options.triggerOnce - 한 번만 트리거할지 여부 [Optional, 기본값: true]
 * @returns {Array} [ref, isInView] - 요소에 연결할 ref와 뷰포트 진입 여부
 * 
 * Example usage:
 * const [ref, isInView] = useIsInView({ threshold: 0.5 });
 * <div ref={ref}>{isInView ? 'Visible' : 'Hidden'}</div>
 */
function useIsInView({ threshold = 0.3, triggerOnce = true } = {}) {
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!triggerOnce || !hasTriggered) {
            setIsInView(true);
            if (triggerOnce) {
              setHasTriggered(true);
            }
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, triggerOnce, hasTriggered]);

  return [ref, isInView];
}

export default useIsInView;
