import * as THREE from 'three';

// Define resource types
export enum ResourceType {
  GOLD = 'gold',
  WOOD = 'wood',
  FOOD = 'food',
}

// Define resource data structure
export interface ResourceData {
  [ResourceType.GOLD]: number;
  [ResourceType.WOOD]: number;
  [ResourceType.FOOD]: number;
}

// Define texture types
export enum TextureType {
  // Terrain textures
  GRASS = 'grass',
  WATER = 'water',
  DIRT = 'dirt',

  // Knight faction textures
  KNIGHT_FORTRESS = 'knight_fortress',
  KNIGHT_BARRACKS = 'knight_barracks',
  KNIGHT_FARM = 'knight_farm',
  KNIGHT_MINE = 'knight_mine',
  KNIGHT_BUILDER = 'knight_builder',
  KNIGHT_SOLDIER = 'knight_soldier',
  KNIGHT_ARCHER = 'knight_archer',
  KNIGHT_PIKEMAN = 'knight_pikeman',
  KNIGHT_CAVALRY = 'knight_cavalry',

  // Goblin faction textures
  GOBLIN_FORTRESS = 'goblin_fortress',
  GOBLIN_BARRACKS = 'goblin_barracks',
  GOBLIN_FARM = 'goblin_farm',
  GOBLIN_MINE = 'goblin_mine',
  GOBLIN_BUILDER = 'goblin_builder',
  GOBLIN_SOLDIER = 'goblin_soldier',
  GOBLIN_ARCHER = 'goblin_archer',
  GOBLIN_PIKEMAN = 'goblin_pikeman',
  GOBLIN_CAVALRY = 'goblin_cavalry',

  // UI textures
  UI_BUTTON = 'ui_button',
  UI_PANEL = 'ui_panel',
  UI_ICON_GOLD = 'ui_icon_gold',
  UI_ICON_WOOD = 'ui_icon_wood',
  UI_ICON_FOOD = 'ui_icon_food',
}

export class ResourceManager {
  private textures: Map<TextureType, THREE.Texture> = new Map();
  private textureLoader: THREE.TextureLoader;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
  }

  public async loadAssets(): Promise<void> {
    // Load terrain textures
    await this.loadTexture(TextureType.GRASS, '/tiny_swords_assets/Terrain/Ground/Tilemap_Flat.png');
    await this.loadTexture(TextureType.WATER, '/tiny_swords_assets/Terrain/Water/Water.png');
    await this.loadTexture(TextureType.DIRT, '/tiny_swords_assets/Terrain/Ground/Tilemap_Elevation.png');

    // Load Knight faction textures
    await this.loadTexture(TextureType.KNIGHT_FORTRESS, '/tiny_swords_assets/Factions/Knights/Buildings/Castle/Castle_Blue.png');
    await this.loadTexture(TextureType.KNIGHT_BARRACKS, '/tiny_swords_assets/Factions/Knights/Buildings/House/House_Blue.png');
    await this.loadTexture(TextureType.KNIGHT_FARM, '/tiny_swords_assets/Factions/Knights/Buildings/House/House_Blue.png');
    await this.loadTexture(TextureType.KNIGHT_MINE, '/tiny_swords_assets/Factions/Knights/Buildings/Tower/Tower_Blue.png');
    await this.loadTexture(TextureType.KNIGHT_BUILDER, '/tiny_swords_assets/Factions/Knights/Troops/Pawn/Blue/Pawn_Blue.png');
    await this.loadTexture(TextureType.KNIGHT_SOLDIER, '/tiny_swords_assets/Factions/Knights/Troops/Warrior/Blue/Warrior_Blue.png');
    await this.loadTexture(TextureType.KNIGHT_ARCHER, '/tiny_swords_assets/Factions/Knights/Troops/Archer/Blue/Archer_Blue.png');
    // Note: No Spearman in assets, using Warrior instead
    await this.loadTexture(TextureType.KNIGHT_PIKEMAN, '/tiny_swords_assets/Factions/Knights/Troops/Warrior/Blue/Warrior_Blue.png');
    // Note: No Cavalry in assets, using Warrior instead
    await this.loadTexture(TextureType.KNIGHT_CAVALRY, '/tiny_swords_assets/Factions/Knights/Troops/Warrior/Blue/Warrior_Blue.png');

    // Load Goblin faction textures
    await this.loadTexture(TextureType.GOBLIN_FORTRESS, '/tiny_swords_assets/Factions/Goblins/Buildings/Wood_Tower/Wood_Tower_Blue.png');
    await this.loadTexture(TextureType.GOBLIN_BARRACKS, '/tiny_swords_assets/Factions/Goblins/Buildings/Wood_House/Goblin_House.png');
    await this.loadTexture(TextureType.GOBLIN_FARM, '/tiny_swords_assets/Factions/Goblins/Buildings/Wood_House/Goblin_House.png');
    await this.loadTexture(TextureType.GOBLIN_MINE, '/tiny_swords_assets/Factions/Goblins/Buildings/Wood_Tower/Wood_Tower_Blue.png');
    await this.loadTexture(TextureType.GOBLIN_BUILDER, '/tiny_swords_assets/Factions/Goblins/Troops/TNT/Blue/TNT_Blue.png');
    // Note: No Warrior in Goblin assets, using Torch instead
    await this.loadTexture(TextureType.GOBLIN_SOLDIER, '/tiny_swords_assets/Factions/Goblins/Troops/Torch/Blue/Torch_Blue.png');
    await this.loadTexture(TextureType.GOBLIN_ARCHER, '/tiny_swords_assets/Factions/Goblins/Troops/Torch/Blue/Torch_Blue.png');
    await this.loadTexture(TextureType.GOBLIN_PIKEMAN, '/tiny_swords_assets/Factions/Goblins/Troops/Barrel/Blue/Barrel_Blue.png');
    await this.loadTexture(TextureType.GOBLIN_CAVALRY, '/tiny_swords_assets/Factions/Goblins/Troops/TNT/Blue/TNT_Blue.png');

    // Load UI textures
    await this.loadTexture(TextureType.UI_BUTTON, '/tiny_swords_assets/UI/Buttons/Button_Red.png');
    await this.loadTexture(TextureType.UI_PANEL, '/tiny_swords_assets/UI/Banners/Banner_Connection_Right.png');
    // Note: No Gold_1.png in assets, using G_Idle.png instead
    await this.loadTexture(TextureType.UI_ICON_GOLD, '/tiny_swords_assets/Resources/Resources/G_Idle.png');
    await this.loadTexture(TextureType.UI_ICON_WOOD, '/tiny_swords_assets/Resources/Resources/W_Idle.png');
    // Note: No Apple/A_Idle.png in assets, using M_Idle.png instead for food
    await this.loadTexture(TextureType.UI_ICON_FOOD, '/tiny_swords_assets/Resources/Resources/M_Idle.png');
  }

  private loadTexture(type: TextureType, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`Attempting to load texture: ${url}`);

      // Create a simple placeholder texture for development
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Draw a colored rectangle based on texture type
        switch (type) {
          case TextureType.GRASS:
            ctx.fillStyle = '#7cfc00'; // Green
            break;
          case TextureType.WATER:
            ctx.fillStyle = '#4169e1'; // Blue
            break;
          case TextureType.DIRT:
            ctx.fillStyle = '#8b4513'; // Brown
            break;
          default:
            // Generate a random color for other textures
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        }

        ctx.fillRect(0, 0, 64, 64);

        // Add a label
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(type, 32, 32);
      }

      // Create a texture from the canvas
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      this.textures.set(type, texture);

      // Try to load the actual texture
      this.textureLoader.load(
        url,
        (loadedTexture) => {
          loadedTexture.wrapS = THREE.RepeatWrapping;
          loadedTexture.wrapT = THREE.RepeatWrapping;
          this.textures.set(type, loadedTexture);
          console.log(`Successfully loaded texture: ${url}`);
          resolve();
        },
        undefined,
        (error) => {
          console.warn(`Error loading texture ${url}:`, error);
          console.log('Using placeholder texture instead.');
          // We already set a placeholder texture, so we can resolve
          resolve();
        }
      );
    });
  }

  public getTexture(type: TextureType): THREE.Texture | undefined {
    return this.textures.get(type);
  }

  // Resource management methods
  private resources: ResourceData = {
    [ResourceType.GOLD]: 500,  // Starting gold
    [ResourceType.WOOD]: 300,  // Starting wood
    [ResourceType.FOOD]: 200,  // Starting food
  };

  public getResource(type: ResourceType): number {
    return this.resources[type];
  }

  public addResource(type: ResourceType, amount: number): void {
    this.resources[type] += amount;
  }

  public subtractResource(type: ResourceType, amount: number): boolean {
    if (this.resources[type] >= amount) {
      this.resources[type] -= amount;
      return true;
    }
    return false;
  }

  public hasResources(resources: Partial<ResourceData>): boolean {
    for (const [type, amount] of Object.entries(resources)) {
      if (this.resources[type as ResourceType] < amount) {
        return false;
      }
    }
    return true;
  }

  public getAllResources(): ResourceData {
    return { ...this.resources };
  }
}
