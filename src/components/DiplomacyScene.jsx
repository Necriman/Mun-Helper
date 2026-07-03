import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function DiplomacyScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.8, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1.55, 64, 64),
      new THREE.MeshStandardMaterial({
        color: 0x3b82c4,
        metalness: 0.18,
        roughness: 0.34,
        transparent: true,
        opacity: 0.88,
      }),
    );
    group.add(globe);

    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(1.575, 32, 16),
      new THREE.MeshBasicMaterial({ color: 0xeef5fc, wireframe: true, transparent: true, opacity: 0.26 }),
    );
    group.add(wire);

    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xf3e6c2, transparent: true, opacity: 0.72 });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.28, 0.012, 12, 120), ringMaterial);
    ringA.rotation.x = Math.PI / 2.6;
    group.add(ringA);

    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.04, 0.01, 12, 120), ringMaterial);
    ringB.rotation.y = Math.PI / 2.2;
    ringB.rotation.x = Math.PI / 7;
    group.add(ringB);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 2.22, 0.22, 64),
      new THREE.MeshStandardMaterial({ color: 0x0f3355, metalness: 0.28, roughness: 0.42 }),
    );
    base.position.y = -2.05;
    group.add(base);

    const gavelMaterial = new THREE.MeshStandardMaterial({ color: 0xb08d2e, metalness: 0.25, roughness: 0.36 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.55, 20), gavelMaterial);
    handle.rotation.z = Math.PI / 2.9;
    handle.position.set(0.95, -1.48, 0.3);
    group.add(handle);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.26, 0.28), gavelMaterial);
    head.rotation.z = Math.PI / 2.9;
    head.position.set(0.46, -1.18, 0.3);
    group.add(head);

    const particles = new THREE.Group();
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xd7e8f7, transparent: true, opacity: 0.7 });
    for (let i = 0; i < 52; i += 1) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), dotMaterial);
      const angle = (i / 52) * Math.PI * 2;
      const radius = 2.75 + (i % 4) * 0.12;
      dot.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.4) * 0.7, Math.sin(angle) * radius * 0.16);
      particles.add(dot);
    }
    group.add(particles);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 4, 5);
    scene.add(key);
    const blue = new THREE.PointLight(0x7fb3e4, 2.5, 9);
    blue.position.set(-3, 1, 3);
    scene.add(blue);

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
        group.rotation.y += 0.004;
        wire.rotation.y -= 0.003;
        particles.rotation.y += 0.002;
        group.rotation.x = Math.sin(performance.now() / 1800) * 0.035;
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
