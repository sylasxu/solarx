'use client'
import { useRef, useState } from "react";
import { NebulaRenderer ,NebulaRendererRef} from "solarx-chart";
function App() {

  const renderer = useRef<NebulaRendererRef>(null)
  
  return (
    <div className="App">
  <button onClick={()=>{
    if(!renderer.current)
      return;
    renderer.current?.reset()
  }}>重置 </button>
  
      <NebulaRenderer  ref={renderer}
      />
    </div>
  );
}

export default App;