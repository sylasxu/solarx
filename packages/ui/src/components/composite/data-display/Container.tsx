import { css } from '../../../../panda/css'
import { splitCssProps, styled } from '../../../../panda/jsx'
import type { HTMLStyledProps } from '../../../../panda/types'
 
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
 