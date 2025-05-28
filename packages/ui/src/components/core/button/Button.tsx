import type React from 'react';
import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { button } from '../../../../panda/recipes';
import type { ButtonVariantProps } from '../../../design-system/recipes/button.recipe';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
  /** 是否显示加载状态 */
  isLoading?: boolean;
  /** 加载状态下的文本 */
  loadingText?: string;
  /** 自定义类名 */
  className?: string;
  /** 自定义样式，支持 CSS 变量 */
  style?: React.CSSProperties & {
    '--button-bg'?: string;
    '--button-color'?: string;
    '--button-hover-bg'?: string;
    '--button-active-bg'?: string;
    '--button-border-color'?: string;
    '--button-height'?: string;
    '--button-padding'?: string;
    '--button-font-size'?: string;
    '--button-border-radius'?: string;
    '--button-gap'?: string;
    '--button-focus-color'?: string;
  };
}

// 简单的加载指示器组件
const LoadingSpinner = () => (
  <svg
    className="animate-spin"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="32"
      strokeDashoffset="32"
    >
      <animate
        attributeName="stroke-dasharray"
        dur="2s"
        values="0 32;16 16;0 32;0 32"
        repeatCount="indefinite"
      />
      <animate
        attributeName="stroke-dashoffset"
        dur="2s"
        values="0;-16;-32;-32"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    // 使用 splitVariantProps 分离样式变体和原生 props
    const [variantProps, restProps] = button.splitVariantProps(props);
    const {
      children,
      leftIcon,
      rightIcon,
      isLoading = false,
      loadingText,
      className = '',
      disabled,
      ...htmlProps
    } = restProps;

    // 生成按钮样式类名
    const buttonClasses = button({ ...variantProps });

    // 确定是否禁用
    const isDisabled = disabled || isLoading;

    // 确定显示的内容
    const displayText = isLoading && loadingText ? loadingText : children;
    const showLeftIcon = isLoading ? <LoadingSpinner /> : leftIcon;
    const showRightIcon = isLoading ? null : rightIcon;

    return (
      <button
        ref={ref}
        className={`${buttonClasses} ${className}`}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        {...htmlProps}
      >
        {showLeftIcon && <span className="button-icon">{showLeftIcon}</span>}
        {displayText && <span className="button-text">{displayText}</span>}
        {showRightIcon && <span className="button-icon">{showRightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
