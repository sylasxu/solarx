import { styled } from "../../../../panda/jsx"
import { cva } from "../../../../panda/css"

export const badge = cva({
  base: {
    fontWeight: 'medium',
    borderRadius: 'md',
  },
  variants: {
    status: {
      default: {
        color: 'white',
        bg: '#456543',
      },
      success: {
        color: 'white',
        bg: 'green.500',
      },
    },
  }
})

export const Badge = styled('span', badge)
