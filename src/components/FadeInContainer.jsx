import React, { useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import useIsInView from '../hooks/useIsInView';

/**
 * FadeInContainer 컴포넌트
 * 뷰포트 진입 시 페이드인 + 이동 애니메이션 효과를 적용합니다.
 * 
 * Props:
 * @param {React.ReactNode} children - 애니메이션을 적용할 자식 요소들 [Required]
 * @param {'left' | 'right' | 'top' | 'bottom' | 'none'} direction - 애니메이션 시작 방향 [Optional, 기본값: 'bottom']
 * @param {number} offset - 시작 방향으로부터의 초기 오프셋 거리(px) [Optional, 기본값: 50]
 * @param {number} duration - 애니메이션 지속 시간(초) [Optional, 기본값: 0.5]
 * @param {number} delay - 애니메이션 시작 전 지연 시간(초) [Optional, 기본값: 0]
 * @param {boolean} once - 애니메이션을 한 번만 실행할지 여부 [Optional, 기본값: true]
 * @param {number} amount - 애니메이션 트리거를 위한 요소 노출 비율 (0 ~ 1) [Optional, 기본값: 0.3]
 * @param {string} className - 추가 CSS 클래스 [Optional]
 * 
 * Example usage:
 * <FadeInContainer direction="left" duration={0.7} delay={0.1}>
 *   <div>Content</div>
 * </FadeInContainer>
 */
function FadeInContainer({
  children,
  direction = 'bottom',
  offset = 50,
  duration = 0.5,
  delay = 0,
  once = true,
  amount = 0.3,
  className = '',
}) {
  const [viewportRef, isInView] = useIsInView({
    threshold: amount,
    triggerOnce: once,
  });

  const controls = useAnimation();

  const initialState = useMemo(
    () => ({
      opacity: 0,
      x: direction === 'left' ? -offset : direction === 'right' ? offset : 0,
      y: direction === 'top' ? -offset : direction === 'bottom' ? offset : 0,
    }),
    [direction, offset]
  );

  const finalState = useMemo(
    () => ({
      opacity: 1,
      x: 0,
      y: 0,
    }),
    []
  );

  useEffect(() => {
    if (isInView) {
      controls.start(finalState);
    } else if (!once) {
      controls.start(initialState);
    }
  }, [isInView, controls, initialState, finalState, once]);

  return (
    <motion.div
      ref={viewportRef}
      initial={initialState}
      animate={controls}
      transition={{
        duration,
        delay,
        ease: [0.4, 0.0, 0.2, 1],
      }}
      className={className}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
}

export default FadeInContainer;
