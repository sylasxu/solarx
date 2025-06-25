import * as THREE from 'three';

export class NoiseBackground {
  private geometry: THREE.PlaneGeometry;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private noiseTexture1: THREE.Texture | null = null;
  private noiseTexture2: THREE.Texture | null = null;
  private noiseTexture3: THREE.Texture | null = null;
  
  constructor() {
    // 创建全屏平面几何体
    this.geometry = new THREE.PlaneGeometry(400, 400);
    
    // 加载三张噪声纹理
    const loader = new THREE.TextureLoader();
    
    
    this.noiseTexture1 = loader.load('/three-nebula-2d/components/noise.jpg');
    this.noiseTexture1.wrapS = THREE.RepeatWrapping;
    this.noiseTexture1.wrapT = THREE.RepeatWrapping;
    
    this.noiseTexture2 = loader.load('/three-nebula-2d/components/clouds1.jpg');
    this.noiseTexture2.wrapS = THREE.RepeatWrapping;
    this.noiseTexture2.wrapT = THREE.RepeatWrapping;
    
    this.noiseTexture3 = loader.load('/three-nebula-2d/components/noise3.jpg');
    this.noiseTexture3.wrapS = THREE.RepeatWrapping;
    this.noiseTexture3.wrapT = THREE.RepeatWrapping;
    
    // 创建着色器材质
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        noiseTexture1: { value: this.noiseTexture1 },
        noiseTexture2: { value: this.noiseTexture2 },
        noiseTexture3: { value: this.noiseTexture3 },
        colorPrimary: { value: new THREE.Color(0x0a2463) },
        colorSecondary: { value: new THREE.Color(0x3e92cc) }
      },
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform sampler2D noiseTexture1;
        uniform sampler2D noiseTexture2;
        uniform sampler2D noiseTexture3;
        uniform vec3 colorPrimary;
        uniform vec3 colorSecondary;
        varying vec2 vUv;
        
        void main() {
          // 静态UV坐标用于三个纹理
          vec2 animatedUV1 = vUv;
          vec2 animatedUV2 = vUv + vec2(0.3, 0.1);
          vec2 animatedUV3 = vUv - vec2(0.2, 0.4);
          
          // 采样三张噪声纹理
          float noise1 = texture2D(noiseTexture1, animatedUV1 * 1.5).r;
          float noise2 = texture2D(noiseTexture2, animatedUV2 * 2.5).g;
          float noise3 = texture2D(noiseTexture3, animatedUV3 * 3.5).b;
          
          // 叠加三层噪声，使用不同的权重
          float combinedNoise = noise1 * 0.4 + noise2 * 0.35 + noise3 * 0.25;
          
          // 添加更复杂的时间变化
          float timeWave1 = sin(time * 0.3 + combinedNoise * 8.0) * 0.2 + 0.8;
          float timeWave2 = cos(time * 0.5 + noise2 * 12.0) * 0.15 + 0.85;
          float finalTimeWave = timeWave1 * timeWave2;
          
          // 基于不同噪声层的颜色混合
          vec3 color1 = mix(colorPrimary, colorSecondary, noise1);
          vec3 color2 = mix(colorSecondary, colorPrimary * 1.2, noise2);
          vec3 color3 = mix(colorPrimary * 0.8, colorSecondary * 1.1, noise3);
          
          // 最终颜色混合
          vec3 finalColor = color1 * 0.4 + color2 * 0.35 + color3 * 0.25;
          
          // 最终透明度
          float alpha = combinedNoise * finalTimeWave * 0.18;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false
    });
    
    // 创建网格
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.z = -50; // 放在背景层
  }
  
  updateColors(primary: THREE.Color, secondary: THREE.Color) {
    // 更新材质颜色
    this.material.uniforms.colorPrimary.value = primary;
    this.material.uniforms.colorSecondary.value = secondary;
  }
  
  update(time: number) {
    // 更新着色器时间
    this.material.uniforms.time.value = time;
  }
  
  getMesh(): THREE.Mesh {
    return this.mesh;
  }
  
  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    if (this.noiseTexture1) {
      this.noiseTexture1.dispose();
    }
    if (this.noiseTexture2) {
      this.noiseTexture2.dispose();
    }
    if (this.noiseTexture3) {
      this.noiseTexture3.dispose();
    }
  }
}