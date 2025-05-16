import React, { useRef, useEffect, useCallback, useImperativeHandle, useMemo, forwardRef, useState } from 'react';
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
  quadtree,
  Quadtree,
  QuadtreeLeaf,
} from 'd3';
import { useThrottle } from '@src/routes/frontweb/innovation/components/MobileFilterDialog/MobileDialog';

import { NebulaTooltip } from './NebulaTooltip';


export const getPerformance = (targetFunction: () => void) => {
  const before = performance.now();
  targetFunction();
  console.log('函数花费了:ms', performance.now() - before ));
};
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
  getVisiblePointsLength: () => number;
  getTransformK: () => number;
  getVisibleArea: () => {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  };
}

export const NebulaRenderer = forwardRef<NebulaRendererRef, NebulaRendererProps>(
  (
    { width = 840, height = 640, zoomExtent = [0.5, 20] as [number, number], maxLinkedPoint = 2, data, className },
    ref,
  ) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const xAxisRef = useRef<SVGGElement>(null);
    const yAxisRef = useRef<SVGGElement>(null);
    const brushRef = useRef<SVGGElement>(null);
    const brushBehavior = useRef<BrushBehavior<SVGSVGElement> | undefined>(null);
    const gridRef = useRef<SVGGElement>(null);
    const mousePosition = useRef<Partial<Point>>({ x: 0, y: 0 });
    const [isBrushing, setIsBrushing] = useState(false);
    const [brushActive, setBrushActive] = useState(false);
    const transformRef = useRef<d3.ZoomTransform>(zoomIdentity);
    const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
    const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
    const quadtreeRef = useRef<Quadtree<Point>>();

    // 初始化四叉树
    useEffect(() => {
      quadtreeRef.current = quadtree<Point>()
        .x((d) => d.x)
        .y((d) => d.y)
        .addAll(data);
    }, []);

    // 获取当前可见区域
    const visibleArea = useMemo(() => {
      const { k, x: tx, y: ty } = transformRef.current;
      return {
        x1: Math.max(0, -tx / k),
        x2: Math.min(width, (width - tx) / k),
        y1: Math.max(0, -ty / k),
        y2: Math.min(height, (height - ty) / k),
      };
    }, [transformRef.current, height, width]);

    // 当前区域内需要渲染的点
    const visiblePoints = useMemo(() => {
      const { k } = transformRef.current;
      // zoom放大时做可见性剔除，只渲染当前视口内可见的点，忽略那些在视口外的点。
      if (k > 1) {
        return data.filter(
          (p) => p.x >= visibleArea.x1 && p.x <= visibleArea.x2 && p.y >= visibleArea.y1 && p.y <= visibleArea.y2,
        );
      }
      if (k < 0.2 && data.length > 80000) {
        // zoom缩小时，聚集成一堆，做动态采样，单位像素内减少渲染数量
        const gridSize = Math.max(10, 100 / k);
        const grid = new Set<string>();
        const result: Point[] = [];
        quadtreeRef.current.visit((node: QuadtreeLeaf<Point>, x0, y0, x1, y1) => {
          if (!node.length) {
            let p: any = node.data;
            while (p) {
              if (p.x >= visibleArea.x1 && p.x <= visibleArea.x2 && p.y >= visibleArea.y1 && p.y <= visibleArea.y2) {
                const gx = Math.floor(p.x / gridSize);
                const gy = Math.floor(p.y / gridSize);
                const key = `${gx},${gy}`;

                if (!grid.has(key)) {
                  grid.add(key);
                  result.push(p);
                }
              }
              p = node.next;
            }
          }
          return x1 < visibleArea.x1 || y1 < visibleArea.y1 || x0 > visibleArea.x2 || y0 > visibleArea.y2;
        });
        return result;
      }

      return data;
    }, [visibleArea, quadtreeRef.current]);

    console.log('visiblePoints.length', visiblePoints.length);

    // 绘制Canvas内容
    const canvasDraw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      console.log('canvasDraw visiblePoints.length', visiblePoints.length);

      // 清空画布
      ctx.save();
      // ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const hasSelectedPoint = selectedPoints.length > 0;

      const visibleSelectedPoints: Point[] = [];

      const slectedColor = 'oklch(57.7% .245 27.325)';

      // 绘制普通点
      for (const d of visiblePoints) {
        // 跳过选中的点
        const currentPointIsSelectedPoint = selectedPoints.filter((p) => p.id === d.id).length > 0;
        if (currentPointIsSelectedPoint) {
          visibleSelectedPoints.push(d);
          continue;
        }
        // 应用当前变换对点坐标
        const [x, y] = transformRef.current.apply([d.x, d.y]);

        ctx.beginPath();
        ctx.arc(x, y, d.r * transformRef.current.k, 0, Math.PI * 2);

        // Hover点设置
        if (hoveredPoint && d.id === hoveredPoint.id) ctx.fillStyle = 'red';
        // 普通点设置
        else {
          if (hasSelectedPoint) {
            ctx.fillStyle = 'oklch(0.13 0.028 261.692 / 10%)';
          } else ctx.fillStyle = 'oklch(72.3% .219 149.579 / 60%)';
        }
        ctx.fill();
      }
      // 绘制线段

      if (selectedPoints.length === 2) {
        const [p1x, p1y] = transformRef.current.apply([selectedPoints[0].x, selectedPoints[0].y]);
        const [p2x, p2y] = transformRef.current.apply([selectedPoints[1].x, selectedPoints[1].y]);
        ctx.beginPath();

        ctx.moveTo(p1x, p1y);
        ctx.setLineDash([2 * transformRef.current.k, 5 * transformRef.current.k]);

        ctx.lineTo(p2x, p2y);
        ctx.lineWidth = 2 * transformRef.current.k;
        ctx.strokeStyle = 'oklch(57.7% .245 27.325)';
        ctx.lineCap = 'round';
        // Stroke it (Do the Drawing)
        ctx.stroke();
      }

      // 绘制选中点,保证在最上层

      for (const d of visibleSelectedPoints) {
        const [x, y] = transformRef.current.apply([d.x, d.y]);

        // 阴影设置
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 500;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // 绘制阴影外圈
        ctx.fillStyle = 'oklch(63.7% .237 25.331 / 30%)';
        ctx.beginPath();
        ctx.arc(x, y, d.r * transformRef.current.k * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // 主外圈
        ctx.fillStyle = 'oklch(63.7% .237 25.331)';
        ctx.beginPath();
        ctx.arc(x, y, d.r * transformRef.current.k, 0, Math.PI * 2);
        ctx.fill();

        // 内圈（重置阴影）
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = slectedColor;
        ctx.beginPath();
        ctx.arc(x, y, d.r * transformRef.current.k * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // 添加光晕效果
        // const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12);
        // gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        // gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        // ctx.fillStyle = gradient;
        // ctx.beginPath();
        // ctx.arc(x, y, d.r * transformRef.current.k, 0, Math.PI * 2);
        // ctx.fill();
      }

      ctx.restore();
    }, [width, height, data, selectedPoints, hoveredPoint, transformRef.current]);

    const throttleZoomed = useThrottle(
      ({ transform }) => {
        transformRef.current = transform;
        updateAxis();
        canvasDraw();
      },
      80,
      [],
    );

    const zoomBehavior = zoom<any, any>()
      .scaleExtent(zoomExtent)
      .filter((e) => e.type === 'wheel')
      .on(
        'zoom',

        throttleZoomed,
      );

    // 初始化刷选工具
    const initBrush = () => {
      if (!brushRef.current || !svgRef.current) return;

      // 优化：对move防抖
      const brushBehavior = brush<SVGSVGElement>()
        .extent([
          [0, 0],
          [width, height],
        ])
        .on('start', () => {
          setIsBrushing(true);
        })
        .on('end', (event) => {
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
          const newTransform = zoomIdentity.translate(translateX, translateY).scale(scale);

          select(canvasRef.current).transition().duration(500).call(zoomBehavior.transform, newTransform);
        });

      select(brushRef.current)
        .call(brushBehavior)
        .call(brushBehavior.move as any, null); // 初始清除选择

      return brushBehavior;
    };

    // 重新绘制坐标轴
    const updateAxis = () => {
      if (!svgRef.current) return;

      const { k } = transformRef.current;

      // 定义从数据到坐标的转换函数
      const xScale = scaleLinear()
        .domain([0, max(data, (d) => d.x) || 0])
        .range([20, width - 190])
        .nice();

      const yScale = scaleLinear()
        .domain([0, max(data, (d) => d.y) || 0])
        .range([height - 210, 20])
        .nice();

      // transform过后的转换函数
      const scaleX = transformRef.current.rescaleX(xScale).interpolate(interpolateRound);
      const scaleY = transformRef.current.rescaleY(yScale).interpolate(interpolateRound);

      // 定义xy的最大刻度数
      const xTicks = k > 1 ? Math.max(4, Math.floor(9 / k)) : Math.min(9, Math.floor(9 / k));
      const yTicks = k > 1 ? Math.max(2, Math.floor(6 / k)) : Math.min(6, Math.floor(6 / k));

      // X轴刻度（保留刻度和值）
      const xAxis = axisBottom(xScale).ticks(xTicks).tickSizeOuter(0);
      // Y轴刻度（保留刻度和值）
      const yAxis = axisLeft(yScale).ticks(yTicks).tickSizeOuter(0);

      // 应用到x轴
      select(xAxisRef.current)
        .attr('transform', `translate(50, ${height - 270})`)
        .call(xAxis.scale(scaleX) as any)
        .select('.domain')
        .remove();

      // 应用到y轴
      select(yAxisRef.current)
        .attr('transform', 'translate(50, -75)')
        .call(yAxis.scale(scaleY) as any)
        .select('.domain')
        .remove();

      // 应用到grid网格
      select(gridRef.current)
        .attr('transform', 'translate(50, -75)')
        .attr('stroke', 'currentColor')
        .attr('stroke-opacity', 0.1)
        .call((g) =>
          g
            .selectAll('.x')
            .data(scaleX.ticks(xTicks))
            .join(
              (enter) => enter.append('line').attr('class', 'x').attr('y2', height),
              (update) => update,
              (exit) => exit.remove(),
            )
            .attr('x1', (d) => 0.5 + scaleX(d))
            .attr('x2', (d) => 0.5 + scaleX(d)),
        )
        .call((g) =>
          g
            .selectAll('.y')
            .data(scaleY.ticks(yTicks))
            .join(
              (enter) => enter.append('line').attr('class', 'y').attr('x2', width),
              (update) => update,
              (exit) => exit.remove(),
            )
            .attr('y1', (d) => 0.5 + scaleY(d))
            .attr('y2', (d) => 0.5 + scaleY(d)),
        );

      //   .attr('stroke', '#999')
      //   .selectAll('text')
      //   .attr('fill', '#666')
      //   .attr('font-size', '10px')
      //   .selectAll('.tick line')
      //   .attr('stroke', tickColor) // 刻度线颜色
      //   .attr('stroke-width', 1);
    };

    const resetRenderer = () => {
      // 重置canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      select(canvas).transition().duration(750).call(zoomBehavior.transform, zoomIdentity);
      // 重置svg
      const svg = svgRef.current;
      if (!svg) return;
      select(svg).transition().duration(750).call(zoomBehavior.transform, zoomIdentity);

      // 重置操作数据
      setHoveredPoint(null);
      setSelectedPoints([]);
    };

    const getTransformK = () => transformRef?.current?.k

    // 暴露出去的声明式ref方法
    useImperativeHandle(ref, () => ({
      // 重制渲染器到初始值
      reset: resetRenderer,
      // 当前实际渲染的点数量
      getVisiblePointsLength: () => visiblePoints?.length,
      // 获取缩放倍数
      getTransformK,
      // 获取当前可视区域
      getVisibleArea: () => visibleArea,
    }));

    // 处理鼠标移动事件
    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
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
      let closestPoint = null;
      let minDistance = Infinity;

      // 悬停敏感区域半径
      const hoverRadius = 5 * k;

      // 找出需要渲染的点里最近的点

      visiblePoints.forEach((point) => {
        const distance = Math.sqrt(Math.pow(point.x - mouseX, 2) + Math.pow(point.y - mouseY, 2)) * k;
        if (distance < hoverRadius && distance < minDistance) {
          minDistance = distance;
          closestPoint = point;
        }
      });

      // 进入和离开对象时，更新ui

      if ((!closestPoint && hoveredPoint) || (closestPoint && !hoveredPoint)) {
        setHoveredPoint(closestPoint);
      }
    };

    // 处理点击事件
    // event: React.MouseEvent<HTMLCanvasElement>
    const handleClick = () => {
      if (hoveredPoint && selectedPoints.length < maxLinkedPoint) setSelectedPoints([...selectedPoints, hoveredPoint]);
      else if (!hoveredPoint) {
        setSelectedPoints([]);
      }
    };

    // 实时重绘（响应hover状态变化）
    useEffect(() => {
      getPerformance(canvasDraw);
    }, [hoveredPoint, selectedPoints]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const svg = svgRef.current;
      if (!svg) return;
      // 初始化画布
      canvas.width = window.innerHeight * 0.9;
      canvas.height = window.innerHeight * 0.7;
      updateAxis();
      canvasDraw();
      if (!brushBehavior.current) brushBehavior.current = initBrush();

      // 为 Canvas 添加 D3 缩放能力
      select(canvas)
        .call(zoomBehavior)
        .on('wheel', (event) => event.preventDefault())
        .on('mousemove', handleMouseMove);
      // .on('mouseout', () => setHoveredPoint(null));

      // 为 Svg 坐标轴同步 Canvas 缩放
      select(svg).call(zoomBehavior);

      // 监听Ctrl快捷键切换模式
      const handleKeyDown = (e: KeyboardEvent) => {
        if (['Control', 'Meta', 'Ctrl'].includes(e.key)) setBrushActive(true);
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (['Control', 'Meta', 'Ctrl'].includes(e.key)) setBrushActive(false);
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      // 结束监听
      return () => {
        select(canvas).on('zoom', null);
        select(svg).on('zoom', null);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }, [width, height, data, transformRef.current]);

    return (
      <div className={`w-[100vw] relative pa-1 ${className}`}>
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 60, left: 80 }}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredPoint(null)}
        />
        <svg
          ref={svgRef}
          style={{
            position: 'absolute',
            inset: 30,
            width: '72vw',
            height: '77vh',
            pointerEvents: brushActive ? 'all' : 'none',
            overflow: 'hidden',
          }}
        >
          {/* 网格 */}
          <g ref={gridRef} className="grid-layer" />
          {/* X轴（底部） */}
          <g ref={xAxisRef} className="x-axis" style={{ stroke: '#999', strokeWidth: 1 }} />

          {/* Y轴（左侧） */}
          <g ref={yAxisRef} className="y-axis" style={{ stroke: '#999', strokeWidth: 1 }} />
          {/* 刷选层 */}
          <g ref={brushRef} style={{ display: brushActive ? 'block' : 'none' }} className="brush-layer" />
        </svg>
        {selectedPoints.length > 0 && <NebulaTooltip points={selectedPoints} />}
        {selectedPoints.length === 0 && hoveredPoint && <NebulaTooltip points={[hoveredPoint]} />}
      </div>
    );
  },
);
