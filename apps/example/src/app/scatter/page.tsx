'use client'
import { useEffect, useMemo, useRef, useState } from "react";
import { NebulaRenderer ,NebulaRendererRef, Point} from "solarx-chart";
function App() {

  const renderer = useRef<NebulaRendererRef>(null)
  const containerRef = useRef<HTMLDivElement>(null);
  const generatePoints = (count: number): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
      const x = Math.max(Math.abs((0.7 - Math.random())) * dimensions.width, 20);
      points.push({
        id: `${i}`,
        x,
        y: Math.min(Math.abs((0.7 - Math.random())) * dimensions.height, x),
        r: Math.floor(Math.max(Math.random() * dimensions.height / 120, 5)),
      });
    }
    return points;
  };
  const [pointCount, setPointCount] = useState(1000);
  const data = useMemo(() => generatePoints(pointCount), [pointCount]);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  // 窗口大小变化处理
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      console.log('containerRef.current', containerRef.current.clientHeight);

      const { clientWidth, clientHeight } = containerRef.current;
      setDimensions({
        width: clientWidth,
        height: clientHeight,
      });
    };

    // 防抖优化
    const debouncedResize = debounce(handleResize, 100);
    // 初始化尺寸
    handleResize();
    // 监听容器尺寸变化
    const resizeObserver = new ResizeObserver(debouncedResize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  return (
    <div className="App">
  <button onClick={()=>{
    if(!renderer.current)
      return;
    renderer.current?.reset()
  }}>重置 </button>
  
  <NebulaRenderer data={data} ref={renderer} width={dimensions.width} height={dimensions.height}
      />
      
    </div>
  );
}

export default App;