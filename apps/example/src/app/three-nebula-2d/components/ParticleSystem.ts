import * as THREE from 'three';

// 顶点着色器
const vertexShader = `
attribute float size;
attribute vec3 customColor;
attribute float alpha;
attribute float phase;
attribute float particleId;

uniform float hoveredParticleId;
uniform float time;
uniform float cameraZoom;

varying vec3 vColor;
varying float vAlpha;
varying float vPhase;
varying float vParticleId;
varying float vIsHovered;

void main() {
  vColor = customColor;
  vAlpha = alpha;
  vPhase = phase;
  vParticleId = particleId;
  vIsHovered = (particleId == hoveredParticleId) ? 1.0 : 0.0;
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  // 根据相机距离和缩放动态调整粒子大小
  float cameraDistance = -mvPosition.z;
  float scaleFactor = 1000.0 / max(cameraDistance, 10.0);
  
  // 悬停时放大粒子
  float hoverScale = vIsHovered > 0.5 ? 1.8 : 1.0;
  
  // 应用相机缩放因子
  gl_PointSize = size * scaleFactor * hoverScale * cameraZoom;
  gl_Position = projectionMatrix * mvPosition;
}
`;

// 片段着色器
const fragmentShader = `
uniform float time;
varying vec3 vColor;
varying float vAlpha;
varying float vPhase;
varying float vIsHovered;

void main() {
  // 创建圆形粒子
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);
  
  if (dist > 0.5) {
    discard;
  }
  
  // 添加闪烁效果 - 2秒一个周期
  float twinkle = sin(time * 3.14159 + vPhase) * 0.3 + 0.7;
  
  // 更清晰的径向渐变效果
  float radialGradient = 1.0 - smoothstep(0.2, 0.5, dist);
  
  // 添加核心亮度
  float core = 1.0 - smoothstep(0.0, 0.15, dist);
  
  // 悬停效果
  vec3 baseColor = vColor;
  if (vIsHovered > 0.5) {
    // 悬停时变为白色并添加发光效果
    baseColor = vec3(1.0, 1.0, 1.0);
    
    // 外发光效果
    float glowRadius = 0.7;
    float glow = 1.0 - smoothstep(0.3, glowRadius, dist);
    float glowPulse = sin(time * 1.5) * 0.3 + 0.7;
    
    // 增强发光
    radialGradient = max(radialGradient, glow * 0.6);
    core += glow * 0.4;
  }
  
  // 最终透明度和亮度，应用闪烁效果
  float finalAlpha = vAlpha * radialGradient * twinkle;
  vec3 finalColor = baseColor + core * 0.3;
  
  gl_FragColor = vec4(finalColor, finalAlpha);
}
`;

export class ParticleSystem {
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private points: THREE.Points;
  private particleCount: number;
  
  // 粒子属性数组
  private positions: Float32Array;
  private sizes: Float32Array;
  private colors: Float32Array;
  private alphas: Float32Array;
  private phases: Float32Array;
  private particleIds: Float32Array;
  
  constructor(particleCount: number = 10) {
    this.particleCount = particleCount;
    
    // 初始化几何体
    this.geometry = new THREE.BufferGeometry();
    
    // 初始化属性数组
    this.positions = new Float32Array(particleCount * 3);
    this.sizes = new Float32Array(particleCount);
    this.colors = new Float32Array(particleCount * 3);
    this.alphas = new Float32Array(particleCount);
    this.phases = new Float32Array(particleCount);
    this.particleIds = new Float32Array(particleCount);
    
    // 初始化粒子
    this.initParticles();
    
    // 创建材质
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        hoveredParticleId: { value: -1 },
        cameraZoom: { value: 1.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    // 创建点云
    this.points = new THREE.Points(this.geometry, this.material);
  }
  
  private initParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      
      // 位置 - 在2D平面上分布
      this.positions[i3] = (Math.random() - 0.5) * 300; // x
      this.positions[i3 + 1] = (Math.random() - 0.5) * 200; // y
      this.positions[i3 + 2] = 0; // z (较小的深度变化)
      
      // 尺寸 - 不同类型的粒子有不同尺寸
      const particleType = Math.random();
      if (particleType < 0.1) {
        // 10% 大星星
        this.sizes[i] = 1;
      } else {
        this.sizes[i] = Math.random();
      }
      
      // 初始颜色（蓝色方案）
      this.colors[i3] = 0.04; // r
      this.colors[i3 + 1] = 0.14; // g
      this.colors[i3 + 2] = 0.39; // b
      
      // 透明度
      this.alphas[i] = 1;
      
      // 闪烁相位
      this.phases[i] = Math.random() * Math.PI * 2;
      
      // 粒子ID
      this.particleIds[i] = i;
    }
    
    // 设置几何体属性
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('customColor', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('alpha', new THREE.BufferAttribute(this.alphas, 1));
    this.geometry.setAttribute('phase', new THREE.BufferAttribute(this.phases, 1));
    this.geometry.setAttribute('particleId', new THREE.BufferAttribute(this.particleIds, 1));
  }
  
  updateColors(primary: THREE.Color, secondary: THREE.Color, accent: THREE.Color) {
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const particleType = Math.random();
      
      let color: THREE.Color;
      if (particleType < 0.1) {
        // 大星星使用强调色
        color = primary;
      } else if (particleType < 0.4) {
        // 中等星星使用次要色
        color = secondary;
      } else {
        // 小星星使用主色
        color = accent;
      }
      
      this.colors[i3] = color.r;
      this.colors[i3 + 1] = color.g;
      this.colors[i3 + 2] = color.b;
    }
    
    // 更新几何体属性
    const colorAttribute = this.geometry.getAttribute('customColor') as THREE.BufferAttribute;
    colorAttribute.needsUpdate = true;
  }
  
  update(deltaTime: number) {
    // 更新时间uniform，使用模运算防止时间值过大
    this.material.uniforms.time.value = (this.material.uniforms.time.value + deltaTime) % (Math.PI * 2);

    // 更新几何体
    this.geometry.attributes.position.needsUpdate = true;
  }

  setHoveredParticle(particleId: number) {
    this.material.uniforms.hoveredParticleId.value = particleId;
  }

  clearHoveredParticle() {
    this.material.uniforms.hoveredParticleId.value = -1;
  }

  updateCameraZoom(zoom: number) {
    this.material.uniforms.cameraZoom.value = zoom;
  }
  
  getMesh(): THREE.Points {
    return this.points;
  }
  
  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}