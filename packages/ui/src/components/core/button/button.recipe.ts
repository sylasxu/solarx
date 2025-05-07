import { defineRecipe } from "@pandacss/dev";

export const buttonRecipe = defineRecipe({
    className: 'btn',
    base: {
      /* 基础样式 */
    },
    variants: {
      variant: {
        primary: { /* 主样式 */ },
        danger: { /* 错误状态 */ }
      }
    },
    defaultVariants: {
      variant: 'primary'
    }
  });