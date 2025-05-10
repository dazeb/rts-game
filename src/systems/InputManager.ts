import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { UnitManager } from './UnitManager';
import { BuildingManager } from './BuildingManager';

export class InputManager {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private scene: THREE.Scene;
  private unitManager: UnitManager;
  private buildingManager: BuildingManager;

  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;

  private isShiftPressed: boolean = false;
  private isDragging: boolean = false;
  private dragStartPosition: THREE.Vector2 = new THREE.Vector2();
  private selectionBox: THREE.Mesh | null = null;

  constructor(
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls,
    scene: THREE.Scene,
    unitManager: UnitManager,
    buildingManager: BuildingManager
  ) {
    this.camera = camera;
    this.controls = controls;
    this.scene = scene;
    this.unitManager = unitManager;
    this.buildingManager = buildingManager;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  public initialize(): void {
    // Add event listeners
    window.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    window.addEventListener('wheel', this.onWheel.bind(this));

    // Create selection box
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide
    });

    this.selectionBox = new THREE.Mesh(geometry, material);
    this.selectionBox.rotation.x = -Math.PI / 2; // Make it horizontal
    this.selectionBox.visible = false;
    this.scene.add(this.selectionBox);
  }

  private onMouseDown(event: MouseEvent): void {
    // Only handle left mouse button
    if (event.button !== 0) return;

    // Update mouse position
    this.updateMousePosition(event);

    // Start dragging for selection box
    this.isDragging = true;
    this.dragStartPosition.set(this.mouse.x, this.mouse.y);

    // If shift is not pressed, deselect all units
    if (!this.isShiftPressed) {
      this.unitManager.deselectAllUnits();
      this.buildingManager.deselectBuilding();
    }
  }

  private onMouseMove(event: MouseEvent): void {
    // Update mouse position
    this.updateMousePosition(event);

    // Handle selection box if dragging
    if (this.isDragging && this.selectionBox) {
      // Calculate selection box dimensions
      const startWorldPos = this.getWorldPositionAtMouse(this.dragStartPosition);
      const currentWorldPos = this.getWorldPositionAtMouse(this.mouse);

      if (startWorldPos && currentWorldPos) {
        // Calculate center position
        const centerX = (startWorldPos.x + currentWorldPos.x) / 2;
        const centerZ = (startWorldPos.z + currentWorldPos.z) / 2;

        // Calculate dimensions
        const width = Math.abs(startWorldPos.x - currentWorldPos.x);
        const height = Math.abs(startWorldPos.z - currentWorldPos.z);

        // Update selection box
        this.selectionBox.position.set(centerX, 0.1, centerZ);
        this.selectionBox.scale.set(width, height, 1);
        this.selectionBox.visible = true;
      }
    }
  }

  private onMouseUp(event: MouseEvent): void {
    // Only handle left mouse button
    if (event.button !== 0) {
      // Right click for movement
      if (event.button === 2) {
        this.handleRightClick(event);
      }
      return;
    }

    // Update mouse position
    this.updateMousePosition(event);

    // Check if it was a click or drag
    if (this.isDragging) {
      // Handle selection box
      if (this.selectionBox && this.selectionBox.visible) {
        this.handleSelectionBox();
      } else {
        // Single click selection
        this.handleSingleSelection();
      }
    } else {
      // Single click selection
      this.handleSingleSelection();
    }

    // Reset dragging state
    this.isDragging = false;
    if (this.selectionBox) {
      this.selectionBox.visible = false;
    }
  }

  private handleSelectionBox(): void {
    // Get selection box bounds
    if (!this.selectionBox) return;

    const position = this.selectionBox.position;
    const scale = this.selectionBox.scale;

    const minX = position.x - scale.x / 2;
    const maxX = position.x + scale.x / 2;
    const minZ = position.z - scale.y / 2;
    const maxZ = position.z + scale.y / 2;

    // Select all units within the selection box
    for (const unit of this.unitManager.getUnits()) {
      if (!unit.isPlayerUnit()) continue;

      const unitPos = unit.getPosition();

      if (
        unitPos.x >= minX && unitPos.x <= maxX &&
        unitPos.z >= minZ && unitPos.z <= maxZ
      ) {
        this.unitManager.selectUnit(unit);
      }
    }
  }

  private handleSingleSelection(): void {
    // Cast ray from mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check for intersections with units
    const unitMeshes = this.unitManager.getUnits().map(unit => unit.getMesh());
    const unitIntersects = this.raycaster.intersectObjects(unitMeshes);

    if (unitIntersects.length > 0) {
      // Find the unit that was clicked
      const mesh = unitIntersects[0].object;
      const unit = this.unitManager.getUnits().find(u => u.getMesh() === mesh);

      if (unit) {
        this.unitManager.selectUnit(unit);
        return;
      }
    }

    // Check for intersections with buildings
    const buildingMeshes = this.buildingManager.getBuildings().map(building => building.getMesh());
    const buildingIntersects = this.raycaster.intersectObjects(buildingMeshes);

    if (buildingIntersects.length > 0) {
      // Find the building that was clicked
      const mesh = buildingIntersects[0].object;
      const building = this.buildingManager.getBuildings().find(b => b.getMesh() === mesh);

      if (building) {
        this.buildingManager.selectBuilding(building);
        return;
      }
    }

    // If no unit or building was clicked, check for ground intersection
    const groundIntersects = this.raycaster.intersectObjects([this.scene], true);

    if (groundIntersects.length > 0) {
      // Deselect all if ground was clicked
      this.unitManager.deselectAllUnits();
      this.buildingManager.deselectBuilding();
    }
  }

  private handleRightClick(event: MouseEvent): void {
    // Update mouse position
    this.updateMousePosition(event);

    // Cast ray from mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check for intersections with ground
    const groundIntersects = this.raycaster.intersectObjects([this.scene], true);

    if (groundIntersects.length > 0) {
      const point = groundIntersects[0].point;

      // Move selected units to the clicked position
      if (this.unitManager.getSelectedUnits().length > 0) {
        this.unitManager.moveSelectedUnits(point.x, point.z);
      }
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    // Handle shift key for multi-selection
    if (event.key === 'Shift') {
      this.isShiftPressed = true;
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    // Handle shift key for multi-selection
    if (event.key === 'Shift') {
      this.isShiftPressed = false;
    }
  }

  private onWheel(event: WheelEvent): void {
    // Handled by OrbitControls
  }

  private updateMousePosition(event: MouseEvent): void {
    // Calculate mouse position in normalized device coordinates (-1 to +1)
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  private getWorldPositionAtMouse(mouse: THREE.Vector2): THREE.Vector3 | null {
    // Cast ray from mouse position
    this.raycaster.setFromCamera(mouse, this.camera);

    // Create a plane at y=0 (ground level)
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    // Calculate intersection with ground plane
    const target = new THREE.Vector3();
    if (this.raycaster.ray.intersectPlane(groundPlane, target)) {
      return target;
    }

    return null;
  }

  public dispose(): void {
    // Remove event listeners
    window.removeEventListener('mousedown', this.onMouseDown.bind(this));
    window.removeEventListener('mousemove', this.onMouseMove.bind(this));
    window.removeEventListener('mouseup', this.onMouseUp.bind(this));
    window.removeEventListener('keydown', this.onKeyDown.bind(this));
    window.removeEventListener('keyup', this.onKeyUp.bind(this));
    window.removeEventListener('wheel', this.onWheel.bind(this));

    // Remove selection box
    if (this.selectionBox) {
      this.scene.remove(this.selectionBox);
    }
  }
}
