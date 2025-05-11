'use client'

import { useState } from "react";
import { Button ,Text,css,Badge,token,Container} from "solarx";

export default function Home() {

  const [s,ss] = useState('400')

  return (
  <>
  
   {token('colors.blue.200')}
        <Button label="12"  >Button</Button>
        <Text as="h2" className={css({
          fontSize:'blod',
          '--button-color': `colors.red.900`,
          // ^^^^^^^^^^^^  will be suggested
         
          
          // bgColor:'pink.900'
        }) 
        +` bg-[${token('colors.primary')}]`}>1111</Text>
        <Badge status="success">111</Badge>
  </>
       
   
  );
}
