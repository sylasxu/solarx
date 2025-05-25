import { defineRecipe } from '@pandacss/dev'

export const buttonRecipe = defineRecipe({
  className: 'button',
  description: '按钮组件的样式配置',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'md',
    fontWeight: 'medium',
    transition: 'all 0.2s',
    cursor: 'pointer',
    outline: 'none',
    position: 'relative',
    whiteSpace: 'nowrap',
    _disabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },
    _hover: {
      _disabled: {
        bg: 'initial',
      },
    },
  },
  variants: {
    variant: {
      solid: {
        bg: 'var(--button-bg, {colors.primary.500})',
        color: 'var(--button-color, {colors.white})',
        _hover: {
          bg: 'var(--button-hover-bg, {colors.primary.600})',
        },
        _active: {
          bg: 'var(--button-active-bg, {colors.primary.700})',
        },
      },
      outline: {
        bg: 'transparent',
        borderWidth: '1px',
        borderColor: 'var(--button-border-color, {colors.primary.500})',
        color: 'var(--button-color, {colors.primary.500})',
        _hover: {
          bg: 'var(--button-hover-bg, {colors.primary.50})',
        },
        _active: {
          bg: 'var(--button-active-bg, {colors.primary.100})',
        },
      },
      ghost: {
        bg: 'transparent',
        color: 'var(--button-color, {colors.primary.500})',
        _hover: {
          bg: 'var(--button-hover-bg, {colors.primary.50})',
        },
        _active: {
          bg: 'var(--button-active-bg, {colors.primary.100})',
        },
      },
      link: {
        bg: 'transparent',
        color: 'var(--button-color, {colors.primary.500})',
        height: 'auto',
        padding: 0,
        _hover: {
          textDecoration: 'underline',
        },
      },
    },
    size: {
      xs: {
        h: '8',
        minW: '8',
        fontSize: 'xs',
        px: '3',
        gap: '1',
      },
      sm: {
        h: '9',
        minW: '9',
        fontSize: 'sm',
        px: '3.5',
        gap: '1.5',
      },
      md: {
        h: '10',
        minW: '10',
        fontSize: 'md',
        px: '4',
        gap: '2',
      },
      lg: {
        h: '11',
        minW: '11',
        fontSize: 'lg',
        px: '4.5',
        gap: '2.5',
      },
      xl: {
        h: '12',
        minW: '12',
        fontSize: 'xl',
        px: '5',
        gap: '3',
      },
    },
    colorScheme: {
      primary: {
        '--button-bg': '{colors.primary.500}',
        '--button-color': '{colors.white}',
        '--button-hover-bg': '{colors.primary.600}',
        '--button-active-bg': '{colors.primary.700}',
        '--button-border-color': '{colors.primary.500}',
      },
      secondary: {
        '--button-bg': '{colors.secondary.500}',
        '--button-color': '{colors.white}',
        '--button-hover-bg': '{colors.secondary.600}',
        '--button-active-bg': '{colors.secondary.700}',
        '--button-border-color': '{colors.secondary.500}',
      },
      danger: {
        '--button-bg': '{colors.red.500}',
        '--button-color': '{colors.white}',
        '--button-hover-bg': '{colors.red.600}',
        '--button-active-bg': '{colors.red.700}',
        '--button-border-color': '{colors.red.500}',
      },
      success: {
        '--button-bg': '{colors.green.500}',
        '--button-color': '{colors.white}',
        '--button-hover-bg': '{colors.green.600}',
        '--button-active-bg': '{colors.green.700}',
        '--button-border-color': '{colors.green.500}',
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
})
