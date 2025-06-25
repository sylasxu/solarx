'use client';

import { useEffect, useRef, useState } from 'react';
import { NebulaScene } from './components/NebulaScene';

export default function ThreeNebula2DPage() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<NebulaScene | null>(null);
  const [colorScheme, setColorScheme] = useState('blue');

  useEffect(() => {
    if (!canvasRef.current) return;

    // 初始化场景
    sceneRef.current = new NebulaScene(canvasRef.current);
    sceneRef.current.init();
    
    // 设置初始颜色方案
    sceneRef.current.setColorScheme(colorScheme);

    // 窗口大小调整
    const handleResize = () => {
      sceneRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      sceneRef.current?.dispose();
    };
  }, []);

  // 颜色方案变化时更新
  useEffect(() => {
    sceneRef.current?.setColorScheme(colorScheme);
  }, [colorScheme]);

  return (
    <div className="w-full h-screen bg-black relative">
      <div ref={canvasRef} className="w-full h-full" />
      
      <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 p-4 rounded">
        <h1 className="font-bold mb-2">2D星空星云 - 30,000粒子</h1>
        <p>• 鼠标拖拽平移视图</p>
        <p>• 鼠标滚轮缩放视图</p>
        <p>• 动态噪声背景跟随颜色</p>
        <p>• 2D正交相机</p>
        <p>• 高性能着色器渲染</p>
        
        <div className="mt-4">
          <p className="mb-2">颜色方案:</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setColorScheme('blue')} 
              className={`w-8 h-8 rounded-full ${colorScheme === 'blue' ? 'ring-2 ring-white' : ''}`}
              style={{ background: 'linear-gradient(to right, #0f2027, #203a43, #2c5364)' }}
            />
            <button 
              onClick={() => setColorScheme('purple')} 
              className={`w-8 h-8 rounded-full ${colorScheme === 'purple' ? 'ring-2 ring-white' : ''}`}
              style={{ background: 'linear-gradient(to right, #4a157c, #6a3093, #8e44ad)' }}
            />
            <button 
              onClick={() => setColorScheme('red')} 
              className={`w-8 h-8 rounded-full ${colorScheme === 'red' ? 'ring-2 ring-white' : ''}`}
              style={{ background: 'linear-gradient(to right, #7f0000, #a52a2a, #ff0000)' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}