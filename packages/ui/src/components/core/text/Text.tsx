import { cx } from '../../../../panda/css';
import { textRecipe, type TextVariantProps } from '../../../design-system/recipes/text.recipe';

type TextHTMLProps = React.HTMLAttributes<HTMLElement>;

type TextElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';

export type TextProps = TextVariantProps &
  TextHTMLProps & { as?: TextElement };

export function Text(props: TextProps) {
  const [variantProps, localProps] = textRecipe.splitVariantProps(props);
  const { as: Component = 'p', className, ...restProps } = localProps;
  return <Component className={cx(textRecipe(variantProps), className)} {...restProps} />;
}