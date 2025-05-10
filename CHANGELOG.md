# Changelog

## [0.1.0] - 2023-05-10

### Added
- Initial project setup with Vite and TypeScript
- Three.js integration for 3D rendering
- Basic game engine architecture
- Core game systems:
  - ResourceManager for asset loading and resource management
  - TerrainSystem for creating and managing the game terrain
  - FactionManager for managing player and AI factions
  - UnitManager for creating and managing units
  - BuildingManager for creating and managing buildings
  - InputManager for handling user input
  - AIManager for controlling the enemy faction
  - UIManager for managing the game UI
- Entity system with base Entity class and derived Unit and Building classes
- Basic UI elements for resource display, unit production, and building construction
- Camera controls with zoom and pan functionality
- Selection system for units and buildings
- Basic pathfinding for unit movement
- Combat system with rock-paper-scissors counter mechanics
- Resource gathering and production mechanics
- AI with different states (building, attacking, defending)

### Todo
- Implement proper textures for units and buildings using the Tiny Swords assets
- Add sound effects and music
- Implement minimap
- Add win/loss conditions
- Improve AI decision making
- Add more advanced pathfinding
- Implement fog of war
- Add game settings menu
- Add tutorial
- Add save/load functionality
