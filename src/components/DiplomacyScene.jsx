import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function DiplomacyScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x071a2e, 7.2, 13);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.55, 8.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.position.y = -0.15;
    scene.add(group);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1.62, 96, 96),
      new THREE.MeshStandardMaterial({
        color: 0x3b82c4,
        emissive: 0x0f3355,
        emissiveIntensity: 0.16,
        metalness: 0.28,
        roughness: 0.24,
        transparent: true,
        opacity: 0.9,
      }),
    );
    group.add(globe);

    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(1.66, 48, 24),
      new THREE.MeshBasicMaterial({ color: 0xeef5fc, wireframe: true, transparent: true, opacity: 0.22 }),
    );
    group.add(wire);

    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(1.9, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x7fb3e4, transparent: true, opacity: 0.08, side: THREE.BackSide }),
    );
    group.add(halo);

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xf3e6c2, transparent: true, opacity: 0.78 });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.42, 0.012, 12, 160), ringMaterial);
    ringA.rotation.x = Math.PI / 2.6;
    group.add(ringA);

    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.16, 0.01, 12, 160), ringMaterial);
    ringB.rotation.y = Math.PI / 2.2;
    ringB.rotation.x = Math.PI / 7;
    group.add(ringB);

    const ringC = new THREE.Mesh(new THREE.TorusGeometry(2.74, 0.006, 8, 180), ringMaterial);
    ringC.rotation.x = Math.PI / 1.9;
    ringC.rotation.z = Math.PI / 9;
    group.add(ringC);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(2.08, 2.46, 0.28, 96),
      new THREE.MeshStandardMaterial({ color: 0x0a2038, metalness: 0.44, roughness: 0.34 }),
    );
    base.position.y = -2.12;
    group.add(base);

    const baseTop = new THREE.Mesh(
      new THREE.CylinderGeometry(1.78, 2.08, 0.09, 96),
      new THREE.MeshStandardMaterial({ color: 0xb08d2e, metalness: 0.48, roughness: 0.28 }),
    );
    baseTop.position.y = -1.91;
    group.add(baseTop);

    const gavelMaterial = new THREE.MeshStandardMaterial({ color: 0xb08d2e, metalness: 0.25, roughness: 0.36 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.55, 20), gavelMaterial);
    handle.rotation.z = Math.PI / 2.9;
    handle.position.set(0.95, -1.48, 0.3);
    group.add(handle);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.26, 0.28), gavelMaterial);
    head.rotation.z = Math.PI / 2.9;
    head.position.set(0.46, -1.18, 0.3);
    group.add(head);

    const laurelMaterial = new THREE.MeshStandardMaterial({ color: 0xd4af5f, metalness: 0.34, roughness: 0.32 });
    const laurels = new THREE.Group();
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 13; i += 1) {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 8), laurelMaterial);
        const t = i / 12;
        const angle = -1.05 + t * 1.85;
        leaf.position.set(side * (1.98 + Math.sin(t * Math.PI) * 0.32), -1.12 + t * 2.05, Math.cos(angle) * 0.12);
        leaf.scale.set(0.45, 1.15, 0.18);
        leaf.rotation.z = side * (0.65 - t * 0.6);
        laurels.add(leaf);
      }
    }
    group.add(laurels);

    const particles = new THREE.Group();
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xd7e8f7, transparent: true, opacity: 0.62 });
    for (let i = 0; i < 90; i += 1) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(i % 7 === 0 ? 0.024 : 0.014, 8, 8), dotMaterial);
      const angle = (i / 90) * Math.PI * 2;
      const radius = 3.05 + (i % 5) * 0.14;
      dot.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.25) * 0.94, Math.sin(angle) * radius * 0.2);
      particles.add(dot);
    }
    group.add(particles);

    scene.add(new THREE.AmbientLight(0xffffff, 1.05));
    const key = new THREE.DirectionalLight(0xffffff, 2.45);
    key.position.set(3, 4, 5);
    scene.add(key);
    const blue = new THREE.PointLight(0x7fb3e4, 3.2, 10);
    blue.position.set(-3.2, 1.4, 3);
    scene.add(blue);
    const gold = new THREE.PointLight(0xd4af5f, 1.8, 8);
    gold.position.set(2.6, -1.2, 2.2);
    scene.add(gold);

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    let frameId = 0;
    const render = () => {
      if (!reduceMotion) {
        const now = performance.now();
        group.rotation.y += 0.0038;
        wire.rotation.y -= 0.0046;
        ringA.rotation.z += 0.0012;
        ringB.rotation.z -= 0.001;
        ringC.rotation.y += 0.0014;
        particles.rotation.y += 0.0024;
        laurels.rotation.y = Math.sin(now / 1800) * 0.035;
        group.rotation.x = Math.sin(now / 1900) * 0.045;
        group.position.y = -0.16 + Math.sin(now / 1600) * 0.055;
      }
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      mount.removeChild(renderer.domElement);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" data-testid="diplomacy-scene" />;
}
