import * as THREE from 'three';
import { Entity } from './Entity';
import { FactionType } from '../systems/FactionManager';
import type { UnitStats } from '../systems/FactionManager';

export enum UnitType {
  BUILDER = 'builder',
  SOLDIER = 'soldier',
  ARCHER = 'archer',
  PIKEMAN = 'pikeman',
  CAVALRY = 'cavalry',
}

export enum UnitState {
  IDLE = 'idle',
  MOVING = 'moving',
  ATTACKING = 'attacking',
  BUILDING = 'building',
  GATHERING = 'gathering',
  DEAD = 'dead',
}

export class Unit extends Entity {
  private type: UnitType;
  private stats: UnitStats;
  private state: UnitState = UnitState.IDLE;

  // Movement properties
  private targetPosition: THREE.Vector3 | null = null;
  private movementSpeed: number;

  // Combat properties
  private attackTarget: Entity | null = null;
  private attackCooldown: number = 0;
  private attackRate: number = 1; // Attacks per second

  constructor(
    mesh: THREE.Mesh,
    type: UnitType,
    faction: FactionType,
    stats: UnitStats,
    isPlayer: boolean
  ) {
    super(mesh, faction, stats.health, isPlayer);

    this.type = type;
    this.stats = stats;
    this.movementSpeed = stats.speed;
  }

  public getType(): UnitType {
    return this.type;
  }

  public getStats(): UnitStats {
    return this.stats;
  }

  public getState(): UnitState {
    return this.state;
  }

  public isPlayerUnit(): boolean {
    return this.isPlayer;
  }

  public moveTo(x: number, z: number): void {
    // Set target position
    this.targetPosition = new THREE.Vector3(x, this.mesh.position.y, z);
    this.state = UnitState.MOVING;

    // Stop attacking if moving
    this.attackTarget = null;
  }

  public attack(target: Entity): void {
    // Set attack target
    this.attackTarget = target;
    this.state = UnitState.ATTACKING;

    // Clear movement target
    this.targetPosition = null;
  }

  public isAttacking(): boolean {
    return this.state === UnitState.ATTACKING;
  }

  public canAttack(): boolean {
    return this.type !== UnitType.BUILDER; // Builders can't attack
  }

  public update(deltaTime: number): void {
    // Handle different states
    switch (this.state) {
      case UnitState.MOVING:
        this.updateMovement(deltaTime);
        break;
      case UnitState.ATTACKING:
        this.updateAttack(deltaTime);
        break;
      case UnitState.BUILDING:
        // TODO: Implement building logic
        break;
      case UnitState.GATHERING:
        // TODO: Implement resource gathering logic
        break;
      case UnitState.IDLE:
      default:
        // Do nothing in idle state
        break;
    }
  }

  private updateMovement(deltaTime: number): void {
    if (!this.targetPosition) {
      this.state = UnitState.IDLE;
      return;
    }

    // Calculate direction to target
    const direction = new THREE.Vector3()
      .subVectors(this.targetPosition, this.mesh.position)
      .normalize();

    // Calculate distance to target
    const distance = this.mesh.position.distanceTo(this.targetPosition);

    // If close enough to target, stop moving
    if (distance < 0.1) {
      this.targetPosition = null;
      this.state = UnitState.IDLE;
      return;
    }

    // Move towards target
    const moveDistance = this.movementSpeed * deltaTime;

    if (moveDistance >= distance) {
      // Reached target
      this.mesh.position.copy(this.targetPosition);
      this.targetPosition = null;
      this.state = UnitState.IDLE;
    } else {
      // Move towards target
      this.mesh.position.add(direction.multiplyScalar(moveDistance));

      // Rotate to face movement direction
      if (direction.x !== 0 || direction.z !== 0) {
        const angle = Math.atan2(direction.x, direction.z);
        this.mesh.rotation.y = angle;
      }
    }
  }

  private updateAttack(deltaTime: number): void {
    if (!this.attackTarget || !this.attackTarget.isAlive()) {
      // Target is dead or missing, stop attacking
      this.attackTarget = null;
      this.state = UnitState.IDLE;
      return;
    }

    // Calculate distance to target
    const distance = this.mesh.position.distanceTo(this.attackTarget.getPosition());

    // Check if target is in range
    if (distance > this.stats.range) {
      // Move towards target
      this.moveTo(
        this.attackTarget.getPosition().x,
        this.attackTarget.getPosition().z
      );
      return;
    }

    // Face target
    const direction = new THREE.Vector3()
      .subVectors(this.attackTarget.getPosition(), this.mesh.position)
      .normalize();

    if (direction.x !== 0 || direction.z !== 0) {
      const angle = Math.atan2(direction.x, direction.z);
      this.mesh.rotation.y = angle;
    }

    // Attack cooldown
    this.attackCooldown -= deltaTime;

    if (this.attackCooldown <= 0) {
      // Perform attack
      this.performAttack();
      this.attackCooldown = 1 / this.attackRate;
    }
  }

  private performAttack(): void {
    if (!this.attackTarget) return;

    // Calculate damage based on attack and target defense
    let damage = this.stats.attack;

    // Apply damage to target
    this.attackTarget.takeDamage(damage);

    // TODO: Add attack animation or effect
  }

  protected onDeath(): void {
    // Change state to dead
    this.state = UnitState.DEAD;

    // TODO: Add death animation or effect

    // Remove from scene after delay
    setTimeout(() => {
      if (this.mesh.parent) {
        this.mesh.parent.remove(this.mesh);
      }
    }, 1000);
  }
}
