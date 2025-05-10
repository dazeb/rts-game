import * as THREE from 'three';
import { Entity } from './Entity';
import { FactionType } from '../systems/FactionManager';
import type { BuildingStats } from '../systems/FactionManager';
import { ResourceType } from '../systems/ResourceManager';

export enum BuildingType {
  FORTRESS = 'fortress',
  BARRACKS = 'barracks',
  FARM = 'farm',
  MINE = 'mine',
}

export enum BuildingState {
  CONSTRUCTING = 'constructing',
  ACTIVE = 'active',
  DAMAGED = 'damaged',
  DESTROYED = 'destroyed',
}

export class Building extends Entity {
  private type: BuildingType;
  private stats: BuildingStats;
  private state: BuildingState;
  private constructionProgress: number = 0;
  private size: { width: number, height: number, depth: number };

  // Production properties
  private productionTimer: number = 0;
  private productionRate: number = 0;
  private productionType: ResourceType | undefined;

  constructor(
    mesh: THREE.Mesh,
    type: BuildingType,
    faction: FactionType,
    stats: BuildingStats,
    isPlayer: boolean,
    size: { width: number, height: number, depth: number }
  ) {
    super(mesh, faction, stats.health, isPlayer);

    this.type = type;
    this.stats = stats;
    this.size = size;

    // Set initial state
    if (type === BuildingType.FORTRESS) {
      // Fortress starts active
      this.state = BuildingState.ACTIVE;
      this.constructionProgress = 1;
    } else {
      // Other buildings start constructing
      this.state = BuildingState.CONSTRUCTING;
      this.constructionProgress = 0;
    }

    // Set production properties if applicable
    if (stats.productionRate && stats.productionType) {
      this.productionRate = stats.productionRate;
      this.productionType = stats.productionType;
    }
  }

  public getType(): BuildingType {
    return this.type;
  }

  public getStats(): BuildingStats {
    return this.stats;
  }

  public getState(): BuildingState {
    return this.state;
  }

  public getSize(): { width: number, height: number, depth: number } {
    return this.size;
  }

  public isPlayerBuilding(): boolean {
    return this.isPlayer;
  }

  public update(deltaTime: number): void {
    // Handle different states
    switch (this.state) {
      case BuildingState.CONSTRUCTING:
        this.updateConstruction(deltaTime);
        break;
      case BuildingState.ACTIVE:
        this.updateProduction(deltaTime);
        break;
      case BuildingState.DAMAGED:
        // Damaged buildings still produce but at reduced rate
        this.updateProduction(deltaTime * 0.5);
        break;
      case BuildingState.DESTROYED:
        // Do nothing when destroyed
        break;
    }
  }

  private updateConstruction(deltaTime: number): void {
    // Progress construction
    if (this.stats.buildTime > 0) {
      this.constructionProgress += deltaTime / this.stats.buildTime;
    } else {
      this.constructionProgress = 1;
    }

    // Check if construction is complete
    if (this.constructionProgress >= 1) {
      this.constructionProgress = 1;
      this.state = BuildingState.ACTIVE;

      // TODO: Add construction complete effect
    }

    // Update visual representation of construction progress
    this.updateConstructionVisual();
  }

  private updateConstructionVisual(): void {
    // Scale the building based on construction progress
    const scale = Math.max(0.1, this.constructionProgress);
    this.mesh.scale.set(scale, scale, scale);
  }

  private updateProduction(deltaTime: number): void {
    // Only buildings with production capabilities
    if (!this.productionRate || !this.productionType) return;

    // Update production timer
    this.productionTimer += deltaTime;

    // Check if it's time to produce resources
    if (this.productionTimer >= 1) {
      // Calculate resources produced
      const resourcesProduced = Math.floor(this.productionTimer * this.productionRate);

      if (resourcesProduced > 0) {
        // TODO: Add resources to player's stockpile
        // This will be handled by the ResourceManager

        // Reset timer (keeping fractional part)
        this.productionTimer = this.productionTimer % 1;
      }
    }
  }

  public takeDamage(amount: number): void {
    // Apply damage
    super.takeDamage(amount);

    // Update building state based on health
    if (this.health <= 0) {
      this.state = BuildingState.DESTROYED;
    } else if (this.health < this.maxHealth * 0.5) {
      this.state = BuildingState.DAMAGED;
    }
  }

  protected onDeath(): void {
    // Change state to destroyed
    this.state = BuildingState.DESTROYED;

    // TODO: Add destruction effect

    // Update visual representation
    this.mesh.scale.y = 0.2; // Flatten the building to show it's destroyed
  }

  public getConstructionProgress(): number {
    return this.constructionProgress;
  }

  public getProductionRate(): number {
    return this.productionRate;
  }

  public getProductionType(): ResourceType | undefined {
    return this.productionType;
  }
}
