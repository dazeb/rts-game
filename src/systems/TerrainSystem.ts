import * as THREE from 'three';
import { TextureType } from './ResourceManager';

export enum TerrainType {
  GRASS = 'grass',
  WATER = 'water',
  DIRT = 'dirt',
}

export interface TerrainTile {
  type: TerrainType;
  x: number;
  z: number;
  walkable: boolean;
  mesh?: THREE.Mesh;
}

export class TerrainSystem {
  private scene: THREE.Scene;
  private terrainGroup: THREE.Group;
  private terrainMap: TerrainTile[][] = [];
  private tileSize: number = 1;
  private width: number = 0;
  private height: number = 0;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.terrainGroup = new THREE.Group();
    this.scene.add(this.terrainGroup);
  }
  
  public createTerrain(width: number, height: number): void {
    this.width = width;
    this.height = height;
    
    // Initialize terrain map
    this.terrainMap = Array(height).fill(null).map(() => Array(width).fill(null));
    
    // Create a simple terrain with grass, some water, and dirt paths
    this.generateTerrain();
    
    // Create terrain meshes
    this.createTerrainMeshes();
  }
  
  private generateTerrain(): void {
    // Simple terrain generation algorithm
    // This is a placeholder - you can implement more complex terrain generation
    
    // Start with all grass
    for (let z = 0; z < this.height; z++) {
      for (let x = 0; x < this.width; x++) {
        this.terrainMap[z][x] = {
          type: TerrainType.GRASS,
          x,
          z,
          walkable: true
        };
      }
    }
    
    // Add a river (water)
    const riverWidth = 3;
    const riverZ = Math.floor(this.height / 2);
    
    for (let z = riverZ - Math.floor(riverWidth / 2); z <= riverZ + Math.floor(riverWidth / 2); z++) {
      for (let x = 0; x < this.width; x++) {
        if (z >= 0 && z < this.height) {
          this.terrainMap[z][x] = {
            type: TerrainType.WATER,
            x,
            z,
            walkable: false
          };
        }
      }
    }
    
    // Add a bridge (dirt) over the river
    const bridgeWidth = 5;
    const bridgeX = Math.floor(this.width / 2);
    
    for (let z = riverZ - Math.floor(riverWidth / 2); z <= riverZ + Math.floor(riverWidth / 2); z++) {
      for (let x = bridgeX - Math.floor(bridgeWidth / 2); x <= bridgeX + Math.floor(bridgeWidth / 2); x++) {
        if (x >= 0 && x < this.width && z >= 0 && z < this.height) {
          this.terrainMap[z][x] = {
            type: TerrainType.DIRT,
            x,
            z,
            walkable: true
          };
        }
      }
    }
    
    // Add some dirt paths
    this.addDirtPath(0, Math.floor(this.height / 4), this.width - 1, Math.floor(this.height / 4), 2);
    this.addDirtPath(0, Math.floor(this.height * 3 / 4), this.width - 1, Math.floor(this.height * 3 / 4), 2);
    this.addDirtPath(Math.floor(this.width / 4), 0, Math.floor(this.width / 4), this.height - 1, 2);
    this.addDirtPath(Math.floor(this.width * 3 / 4), 0, Math.floor(this.width * 3 / 4), this.height - 1, 2);
  }
  
  private addDirtPath(x1: number, z1: number, x2: number, z2: number, width: number): void {
    // Simple line drawing algorithm to create paths
    const dx = Math.abs(x2 - x1);
    const dz = Math.abs(z2 - z1);
    const sx = x1 < x2 ? 1 : -1;
    const sz = z1 < z2 ? 1 : -1;
    let err = dx - dz;
    
    let x = x1;
    let z = z1;
    
    while (true) {
      // Set the current tile and surrounding tiles to dirt based on path width
      for (let offsetZ = -Math.floor(width / 2); offsetZ <= Math.floor(width / 2); offsetZ++) {
        for (let offsetX = -Math.floor(width / 2); offsetX <= Math.floor(width / 2); offsetX++) {
          const tileX = x + offsetX;
          const tileZ = z + offsetZ;
          
          if (tileX >= 0 && tileX < this.width && tileZ >= 0 && tileZ < this.height) {
            // Don't overwrite water with dirt
            if (this.terrainMap[tileZ][tileX].type !== TerrainType.WATER) {
              this.terrainMap[tileZ][tileX] = {
                type: TerrainType.DIRT,
                x: tileX,
                z: tileZ,
                walkable: true
              };
            }
          }
        }
      }
      
      if (x === x2 && z === z2) break;
      
      const e2 = 2 * err;
      if (e2 > -dz) {
        err -= dz;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        z += sz;
      }
    }
  }
  
  private createTerrainMeshes(): void {
    // Create a single geometry for each terrain type for better performance
    const grassGeometry = new THREE.PlaneGeometry(this.tileSize, this.tileSize);
    const waterGeometry = new THREE.PlaneGeometry(this.tileSize, this.tileSize);
    const dirtGeometry = new THREE.PlaneGeometry(this.tileSize, this.tileSize);
    
    // Create materials
    const grassMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x7cfc00,
      roughness: 0.8,
      metalness: 0.2
    });
    
    const waterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4169e1,
      roughness: 0.3,
      metalness: 0.6
    });
    
    const dirtMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b4513,
      roughness: 0.9,
      metalness: 0.1
    });
    
    // Create instanced meshes for better performance
    const grassMesh = new THREE.InstancedMesh(
      grassGeometry,
      grassMaterial,
      this.width * this.height // Maximum possible instances
    );
    
    const waterMesh = new THREE.InstancedMesh(
      waterGeometry,
      waterMaterial,
      this.width * this.height
    );
    
    const dirtMesh = new THREE.InstancedMesh(
      dirtGeometry,
      dirtMaterial,
      this.width * this.height
    );
    
    // Set instance counts to 0 initially
    grassMesh.count = 0;
    waterMesh.count = 0;
    dirtMesh.count = 0;
    
    // Create transformation matrix for instancing
    const matrix = new THREE.Matrix4();
    
    // Place terrain tiles
    for (let z = 0; z < this.height; z++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.terrainMap[z][x];
        const worldX = (x - this.width / 2) * this.tileSize;
        const worldZ = (z - this.height / 2) * this.tileSize;
        
        // Set position and rotation
        matrix.makeRotationX(-Math.PI / 2); // Rotate to be horizontal
        matrix.setPosition(worldX, 0, worldZ);
        
        // Add instance based on terrain type
        switch (tile.type) {
          case TerrainType.GRASS:
            grassMesh.setMatrixAt(grassMesh.count, matrix);
            grassMesh.count++;
            break;
          case TerrainType.WATER:
            waterMesh.setMatrixAt(waterMesh.count, matrix);
            waterMesh.count++;
            break;
          case TerrainType.DIRT:
            dirtMesh.setMatrixAt(dirtMesh.count, matrix);
            dirtMesh.count++;
            break;
        }
      }
    }
    
    // Add meshes to the terrain group
    this.terrainGroup.add(grassMesh);
    this.terrainGroup.add(waterMesh);
    this.terrainGroup.add(dirtMesh);
    
    // Add grid helper for debugging
    const gridHelper = new THREE.GridHelper(
      Math.max(this.width, this.height) * this.tileSize,
      Math.max(this.width, this.height)
    );
    this.terrainGroup.add(gridHelper);
  }
  
  public getTileAt(x: number, z: number): TerrainTile | null {
    // Convert world coordinates to grid coordinates
    const gridX = Math.floor(x / this.tileSize + this.width / 2);
    const gridZ = Math.floor(z / this.tileSize + this.height / 2);
    
    if (gridX >= 0 && gridX < this.width && gridZ >= 0 && gridZ < this.height) {
      return this.terrainMap[gridZ][gridX];
    }
    
    return null;
  }
  
  public isWalkable(x: number, z: number): boolean {
    const tile = this.getTileAt(x, z);
    return tile ? tile.walkable : false;
  }
  
  public getWidth(): number {
    return this.width;
  }
  
  public getHeight(): number {
    return this.height;
  }
  
  public getTileSize(): number {
    return this.tileSize;
  }
  
  public getTerrainMap(): TerrainTile[][] {
    return this.terrainMap;
  }
}
