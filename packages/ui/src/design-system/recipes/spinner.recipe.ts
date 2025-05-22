import { defineRecipe } from '@pandacss/dev'

export const spinnerRecipe = defineRecipe({
  className: 'spinner',
  description: '加载指示器组件的样式配置',
  base: {
    display: 'inline-block',
    borderStyle: 'solid',
    borderRadius: '50%',
    borderColor: 'var(--spinner-color, currentColor)',
    borderTopColor: 'transparent',
    animation: 'spin 0.7s linear infinite',
    '@keyframes spin': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
  },
  variants: {
    size: {
      xs: {
        width: 'var(--spinner-size, 0.75rem)',
        height: 'var(--spinner-size, 0.75rem)',
        borderWidth: 'var(--spinner-border-width, 1.5px)',
      },
      sm: {
        width: 'var(--spinner-size, 1rem)',
        height: 'var(--spinner-size, 1rem)',
        borderWidth: 'var(--spinner-border-width, 2px)',
      },
      md: {
        width: 'var(--spinner-size, 1.5rem)',
        height: 'var(--spinner-size, 1.5rem)',
        borderWidth: 'var(--spinner-border-width, 2px)',
      },
      lg: {
        width: 'var(--spinner-size, 2rem)',
        height: 'var(--spinner-size, 2rem)',
        borderWidth: 'var(--spinner-border-width, 3px)',
      },
      xl: {
        width: 'var(--spinner-size, 3rem)',
        height: 'var(--spinner-size, 3rem)',
        borderWidth: 'var(--spinner-border-width, 4px)',
      },
    },
    color: {
      primary: {
        '--spinner-color': '{colors.primary.500}',
      },
      secondary: {
        '--spinner-color': '{colors.secondary.500}',
      },
      danger: {
        '--spinner-color': '{colors.red.500}',
      },
      success: {
        '--spinner-color': '{colors.green.500}',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});