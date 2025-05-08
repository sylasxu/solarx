import { css } from '../../../../styled-system/css'
import { splitCssProps, styled } from '../../../../styled-system/jsx'
import type { HTMLStyledProps } from '../../../../styled-system/types'
 
export const Container=(props: HTMLStyledProps<'div'>)=> {
  const [cssProps, restProps] = splitCssProps(props)
  const { css: cssProp, ...styleProps } = cssProps
 
  const className = css(
    { display: 'flex', height: '20', width: '20' },
    styleProps,
    cssProp
  )
 
  return <div {...restProps} className={className} />
}
 