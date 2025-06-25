import * as THREE from 'three';
import { ParticleSystem } from './ParticleSystem';
import { NoiseBackground } from './NoiseBackground';

// 颜色方案定义
const COLOR_SCHEMES = {
  blue: {
    primary: new THREE.Color(0x0a2463),
    secondary: new THREE.Color(0x3e92cc),
    accent: new THREE.Color(0xd8e1e9),
    background: new THREE.Color(0x010b19)
  },
  purple: {
    primary: new THREE.Color(0x4a157c),
    secondary: new THREE.Color(0x8e44ad),
    accent: new THREE.Color(0xe9d8f2),
    background: new THREE.Color(0x19011a)
  },
  red: {
    primary: new THREE.Color(0x7f0000),
    secondary: new THREE.Color(0xc23616),
    accent: new THREE.Color(0xf5d8d8),
    background: new THREE.Color(0x190101)
  }
};

export class NebulaScene {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private clock: THREE.Clock;
  
  private particleSystem: ParticleSystem;
  // private noiseBackground: NoiseBackground;
  private mouse = new THREE.Vector2();
  private hoveredParticleId: number = -1;
  
  // GPU拾取检测相关
  private pickingTexture: THREE.WebGLRenderTarget;
  private pickingScene: THREE.Scene;
  private pickingMaterial!: THREE.ShaderMaterial;
  private pixelBuffer: Uint8Array;
  
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private currentColorScheme = 'blue';
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    
    // 创建2D正交相机
    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = 100;
    this.camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'highp'
    });
    
    // 初始化粒子系统和噪声背景
    this.particleSystem = new ParticleSystem(10000);
    // this.noiseBackground = new NoiseBackground();
    
    // 移除后处理组件初始化
    
    // 初始化GPU拾取检测
    this.mouse = new THREE.Vector2();
    
    // 创建拾取渲染目标
    this.pickingTexture = new THREE.WebGLRenderTarget(
      container.clientWidth,
      container.clientHeight
    );
    this.pickingTexture.texture.minFilter = THREE.NearestFilter;
    this.pickingTexture.texture.magFilter = THREE.NearestFilter;
    this.pickingTexture.texture.generateMipmaps = false;
    
    // 创建拾取场景
    this.pickingScene = new THREE.Scene();
    
    // 创建像素缓冲区
     this.pixelBuffer = new Uint8Array(4);
     
     // 创建GPU拾取着色器材质
     this.createPickingMaterial();
  }
  
  private createPickingMaterial() {
    const pickingVertexShader = `
      attribute float size;
      attribute float particleId;
      
      uniform float cameraZoom;
      
      varying float vParticleId;
      
      void main() {
        vParticleId = particleId;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
        // 根据相机距离和缩放动态调整粒子大小（与ParticleSystem保持一致）
        float cameraDistance = -mvPosition.z;
        float scaleFactor = 1000.0 / max(cameraDistance, 10.0);
        
        // 应用相机缩放因子
        gl_PointSize = size * scaleFactor * cameraZoom;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;
    
    const pickingFragmentShader = `
      varying float vParticleId;
      
      void main() {
        // 创建圆形粒子
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        if (dist > 0.5) {
          discard;
        }
        
        // 将粒子ID编码为颜色 (ID从1开始，0表示背景)
         float id = vParticleId + 1.0;
         float r = floor(id / 65536.0) / 255.0;
         float g = floor(mod(id, 65536.0) / 256.0) / 255.0;
         float b = mod(id, 256.0) / 255.0;
        
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `;
    
    this.pickingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        cameraZoom: { value: 1.0 }
      },
      vertexShader: pickingVertexShader,
      fragmentShader: pickingFragmentShader,
      vertexColors: false
    });
  }
  
  init() {
    // 设置渲染器
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3)); // 提高像素比上限
    this.renderer.outputColorSpace = THREE.SRGBColorSpace; // 确保正确的颜色空间
    this.container.appendChild(this.renderer.domElement);
    
    // 设置相机位置
    this.camera.position.z = 100;
    
    // 添加粒子系统和噪声背景到场景
    this.scene.add(this.particleSystem.getMesh());
    // this.scene.add(this.noiseBackground.getMesh());
    
    // 创建拾取场景的粒子系统
    this.setupPickingScene();
    
    // 设置背景色
    this.scene.background = COLOR_SCHEMES[this.currentColorScheme as keyof typeof COLOR_SCHEMES].background;
    
    // 设置初始缩放因子
    const initialWidth = this.camera.right - this.camera.left;
    const initialZoomFactor = 100 / initialWidth;
    this.particleSystem.updateCameraZoom(initialZoomFactor);
    this.pickingMaterial.uniforms.cameraZoom.value = initialZoomFactor;
    
    // 添加事件监听器
    this.setupEventListeners();
    
    // 开始动画循环
    this.animate();
  }
  
  setColorScheme(scheme: string) {
    if (scheme in COLOR_SCHEMES) {
      this.currentColorScheme = scheme;
      const colors = COLOR_SCHEMES[scheme as keyof typeof COLOR_SCHEMES];
      
      // 更新场景背景色
      // this.scene.background = colors.background;
      
      // 更新粒子系统颜色
      this.particleSystem.updateColors(colors.primary, colors.secondary, colors.accent);
      
      // 更新噪声背景颜色
      // this.noiseBackground.updateColors(colors.primary, colors.secondary);
    }
  }
  
  // 移除后处理设置方法
  
  private setupEventListeners() {
    const canvas = this.renderer.domElement;
    
    // 鼠标拖拽平移
    canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    });
    
    canvas.addEventListener('mousemove', (e) => {
      // 更新鼠标位置（用于射线检测）
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      console.log('this.mouse',this.mouse)
      
      // 执行GPU拾取检测
      this.performGPUPicking();
      
      if (!this.isDragging) return;
      
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;
      
      // 计算相机移动量（考虑缩放级别）
      const zoomLevel = this.camera.right - this.camera.left;
      const moveX = (deltaX / this.container.clientWidth) * zoomLevel;
      const moveY = (deltaY / this.container.clientHeight) * zoomLevel;
      
      // 移动相机
      this.camera.position.x -= moveX;
      this.camera.position.y += moveY;
      
      this.previousMousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    });
    
    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
    
    canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
    });
    
    // 鼠标滚轮缩放
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      const zoomSpeed = 0.1;
      const zoomFactor = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;
      
      // 限制缩放范围
      const currentWidth = this.camera.right - this.camera.left;
      const newWidth = currentWidth * zoomFactor;
      
      if (newWidth > 10 && newWidth < 500) {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        const halfWidth = newWidth / 2;
        const halfHeight = halfWidth / aspect;
        
        this.camera.left = -halfWidth;
        this.camera.right = halfWidth;
        this.camera.top = halfHeight;
        this.camera.bottom = -halfHeight;
        this.camera.updateProjectionMatrix();
        
        // 更新粒子系统的缩放因子
        const zoomFactor = 100 / newWidth; // 基准宽度为100
        this.particleSystem.updateCameraZoom(zoomFactor);
        this.pickingMaterial.uniforms.cameraZoom.value = zoomFactor;
      }
    });
  }
  
  private setupPickingScene() {
    // 创建拾取场景的粒子系统
    const pickingGeometry = this.particleSystem.getMesh().geometry.clone();
    const pickingPoints = new THREE.Points(pickingGeometry, this.pickingMaterial);
    this.pickingScene.add(pickingPoints);
  }
  
  private performGPUPicking() {
    // 渲染拾取场景到纹理
    this.renderer.setRenderTarget(this.pickingTexture);
    this.renderer.render(this.pickingScene, this.camera);
    
    // 计算鼠标在渲染目标中的像素坐标
    const canvasPosition = this.renderer.domElement.getBoundingClientRect();
    const x = Math.floor((this.mouse.x * 0.5 + 0.5) * this.pickingTexture.width);
    const y = Math.floor((this.mouse.y * 0.5 + 0.5) * this.pickingTexture.height);
    
    // 读取像素颜色
    this.renderer.readRenderTargetPixels(
      this.pickingTexture,
      x, y, 1, 1,
      this.pixelBuffer
    );
    
    // 恢复默认渲染目标
    this.renderer.setRenderTarget(null);
    
    // 解码粒子ID
    const particleId = this.pixelBuffer[0] * 65536 + this.pixelBuffer[1] * 256 + this.pixelBuffer[2];
    
    if (particleId > 0 && particleId <= this.particleSystem.getMesh().geometry.getAttribute('position').count) {
       // 设置悬停粒子ID到着色器
       const actualParticleId = particleId - 1; // 减1因为着色器中ID+1了
       this.particleSystem.setHoveredParticle(actualParticleId);
       this.hoveredParticleId = actualParticleId;
       console.log('选中粒子ID:', actualParticleId);
    } else {
      // 清除悬停状态
      this.particleSystem.clearHoveredParticle();
      this.hoveredParticleId = -1;
    }
  }
  
  // 移除悬停粒子相关方法，现在使用着色器内置悬停效果
  
  resize() {
    if (!this.container) return;
    
    const aspect = this.container.clientWidth / this.container.clientHeight;
    const currentWidth = this.camera.right - this.camera.left;
    const halfWidth = currentWidth / 2;
    const halfHeight = halfWidth / aspect;
    
    this.camera.top = halfHeight;
    this.camera.bottom = -halfHeight;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    
    // 更新粒子系统的缩放因子
    const zoomFactor = 100 / currentWidth;
    this.particleSystem.updateCameraZoom(zoomFactor);
    this.pickingMaterial.uniforms.cameraZoom.value = zoomFactor;
    
    // 更新拾取纹理尺寸
    if (this.pickingTexture) {
      this.pickingTexture.setSize(this.container.clientWidth, this.container.clientHeight);
    }
  }
  
  private animate = () => {
    requestAnimationFrame(this.animate);
    
    const elapsedTime = this.clock.getElapsedTime();
    
    // 更新粒子系统
    this.particleSystem.update(elapsedTime);
    
    // 更新噪声背景
    // this.noiseBackground.update(elapsedTime);
    
    // 直接渲染场景
    this.renderer.render(this.scene, this.camera);
  };
  
  dispose() {
    // 清理事件监听器
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('mousedown', () => {});
    canvas.removeEventListener('mousemove', () => {});
    canvas.removeEventListener('mouseup', () => {});
    canvas.removeEventListener('mouseleave', () => {});
    canvas.removeEventListener('wheel', () => {});
    
    // 清理悬停状态
    this.particleSystem.clearHoveredParticle();
    
    // 清理GPU拾取资源
    if (this.pickingTexture) {
      this.pickingTexture.dispose();
    }
    if (this.pickingMaterial) {
      this.pickingMaterial.dispose();
    }
    
    // 清理Three.js资源
    this.particleSystem.dispose();
    // this.noiseBackground.dispose();
    this.renderer.dispose();
    
    // 从DOM中移除canvas
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}