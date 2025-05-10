import * as THREE from 'three';
import { FactionManager, FactionType } from './FactionManager';
import type { UnitStats } from './FactionManager';
import { TextureType } from './ResourceManager';
import { Entity } from '../entities/Entity';
import { Unit, UnitType } from '../entities/Unit';

export class UnitManager {
  private scene: THREE.Scene;
  private factionManager: FactionManager;
  private units: Unit[] = [];
  private selectedUnits: Unit[] = [];

  constructor(scene: THREE.Scene, factionManager: FactionManager) {
    this.scene = scene;
    this.factionManager = factionManager;
  }

  public createInitialUnits(): void {
    // Create initial units for player faction
    const playerFaction = this.factionManager.getPlayerFaction();
    if (playerFaction) {
      // Create builders
      this.createUnit(
        UnitType.BUILDER,
        playerFaction.type,
        -20, 0, -20
      );
      this.createUnit(
        UnitType.BUILDER,
        playerFaction.type,
        -22, 0, -20
      );

      // Create some military units
      this.createUnit(
        UnitType.SOLDIER,
        playerFaction.type,
        -18, 0, -22
      );
      this.createUnit(
        UnitType.ARCHER,
        playerFaction.type,
        -20, 0, -24
      );
    }

    // Create initial units for AI faction
    const aiFaction = this.factionManager.getAIFaction();
    if (aiFaction) {
      // Create builders
      this.createUnit(
        UnitType.BUILDER,
        aiFaction.type,
        20, 0, 20
      );
      this.createUnit(
        UnitType.BUILDER,
        aiFaction.type,
        22, 0, 20
      );

      // Create some military units
      this.createUnit(
        UnitType.SOLDIER,
        aiFaction.type,
        18, 0, 22
      );
      this.createUnit(
        UnitType.ARCHER,
        aiFaction.type,
        20, 0, 24
      );
    }
  }

  public createUnit(type: UnitType, faction: FactionType, x: number, y: number, z: number): Unit | null {
    const factionData = this.factionManager.getFaction(faction);
    if (!factionData) {
      console.error(`Faction ${faction} not found`);
      return null;
    }

    let stats: UnitStats;
    let textureType: TextureType;

    // Get unit stats and texture based on unit type and faction
    switch (type) {
      case UnitType.BUILDER:
        stats = factionData.unitStats.builder;
        textureType = faction === FactionType.KNIGHTS ? TextureType.KNIGHT_BUILDER : TextureType.GOBLIN_BUILDER;
        break;
      case UnitType.SOLDIER:
        stats = factionData.unitStats.soldier;
        textureType = faction === FactionType.KNIGHTS ? TextureType.KNIGHT_SOLDIER : TextureType.GOBLIN_SOLDIER;
        break;
      case UnitType.ARCHER:
        stats = factionData.unitStats.archer;
        textureType = faction === FactionType.KNIGHTS ? TextureType.KNIGHT_ARCHER : TextureType.GOBLIN_ARCHER;
        break;
      case UnitType.PIKEMAN:
        stats = factionData.unitStats.pikeman;
        textureType = faction === FactionType.KNIGHTS ? TextureType.KNIGHT_PIKEMAN : TextureType.GOBLIN_PIKEMAN;
        break;
      case UnitType.CAVALRY:
        stats = factionData.unitStats.cavalry;
        textureType = faction === FactionType.KNIGHTS ? TextureType.KNIGHT_CAVALRY : TextureType.GOBLIN_CAVALRY;
        break;
      default:
        console.error(`Unknown unit type: ${type}`);
        return null;
    }

    // Create unit mesh
    const geometry = new THREE.BoxGeometry(0.8, 1.5, 0.8);
    const material = new THREE.MeshStandardMaterial({
      color: factionData.color,
      roughness: 0.7,
      metalness: 0.3
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y + 0.75, z); // Position at ground level + half height
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Add selection indicator (ring)
    const ringGeometry = new THREE.RingGeometry(0.6, 0.8, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2; // Rotate to be horizontal
    ring.position.y = 0.05; // Slightly above ground
    ring.visible = false; // Hidden by default
    mesh.add(ring);

    // Create unit object
    const unit = new Unit(
      mesh,
      type,
      faction,
      stats,
      factionData.isPlayer
    );

    // Add to scene and units array
    this.scene.add(mesh);
    this.units.push(unit);

    return unit;
  }

  public update(deltaTime: number): void {
    // Update all units
    for (const unit of this.units) {
      unit.update(deltaTime);
    }

    // Check for combat between units
    this.checkCombat();
  }

  private checkCombat(): void {
    // Simple combat detection - units within range of each other
    for (const unit of this.units) {
      if (unit.isAttacking() || !unit.canAttack()) continue;

      // Find enemy units in range
      for (const target of this.units) {
        if (unit === target || unit.getFaction() === target.getFaction()) continue;

        const distance = unit.getPosition().distanceTo(target.getPosition());
        if (distance <= unit.getStats().range) {
          unit.attack(target);
          break;
        }
      }
    }
  }

  public selectUnit(unit: Unit): void {
    // Deselect all units if not multi-selecting
    if (!this.isMultiSelecting()) {
      this.deselectAllUnits();
    }

    // Only select player units
    if (unit.isPlayerUnit()) {
      unit.select();
      this.selectedUnits.push(unit);
    }
  }

  public deselectUnit(unit: Unit): void {
    unit.deselect();
    const index = this.selectedUnits.indexOf(unit);
    if (index !== -1) {
      this.selectedUnits.splice(index, 1);
    }
  }

  public deselectAllUnits(): void {
    for (const unit of this.selectedUnits) {
      unit.deselect();
    }
    this.selectedUnits = [];
  }

  public getSelectedUnits(): Unit[] {
    return this.selectedUnits;
  }

  public isMultiSelecting(): boolean {
    // Check if shift key is pressed for multi-selection
    return false; // This will be implemented in InputManager
  }

  public moveSelectedUnits(targetX: number, targetZ: number): void {
    // Move all selected units to the target position
    // Implement formation movement or simple pathfinding
    for (let i = 0; i < this.selectedUnits.length; i++) {
      const unit = this.selectedUnits[i];

      // Calculate offset for formation movement
      const offset = this.calculateFormationOffset(i, this.selectedUnits.length);

      unit.moveTo(targetX + offset.x, targetZ + offset.z);
    }
  }

  private calculateFormationOffset(index: number, totalUnits: number): { x: number, z: number } {
    // Simple grid formation
    const unitsPerRow = Math.ceil(Math.sqrt(totalUnits));
    const row = Math.floor(index / unitsPerRow);
    const col = index % unitsPerRow;

    return {
      x: (col - Math.floor(unitsPerRow / 2)) * 2,
      z: (row - Math.floor(totalUnits / unitsPerRow / 2)) * 2
    };
  }

  public getUnitAt(x: number, z: number, radius: number = 1): Unit | null {
    // Find unit at the given position within radius
    for (const unit of this.units) {
      const position = unit.getPosition();
      const dx = position.x - x;
      const dz = position.z - z;
      const distanceSquared = dx * dx + dz * dz;

      if (distanceSquared <= radius * radius) {
        return unit;
      }
    }

    return null;
  }

  public getUnits(): Unit[] {
    return this.units;
  }

  public getPlayerUnits(): Unit[] {
    return this.units.filter(unit => unit.isPlayerUnit());
  }

  public getAIUnits(): Unit[] {
    return this.units.filter(unit => !unit.isPlayerUnit());
  }

  public removeUnit(unit: Unit): void {
    // Remove from selected units if selected
    this.deselectUnit(unit);

    // Remove from scene
    this.scene.remove(unit.getMesh());

    // Remove from units array
    const index = this.units.indexOf(unit);
    if (index !== -1) {
      this.units.splice(index, 1);
    }
  }
}
