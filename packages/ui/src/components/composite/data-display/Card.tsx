
import { cva } from "../../../../styled-system/css";

const cardStyle = cva({
    base: {
      p: 4,
      borderRadius: 'lg',
      boxShadow: 'md'
    },
    variants: {
      variant: {
        elevated: { bg: 'white', shadow: 'xl' },
        outline: { border: '1px solid {colors.gray.200}' }
      }
    }
  });
  
  export const Card = ({ variant, children }:any) => (
    <div className={cardStyle({ variant})}>
      {children}
    </div>
  );