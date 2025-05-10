import { ResourceType } from './ResourceManager';
import type { ResourceData } from './ResourceManager';

export enum FactionType {
  KNIGHTS = 'knights',
  GOBLINS = 'goblins',
}

export interface UnitStats {
  health: number;
  attack: number;
  defense: number;
  speed: number;
  range: number;
  buildTime: number;
  cost: Partial<ResourceData>;
}

export interface BuildingStats {
  health: number;
  defense: number;
  buildTime: number;
  cost: Partial<ResourceData>;
  productionRate?: number;
  productionType?: ResourceType;
}

export interface FactionData {
  type: FactionType;
  name: string;
  color: string;
  isPlayer: boolean;
  unitStats: {
    builder: UnitStats;
    soldier: UnitStats;
    archer: UnitStats;
    pikeman: UnitStats;
    cavalry: UnitStats;
  };
  buildingStats: {
    fortress: BuildingStats;
    barracks: BuildingStats;
    farm: BuildingStats;
    mine: BuildingStats;
  };
}

export class FactionManager {
  private factions: Map<FactionType, FactionData> = new Map();
  private playerFaction: FactionType = FactionType.KNIGHTS;

  constructor() {}

  public createFactions(): void {
    // Create Knight faction (player)
    this.factions.set(FactionType.KNIGHTS, {
      type: FactionType.KNIGHTS,
      name: 'Knights',
      color: '#0000ff', // Blue
      isPlayer: true,
      unitStats: {
        builder: {
          health: 50,
          attack: 5,
          defense: 2,
          speed: 2,
          range: 1,
          buildTime: 10,
          cost: {
            [ResourceType.FOOD]: 50
          }
        },
        soldier: {
          health: 100,
          attack: 15,
          defense: 10,
          speed: 1.5,
          range: 1,
          buildTime: 15,
          cost: {
            [ResourceType.FOOD]: 75,
            [ResourceType.GOLD]: 25
          }
        },
        archer: {
          health: 60,
          attack: 12,
          defense: 5,
          speed: 1.8,
          range: 5,
          buildTime: 20,
          cost: {
            [ResourceType.FOOD]: 60,
            [ResourceType.WOOD]: 40
          }
        },
        pikeman: {
          health: 80,
          attack: 18,
          defense: 8,
          speed: 1.2,
          range: 2,
          buildTime: 18,
          cost: {
            [ResourceType.FOOD]: 70,
            [ResourceType.WOOD]: 30
          }
        },
        cavalry: {
          health: 120,
          attack: 20,
          defense: 12,
          speed: 3,
          range: 1,
          buildTime: 25,
          cost: {
            [ResourceType.FOOD]: 100,
            [ResourceType.GOLD]: 50
          }
        }
      },
      buildingStats: {
        fortress: {
          health: 1000,
          defense: 20,
          buildTime: 0, // Instant for initial building
          cost: {
            [ResourceType.WOOD]: 0,
            [ResourceType.GOLD]: 0
          }
        },
        barracks: {
          health: 500,
          defense: 10,
          buildTime: 30,
          cost: {
            [ResourceType.WOOD]: 150,
            [ResourceType.GOLD]: 50
          }
        },
        farm: {
          health: 300,
          defense: 5,
          buildTime: 20,
          cost: {
            [ResourceType.WOOD]: 100
          },
          productionRate: 5,
          productionType: ResourceType.FOOD
        },
        mine: {
          health: 400,
          defense: 8,
          buildTime: 25,
          cost: {
            [ResourceType.WOOD]: 120,
            [ResourceType.GOLD]: 30
          },
          productionRate: 3,
          productionType: ResourceType.GOLD
        }
      }
    });

    // Create Goblin faction (AI)
    this.factions.set(FactionType.GOBLINS, {
      type: FactionType.GOBLINS,
      name: 'Goblins',
      color: '#00ff00', // Green
      isPlayer: false,
      unitStats: {
        builder: {
          health: 40,
          attack: 6,
          defense: 1,
          speed: 2.2,
          range: 1,
          buildTime: 8,
          cost: {
            [ResourceType.FOOD]: 40
          }
        },
        soldier: {
          health: 80,
          attack: 18,
          defense: 8,
          speed: 1.7,
          range: 1,
          buildTime: 12,
          cost: {
            [ResourceType.FOOD]: 65,
            [ResourceType.GOLD]: 20
          }
        },
        archer: {
          health: 50,
          attack: 14,
          defense: 3,
          speed: 2,
          range: 6,
          buildTime: 15,
          cost: {
            [ResourceType.FOOD]: 50,
            [ResourceType.WOOD]: 35
          }
        },
        pikeman: {
          health: 70,
          attack: 20,
          defense: 6,
          speed: 1.4,
          range: 2,
          buildTime: 15,
          cost: {
            [ResourceType.FOOD]: 60,
            [ResourceType.WOOD]: 25
          }
        },
        cavalry: {
          health: 100,
          attack: 22,
          defense: 10,
          speed: 3.2,
          range: 1,
          buildTime: 20,
          cost: {
            [ResourceType.FOOD]: 90,
            [ResourceType.GOLD]: 40
          }
        }
      },
      buildingStats: {
        fortress: {
          health: 900,
          defense: 18,
          buildTime: 0, // Instant for initial building
          cost: {
            [ResourceType.WOOD]: 0,
            [ResourceType.GOLD]: 0
          }
        },
        barracks: {
          health: 450,
          defense: 8,
          buildTime: 25,
          cost: {
            [ResourceType.WOOD]: 130,
            [ResourceType.GOLD]: 40
          }
        },
        farm: {
          health: 250,
          defense: 4,
          buildTime: 15,
          cost: {
            [ResourceType.WOOD]: 80
          },
          productionRate: 6,
          productionType: ResourceType.FOOD
        },
        mine: {
          health: 350,
          defense: 6,
          buildTime: 20,
          cost: {
            [ResourceType.WOOD]: 100,
            [ResourceType.GOLD]: 25
          },
          productionRate: 4,
          productionType: ResourceType.GOLD
        }
      }
    });
  }

  public getFaction(type: FactionType): FactionData | undefined {
    return this.factions.get(type);
  }

  public getPlayerFaction(): FactionData | undefined {
    return this.factions.get(this.playerFaction);
  }

  public getAIFaction(): FactionData | undefined {
    for (const [type, faction] of this.factions.entries()) {
      if (!faction.isPlayer) {
        return faction;
      }
    }
    return undefined;
  }

  public getAllFactions(): FactionData[] {
    return Array.from(this.factions.values());
  }

  public setPlayerFaction(type: FactionType): void {
    if (this.factions.has(type)) {
      this.playerFaction = type;

      // Update isPlayer flag for all factions
      for (const [factionType, faction] of this.factions.entries()) {
        faction.isPlayer = (factionType === type);
      }
    }
  }
}
