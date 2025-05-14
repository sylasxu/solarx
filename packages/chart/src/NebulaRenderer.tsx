import React, { useRef, useEffect, useCallback, useImperativeHandle, useMemo, forwardRef, useState } from 'react';
import { brush, zoom, max, interpolateRound, select, zoomIdentity, axisBottom, axisLeft, scaleLinear } from 'd3';
import { log } from 'console';

type Point = {
  x: number;
  y: number;
  id: string
};

interface NebulaRendererProps {
  width?: number;
  height?: number;
  zoomExtent?: [number, number]
  axisColor?: string;      // 轴线颜色
  tickColor?: string;      // 刻度线颜色
  labelColor?: string;     // 标签颜色
}

export interface NebulaRendererRef {
  reset: () => void;

}

const generatePoints = (count: number): Point[] => {
  const points: Point[] = [];
  for (let i = 0; i < count; i++) {
    points.push({
      id: i + '',
      x: Math.max(Math.random() * 840,150),
      y: Math.random() * 400,
    });
  }
  return points;
};

const data = generatePoints(1000);
const r = 5

const NebulaRenderer = forwardRef<NebulaRendererRef, NebulaRendererProps>(({
  width = 840,
  height = 640,
  zoomExtent = [0.01, 100] as [number, number],
  axisColor = '#999',
  tickColor = '#666',
  labelColor = '#333',
}, ref) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);
  const brushRef = useRef<SVGGElement>(null);
  const [isBrushing, setIsBrushing] = useState(false);
  const [brushActive, setBrushActive] = useState(false);
  const transformRef = useRef<d3.ZoomTransform>(zoomIdentity);
  const [selectedId, setSelectedId] = useState<string | null>('');
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  // 获取当前可见区域
  const visibleArea = useMemo(() => {
    const { k, x: tx, y: ty } = transformRef.current;
    return {
      x1: Math.max(0, -tx / k),
      x2: Math.min(width, (width - tx) / k),
      y1: Math.max(0, -ty / k),
      y2: Math.min(height, (height - ty) / k)
    };
  }, [transformRef.current, width, height]);


  // 绘制函数
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.save();
    // ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const visiblePoints = data.filter(p =>
      p.x >= visibleArea.x1 && p.x <= visibleArea.x2 &&
      p.y >= visibleArea.y1 && p.y <= visibleArea.y2
    );

    // 绘制所有点应用当前变换

    for (const d of visiblePoints) {


      const [x, y] = transformRef.current.apply([d.x, d.y]);


      ctx.beginPath();
      ctx.arc(x, y, r * transformRef.current.k, 0, Math.PI * 2);

      // 选中状态
      if (d.id === selectedId) {
        ctx.fillStyle = '#ff0000';
      }
      // Hover状态
      else if (hoveredPoint && d.id === hoveredPoint.id) {
        ctx.fillStyle = '#00ff00';
      }
      // 普通状态
      else {
        if(selectedId){
ctx.fillStyle = 'rgba(31, 119, 180,.1)'
        }
        else ctx.fillStyle = 'rgba(31, 119, 180,.6)';
      }
      ctx.fill();
    }


    ctx.restore()

  }, [visibleArea,selectedId,hoveredPoint]);


  const zoomBehavior = useMemo(() => {
    return zoom<any, any>()
      .scaleExtent(zoomExtent)
      .filter(event => event.type === 'wheel')
      .on('zoom', ({ transform }) => {
        transformRef.current = transform;
        draw();
        updateAxes()
      });
  }, [zoomExtent])

  // 初始化刷选工具
  const initBrush = useCallback(() => {
    if (!brushRef.current || !svgRef.current) return;

    // 优化：对move防抖
    const brushBehavior = brush<SVGSVGElement>()
      .extent([[0, 0], [width, height]])
      .on('start', () => {
        console.log("brush start");
        
        setIsBrushing(true)
        // setHoveredPoint(null); // 刷选时禁用hover
      })
      // .on('brush', (event) => {
      //   if (!event.selection) return;
      //   setHoveredPoint(null);
      // })
      .on('end', (event) => {
       
        setIsBrushing(false);
        if (!event.selection) return;
 console.log("brush end");
        const [[x0, y0], [x1, y1]] = event.selection;
        const svg = svgRef.current;
        if (!svg) return;

        // 清除刷选区域
        select(brushRef.current).call(brushBehavior.move as any, null);

        // 计算目标区域和缩放参数
        const targetWidth = x1 - x0;
        const targetHeight = y1 - y0;
        const scaleX = width / targetWidth;
        const scaleY = height / targetHeight;
        const scale = Math.min(scaleX, scaleY) * 0.9; // 留10%边距

        const translateX = -x0 * scale;
        const translateY = -y0 * scale;

        // 应用新变换
        const newTransform = zoomIdentity
          .translate(translateX, translateY)
          .scale(scale);

        select(canvasRef.current)
          .transition()
          .duration(500)
          .call(zoomBehavior.transform as any, newTransform);



      });
    select(brushRef.current)
      .call(brushBehavior as any)
      .call(brushBehavior.move as any, null); // 初始清除选择

  }, [width, height]);

  const updateAxes = useCallback(() => {

    if (!svgRef.current)
      return;

    const xScale = scaleLinear()
      .domain([0, max(data, d => d['x']) || 0])
      .range([20, width - 20]).nice();

    const yScale = scaleLinear()
      .domain([0, max(data, d => d['y']) || 0])
      .range([height - 20, 20]).nice();


    const scaleX = transformRef.current.rescaleX(xScale).interpolate(interpolateRound);
    const scaleY = transformRef.current.rescaleY(yScale).interpolate(interpolateRound);
    // 根据缩放级别调整刻度数量
    const tickCount = Math.max(2, Math.min(10, Math.floor(width / (100 / transformRef.current.k))));
    // X轴刻度（保留刻度和值）
    const xAxis = axisBottom(xScale).ticks(tickCount).tickSizeOuter(0)
    // Y轴刻度（保留刻度和值）
    const yAxis = axisLeft(yScale).ticks(tickCount).tickSizeOuter(0)


    select(xAxisRef.current)
      .attr("transform", `translate(20, ${height - 20})`)
      .call(xAxis.tickSizeOuter(0).scale(scaleX) as any)
      .select(".domain").remove()
      .attr("stroke", "#999")
      .selectAll("text")
      .attr("fill", "#666")
      .attr("font-size", "10px")
      .selectAll(".tick line")
      .attr("stroke", tickColor)  // 刻度线颜色
      .attr("stroke-width", 1);
    ;

    select(yAxisRef.current)
      .attr("transform", `translate(${40}, 0)`).call(yAxis.tickSizeOuter(0).scale(scaleY) as any)
      .select(".domain").remove()
      .attr("stroke", "#999")
      .selectAll("text")
      .attr("fill", "#666")
      .attr("font-size", "10px")
      .selectAll(".tick line")
      .attr("stroke", tickColor)  // 刻度线颜色
      .attr("stroke-width", 1);

  }, [width, height, axisColor, tickColor, labelColor]);


  // 暴露出去的声明式ref方法
  useImperativeHandle(ref, () => ({
    // 重制渲染器到初始值
    reset: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      select(canvas)
        .transition()
        .call(zoomBehavior.transform, zoomIdentity);
    }
  }))


  // 处理鼠标移动事件
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log("move", isBrushing || brushActive);

    if (isBrushing || brushActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const { k, x: tx, y: ty } = transformRef.current;

    // 更新鼠标位置（用于tooltip定位）
    setMousePosition({
      x: event.clientX,
      y: event.clientY
    });

    // 转换坐标到数据空间
    const mouseX = (event.clientX - rect.left - tx) / k;
    const mouseY = (event.clientY - rect.top - ty) / k;

    // 查找最近的悬停点
    let closestPoint: Point | null = null;
    let minDistance = Infinity;
    const hoverRadius = r * k; // 悬停敏感区域半径

    const visiblePoints = data
    // 只检测视口内的点

    // const visiblePoints = data.filter(p =>
    //   p.x >= visibleArea.x1 &&
    //   p.x <= visibleArea.x2 &&
    //   p.y >= visibleArea.y1 &&
    //   p.y <= visibleArea.y2
    // );
    visiblePoints.forEach(point => {
      const distance = Math.sqrt(
        Math.pow(point.x - mouseX, 2) +
        Math.pow(point.y - mouseY, 2)
      );

      if (distance < hoverRadius && distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });

    setHoveredPoint(closestPoint);
  }, [isBrushing, brushActive]);

  // const debouncedDraw = useDebounce(draw, 10);
  // 实时重绘（响应hover状态变化）
  useEffect(() => {
    console.log('hoveredPoint change',hoveredPoint,selectedId);
    
    draw();
  }, [hoveredPoint,selectedId]);

  // 处理点击事件
  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    console.log('handleClick',hoveredPoint);
    
    setSelectedId(hoveredPoint ? hoveredPoint.id : null);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const svg = svgRef.current
    if (!svg) return;

    // 初始化画布
    canvas.width = width;
    canvas.height = height;
    draw();
    updateAxes();
    initBrush()
    // 为 Canvas 添加 D3 缩放能力
    select(canvas)
      .call(zoomBehavior)
      .on('wheel', (event) => event.preventDefault())
      .on('mousemove', handleMouseMove as any)
      .on('mouseout', () => setHoveredPoint(null));
    // 为 Svg 添加 D3 缩放能力
    select(svg).call(zoomBehavior).on('wheel', (event) => event.preventDefault());

    // 快捷键切换模式
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('handleKeyDown', e.key)
      if (['Control', 'Meta', 'Ctrl'].includes(e.key)) setBrushActive(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      console.log('handleKeyUp', e.key)
      if (['Control', 'Meta', 'Ctrl'].includes(e.key)) setBrushActive(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 结束监听
    return () => {
      select(canvas).on('zoom', null);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [draw, generatePoints, updateAxes, initBrush, handleMouseMove]);

  return <div style={{ position: 'relative', width, height, padding: '1rem' }}>

    <canvas ref={canvasRef} style={{ position: 'absolute', bottom: 40, left: 40 }}
      width={width}
      height={height} onClick={handleClick} onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredPoint(null)} />
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: brushActive ? 'all' : 'none' }}
    >
      {/* X轴（底部） */}
      <g
        ref={xAxisRef}
        className="x-axis"
        style={{ stroke: '#999', strokeWidth: 1 }}
      />

      {/* Y轴（左侧） */}
      <g
        ref={yAxisRef}
        className="y-axis"
        style={{ stroke: '#999', strokeWidth: 1 }}
      />
      {/* 刷选层 */}
      <g
        ref={brushRef}
        style={{ display: brushActive ? 'block' : 'none' }}
        className="brush-layer"
      />
    </svg>
    {hoveredPoint && (
      <div style={{
        position: 'fixed',
        left: mousePosition.x + 15*transformRef.current.k,
        top: mousePosition.y + 15*transformRef.current.k,
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid #fff',
        borderRadius: '4px',
        padding: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        pointerEvents: 'none',
        transition: 'opacity 0.25s, transform 0.2s',
        zIndex: 10,
        fontSize: '14px',
        maxWidth: '200px'
      }}>
        <div style={{
          color: '#1c1c1c'
        }}><strong>ID:</strong> {hoveredPoint.id}</div>
        <div style={{
          color: '#6e6e6e'
        }}><strong>位置:</strong>
          ({hoveredPoint.x.toFixed(1)}, {hoveredPoint.y.toFixed(1)})
        </div>


        <div style={{
          color: '#6e6e6e',
          margin:'1rem 0'
        }}><strong>文本名:</strong>
          Carbon Capture,Utilisation,and Storage in the图并下载图例European Union
        </div>

        <div style={{
          color: '#6e6e6e',
          textWrap:'wrap',
        }}><strong>片段:</strong>
          nless otherwise noted, the reuse of thisdocument is authorised under the CreativeCommons Attribution 4.0 International (CCBY 4.0) licence(https://creativecommons.org508licenses/by/4.0/). This means that reuse isallowed provided appropriate credit is givenand any changes are indicated.
        </div>

      </div>
    )}
    <div style={{
      position: 'absolute',
      right: 10,
      top: 10,
      background: 'rgba(255,255,255,0.7)',
      padding: '5px 10px',
      fontSize: 12,
      height: 'max-content',
      width: '20vw'
    }}>
      当前缩放{parseFloat(transformRef.current.k + '').toFixed(2)}倍
      <div >
        可见区域为: [
        {visibleArea.x1.toFixed(0)}, {visibleArea.y1.toFixed(0)}] → [
        {visibleArea.x2.toFixed(0)}, {visibleArea.y2.toFixed(0)}]
      </div>
    </div>
  </div>


});

export default NebulaRenderer;