import { defineRecipe } from '@pandacss/dev';

export const buttonRecipe = defineRecipe({
  className: 'button',
  description: '高度可定制的按钮组件，使用 CSS 变量实现核心定制功能',
  base: {
    // 基础布局
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    whiteSpace: 'nowrap',
    userSelect: 'none',

    // 核心样式变量
    backgroundColor: 'var(--button-bg)',
    color: 'var(--button-color)',
    border: 'var(--button-border, none)',
    borderRadius: 'var(--button-border-radius, {radii.md})',
    fontSize: 'var(--button-font-size)',
    fontWeight: 'var(--button-font-weight, {fontWeights.medium})',
    height: 'var(--button-height)',
    minWidth: 'var(--button-min-width)',
    padding: 'var(--button-padding)',
    gap: 'var(--button-gap)',

    // 交互样式
    cursor: 'pointer',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

    // 状态样式
    _hover: {
      backgroundColor: 'var(--button-hover-bg, var(--button-bg))',
      color: 'var(--button-hover-color, var(--button-color))',
      borderColor:
        'var(--button-hover-border-color, var(--button-border-color))',
      _disabled: {
        backgroundColor: 'var(--button-bg)',
        color: 'var(--button-color)',
      },
    },

    _active: {
      backgroundColor:
        'var(--button-active-bg, var(--button-hover-bg, var(--button-bg)))',
      color:
        'var(--button-active-color, var(--button-hover-color, var(--button-color)))',
    },

    _focus: {
      outline: '2px solid var(--button-focus-color, {colors.primary.500})',
      outlineOffset: '2px',
    },

    _disabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },

    _loading: {
      cursor: 'default',
      pointerEvents: 'none',
      opacity: 0.6,
    },
  },
  variants: {
    variant: {
      solid: {
        '--button-bg': '{colors.primary.500}',
        '--button-color': '{colors.white}',
        '--button-hover-bg': '{colors.primary.600}',
        '--button-active-bg': '{colors.primary.700}',
      },
      outline: {
        '--button-bg': 'transparent',
        '--button-color': '{colors.primary.500}',
        '--button-border': '1px solid {colors.primary.500}',
        '--button-hover-bg': '{colors.primary.50}',
        '--button-active-bg': '{colors.primary.100}',
      },
      ghost: {
        '--button-bg': 'transparent',
        '--button-color': '{colors.primary.500}',
        '--button-hover-bg': '{colors.primary.50}',
        '--button-active-bg': '{colors.primary.100}',
      },
      link: {
        '--button-bg': 'transparent',
        '--button-color': '{colors.primary.500}',
        '--button-height': 'auto',
        '--button-padding': '0',
        _hover: {
          textDecoration: 'underline',
        },
      },
    },
    size: {
      xs: {
        '--button-height': '{sizes.8}',
        '--button-min-width': '{sizes.8}',
        '--button-font-size': '{fontSizes.xs}',
        '--button-padding': '0 {spacing.3}',
        '--button-gap': '{spacing.1}',
      },
      sm: {
        '--button-height': '{sizes.9}',
        '--button-min-width': '{sizes.9}',
        '--button-font-size': '{fontSizes.sm}',
        '--button-padding': '0 {spacing.3.5}',
        '--button-gap': '{spacing.1.5}',
      },
      md: {
        '--button-height': '{sizes.10}',
        '--button-min-width': '{sizes.10}',
        '--button-font-size': '{fontSizes.md}',
        '--button-padding': '0 {spacing.4}',
        '--button-gap': '{spacing.2}',
      },
      lg: {
        '--button-height': '{sizes.11}',
        '--button-min-width': '{sizes.11}',
        '--button-font-size': '{fontSizes.lg}',
        '--button-padding': '0 {spacing.4.5}',
        '--button-gap': '{spacing.2.5}',
      },
      xl: {
        '--button-height': '{sizes.12}',
        '--button-min-width': '{sizes.12}',
        '--button-font-size': '{fontSizes.xl}',
        '--button-padding': '0 {spacing.5}',
        '--button-gap': '{spacing.3}',
      },
    },
    colorScheme: {
      primary: {
        '--button-focus-color': '{colors.primary.500}',
      },
      secondary: {
        '--button-bg': '{colors.secondary.500}',
        '--button-hover-bg': '{colors.secondary.600}',
        '--button-active-bg': '{colors.secondary.700}',
        '--button-focus-color': '{colors.secondary.500}',
      },
      danger: {
        '--button-bg': '{colors.red.500}',
        '--button-hover-bg': '{colors.red.600}',
        '--button-active-bg': '{colors.red.700}',
        '--button-focus-color': '{colors.red.500}',
      },
      success: {
        '--button-bg': '{colors.green.500}',
        '--button-hover-bg': '{colors.green.600}',
        '--button-active-bg': '{colors.green.700}',
        '--button-focus-color': '{colors.green.500}',
      },
    },
    isFullWidth: {
      true: {
        width: '100%',
      },
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
    colorScheme: 'primary',
  },
});

// 手动定义类型，而不是从 @pandacss/dev 导入
export type ButtonVariantProps = {
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  colorScheme?: 'primary' | 'secondary' | 'danger' | 'success';
  isFullWidth?: boolean;
};
