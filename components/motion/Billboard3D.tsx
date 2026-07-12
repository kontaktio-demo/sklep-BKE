"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Mesh } from "three";
import { cn } from "@/lib/utils";

function CollarRing() {
  const mesh = useRef<Mesh>(null);

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    m.rotation.y += delta * 0.18;
    m.rotation.x = 0.45 + Math.sin(state.clock.elapsedTime * 0.35) * 0.07;
  });

  return (
    <mesh ref={mesh} rotation={[0.45, 0, 0]}>
      <torusGeometry args={[1.7, 0.42, 48, 128]} />
      <meshStandardMaterial color="#4A5D43" roughness={0.55} metalness={0.35} />
    </mesh>
  );
}

// Hero billboard only (§7-1). Loaded via next/dynamic ssr:false; the hero keeps
// a static image behind it, so returning null is always a safe fallback.
export default function Billboard3D({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") ?? probe.getContext("webgl");
    const webglOk = gl !== null;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(webglOk && !mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  // pause the frameloop while the billboard is scrolled offscreen
  useEffect(() => {
    if (!enabled) return;
    const node = containerRef.current;
    if (!node) return;
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry) setInView(entry.isIntersecting);
    });
    io.observe(node);
    return () => io.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
    >
      <Canvas
        frameloop={inView ? "always" : "never"}
        gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6], fov: 45 }}
      >
        <ambientLight intensity={0.25} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} />
        <pointLight color="#E50914" intensity={30} position={[-4, 1.5, -3]} />
        <CollarRing />
      </Canvas>
    </div>
  );
}
