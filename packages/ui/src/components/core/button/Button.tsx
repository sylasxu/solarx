import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import {  button, type ButtonVariant } from '../../../../panda/recipes';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariant {

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties & {
    '--button-bg'?: string;
    '--button-color'?: string;
    '--button-hover-bg'?: string;
    '--button-active-bg'?: string;
    '--button-border-color'?: string;
  };
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    // 使用 splitVariantProps 分离样式变体和原生 props
    const [variantProps, restProps] = button.splitVariantProps(props);
    const {
      children,
      leftIcon,
      rightIcon,
      className = '',
      ...htmlProps
    } = restProps;

    // 生成按钮样式类名
    const buttonClasses = button({ ...variantProps });

    return (
      <button
        ref={ref}
        className={`${buttonClasses} ${className}`}
        disabled={htmlProps.disabled}
        {...htmlProps}
      >
       
        {leftIcon  && <span>{leftIcon}</span>}
        {children}
        {rightIcon  && <span>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';