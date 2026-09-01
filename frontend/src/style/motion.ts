// Variantes e transições compartilhadas do framer-motion.
//
// A ideia é que toda tela entre com o mesmo ritmo: containers escalonam os
// filhos, filhos sobem e aparecem. Assim a navegação inteira tem uma cadência
// reconhecível em vez de cada página inventar a sua.

import type { Transition, Variants } from 'framer-motion';

export const spring: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
  mass: 0.8,
};

export const softSpring: Transition = {
  type: 'spring',
  stiffness: 180,
  damping: 24,
};

export const snappy: Transition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],
};

/** Container que escalona a entrada dos filhos. */
export const staggerContainer = (stagger = 0.06, delay = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/** Item padrão: sobe e aparece. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: spring },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: snappy },
};

/** Cards que nascem com um leve pop. */
export const popIn: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: spring },
};

/** Transição entre telas. */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18, ease: [0.65, 0, 0.35, 1] } },
};

/** Hover/tap padrão de qualquer coisa clicável. */
export const pressable = {
  whileHover: { y: -4, scale: 1.015 },
  whileTap: { scale: 0.97 },
  transition: spring,
};
