import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { buttonRecipe as button } from '../../../design-system/recipes/button.recipe';
import { Spinner } from './Spinner'; // 假设您有一个 Spinner 组件

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  colorScheme?: 'primary' | 'secondary' | 'danger' | 'success';
  isFullWidth?: boolean;
  isLoading?: boolean;
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
      isLoading,
      leftIcon,
      rightIcon,
      className = '',
      ...htmlProps
    } = restProps;

    // 生成按钮样式类名
    const buttonClasses = button({ ...variantProps, isLoading });

    return (
      <button
        ref={ref}
        className={`${buttonClasses} ${className}`}
        disabled={isLoading || htmlProps.disabled}
        {...htmlProps}
      >
        {isLoading && (
          <span className="button-spinner">
            <Spinner size={variantProps.size === 'xs' || variantProps.size === 'sm' ? 'sm' : 'md'} />
          </span>
        )}
        {leftIcon && !isLoading && <span>{leftIcon}</span>}
        {children}
        {rightIcon && !isLoading && <span>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';