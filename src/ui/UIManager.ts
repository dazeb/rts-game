import { FactionManager } from '../systems/FactionManager';
import { ResourceManager, ResourceType } from '../systems/ResourceManager';
import { BuildingType } from '../entities/Building';
import { UnitType } from '../entities/Unit';

export class UIManager {
  private factionManager: FactionManager;
  private resourceManager: ResourceManager;
  
  private uiContainer: HTMLElement | null = null;
  private resourceDisplay: HTMLElement | null = null;
  private unitMenu: HTMLElement | null = null;
  private buildingMenu: HTMLElement | null = null;
  
  constructor(factionManager: FactionManager, resourceManager: ResourceManager) {
    this.factionManager = factionManager;
    this.resourceManager = resourceManager;
  }
  
  public initialize(): void {
    // Get UI container
    this.uiContainer = document.getElementById('ui-container');
    
    if (!this.uiContainer) {
      console.error('UI container not found!');
      return;
    }
    
    // Create resource display
    this.createResourceDisplay();
    
    // Create unit menu
    this.createUnitMenu();
    
    // Create building menu
    this.createBuildingMenu();
  }
  
  private createResourceDisplay(): void {
    if (!this.uiContainer) return;
    
    // Create resource display element
    this.resourceDisplay = document.createElement('div');
    this.resourceDisplay.className = 'resource-display ui-element';
    
    // Add resource display to UI container
    this.uiContainer.appendChild(this.resourceDisplay);
    
    // Update resource display
    this.updateResourceDisplay();
  }
  
  private updateResourceDisplay(): void {
    if (!this.resourceDisplay) return;
    
    // Get current resources
    const resources = this.resourceManager.getAllResources();
    
    // Update resource display
    this.resourceDisplay.innerHTML = `
      <div>Gold: ${resources[ResourceType.GOLD]}</div>
      <div>Wood: ${resources[ResourceType.WOOD]}</div>
      <div>Food: ${resources[ResourceType.FOOD]}</div>
    `;
  }
  
  private createUnitMenu(): void {
    if (!this.uiContainer) return;
    
    // Create unit menu element
    this.unitMenu = document.createElement('div');
    this.unitMenu.className = 'unit-menu ui-element hidden';
    
    // Add unit buttons
    const unitTypes = [
      { type: UnitType.BUILDER, name: 'Builder' },
      { type: UnitType.SOLDIER, name: 'Soldier' },
      { type: UnitType.ARCHER, name: 'Archer' },
      { type: UnitType.PIKEMAN, name: 'Pikeman' },
      { type: UnitType.CAVALRY, name: 'Cavalry' }
    ];
    
    for (const unit of unitTypes) {
      const button = document.createElement('button');
      button.textContent = unit.name;
      button.addEventListener('click', () => this.onUnitButtonClick(unit.type));
      this.unitMenu.appendChild(button);
    }
    
    // Add unit menu to UI container
    this.uiContainer.appendChild(this.unitMenu);
  }
  
  private onUnitButtonClick(unitType: UnitType): void {
    // Handle unit button click
    console.log(`Produce unit: ${unitType}`);
    
    // TODO: Implement unit production
  }
  
  private createBuildingMenu(): void {
    if (!this.uiContainer) return;
    
    // Create building menu element
    this.buildingMenu = document.createElement('div');
    this.buildingMenu.className = 'building-menu ui-element hidden';
    
    // Add building buttons
    const buildingTypes = [
      { type: BuildingType.BARRACKS, name: 'Barracks' },
      { type: BuildingType.FARM, name: 'Farm' },
      { type: BuildingType.MINE, name: 'Mine' }
    ];
    
    for (const building of buildingTypes) {
      const button = document.createElement('button');
      button.textContent = building.name;
      button.addEventListener('click', () => this.onBuildingButtonClick(building.type));
      this.buildingMenu.appendChild(button);
    }
    
    // Add building menu to UI container
    this.uiContainer.appendChild(this.buildingMenu);
  }
  
  private onBuildingButtonClick(buildingType: BuildingType): void {
    // Handle building button click
    console.log(`Build structure: ${buildingType}`);
    
    // TODO: Implement building construction
  }
  
  public showUnitMenu(): void {
    if (this.unitMenu) {
      this.unitMenu.classList.remove('hidden');
    }
  }
  
  public hideUnitMenu(): void {
    if (this.unitMenu) {
      this.unitMenu.classList.add('hidden');
    }
  }
  
  public showBuildingMenu(): void {
    if (this.buildingMenu) {
      this.buildingMenu.classList.remove('hidden');
    }
  }
  
  public hideBuildingMenu(): void {
    if (this.buildingMenu) {
      this.buildingMenu.classList.add('hidden');
    }
  }
  
  public update(): void {
    // Update resource display
    this.updateResourceDisplay();
  }
  
  public dispose(): void {
    // Clean up event listeners
    if (this.unitMenu) {
      const buttons = this.unitMenu.querySelectorAll('button');
      buttons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
      });
    }
    
    if (this.buildingMenu) {
      const buttons = this.buildingMenu.querySelectorAll('button');
      buttons.forEach(button => {
        button.replaceWith(button.cloneNode(true));
      });
    }
  }
}
