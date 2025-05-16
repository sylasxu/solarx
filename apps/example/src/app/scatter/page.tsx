'use client'
import { useEffect, useMemo, useRef, useState } from "react";
import { NebulaRenderer ,NebulaRendererRef, Point} from "solarx-chart";
function App() {

  const renderer = useRef<NebulaRendererRef>(null)
  const containerRef = useRef<HTMLDivElement>(null);
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
    // 初始化尺寸
    handleResize();
    // 监听容器尺寸变化
    const resizeObserver = new ResizeObserver(handleResize);
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
      <div className='text-blod'>
            {' '}
            总数据数量：
            {data.length}
          </div>
          <div className='text-blod'>
            {' '}
            优化后实际实际渲染点数量：
            { renderer.current?.getVisiblePointsLength()} 
          </div>

         
                      当前缩放
                      {parseFloat(`${renderer.current?.getTransformK()}`).toFixed(2)} 倍
                      <div>
                        可见区域为: [{renderer.current?.getVisibleArea().x1.toFixed(0)} , {renderer.current?.getVisibleArea().y1.toFixed(0)} ] →
                        [{renderer.current?.getVisibleArea().x2.toFixed(0)} , {renderer.current?.getVisibleArea().y2.toFixed(0)} ]
                      </div>
            
    </div>
  );
}

export default App;