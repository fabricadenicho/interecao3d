import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function MathSurface() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number>(0);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  
  const [isAnimated, setIsAnimated] = useState(true);
  const [frequency, setFrequency] = useState(1.0);
  const [frequencyY, setFrequencyY] = useState(1.0);
  const [amplitude, setAmplitude] = useState(1.0);
  const [wireframe, setWireframe] = useState(false);
  const [surfaceType, setSurfaceType] = useState<"sinc" | "wave" | "ripple" | "sinh" | "exponential">("sinc");
  const [forceUpdate, setForceUpdate] = useState(0);
  const lastUpdateRef = useRef({ surfaceType, frequency, frequencyY, amplitude });

  const surfaceTypeRef = useRef(surfaceType);
  const frequencyRef = useRef(frequency);
  const frequencyYRef = useRef(frequencyY);
  const amplitudeRef = useRef(amplitude);
  const isAnimatedRef = useRef(isAnimated);

  const meshRef = useRef<THREE.Mesh | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    surfaceTypeRef.current = surfaceType;
  }, [surfaceType]);

  useEffect(() => {
    frequencyRef.current = frequency;
  }, [frequency]);

  useEffect(() => {
    frequencyYRef.current = frequencyY;
  }, [frequencyY]);

  useEffect(() => {
    amplitudeRef.current = amplitude;
  }, [amplitude]);

  useEffect(() => {
    isAnimatedRef.current = isAnimated;
  }, [isAnimated]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(6, 6, 6);
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
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(10, 10, 0x888888, 0x444444);
    scene.add(gridHelper);

    // Create surface
    createSurface();
    updateSurface(0);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      const time = clockRef.current.getElapsedTime();
      
      const st = surfaceTypeRef.current;
      const freq = frequencyRef.current;
      const freqY = frequencyYRef.current;
      const amp = amplitudeRef.current;
      const anim = isAnimatedRef.current;

      if (anim) {
        updateSurface(time * 2);
      } else {
        // Verifica se algum parâmetro mudou e força atualização
        const current = { surfaceType: st, frequency: freq, frequencyY: freqY, amplitude: amp };
        const last = lastUpdateRef.current;
        
        if (current.surfaceType !== last.surfaceType || 
            current.frequency !== last.frequency || 
            current.frequencyY !== last.frequencyY || 
            current.amplitude !== last.amplitude) {
          updateSurface(0);
          lastUpdateRef.current = current;
        }
      }
      
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

  const createSurface = () => {
    if (!sceneRef.current) return;

    const size = 12;
    const segments = 150;

    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      roughness: 0.7,
      metalness: 0.1,
      wireframe: wireframe
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    sceneRef.current.add(mesh);
    meshRef.current = mesh;
  };

  const updateSurface = (time: number) => {
    if (!meshRef.current) return;

    const st = surfaceTypeRef.current;
    const freq = frequencyRef.current;
    const freqY = frequencyYRef.current;
    const amp = amplitudeRef.current;
    const anim = isAnimatedRef.current;

    const positions = meshRef.current.geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    
    let zMin = Infinity;
    let zMax = -Infinity;

    // Calculate Z values and find min/max
    const tempZValues = new Float32Array(positions.count);
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      
      let z = 0;
      
      switch (st) {
        case "sinc":
          const r = Math.sqrt(x * x + y * y);
          z = amp * ((r === 0) ? 1.0 : Math.sin(r * freq - (anim ? time : 0)) / r);
          break;
        case "wave":
          z = amp * Math.sin(x * freq - (anim ? time : 0)) * Math.cos(y * freqY);
          break;
        case "ripple":
          const dist = Math.sqrt(x * x + y * y);
          z = amp * Math.sin(dist * freq - (anim ? time : 0)) * Math.exp(-dist * 0.1);
          break;
        case "sinh":
          // Função da sela hiperbólica: f(x,y) = amp * (x² - y²) com pulsação
          const pulse = anim ? Math.cos(time * freq) : 1;
          z = amp * (x * x - y * y) * pulse;
          break;
        case "exponential":
          // Ondas exponenciais: f(x,y) = e^(-r² * decay) * sin(freqX*x + t) * cos(freqY*y + t)
          const r2 = x * x + y * y;
          const animTime = anim ? time * 1.5 : 0;
          z = Math.exp(-r2 * 0.2) * Math.sin(freq * x + animTime) * Math.cos(freqY * y + animTime);
          break;
      }
      
      tempZValues[i] = z;
      if (z < zMin) zMin = z;
      if (z > zMax) zMax = z;
    }

    // Escolha do esquema de cores baseado na função
    let color1, color2, color3, color4, color5;
    
    if (st === "exponential") {
      // Hot colormap para ondas exponenciais
      color1 = new THREE.Color(0x000000); // Preto
      color2 = new THREE.Color(0x990000); // Vermelho escuro
      color3 = new THREE.Color(0xff6600); // Laranja
      color4 = new THREE.Color(0xffff00); // Amarelo
      color5 = new THREE.Color(0xffffff); // Branco
    } else {
      // Cool to Warm para outras funções
      color1 = new THREE.Color(0x3b4cc0);   // Azul
      color2 = new THREE.Color(0xffffff);   // Branco
      color3 = new THREE.Color(0xd4382c);   // Vermelho
      color4 = color2; // Duplicado para compatibilidade
      color5 = color3; // Duplicado para compatibilidade
    }
    
    // Apply Z and colors
    for (let i = 0; i < positions.count; i++) {
      const z = tempZValues[i];
      positions.setZ(i, z);

      const normalizedZ = (zMax > zMin) ? (z - zMin) / (zMax - zMin) : 0.5;
      const color = new THREE.Color();
      
      if (st === "exponential") {
        // Hot colormap com 5 cores
        if (normalizedZ < 0.25) {
          color.lerpColors(color1, color2, normalizedZ * 4);
        } else if (normalizedZ < 0.5) {
          color.lerpColors(color2, color3, (normalizedZ - 0.25) * 4);
        } else if (normalizedZ < 0.75) {
          color.lerpColors(color3, color4, (normalizedZ - 0.5) * 4);
        } else {
          color.lerpColors(color4, color5, (normalizedZ - 0.75) * 4);
        }
      } else {
        // Cool to Warm com 3 cores
        if (normalizedZ < 0.5) {
          color.lerpColors(color1, color2, normalizedZ * 2);
        } else {
          color.lerpColors(color2, color3, (normalizedZ - 0.5) * 2);
        }
      }
      color.toArray(colors, i * 3);
    }

    meshRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    meshRef.current.geometry.attributes.position.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  };

  const handleSurfaceTypeChange = (newType: "sinc" | "wave" | "ripple" | "sinh" | "exponential") => {
    setSurfaceType(newType);
    setForceUpdate(prev => prev + 1);
  };

  const handleWireframeToggle = () => {
    const newWireframe = !wireframe;
    setWireframe(newWireframe);
    if (meshRef.current && meshRef.current.material) {
      (meshRef.current.material as THREE.MeshStandardMaterial).wireframe = newWireframe;
    }
  };

  useEffect(() => {
    if (!isAnimated) {
      updateSurface(0);
    }
  }, [frequency, frequencyY, amplitude, isAnimated, surfaceType]);

  // Força atualização quando forceUpdate muda
  useEffect(() => {
    if (meshRef.current) {
      updateSurface(0);
    }
  }, [forceUpdate]);

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Control Panel */}
      <div className="absolute top-5 left-5 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/20 max-w-xs">
        <button
          onClick={() => navigate("/")}
          className="mb-4 w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
        >
          ← Voltar à Galeria
        </button>
        
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Tipo de Superfície
          </label>
          <select
            value={surfaceType}
            onChange={(e) => handleSurfaceTypeChange(e.target.value as "sinc" | "wave" | "ripple" | "sinh" | "exponential")}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
          >
            <option value="sinc">Função Sinc</option>
            <option value="wave">Onda Bidimensional</option>
            <option value="ripple">Ondulação</option>
            <option value="sinh">Sela Hiperbólica</option>
            <option value="exponential">Ondas Exponenciais</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Frequência X: {frequency.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.05"
            value={frequency}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setFrequency(newValue);
              if (!isAnimated) updateSurface(0);
            }}
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Frequência Y: {frequencyY.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.05"
            value={frequencyY}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setFrequencyY(newValue);
              if (!isAnimated) updateSurface(0);
            }}
            className="w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-2">
            Amplitude: {amplitude.toFixed(1)}
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={amplitude}
            onChange={(e) => {
              const newValue = Number(e.target.value);
              setAmplitude(newValue);
              if (!isAnimated) updateSurface(0);
            }}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center justify-between text-white text-sm py-2 border-t border-white/20 mb-2">
          <label htmlFor="animate-toggle">Animação de Onda</label>
          <input
            id="animate-toggle"
            type="checkbox"
            checked={isAnimated}
            onChange={(e) => setIsAnimated(e.target.checked)}
            className="w-8 h-4 bg-gray-600 rounded-full relative cursor-pointer appearance-none checked:bg-blue-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center justify-between text-white text-sm py-2 border-t border-white/20">
          <label htmlFor="wireframe-toggle">Modo Wireframe</label>
          <input
            id="wireframe-toggle"
            type="checkbox"
            checked={wireframe}
            onChange={handleWireframeToggle}
            className="w-8 h-4 bg-gray-600 rounded-full relative cursor-pointer appearance-none checked:bg-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Information Panel */}
      <div className="absolute top-5 right-5 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/20 max-w-sm">
        <h3 className="text-white font-bold mb-3">
          {surfaceType === "sinc" && "Função Sinc"}
          {surfaceType === "wave" && "Onda Bidimensional"}
          {surfaceType === "ripple" && "Ondulação"}
          {surfaceType === "sinh" && "Sela Hiperbólica"}
          {surfaceType === "exponential" && "Ondas Exponenciais"}
        </h3>
        
        <div className="text-gray-300 text-sm space-y-2">
          {surfaceType === "sinc" && (
            <div>
              <p>A função sinc é fundamental em processamento de sinais.</p>
              <p>Definida como sin(πx)/(πx), ela aparece na teoria de amostragem.</p>
              <p>Visualização 3D mostra sua característica de oscilação decrescente.</p>
            </div>
          )}
          
          {surfaceType === "wave" && (
            <div>
              <p>Onda bidimensional criada pelo produto de seno e cosseno.</p>
              <p>Demonstra interferência construtiva e destrutiva.</p>
              <p>Padrão característico de ondas estacionárias.</p>
            </div>
          )}
          
          {surfaceType === "ripple" && (
            <div>
              <p>Simulação de ondas circulares com decaimento exponencial.</p>
              <p>Similar a ondas na água partindo de um ponto central.</p>
              <p>Combina propagação radial com amortecimento natural.</p>
            </div>
          )}
          
          {surfaceType === "sinh" && (
            <div>
              <p>Superfície de sela hiperbólica: f(x,y) = (x² - y²).</p>
              <p>Forma característica de "sela de cavalo" com pulsação.</p>
              <p>Demonstra curvatura positiva e negativa simultaneamente.</p>
              <p>Fundamental em geometria diferencial e topologia.</p>
            </div>
          )}
          
          {surfaceType === "exponential" && (
            <div>
              <p>Ondas exponenciais: e^(-r²×decay) × sin(x) × cos(y).</p>
              <p>Combina decaimento radial com oscilações trigonométricas.</p>
              <p>Cria padrões que diminuem conforme se afastam do centro.</p>
              <p>Usado em física ondulatória e processamento de sinais.</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-5 left-5 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-white/20 max-w-sm">
        <h3 className="text-white font-bold mb-2">Matemática Visual</h3>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Gire a visualização arrastando</li>
          <li>• Use a roda do mouse para zoom</li>
          <li>• Alterne entre diferentes funções matemáticas</li>
          <li>• Ajuste frequência e amplitude em tempo real</li>
          <li>• Observe padrões de interferência e ondas</li>
        </ul>
      </div>
    </div>
  );
}
