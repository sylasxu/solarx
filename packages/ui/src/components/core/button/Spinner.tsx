import React from 'react';
import { spinner } from '../../../../panda/recipes';
import { cx } from '../../../../panda/css';
import { splitVariantProps } from '../../../tools/helpers/splitVariantProps';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Spinner 的尺寸
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Spinner 的颜色方案
   */
  color?: 'primary' | 'secondary' | 'danger' | 'success';
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 自定义样式
   */
  style?: React.CSSProperties & {
    '--spinner-color'?: string;
    '--spinner-size'?: string;
    '--spinner-border-width'?: string;
  };
}

/**
 * Spinner 组件 - 用于显示加载状态
 */
export const Spinner: React.FC<SpinnerProps> = (props) => {
  // 分离样式变体和原生 props
  const [variantProps, otherProps] = splitVariantProps(props, spinner.variantKeys);
  const { size = 'md', color, className = '', style, ...rest } = otherProps;

  // 生成 spinner 样式类
  const spinnerClasses = spinner({ size, color });

  return (
    <div 
      className={cx(spinnerClasses, className)}
      style={style}
      aria-label="加载中"
      role="status"
      {...rest}
    />
  );
};

Spinner.displayName = 'Spinner';