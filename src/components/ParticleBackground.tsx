'use client'
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// 组件 Props 类型
interface ParticleBackgroundProps {
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
  particleCount?: number;
  color?: string;        // 十六进制颜色字符串，如 "#88aaff"
  size?: number;         // 粒子基础大小
  speed?: number;        // 动画速度系数
  onClick?: (event: React.MouseEvent<HTMLDivElement>, objects: { particles: THREE.Points | null; stars: THREE.Points | null }) => void;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  width = '100%',
  height = '100%',
  style = {},
  particleCount = 2000,
  color = '#88aaff',
  size = 0.08,
  speed = 0.5,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const materialRef = useRef<THREE.PointsMaterial | null>(null);

  // 存储原始材质属性（用于点击恢复）
  const originalColorRef = useRef<THREE.Color | null>(null);
  const originalSizeRef = useRef<number>(size);
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 点击处理函数
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // 执行外部回调（如果提供）
    if (onClick) {
      onClick(event, { particles: particlesRef.current, stars: starsRef.current });
    }

    // 默认脉冲效果：临时改变颜色和大小，然后恢复
    const material = materialRef.current;
    if (material) {
      // 保存原始颜色（仅第一次）
      if (!originalColorRef.current) {
        originalColorRef.current = material.color.clone();
      }
      // 临时修改
      material.color.setHex(0xff8844);
      material.size = originalSizeRef.current * 1.5;

      // 清除之前的定时器，避免恢复冲突
      if (pulseTimeoutRef.current) {
        clearTimeout(pulseTimeoutRef.current);
      }
      pulseTimeoutRef.current = setTimeout(() => {
        if (materialRef.current && originalColorRef.current) {
          materialRef.current.color.copy(originalColorRef.current);
          materialRef.current.size = originalSizeRef.current;
        }
        pulseTimeoutRef.current = null;
      }, 300);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 场景
    const scene = new THREE.Scene();
    scene.background = null; // 透明

    // 相机
    const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    camera.position.z = 5;

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(containerWidth, containerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // 主粒子几何体
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // 解析主色
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;

      // 颜色在主色附近随机变化
      const variation = 0.5;
      colors[i * 3] = r + (Math.random() - 0.5) * variation;
      colors[i * 3 + 1] = g + (Math.random() - 0.5) * variation;
      colors[i * 3 + 2] = b + (Math.random() - 0.5) * variation;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // 粒子材质
    const material = new THREE.PointsMaterial({
      size: size,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    materialRef.current = material;
    originalSizeRef.current = size;

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    particlesRef.current = particles;

    // 星星粒子（第二层）
    const starCount = 800;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 20;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 12;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 10;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffaa88,
      size: 0.05,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    starsRef.current = stars;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // 动画循环
    let time = 0;
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01 * speed;

      if (particles) {
        particles.rotation.y = time * 0.1;
        particles.rotation.x = Math.sin(time * 0.2) * 0.2;
      }
      if (stars) {
        stars.rotation.y = time * 0.05;
        stars.rotation.x = time * 0.03;
      }

      camera.position.x = Math.sin(time * 0.2) * 0.2;
      camera.position.y = Math.cos(time * 0.3) * 0.1;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // 监听容器尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = newWidth / newHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(newWidth, newHeight);
      }
    });
    resizeObserver.observe(container);

    // 添加点击事件监听（通过 React 合成事件需要绑定到原生元素）
    const containerDiv = container;
    containerDiv.addEventListener('click', handleClick as any); // 类型转换因 React.MouseEvent 和原生事件略有差异，但实际可用

    // 清理函数
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      if (pulseTimeoutRef.current) clearTimeout(pulseTimeoutRef.current);
      renderer.dispose();
      containerDiv.removeEventListener('click', handleClick as any);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [particleCount, color, size, speed, onClick]); // 依赖项变化时完全重建粒子系统

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        ...style,
      }}
    />
  );
};

export default ParticleBackground;