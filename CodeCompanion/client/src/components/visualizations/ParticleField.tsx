import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  energy: number;
  quantum_state: number;
}

export default function ParticleField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  
  const [fieldType, setFieldType] = useState<"wave" | "quantum" | "interference">("wave");
  const [particleCount, setParticleCount] = useState(5000);
  const [waveAmplitude, setWaveAmplitude] = useState(2);
  const [interactionStrength, setInteractionStrength] = useState(1);
  
  const particlesRef = useRef<THREE.Points | null>(null);
  const particleSystemRef = useRef<Particle[]>([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000510);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 30);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    controlsRef.current = controls;

    // Create particle field
    createParticleField();

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      const time = clockRef.current.getElapsedTime();
      updateParticleField(time);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, camera);
      }
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  const createParticleField = () => {
    if (!sceneRef.current) return;

    // Remove existing particles
    if (particlesRef.current) {
      sceneRef.current.remove(particlesRef.current);
    }

    // Create particle geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Initialize particles
    particleSystemRef.current = [];
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Position particles in a volume
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      
      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;
      
      // Initial colors (blue to purple spectrum)
      colors[i3] = 0.3 + Math.random() * 0.4;     // R
      colors[i3 + 1] = 0.1 + Math.random() * 0.3; // G
      colors[i3 + 2] = 0.8 + Math.random() * 0.2; // B
      
      
      // Create particle data
      particleSystemRef.current.push({
        position: new THREE.Vector3(x, y, z),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        energy: Math.random(),
        quantum_state: Math.floor(Math.random() * 4)
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create particle material
    const material = new THREE.PointsMaterial({
      size: 0.5,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    // Create particle system
    const particles = new THREE.Points(geometry, material);
    sceneRef.current.add(particles);
    particlesRef.current = particles;
  };

  const updateParticleField = (time: number) => {
    if (!particlesRef.current || !particleSystemRef.current.length) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;
    const sizeAttr = particlesRef.current.geometry.getAttribute('size') as THREE.BufferAttribute | undefined;
    const sizes = sizeAttr ? (sizeAttr.array as Float32Array) : null;

    for (let i = 0; i < particleSystemRef.current.length; i++) {
      const particle = particleSystemRef.current[i];
      const i3 = i * 3;

      switch (fieldType) {
        case "wave":
          updateWaveField(particle, time, i);
          break;
        case "quantum":
          updateQuantumField(particle, time, i);
          break;
        case "interference":
          updateInterferenceField(particle, time, i);
          break;
      }

      // Update positions
      positions[i3] = particle.position.x;
      positions[i3 + 1] = particle.position.y;
      positions[i3 + 2] = particle.position.z;

      // Update colors based on energy
      const energyColor = particle.energy;
      colors[i3] = 0.2 + energyColor * 0.6;     // R
      colors[i3 + 1] = 0.1 + energyColor * 0.4; // G
      colors[i3 + 2] = 0.9 - energyColor * 0.3; // B

      // Update sizes if attribute exists
      if (sizes) {
        sizes[i] = 0.5 + particle.energy * 2;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.geometry.attributes.color.needsUpdate = true;
    if (sizeAttr) {
      sizeAttr.needsUpdate = true;
    }
  };

  const updateWaveField = (particle: Particle, time: number, index: number) => {
    // Wave function
    const waveX = Math.sin(time * 0.5 + particle.position.z * 0.1) * waveAmplitude;
    const waveY = Math.cos(time * 0.7 + particle.position.x * 0.1) * waveAmplitude;
    const waveZ = Math.sin(time * 0.3 + particle.position.y * 0.1) * waveAmplitude;

    particle.position.x += (waveX - particle.position.x) * 0.01;
    particle.position.y += (waveY - particle.position.y) * 0.01;
    particle.position.z += (waveZ - particle.position.z) * 0.01;

    // Update energy based on wave amplitude
    particle.energy = (Math.sin(time + index * 0.1) + 1) * 0.5;
  };

  const updateQuantumField = (particle: Particle, time: number, index: number) => {
    // Quantum tunneling effect
    if (Math.random() < 0.001) {
      particle.position.x = (Math.random() - 0.5) * 40;
      particle.position.y = (Math.random() - 0.5) * 40;
      particle.position.z = (Math.random() - 0.5) * 40;
    }

    // Quantum state transitions
    const stateTransition = Math.sin(time * 2 + index * 0.1);
    if (stateTransition > 0.95) {
      particle.quantum_state = (particle.quantum_state + 1) % 4;
    }

    // Energy levels
    particle.energy = Math.abs(Math.sin(time * 0.5 + particle.quantum_state));

    // Uncertainty principle - position becomes more uncertain
    particle.position.x += (Math.random() - 0.5) * 0.1 * interactionStrength;
    particle.position.y += (Math.random() - 0.5) * 0.1 * interactionStrength;
    particle.position.z += (Math.random() - 0.5) * 0.1 * interactionStrength;
  };

  const updateInterferenceField = (particle: Particle, time: number, index: number) => {
    // Two wave sources creating interference pattern
    const source1 = new THREE.Vector3(-10, 0, 0);
    const source2 = new THREE.Vector3(10, 0, 0);

    const dist1 = particle.position.distanceTo(source1);
    const dist2 = particle.position.distanceTo(source2);

    const wave1 = Math.sin(time * 2 - dist1 * 0.2) * waveAmplitude;
    const wave2 = Math.sin(time * 2 - dist2 * 0.2) * waveAmplitude;

    // Interference pattern
    const interference = wave1 + wave2;
    particle.energy = Math.abs(interference) / (2 * waveAmplitude);

    // Move particles based on interference
    const force = interference * 0.01;
    particle.position.y += force;

    // Gradual return to original position
    particle.position.x += (particle.position.x * -0.001);
    particle.position.z += (particle.position.z * -0.001);
  };

  const resetField = () => {
    createParticleField();
  };

  useEffect(() => {
    createParticleField();
  }, [particleCount]);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Control Panel */}
      <div className="absolute top-5 left-5 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/20 max-w-xs">
        <button
          onClick={() => navigate("/")}
          className="mb-4 w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
        >
          ← Back to Gallery
        </button>
        
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Field Type
          </label>
          <select
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value as "wave" | "quantum" | "interference")}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="wave">Wave Function</option>
            <option value="quantum">Quantum Field</option>
            <option value="interference">Wave Interference</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Particles: {particleCount}
          </label>
          <input
            type="range"
            min="1000"
            max="10000"
            step="500"
            value={particleCount}
            onChange={(e) => setParticleCount(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Wave Amplitude: {waveAmplitude.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="5"
            step="0.1"
            value={waveAmplitude}
            onChange={(e) => setWaveAmplitude(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Interaction: {interactionStrength.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={interactionStrength}
            onChange={(e) => setInteractionStrength(Number(e.target.value))}
            className="w-full"
          />
        </div>
        
        <button
          onClick={resetField}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
        >
          🔄 Reset Field
        </button>
      </div>

      {/* Field Information */}
      <div className="absolute top-5 right-5 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/20 max-w-sm">
        <h3 className="text-white font-bold mb-3">
          {fieldType === "wave" && "Wave Function"}
          {fieldType === "quantum" && "Quantum Field"}
          {fieldType === "interference" && "Wave Interference"}
        </h3>
        
        <div className="text-gray-300 text-sm space-y-2">
          {fieldType === "wave" && (
            <div>
              <p>Particles follow sinusoidal wave patterns in 3D space.</p>
              <p>Energy varies with wave amplitude and frequency.</p>
              <p>Demonstrates wave-like behavior of matter.</p>
            </div>
          )}
          
          {fieldType === "quantum" && (
            <div>
              <p>Particles exhibit quantum tunneling and state transitions.</p>
              <p>Position uncertainty demonstrates Heisenberg principle.</p>
              <p>Discrete energy levels and quantum superposition.</p>
            </div>
          )}
          
          {fieldType === "interference" && (
            <div>
              <p>Two wave sources create interference patterns.</p>
              <p>Constructive and destructive interference visible.</p>
              <p>Demonstrates wave nature and double-slit experiment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="absolute bottom-5 right-5 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/20">
        <h3 className="text-white font-bold mb-2">Statistics</h3>
        <div className="text-gray-300 text-sm space-y-1">
          <div>Active Particles: <span className="text-white font-semibold">{particleCount.toLocaleString()}</span></div>
          <div>Field Type: <span className="text-blue-400 font-semibold">{fieldType}</span></div>
          <div>Wave Amplitude: <span className="text-green-400 font-semibold">{waveAmplitude}x</span></div>
          <div>Interaction: <span className="text-purple-400 font-semibold">{interactionStrength}x</span></div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-5 left-5 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/20 max-w-sm">
        <h3 className="text-white font-bold mb-2">Quantum Physics</h3>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Particles exhibit wave-particle duality</li>
          <li>• Quantum states are probabilistic</li>
          <li>• Energy levels are quantized</li>
          <li>• Uncertainty principle limits precision</li>
          <li>• Wave interference creates patterns</li>
        </ul>
      </div>
    </div>
  );
}
