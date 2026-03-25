'use client'
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 确保只在客户端运行
    if (typeof window === 'undefined') return;

    // 场景、相机、渲染器
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true }); // 透明背景
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // 完全透明，以便背景色透过
    containerRef.current?.appendChild(renderer.domElement);

    // 添加一个简单的几何体（这里用环面结，视觉效果更炫酷）
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x4c9aff, roughness: 0.3, metalness: 0.7 });
    const knot = new THREE.Mesh(geometry, material);
    scene.add(knot);

    // 添加灯光
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 2, 3);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);

    camera.position.z = 3;

    // 动画循环
    let animationId:any;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      knot.rotation.x += 0.01;
      knot.rotation.y += 0.012;
      renderer.render(scene, camera);
    };
    animate();

    // 窗口大小自适应
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none', // 让背景不干扰点击事件
      }}
    />
  );
}