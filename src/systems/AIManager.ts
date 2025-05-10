import { FactionManager, FactionType } from './FactionManager';
import { UnitManager } from './UnitManager';
import { BuildingManager } from './BuildingManager';
import { ResourceManager, ResourceType } from './ResourceManager';
import { BuildingType } from '../entities/Building';
import { UnitType } from '../entities/Unit';
import * as THREE from 'three';

// AI difficulty levels
export enum AIDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

// AI states
enum AIState {
  BUILDING, // Focus on building economy
  ATTACKING, // Focus on attacking player
  DEFENDING, // Focus on defending base
}

export class AIManager {
  private factionManager: FactionManager;
  private unitManager: UnitManager;
  private buildingManager: BuildingManager;
  private resourceManager: ResourceManager;
  
  private difficulty: AIDifficulty = AIDifficulty.MEDIUM;
  private state: AIState = AIState.BUILDING;
  private aiFaction: FactionType = FactionType.GOBLINS;
  
  private decisionTimer: number = 0;
  private decisionInterval: number = 5; // Make decisions every 5 seconds
  
  constructor(
    factionManager: FactionManager,
    unitManager: UnitManager,
    buildingManager: BuildingManager,
    resourceManager: ResourceManager
  ) {
    this.factionManager = factionManager;
    this.unitManager = unitManager;
    this.buildingManager = buildingManager;
    this.resourceManager = resourceManager;
  }
  
  public update(deltaTime: number): void {
    // Update decision timer
    this.decisionTimer += deltaTime;
    
    // Make decisions at regular intervals
    if (this.decisionTimer >= this.decisionInterval) {
      this.makeDecisions();
      this.decisionTimer = 0;
    }
  }
  
  private makeDecisions(): void {
    // Determine current state based on game situation
    this.updateState();
    
    // Make decisions based on current state
    switch (this.state) {
      case AIState.BUILDING:
        this.handleBuildingState();
        break;
      case AIState.ATTACKING:
        this.handleAttackingState();
        break;
      case AIState.DEFENDING:
        this.handleDefendingState();
        break;
    }
  }
  
  private updateState(): void {
    const aiUnits = this.unitManager.getAIUnits();
    const playerUnits = this.unitManager.getPlayerUnits();
    const aiBuildings = this.buildingManager.getAIBuildings();
    const playerBuildings = this.buildingManager.getPlayerBuildings();
    
    // Check if under attack (player units near AI buildings)
    const underAttack = this.isUnderAttack(aiBuildings, playerUnits);
    
    if (underAttack) {
      // Switch to defense if under attack
      this.state = AIState.DEFENDING;
    } else if (aiUnits.length >= 10) {
      // If we have enough units, switch to attack
      this.state = AIState.ATTACKING;
    } else {
      // Otherwise, focus on building
      this.state = AIState.BUILDING;
    }
  }
  
  private isUnderAttack(buildings: any[], enemyUnits: any[]): boolean {
    // Check if any enemy units are near our buildings
    for (const building of buildings) {
      const buildingPos = building.getPosition();
      
      for (const unit of enemyUnits) {
        const unitPos = unit.getPosition();
        const distance = new THREE.Vector3(
          buildingPos.x,
          0,
          buildingPos.z
        ).distanceTo(new THREE.Vector3(unitPos.x, 0, unitPos.z));
        
        if (distance < 10) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  private handleBuildingState(): void {
    // Focus on building economy and units
    const aiBuildings = this.buildingManager.getAIBuildings();
    const aiUnits = this.unitManager.getAIUnits();
    
    // Count building types
    const fortressCount = aiBuildings.filter(b => b.getType() === BuildingType.FORTRESS).length;
    const barracksCount = aiBuildings.filter(b => b.getType() === BuildingType.BARRACKS).length;
    const farmCount = aiBuildings.filter(b => b.getType() === BuildingType.FARM).length;
    const mineCount = aiBuildings.filter(b => b.getType() === BuildingType.MINE).length;
    
    // Count unit types
    const builderCount = aiUnits.filter(u => u.getType() === UnitType.BUILDER).length;
    const soldierCount = aiUnits.filter(u => u.getType() === UnitType.SOLDIER).length;
    const archerCount = aiUnits.filter(u => u.getType() === UnitType.ARCHER).length;
    const pikemanCount = aiUnits.filter(u => u.getType() === UnitType.PIKEMAN).length;
    const cavalryCount = aiUnits.filter(u => u.getType() === UnitType.CAVALRY).length;
    
    // Build priority
    if (farmCount < 2) {
      // Need more farms for food production
      this.buildStructure(BuildingType.FARM);
    } else if (mineCount < 1) {
      // Need mines for gold production
      this.buildStructure(BuildingType.MINE);
    } else if (barracksCount < 1) {
      // Need barracks to produce military units
      this.buildStructure(BuildingType.BARRACKS);
    } else if (farmCount < 3) {
      // More farms for increased food production
      this.buildStructure(BuildingType.FARM);
    } else if (mineCount < 2) {
      // More mines for increased gold production
      this.buildStructure(BuildingType.MINE);
    }
    
    // Unit production priority
    if (builderCount < 3) {
      // Need more builders for resource gathering
      this.produceUnit(UnitType.BUILDER);
    } else if (soldierCount < 3) {
      // Build basic defense force
      this.produceUnit(UnitType.SOLDIER);
    } else if (archerCount < 2) {
      // Add ranged units
      this.produceUnit(UnitType.ARCHER);
    } else if (pikemanCount < 2) {
      // Add anti-cavalry units
      this.produceUnit(UnitType.PIKEMAN);
    } else if (cavalryCount < 1) {
      // Add fast units
      this.produceUnit(UnitType.CAVALRY);
    } else {
      // Build balanced army
      const totalMilitaryUnits = soldierCount + archerCount + pikemanCount + cavalryCount;
      
      if (totalMilitaryUnits < 15) {
        // Randomly choose which unit to produce
        const unitTypes = [UnitType.SOLDIER, UnitType.ARCHER, UnitType.PIKEMAN, UnitType.CAVALRY];
        const randomType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
        this.produceUnit(randomType);
      }
    }
  }
  
  private handleAttackingState(): void {
    // Focus on attacking player
    const aiUnits = this.unitManager.getAIUnits();
    const playerBuildings = this.buildingManager.getPlayerBuildings();
    
    // Find military units
    const militaryUnits = aiUnits.filter(unit => 
      unit.getType() !== UnitType.BUILDER
    );
    
    if (militaryUnits.length >= 5) {
      // Find target (prioritize fortress)
      let target = playerBuildings.find(b => b.getType() === BuildingType.FORTRESS);
      
      // If no fortress, target any building
      if (!target && playerBuildings.length > 0) {
        target = playerBuildings[0];
      }
      
      if (target) {
        const targetPos = target.getPosition();
        
        // Send units to attack
        for (const unit of militaryUnits) {
          // Add some randomness to prevent units from stacking
          const offsetX = (Math.random() - 0.5) * 10;
          const offsetZ = (Math.random() - 0.5) * 10;
          
          unit.moveTo(targetPos.x + offsetX, targetPos.z + offsetZ);
        }
      }
    }
    
    // Continue producing units
    this.produceUnit(UnitType.SOLDIER);
  }
  
  private handleDefendingState(): void {
    // Focus on defending base
    const aiUnits = this.unitManager.getAIUnits();
    const aiBuildings = this.buildingManager.getAIBuildings();
    const playerUnits = this.unitManager.getPlayerUnits();
    
    // Find military units
    const militaryUnits = aiUnits.filter(unit => 
      unit.getType() !== UnitType.BUILDER
    );
    
    // Find fortress or important building to defend
    let buildingToDefend = aiBuildings.find(b => b.getType() === BuildingType.FORTRESS);
    
    if (!buildingToDefend && aiBuildings.length > 0) {
      buildingToDefend = aiBuildings[0];
    }
    
    if (buildingToDefend) {
      const buildingPos = buildingToDefend.getPosition();
      
      // Find closest enemy unit
      let closestEnemy = null;
      let closestDistance = Infinity;
      
      for (const unit of playerUnits) {
        const unitPos = unit.getPosition();
        const distance = new THREE.Vector3(
          buildingPos.x,
          0,
          buildingPos.z
        ).distanceTo(new THREE.Vector3(unitPos.x, 0, unitPos.z));
        
        if (distance < closestDistance) {
          closestDistance = distance;
          closestEnemy = unit;
        }
      }
      
      if (closestEnemy) {
        const enemyPos = closestEnemy.getPosition();
        
        // Send units to defend
        for (const unit of militaryUnits) {
          // Add some randomness to prevent units from stacking
          const offsetX = (Math.random() - 0.5) * 5;
          const offsetZ = (Math.random() - 0.5) * 5;
          
          unit.moveTo(enemyPos.x + offsetX, enemyPos.z + offsetZ);
        }
      } else {
        // No enemies found, return to fortress
        for (const unit of militaryUnits) {
          // Add some randomness to prevent units from stacking
          const offsetX = (Math.random() - 0.5) * 10;
          const offsetZ = (Math.random() - 0.5) * 10;
          
          unit.moveTo(buildingPos.x + offsetX, buildingPos.z + offsetZ);
        }
      }
    }
    
    // Continue producing units with focus on defense
    const unitTypes = [UnitType.SOLDIER, UnitType.ARCHER, UnitType.PIKEMAN];
    const randomType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
    this.produceUnit(randomType);
  }
  
  private buildStructure(type: BuildingType): void {
    // Find a suitable location to build
    const aiBuildings = this.buildingManager.getAIBuildings();
    
    // Start from fortress or any existing building
    let referenceBuilding = aiBuildings.find(b => b.getType() === BuildingType.FORTRESS);
    
    if (!referenceBuilding && aiBuildings.length > 0) {
      referenceBuilding = aiBuildings[0];
    }
    
    if (referenceBuilding) {
      const refPos = referenceBuilding.getPosition();
      
      // Calculate position with some offset from reference building
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetZ = (Math.random() - 0.5) * 20;
      
      const x = refPos.x + offsetX;
      const z = refPos.z + offsetZ;
      
      // Create the building
      this.buildingManager.createBuilding(type, this.aiFaction, x, 0, z);
    }
  }
  
  private produceUnit(type: UnitType): void {
    // Find a suitable location to spawn the unit
    const aiBuildings = this.buildingManager.getAIBuildings();
    
    // Spawn near barracks if available, otherwise near fortress
    let spawnBuilding = aiBuildings.find(b => b.getType() === BuildingType.BARRACKS);
    
    if (!spawnBuilding) {
      spawnBuilding = aiBuildings.find(b => b.getType() === BuildingType.FORTRESS);
    }
    
    if (spawnBuilding) {
      const buildingPos = spawnBuilding.getPosition();
      
      // Calculate spawn position with some offset
      const offsetX = (Math.random() - 0.5) * 5;
      const offsetZ = (Math.random() - 0.5) * 5;
      
      const x = buildingPos.x + offsetX;
      const z = buildingPos.z + offsetZ;
      
      // Create the unit
      this.unitManager.createUnit(type, this.aiFaction, x, 0, z);
    }
  }
  
  public setDifficulty(difficulty: AIDifficulty): void {
    this.difficulty = difficulty;
    
    // Adjust decision interval based on difficulty
    switch (difficulty) {
      case AIDifficulty.EASY:
        this.decisionInterval = 8; // Slower decisions
        break;
      case AIDifficulty.MEDIUM:
        this.decisionInterval = 5; // Default
        break;
      case AIDifficulty.HARD:
        this.decisionInterval = 3; // Faster decisions
        break;
    }
  }
  
  public getDifficulty(): AIDifficulty {
    return this.difficulty;
  }
}
