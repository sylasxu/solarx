import './button.css';
import { css as cssFunction, Styles } from  '../../../../styled-system/css';
import { motion } from 'motion/react';
import { useRef } from 'react';

interface ButtonProps {
  primary?: boolean;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
  label: string;
  css?: Styles
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
  css,
  ...props
}: ButtonProps) => {
  const ref = useRef(null);


  return (
    <motion.button
      {...props}
      ref={ref}
      className={cssFunction({
        
        bg: backgroundColor||'primary',
        color: 'white',
        px: 4,
        py: 2,
        rounded: 'md',
        cursor: 'pointer'
      },css)}
      whileTap={{ scale: 0.95 }}
    >
      {props.children}
    </motion.button>
  );
};