import * as THREE from 'three';
import { FactionType } from '../systems/FactionManager';

export abstract class Entity {
  protected mesh: THREE.Mesh;
  protected faction: FactionType;
  protected isPlayer: boolean;
  protected selected: boolean = false;
  protected health: number;
  protected maxHealth: number;
  
  constructor(
    mesh: THREE.Mesh,
    faction: FactionType,
    health: number,
    isPlayer: boolean
  ) {
    this.mesh = mesh;
    this.faction = faction;
    this.health = health;
    this.maxHealth = health;
    this.isPlayer = isPlayer;
  }
  
  public getMesh(): THREE.Mesh {
    return this.mesh;
  }
  
  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }
  
  public getFaction(): FactionType {
    return this.faction;
  }
  
  public isPlayerEntity(): boolean {
    return this.isPlayer;
  }
  
  public isSelected(): boolean {
    return this.selected;
  }
  
  public select(): void {
    this.selected = true;
    this.updateSelectionIndicator();
  }
  
  public deselect(): void {
    this.selected = false;
    this.updateSelectionIndicator();
  }
  
  protected updateSelectionIndicator(): void {
    // Find selection indicator in children
    const selectionIndicator = this.findSelectionIndicator();
    
    if (selectionIndicator) {
      selectionIndicator.visible = this.selected;
    }
  }
  
  protected findSelectionIndicator(): THREE.Object3D | undefined {
    // Find selection indicator (first child)
    if (this.mesh.children.length > 0) {
      return this.mesh.children[0];
    }
    
    return undefined;
  }
  
  public getHealth(): number {
    return this.health;
  }
  
  public getMaxHealth(): number {
    return this.maxHealth;
  }
  
  public takeDamage(amount: number): void {
    this.health -= amount;
    
    if (this.health <= 0) {
      this.health = 0;
      this.onDeath();
    }
  }
  
  public heal(amount: number): void {
    this.health += amount;
    
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }
  
  public isAlive(): boolean {
    return this.health > 0;
  }
  
  protected abstract onDeath(): void;
  
  public abstract update(deltaTime: number): void;
}
