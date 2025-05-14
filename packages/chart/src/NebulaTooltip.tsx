import { Point } from "./NebulaRenderer";

export const Tooltip = (point:Point) => {
    return (
      <div
        style={{
          position: "fixed",
          right: 20,
          top: 20,
          background: "rgba(255,255,255,0.95)",
          border: "1px solid #fff",
          borderRadius: "4px",
          padding: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          pointerEvents: "none",
          transition: "opacity 0.25s, transform 0.2s",
          zIndex: 10,
          fontSize: "14px",
          maxWidth: "200px",
        }}
      >
        <div
          style={{
            color: "#1c1c1c",
          }}
        >
          <strong>ID:</strong> {point?.id}
        </div>
        <div
          style={{
            color: "#6e6e6e",
          }}
        >
          <strong>位置:</strong>({point?.x?.toFixed(1)}, {point?.y?.toFixed(1)})
        </div>
  
        <div
          style={{
            color: "#6e6e6e",
            margin: "1rem 0",
          }}
        >
          <strong>文本名:</strong>
          <div>  Carbon Capture,Utilisation,and Storage in the图并下载图例European Union        </div>
        </div>
  
        <div
          style={{
            color: "#6e6e6e",
            textWrap: "wrap",
          }}
        >
          <strong>片段:</strong>
          <div>
             nless otherwise noted, the reuse of thisdocument is authorised under the
          CreativeCommons Attribution 4.0 International (CCBY 4.0). This means that
          reuse isallowed provided appropriate credit is givenand any changes are
          indicated.
          </div>
         
        </div>
      </div>
    );
  };