import React, {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  useMemo,
  forwardRef,
  useState,
} from "react";
import {
  brush,
  zoom,
  max,
  interpolateRound,
  select,
  zoomIdentity,
  axisBottom,
  axisLeft,
  scaleLinear,
  BrushBehavior,
} from "d3";

import { NebulaTooltip } from "./NebulaTooltip";

export const debounce = (func: () => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(func, wait);
  };
};

export type Point = {
  x: number;
  y: number;
  id: string;
  r: number;
};

interface NebulaRendererProps {
  width?: number;
  height?: number;
  zoomExtent?: [number, number];
  axisColor?: string; // 轴线颜色
  tickColor?: string; // 刻度线颜色
  labelColor?: string; // 标签颜色
  maxLinkedPoint?: number; // 最大选择数
  className?: string;
  data: Point[];
}

export interface NebulaRendererRef {
  reset: () => void;
}

export const NebulaRenderer = forwardRef<
  NebulaRendererRef,
  NebulaRendererProps
>(
  (
    {
      width = 840,
      height = 640,
      zoomExtent = [0.01, 100] as [number, number],

      maxLinkedPoint = 2,
      data,
      className,
    },
    ref
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const xAxisRef = useRef<SVGGElement>(null);
    const yAxisRef = useRef<SVGGElement>(null);
    const brushRef = useRef<SVGGElement>(null);
    const brushBehavior = useRef<BrushBehavior<SVGSVGElement> | undefined>(
      null
    );

    const mousePosition = useRef<Partial<Point>>({ x: 0, y: 0 });
    const [isBrushing, setIsBrushing] = useState(false);
    const [brushActive, setBrushActive] = useState(false);
    const transformRef = useRef<d3.ZoomTransform>(zoomIdentity);
    const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
    const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);

    // 获取当前可见区域
    const visibleArea = (() => {
      const { k, x: tx, y: ty } = transformRef.current;
      return {
        x1: Math.max(0, -tx / k),
        x2: Math.min(width, (width - tx) / k),
        y1: Math.max(0, -ty / k),
        y2: Math.min(height, (height - ty) / k),
      };
    })();

    // 绘制函数
    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 清空画布
      ctx.save();
      // ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const visiblePoints = data;
      // const visiblePoints = data.filter(
      //   (p) =>
      //     p.x >= visibleArea.x1 &&
      //     p.x <= visibleArea.x2 &&
      //     p.y >= visibleArea.y1 &&
      //     p.y <= visibleArea.y2
      // );

      const hasSelectedPoint = selectedPoints.length > 0;
      console.log("draw", selectedPoints, hoveredPoint);

      const visibleSelectedPoints: Point[] = [];

      const slectedColor = "oklch(57.7% .245 27.325)";

      // 绘制普通点
      for (const d of visiblePoints) {
        // 跳过选中的点
        const currentPointIsSelectedPoint =
          selectedPoints.filter((p) => p.id === d.id).length > 0;
        if (currentPointIsSelectedPoint) {
          visibleSelectedPoints.push(d);
          continue;
        }
        // 应用当前变换对点坐标
        const [x, y] = transformRef.current.apply([d.x, d.y]);

        ctx.beginPath();
        ctx.arc(x, y, d.r * transformRef.current.k, 0, Math.PI * 2);

        // Hover点设置
        if (hoveredPoint && d.id === hoveredPoint.id) ctx.fillStyle = "#00ff00";
        // 普通点设置
        else {
          if (hasSelectedPoint) {
            ctx.fillStyle = "oklch(0.13 0.028 261.692 / 10%)";
          } else ctx.fillStyle = "oklch(51.1% .262 276.966 / 50%)";
        }
        ctx.fill();
      }
      // 绘制线段

      if (selectedPoints.length === 2) {
        const [p1x, p1y] = transformRef.current.apply([
          selectedPoints[0].x,
          selectedPoints[0].y,
        ]);
        const [p2x, p2y] = transformRef.current.apply([
          selectedPoints[1].x,
          selectedPoints[1].y,
        ]);
        ctx.beginPath();

        ctx.moveTo(p1x, p1y);
        ctx.setLineDash([
          2 * transformRef.current.k,
          5 * transformRef.current.k,
        ]);

        ctx.lineTo(p2x, p2y);
        ctx.lineWidth = 2 * transformRef.current.k;
        ctx.strokeStyle = "oklch(57.7% .245 27.325)";
        ctx.lineCap = "round";
        // Stroke it (Do the Drawing)
        ctx.stroke();
      }

      // 绘制选中点,保证在最上层

      for (const d of visibleSelectedPoints) {
        const [x, y] = transformRef.current.apply([d.x, d.y]);

        // 阴影设置
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // 绘制阴影外圈
        ctx.fillStyle = "rgba(255, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.arc(x, y, d.r * transformRef.current.k, 0, Math.PI * 2);
        ctx.fill();

        // 主外圈
        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(x, y, d.r * transformRef.current.k * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // 内圈（重置阴影）
        ctx.shadowColor = "transparent";
        ctx.fillStyle = slectedColor;
        ctx.beginPath();
        ctx.arc(x, y, d.r * transformRef.current.k * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // 添加光晕效果
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, d.r * transformRef.current.k, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }, [
      width,
      height,
      data,
      selectedPoints,
      hoveredPoint,
      transformRef.current,
    ]);

    const zoomBehavior = zoom<any, any>()
      .scaleExtent(zoomExtent)
      .filter((event) => event.type === "wheel")
      .on("zoom", ({ transform }) => {
        transformRef.current = transform;
        console.log("mousePosition", mousePosition);

        draw();
        updateAxes();
      });

    // 初始化刷选工具
    const initBrush = () => {
      if (!brushRef.current || !svgRef.current) return;

      // 优化：对move防抖
      const brushBehavior = brush<SVGSVGElement>()
        .extent([
          [0, 0],
          [width, height],
        ])
        .on("start", () => {
          console.log("brush start");
          setIsBrushing(true);
        })
        .on("end", (event) => {
          console.log("brush end");
          setIsBrushing(false);
          if (!event.selection) return;

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
            .call(zoomBehavior.transform, newTransform);
        });

      select(brushRef.current)
        .call(brushBehavior as any)
        .call(brushBehavior.move as any, null); // 初始清除选择

      return brushBehavior;
    };

    const updateAxes = () => {
      if (!svgRef.current) return;

      const xScale = scaleLinear()
        .domain([0, max(data, (d) => d.x) || 0])
        .range([20, width - 100])
        .nice();

      const yScale = scaleLinear()
        .domain([0, max(data, (d) => d.y) || 0])
        .range([height - 100, 20])
        .nice();

      const scaleX = transformRef.current
        .rescaleX(xScale)
        .interpolate(interpolateRound);
      const scaleY = transformRef.current
        .rescaleY(yScale)
        .interpolate(interpolateRound);
      // 根据缩放级别调整刻度数量
      const tickCount = Math.max(
        2,
        Math.min(5, Math.floor(width / (100 / transformRef.current.k)))
      );
      // X轴刻度（保留刻度和值）
      const xAxis = axisBottom(xScale).ticks(tickCount).tickSizeOuter(0);
      // Y轴刻度（保留刻度和值）
      const yAxis = axisLeft(yScale).ticks(tickCount).tickSizeOuter(0);

      select(xAxisRef.current)
        .attr("transform", `translate(20, ${height - 100})`)
        .call(xAxis.tickSizeOuter(0).scale(scaleX) as any)
        .select(".domain")
        .remove();

      select(yAxisRef.current)
        .attr("transform", `translate(${40}, 0)`)
        .call(yAxis.tickSizeOuter(0).scale(scaleY) as any)
        .select(".domain")
        .remove();
      //   .attr('stroke', '#999')
      //   .selectAll('text')
      //   .attr('fill', '#666')
      //   .attr('font-size', '10px')
      //   .selectAll('.tick line')
      //   .attr('stroke', tickColor) // 刻度线颜色
      //   .attr('stroke-width', 1);
    };

    const resetRenderer = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      select(canvas).transition().call(zoomBehavior.transform, zoomIdentity);
      setHoveredPoint(null);
      setSelectedPoints([]);
    };

    // 暴露出去的声明式ref方法
    useImperativeHandle(ref, () => ({
      // 重制渲染器到初始值
      reset: resetRenderer,
    }));

    // 处理鼠标移动事件
    const handleMouseMove = useCallback(
      (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (isBrushing || brushActive) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const { k, x: tx, y: ty } = transformRef.current;

        // 更新鼠标位置（用于tooltip定位）
        mousePosition.current = {
          x: event.clientX,
          y: event.clientY,
        };

        // 转换坐标到数据空间
        const mouseX = (event.clientX - rect.left - tx) / k;
        const mouseY = (event.clientY - rect.top - ty) / k;

        // 查找最近的悬停点
        let closestPoint: Point | null = null;
        let minDistance = Infinity;
        const hoverRadius = 20 / k; // 悬停敏感区域半径

        const visiblePoints = data;
        // 只检测视口内的点

        //  visiblePoints = data.filter(p =>
        //   p.x >= visibleArea.x1 &&
        //   p.x <= visibleArea.x2 &&
        //   p.y >= visibleArea.y1 &&
        //   p.y <= visibleArea.y2
        // );
        visiblePoints.forEach((point) => {
          const distance = Math.sqrt(
            Math.pow(point.x - mouseX, 2) + Math.pow(point.y - mouseY, 2)
          );

          if (distance < hoverRadius && distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
          }
        });
        setHoveredPoint(closestPoint);
      },
      [isBrushing, brushActive]
    );

    // 处理点击事件
    // event: React.MouseEvent<HTMLCanvasElement>
    const handleClick = () => {
      if (hoveredPoint && selectedPoints.length < maxLinkedPoint)
        setSelectedPoints([...selectedPoints, hoveredPoint]);

      if (!hoveredPoint) {
        setSelectedPoints([]);
      }
    };

    // 实时重绘（响应hover状态变化）
    useEffect(() => {
      debounce(draw, 10)();
    }, [hoveredPoint, selectedPoints]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const svg = svgRef.current;
      if (!svg) return;
      // 初始化画布
      canvas.width = width;
      canvas.height = height - 60;

      // 重新绘制
      draw();
      updateAxes();
      if (!brushBehavior.current) brushBehavior.current = initBrush();

      // 为 Canvas 添加 D3 缩放能力
      select(canvas)
        .call(zoomBehavior)
        .on("wheel", (event) => event.preventDefault())
        .on("mousemove", handleMouseMove)
        .on("mouseout", () => setHoveredPoint(null));

      // 为 Svg 坐标轴同步 Canvas 缩放
      select(svg)
        .call(zoomBehavior)
        .on("wheel", (event) => event.preventDefault());

      // Ctrl快捷键切换模式
      const handleKeyDown = (e: KeyboardEvent) => {
        if (["Control", "Meta", "Ctrl"].includes(e.key)) setBrushActive(true);
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (["Control", "Meta", "Ctrl"].includes(e.key)) setBrushActive(false);
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      // 结束监听
      return () => {
        select(canvas).on("zoom", null);
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
    }, [width, height]);

    return (
      <div className={`w-[100vw] relative pa-1 ${className}`}>
        <canvas
          ref={canvasRef}
          height={height}
          width={width}
          style={{ position: "absolute", inset: 40 }}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        />
        <svg
          ref={svgRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: brushActive ? "all" : "none",
          }}
        >
          {/* X轴（底部） */}
          <g
            ref={xAxisRef}
            className="x-axis"
            style={{ stroke: "#999", strokeWidth: 1 }}
          />

          {/* Y轴（左侧） */}
          <g
            ref={yAxisRef}
            className="y-axis"
            style={{ stroke: "#999", strokeWidth: 1 }}
          />
          {/* 刷选层 */}
          <g
            ref={brushRef}
            style={{ display: brushActive ? "block" : "none" }}
            className="brush-layer"
          />
        </svg>
        {/* {hoveredPoint && <NebulaTooltip point={{ ...hoveredPoint, ...mousePosition.current }} />} */}
        {selectedPoints.length > 0 && <NebulaTooltip points={selectedPoints} />}
        {selectedPoints.length === 0 && hoveredPoint && (
          <NebulaTooltip points={[hoveredPoint]} />
        )}
        ))
        <div
          style={{
            position: "absolute",
            right: 10,
            top: 10,
            padding: "5px 10px",
            height: "max-content",
            transform: "translateX(-100%)",
          }}
        >
         
            当前缩放
            {parseFloat(`${transformRef.current.k}`).toFixed(2)}
            
            倍
            <div>
              可见区域为: [ {visibleArea.x1.toFixed(0)} ,
               {visibleArea.y1.toFixed(0)} ] → [
               {visibleArea.x2.toFixed(0)} ,
               {visibleArea.y2.toFixed(0)} ]
            </div>
        </div>
      </div>
    );
  }
);
