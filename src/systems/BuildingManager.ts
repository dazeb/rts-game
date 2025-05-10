import * as THREE from 'three';
import { FactionManager, FactionType } from './FactionManager';
import type { BuildingStats } from './FactionManager';
import { TextureType } from './ResourceManager';
import { Building, BuildingType } from '../entities/Building';

export class BuildingManager {
  private scene: THREE.Scene;
  private factionManager: FactionManager;
  private buildings: Building[] = [];
  private selectedBuilding: Building | null = null;

  constructor(scene: THREE.Scene, factionManager: FactionManager) {
    this.scene = scene;
    this.factionManager = factionManager;
  }

  public createInitialBuildings(): void {
    // Create initial buildings for player faction
    const playerFaction = this.factionManager.getPlayerFaction();
    if (playerFaction) {
      // Create fortress (main building)
      this.createBuilding(
        BuildingType.FORTRESS,
        playerFaction.type,
        -20, 0, -20
      );

      // Create farm
      this.createBuilding(
        BuildingType.FARM,
        playerFaction.type,
        -25, 0, -15
      );
    }

    // Create initial buildings for AI faction
    const aiFaction = this.factionManager.getAIFaction();
    if (aiFaction) {
      // Create fortress (main building)
      this.createBuilding(
        BuildingType.FORTRESS,
        aiFaction.type,
        20, 0, 20
      );

      // Create farm
      this.createBuilding(
        BuildingType.FARM,
        aiFaction.type,
        25, 0, 15
      );
    }
  }

  public createBuilding(type: BuildingType, faction: FactionType, x: number, y: number, z: number): Building | null {
    const factionData = this.factionManager.getFaction(faction);
    if (!factionData) {
      console.error(`Faction ${faction} not found`);
      return null;
    }

    let stats: BuildingStats;
    let textureType: TextureType;
    let size: { width: number, height: number, depth: number };

    // Get building stats, texture, and size based on building type and faction
    switch (type) {
      case BuildingType.FORTRESS:
        stats = factionData.buildingStats.fortress;
        textureType = faction === FactionType.KNIGHTS ? TextureType.KNIGHT_FORTRESS : TextureType.GOBLIN_FORTRESS;
        size = { width: 5, height: 5, depth: 5 };
        break;
      case BuildingType.BARRACKS:
        stats = factionData.buildingStats.barracks;
        textureType = faction === FactionType.KNIGHTS ? TextureType.KNIGHT_BARRACKS : TextureType.GOBLIN_BARRACKS;
        size = { width: 4, height: 3, depth: 4 };
        break;
      case BuildingType.FARM:
        stats = factionData.buildingStats.farm;
        textureType = faction === FactionType.KNIGHTS ? TextureType.KNIGHT_FARM : TextureType.GOBLIN_FARM;
        size = { width: 3, height: 2, depth: 3 };
        break;
      case BuildingType.MINE:
        stats = factionData.buildingStats.mine;
        textureType = faction === FactionType.KNIGHTS ? TextureType.KNIGHT_MINE : TextureType.GOBLIN_MINE;
        size = { width: 3, height: 3, depth: 3 };
        break;
      default:
        console.error(`Unknown building type: ${type}`);
        return null;
    }

    // Create building mesh
    const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const material = new THREE.MeshStandardMaterial({
      color: factionData.color,
      roughness: 0.7,
      metalness: 0.3
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + size.height / 2, z); // Position at ground level + half height
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Add selection indicator (outline)
    const outlineGeometry = new THREE.BoxGeometry(
      size.width + 0.2,
      size.height + 0.2,
      size.depth + 0.2
    );
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      wireframe: true
    });
    const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
    outline.visible = false; // Hidden by default
    mesh.add(outline);

    // Create building object
    const building = new Building(
      mesh,
      type,
      faction,
      stats,
      factionData.isPlayer,
      size
    );

    // Add to scene and buildings array
    this.scene.add(mesh);
    this.buildings.push(building);

    return building;
  }

  public update(deltaTime: number): void {
    // Update all buildings
    for (const building of this.buildings) {
      building.update(deltaTime);
    }
  }

  public selectBuilding(building: Building): void {
    // Deselect current building if any
    if (this.selectedBuilding) {
      this.selectedBuilding.deselect();
    }

    // Only select player buildings
    if (building.isPlayerBuilding()) {
      building.select();
      this.selectedBuilding = building;
    }
  }

  public deselectBuilding(): void {
    if (this.selectedBuilding) {
      this.selectedBuilding.deselect();
      this.selectedBuilding = null;
    }
  }

  public getSelectedBuilding(): Building | null {
    return this.selectedBuilding;
  }

  public getBuildingAt(x: number, z: number): Building | null {
    // Find building at the given position
    for (const building of this.buildings) {
      const position = building.getPosition();
      const size = building.getSize();

      // Check if position is within building bounds
      if (
        x >= position.x - size.width / 2 &&
        x <= position.x + size.width / 2 &&
        z >= position.z - size.depth / 2 &&
        z <= position.z + size.depth / 2
      ) {
        return building;
      }
    }

    return null;
  }

  public getBuildings(): Building[] {
    return this.buildings;
  }

  public getPlayerBuildings(): Building[] {
    return this.buildings.filter(building => building.isPlayerBuilding());
  }

  public getAIBuildings(): Building[] {
    return this.buildings.filter(building => !building.isPlayerBuilding());
  }

  public getBuildingsByType(type: BuildingType, faction?: FactionType): Building[] {
    return this.buildings.filter(building => {
      if (building.getType() !== type) return false;
      if (faction && building.getFaction() !== faction) return false;
      return true;
    });
  }

  public removeBuilding(building: Building): void {
    // Deselect if selected
    if (this.selectedBuilding === building) {
      this.deselectBuilding();
    }

    // Remove from scene
    this.scene.remove(building.getMesh());

    // Remove from buildings array
    const index = this.buildings.indexOf(building);
    if (index !== -1) {
      this.buildings.splice(index, 1);
    }
  }
}
