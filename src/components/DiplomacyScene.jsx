import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function DiplomacyScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: 0, y: 0 };
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x061b36, 8, 15);

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.55, 8.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const root = new THREE.Group();
    root.position.y = -0.18;
    scene.add(root);

    const world = new THREE.Group();
    world.scale.setScalar(reduceMotion ? 1 : 0.001);
    root.add(world);

    const globeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x163c91,
      emissive: 0x0b2d68,
      emissiveIntensity: 0.22,
      metalness: 0.42,
      roughness: 0.18,
      clearcoat: 0.65,
      clearcoatRoughness: 0.18,
      transparent: true,
      opacity: 0.94,
    });
    const globe = new THREE.Mesh(new THREE.SphereGeometry(1.72, 128, 128), globeMaterial);
    world.add(globe);

    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0xd8ecff,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const grid = new THREE.Mesh(new THREE.SphereGeometry(1.745, 48, 28), gridMaterial);
    world.add(grid);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.05, 96, 96),
      new THREE.MeshBasicMaterial({
        color: 0x64b5ff,
        transparent: true,
        opacity: 0.11,
        side: THREE.BackSide,
      }),
    );
    world.add(atmosphere);

    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x5b92e5, transparent: true, opacity: 0.82 });
    const orbitA = new THREE.Mesh(new THREE.TorusGeometry(2.68, 0.012, 12, 180), orbitMaterial);
    orbitA.rotation.x = Math.PI / 2.65;
    world.add(orbitA);
    const orbitB = new THREE.Mesh(new THREE.TorusGeometry(3.06, 0.009, 10, 200), orbitMaterial);
    orbitB.rotation.x = Math.PI / 1.9;
    orbitB.rotation.z = Math.PI / 7;
    world.add(orbitB);

    const laurelMaterial = new THREE.MeshStandardMaterial({
      color: 0xf4f7ff,
      metalness: 0.28,
      roughness: 0.3,
      emissive: 0x1d5fff,
      emissiveIntensity: 0.08,
    });
    const laurels = new THREE.Group();
    for (let i = 0; i < 17; i += 1) {
      const t = i / 16;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 8), laurelMaterial);
      leaf.position.set(1.05 + t * 0.58, -1.25 + t * 1.95, 0.36);
      leaf.scale.set(0.42, 1.18, 0.2);
      leaf.rotation.z = -0.92 + t * 0.78;
      laurels.add(leaf);
    }
    world.add(laurels);

    const stars = new THREE.Group();
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.82 });
    for (let i = 0; i < 110; i += 1) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(i % 9 === 0 ? 0.027 : 0.014, 8, 8), starMaterial);
      const angle = (i / 110) * Math.PI * 2;
      const radius = 3.15 + (i % 7) * 0.13;
      dot.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.8) * 1.05, Math.sin(angle) * radius * 0.28);
      stars.add(dot);
    }
    root.add(stars);

    const desk = new THREE.Group();
    root.add(desk);
    const baseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x071d35,
      metalness: 0.5,
      roughness: 0.26,
      clearcoat: 0.35,
    });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.18, 2.58, 0.26, 128), baseMaterial);
    base.position.y = -2.08;
    desk.add(base);

    const strikeRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.018, 12, 180),
      new THREE.MeshBasicMaterial({ color: 0x85c7ff, transparent: true, opacity: 0 }),
    );
    strikeRing.position.y = -1.87;
    strikeRing.rotation.x = Math.PI / 2;
    root.add(strikeRing);

    const gavel = new THREE.Group();
    root.add(gavel);
    const gavelMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xb8c7dd,
      metalness: 0.72,
      roughness: 0.18,
      clearcoat: 0.55,
    });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.75, 28), gavelMaterial);
    handle.rotation.z = Math.PI / 2.72;
    handle.position.set(1.05, -1.4, 0.55);
    gavel.add(handle);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.28, 0.32), gavelMaterial);
    head.rotation.z = Math.PI / 2.72;
    head.position.set(0.48, -1.05, 0.55);
    gavel.add(head);
    gavel.rotation.z = reduceMotion ? 0 : -0.34;
    gavel.position.set(0.08, reduceMotion ? 0 : 0.62, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.92));
    const key = new THREE.DirectionalLight(0xffffff, 2.8);
    key.position.set(3.6, 4.2, 4.8);
    scene.add(key);
    const rim = new THREE.PointLight(0x5b92e5, 4.8, 11);
    rim.position.set(-3.4, 1.6, 3.4);
    scene.add(rim);
    const flash = new THREE.PointLight(0x9ed7ff, 0, 7);
    flash.position.set(0, -1.6, 2.2);
    scene.add(flash);

    const onPointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 2;
      pointer.y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
    };
    mount.addEventListener('pointermove', onPointerMove);

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const easeOutBack = (x) => 1 + 2.3 * Math.pow(x - 1, 3) + 1.3 * Math.pow(x - 1, 2);
    let frameId = 0;
    const started = performance.now();
    const render = () => {
      const now = performance.now();
      const elapsed = (now - started) / 1000;

      if (!reduceMotion) {
        const strike = Math.min(Math.max((elapsed - 0.18) / 0.92, 0), 1);
        const reveal = Math.min(Math.max((elapsed - 0.88) / 1.1, 0), 1);
        const shock = Math.min(Math.max((elapsed - 0.72) / 0.9, 0), 1);

        gavel.rotation.z = -0.78 + strike * 0.98 - Math.sin(strike * Math.PI) * 0.12;
        gavel.position.y = 0.72 - strike * 0.72 + Math.sin(Math.min(strike, 1) * Math.PI) * 0.06;
        world.scale.setScalar(Math.min(1, easeOutBack(reveal)));
        strikeRing.scale.setScalar(0.35 + shock * 3.2);
        strikeRing.material.opacity = shock > 0 && shock < 1 ? (1 - shock) * 0.72 : 0;
        flash.intensity = shock > 0 && shock < 0.3 ? (1 - shock / 0.3) * 6 : 0;

        const targetX = pointer.y * 0.08;
        const targetY = pointer.x * 0.16;
        root.rotation.x += (targetX - root.rotation.x) * 0.045;
        root.rotation.y += (targetY - root.rotation.y) * 0.045;

        world.rotation.y += 0.0042;
        grid.rotation.y -= 0.0052;
        orbitA.rotation.z += 0.0016;
        orbitB.rotation.y += 0.0014;
        stars.rotation.y += 0.0015;
        atmosphere.scale.setScalar(1 + Math.sin(now / 900) * 0.015);
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      mount.removeEventListener('pointermove', onPointerMove);
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
