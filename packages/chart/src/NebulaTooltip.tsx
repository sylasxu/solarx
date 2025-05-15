import React from 'react';
import { Point } from './NebulaRenderer';


export const NebulaTooltip = ({ points }: { points: Point[] }) => (
  <>
    {points.map((p, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          right: '1rem',
          top: `${i * 35}vh`,
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid #fff',
          borderRadius: '4px',
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
          transition: 'opacity 0.25s, transform 0.2s',
          zIndex: 10,
          fontSize: '14px',
          maxWidth: '200px',
          height: '30vh',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            color: '#1c1c1c',
          }}
        >
          <div>ID:</div> {p?.id}
        </div>
        <div
          style={{
            color: '#6e6e6e',
          }}
        >
          <div>位置:</div>({p.x?.toFixed(1)}, {p.y?.toFixed(1)})
        </div>

        <div
          style={{
            color: '#6e6e6e',
            margin: '1rem 0',
          }}
        >
          <div>文本名:</div>
          <div>Carbon Capture,Utilisation,and Storage in the图并下载图例European Union' </div>
        </div>

        <div
          style={{
            color: '#6e6e6e',
            textWrap: 'wrap',
          }}
        >
          <div>片段:</div>
          <div>
            nless otherwise noted, the reuse of thisdocument is authorised under the CreativeCommons Attribution 4.0
            International (CCBY 4.0). This means that reuse isallowed provided appropriate credit is givenand any
            changes are indicated.
          </div>
        </div>
      </div>
    ))}
  </>
);
