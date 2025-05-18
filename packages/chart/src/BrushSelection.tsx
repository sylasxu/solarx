import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface Point {
  x: number;
  y: number;
  r: number;
}

export const BrushSelection: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<SVGSVGElement>(null);
    
    useEffect(() => {
        if (!canvasRef.current || !overlayRef.current) return;

        // 设置尺寸和边距
        const margin = {top: 20, right: 20, bottom: 30, left: 40};
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        // 获取Canvas上下文
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // 设置Canvas尺寸
        canvas.width = width + margin.left + margin.right;
        canvas.height = height + margin.top + margin.bottom;
        
        // 创建SVG覆盖层用于刷选
        const svg = d3.select(overlayRef.current)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // 生成随机数据
        const data: Point[] = d3.range(100).map(() => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 3 + 2
        }));

        // 绘制Canvas点
        const drawPoints = (selectedPoints: Point[] = []) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(margin.left, margin.top);
            
            data.forEach(d => {
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
                ctx.fillStyle = selectedPoints.includes(d) ? 'red' : '#69b3a2';
                ctx.strokeStyle = '#fff';
                ctx.fill();
                ctx.stroke();
            });
            
            ctx.restore();
        };
        
        // 初始绘制
        drawPoints();

        // 创建比例尺
        const x = d3.scaleLinear()
            .domain([0, width])
            .range([0, width]);
            
        const y = d3.scaleLinear()
            .domain([0, height])
            .range([height, 0]);

        // 创建刷选功能
        const brush = d3.brush()
            .extent([[0, 0], [width, height]])
            .on("brush", brushed)
            .on("end", brushEnd);

        // 添加刷选区域
        svg.append("g")
            .attr("class", "brush")
            .call(brush);

        // 刷选事件处理函数
        function brushed(event: d3.D3BrushEvent<Point>) {
            const selection = event.selection;
            if (!selection) return;
            
            const [[x0, y0], [x1, y1]] = selection as any;
            
            const selectedPoints = data.filter(d => 
                x(d.x) >= x0 && x(d.x) <= x1 && 
                y(d.y) >= y0 && y(d.y) <= y1
            );
            
            drawPoints(selectedPoints);
        }

        function brushEnd(event: d3.D3BrushEvent<Point>) {
            if (!event.selection) {
                drawPoints();
            }
        }

        return () => {
            svg.selectAll("*").remove();
        };
    }, []);

    return (
        <div style={{ position: 'relative', width: '600px', height: '400px' }}>
            <canvas 
                ref={canvasRef} 
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1
                }}
            />
            <svg 
                ref={overlayRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 2,
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};