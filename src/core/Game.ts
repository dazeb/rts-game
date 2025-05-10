import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'stats.js';
import { ResourceManager } from '../systems/ResourceManager';
import { TerrainSystem } from '../systems/TerrainSystem';
import { UnitManager } from '../systems/UnitManager';
import { BuildingManager } from '../systems/BuildingManager';
import { UIManager } from '../ui/UIManager';
import { InputManager } from '../systems/InputManager';
import { FactionManager } from '../systems/FactionManager';
import { AIManager } from '../systems/AIManager';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private stats: Stats;
  private clock: THREE.Clock;
  
  // Game systems
  private resourceManager: ResourceManager;
  private terrainSystem: TerrainSystem;
  private unitManager: UnitManager;
  private buildingManager: BuildingManager;
  private uiManager: UIManager;
  private inputManager: InputManager;
  private factionManager: FactionManager;
  private aiManager: AIManager;
  
  // Game state
  private isRunning: boolean = false;
  
  constructor(container: HTMLElement) {
    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);
    
    // Set up camera
    this.camera.position.set(0, 50, 50);
    this.camera.lookAt(0, 0, 0);
    
    // Set up controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = false;
    this.controls.minDistance = 20;
    this.controls.maxDistance = 100;
    this.controls.maxPolarAngle = Math.PI / 2.5; // Limit camera angle to prevent going below ground
    
    // Set up stats
    this.stats = new Stats();
    this.stats.showPanel(0);
    document.body.appendChild(this.stats.dom);
    
    // Set up clock
    this.clock = new THREE.Clock();
    
    // Initialize game systems
    this.resourceManager = new ResourceManager();
    this.terrainSystem = new TerrainSystem(this.scene);
    this.factionManager = new FactionManager();
    this.unitManager = new UnitManager(this.scene, this.factionManager);
    this.buildingManager = new BuildingManager(this.scene, this.factionManager);
    this.uiManager = new UIManager(this.factionManager, this.resourceManager);
    this.inputManager = new InputManager(
      this.camera, 
      this.controls, 
      this.scene, 
      this.unitManager, 
      this.buildingManager
    );
    this.aiManager = new AIManager(
      this.factionManager, 
      this.unitManager, 
      this.buildingManager, 
      this.resourceManager
    );
    
    // Set up event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Add lights
    this.setupLights();
  }
  
  private setupLights(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    
    this.scene.add(directionalLight);
  }
  
  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  public async initialize(): Promise<void> {
    // Load assets and initialize game systems
    await this.resourceManager.loadAssets();
    
    // Initialize terrain
    this.terrainSystem.createTerrain(100, 100);
    
    // Initialize factions
    this.factionManager.createFactions();
    
    // Initialize player starting units and buildings
    this.buildingManager.createInitialBuildings();
    this.unitManager.createInitialUnits();
    
    // Initialize UI
    this.uiManager.initialize();
    
    // Initialize input manager
    this.inputManager.initialize();
    
    // Start the game
    this.isRunning = true;
    this.animate();
  }
  
  private animate(): void {
    if (!this.isRunning) return;
    
    requestAnimationFrame(this.animate.bind(this));
    
    this.stats.begin();
    
    const deltaTime = this.clock.getDelta();
    
    // Update game systems
    this.controls.update();
    this.unitManager.update(deltaTime);
    this.buildingManager.update(deltaTime);
    this.aiManager.update(deltaTime);
    this.uiManager.update();
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
    
    this.stats.end();
  }
  
  public dispose(): void {
    this.isRunning = false;
    
    // Dispose of resources
    this.inputManager.dispose();
    this.uiManager.dispose();
    
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    
    // Dispose of Three.js resources
    this.renderer.dispose();
    this.controls.dispose();
  }
}
