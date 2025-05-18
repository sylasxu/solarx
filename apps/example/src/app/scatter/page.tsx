"use client";
import { log } from "console";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { NebulaRenderer, NebulaRendererRef, Point } from "solarx-chart";
function App() {
  const renderer = useRef<NebulaRendererRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const generatePoints = (count: number): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.max(Math.abs(0.7 - Math.random()) * dimensions.width, 20);
      points.push({
        id: `${i}`,
        x,
        y: Math.max(Math.abs(0.7 - Math.random()) * dimensions.height, 20),
        r: 5,
      });
    }
    return points;
  };
  const [pointCount, setPointCount] = useState(10000);
  const data = useMemo(() => generatePoints(pointCount), [pointCount]);
  const [k,setK]=useState(1)
  // 窗口大小变化处理
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (!containerRef.current) return;
  //     const { clientWidth, clientHeight } = containerRef.current;
  //     setDimensions({
  //       width: clientWidth,
  //       height: clientHeight,
  //     });
  //   };

  //   if(!containerRef.current)return ;
  //   // 防抖优化
  //   // 初始化尺寸
  //   handleResize();
  //   // 监听容器尺寸变化
  //   const resizeObserver = new ResizeObserver(handleResize);
  //   resizeObserver.observe(containerRef.current);

  //   return () => {
  //     resizeObserver.disconnect();
  //   };
  // }, []);
 console.log("!1",renderer?.current?.getTransformK())
  useLayoutEffect(()=>{
    if(renderer.current){
     
      setK(renderer.current.getTransformK())
    }
  },[renderer.current])
  return (
    <div ref={containerRef} className="App">
      <button
        onClick={() => {
          if (!renderer.current) return;
          renderer.current?.reset();
        }}
      >
        重置{" "}
      </button>
      <NebulaRenderer
        data={data}
        ref={renderer}
        width={dimensions.width}
        height={dimensions.height}
      />
      <div className="text-blod">
        {" "}
        总数据数量：
        {data.length}
      </div>
      <div className="text-blod">
        {" "}
        优化后实际实际渲染点数量：
        {renderer.current?.getVisiblePointsLength()}
      </div>
      当前缩放

      {parseFloat(`${k}`).toFixed(2)} 倍
      <div>
        可见区域为: [{renderer.current?.visibleArea.x1.toFixed(0)} ,{" "}
        {renderer.current?.visibleArea.y1.toFixed(0)} ] → [
        {renderer.current?.visibleArea.x2.toFixed(0)} ,{" "}
        {renderer.current?.visibleArea.y2.toFixed(0)} ]
      </div>
    </div>
  );
}

export default App;
