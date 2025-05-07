import './button.css';
import { css } from  '../../../../styled-system/css';
import { motion } from 'motion/react';
import { useRef } from 'react';

interface ButtonProps {
  primary?: boolean;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
  label: string;
  onClick?: () => void;
  children:React.ReactNode
}

/**
 * @aiComponent
 * @category Basic
 * @description 带动画效果的通用按钮
 */
export const Button = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  ...props
}: ButtonProps) => {
  const ref = useRef(null);


  return (
    <motion.button
      {...props}
      ref={ref}
      className={css({
        bg: 'primary',
        color: 'white',
        px: 4,
        py: 2,
        rounded: 'md',
        cursor: 'pointer'
      })}
      whileTap={{ scale: 0.95 }}
    >
      {props.children}
    </motion.button>
  );
};