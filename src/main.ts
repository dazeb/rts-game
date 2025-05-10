import './style.css'
import { Game } from './core/Game'

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get the game container element
  const gameContainer = document.getElementById('game-container');

  if (!gameContainer) {
    console.error('Game container not found!');
    return;
  }

  // Create and initialize the game
  const game = new Game(gameContainer);

  // Initialize the game
  game.initialize().catch(error => {
    console.error('Failed to initialize game:', error);
  });

  // Add event listener for cleanup when the window is closed
  window.addEventListener('beforeunload', () => {
    game.dispose();
  });
});
