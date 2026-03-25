'use client'
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const CartoonRobot = ({ width = '100%', height = '100%', style = {} }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const robotRef = useRef<any>(null);

  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;

    // 获取容器实际尺寸
    const container = containerRef.current as HTMLDivElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 场景、相机、渲染器
    const scene = new THREE.Scene();
    scene.background = null; // 透明背景

    // 透视相机：视野、宽高比、近平面、远平面
    const camera = new THREE.PerspectiveCamera(45, containerWidth / containerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 1.5, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true }); // 透明背景
    renderer.setSize(containerWidth, containerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // --- 灯光 ---
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    // 主光源方向光
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1, 2, 1);
    scene.add(dirLight);
    // 背光暖色补充
    const backLight = new THREE.DirectionalLight(0xffaa66, 0.5);
    backLight.position.set(-1, 1, -1);
    scene.add(backLight);

    // --- 创建卡通机器人（组）---
    const robot = new THREE.Group();

    // 身体（圆角立方体，使用 BoxGeometry + 圆滑材质）
    const bodyGeo = new THREE.BoxGeometry(1.2, 1.5, 0.8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x66ccff, roughness: 0.2, metalness: 0.1 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0;
    robot.add(body);

    // 头部（球体）
    const headGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xffdd99, roughness: 0.3 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.2;
    robot.add(head);

    // 眼睛（两个小黑球）
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), eyeMat);
    leftEye.position.set(-0.25, 1.45, 0.65);
    robot.add(leftEye);
    const rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), eyeMat);
    rightEye.position.set(0.25, 1.45, 0.65);
    robot.add(rightEye);
    
    // 瞳孔高光（小白点）
    const highlightMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const leftHigh = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), highlightMat);
    leftHigh.position.set(-0.28, 1.48, 0.72);
    robot.add(leftHigh);
    const rightHigh = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), highlightMat);
    rightHigh.position.set(0.22, 1.48, 0.72);
    robot.add(rightHigh);

    // 嘴巴（半圆环或者一个小圆环）
    const mouthGeo = new THREE.TorusGeometry(0.2, 0.05, 16, 32, Math.PI);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0xcc8866 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.rotation.x = 0.2;
    mouth.rotation.z = 0.1;
    mouth.position.set(0, 1.2, 0.68);
    robot.add(mouth);

    // 天线（圆柱 + 小球）
    const antennaMat = new THREE.MeshStandardMaterial({ color: 0xffaa66 });
    const antennaStick = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8), antennaMat);
    antennaStick.position.set(0, 1.85, 0);
    robot.add(antennaStick);
    const antennaBall = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshStandardMaterial({ color: 0xff6666 }));
    antennaBall.position.set(0, 2.05, 0);
    robot.add(antennaBall);

    // 手臂（圆柱，可旋转动画）
    const armMat = new THREE.MeshStandardMaterial({ color: 0x66ccff });
    const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8), armMat);
    leftArm.position.set(-0.9, 1.0, 0);
    leftArm.rotation.z = 0.3;
    robot.add(leftArm);
    const rightArm = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8), armMat);
    rightArm.position.set(0.9, 1.0, 0);
    rightArm.rotation.z = -0.3;
    robot.add(rightArm);
    
    // 腿部（小圆柱）
    const legMat = new THREE.MeshStandardMaterial({ color: 0x66ccff });
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.6, 8), legMat);
    leftLeg.position.set(-0.4, -0.8, 0);
    robot.add(leftLeg);
    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.6, 8), legMat);
    rightLeg.position.set(0.4, -0.8, 0);
    robot.add(rightLeg);

    scene.add(robot);
    robotRef.current = robot;

    // 添加一个简单的粒子背景（可选，增加趣味）
    const particleCount = 800;
    const particlesGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i*3] = (Math.random() - 0.5) * 20;
      particlePositions[i*3+1] = (Math.random() - 0.5) * 10;
      particlePositions[i*3+2] = (Math.random() - 0.5) * 15 - 5;
    }
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.05, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(particlesGeo, particleMat);
    scene.add(particles);

    // 保存引用以便动画中使用
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // 动画循环
    let animationId:any;
    let time = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.02;

      // 机器人浮动效果
      if (robot) {
        robot.position.y = Math.sin(time) * 0.05;
        // 手臂摆动
        if (leftArm && rightArm) {
          leftArm.rotation.z = 0.3 + Math.sin(time * 2) * 0.2;
          rightArm.rotation.z = -0.3 + Math.cos(time * 2) * 0.2;
        }
        // 天线小球旋转
        if (antennaBall) {
          antennaBall.rotation.y += 0.02;
        }
      }

      // 粒子缓慢旋转
      particles.rotation.y += 0.002;
      particles.rotation.x += 0.001;

      renderer.render(scene, camera);
    };
    animate();

    // 监听窗口/容器大小变化
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

    // 清理函数
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []); // 空依赖确保只初始化一次

  return (
    <div
      ref={containerRef}
      style={{
        width: width,
        height: height,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    />
  );
};

export default CartoonRobot;