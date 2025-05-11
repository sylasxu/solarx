import { cva, type RecipeVariantProps } from '../../../panda/css';

export const textRecipe = cva({
  base: {
    color: 'gray.800',
    backgroundColor: 'var(--button-color)'
  },
  variants: {
    level: {
      h1: {
        textStyle: 'headline1',
      },
      h2: {
        textStyle: 'headline2',
      },
    },
  },
});

export type TextVariantProps = RecipeVariantProps<typeof textRecipe>;