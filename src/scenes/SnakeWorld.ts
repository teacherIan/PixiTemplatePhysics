import { Container, Graphics } from "pixi.js";
import WorldColors from "../WorldColors";
import { Manager } from "../Manager";
interface Location {
  x: number;
  y: number;
}

interface GridEntity {
  Location: Location;
  Graphic: Graphics;
}

enum Direction {
  LEFT,
  RIGHT,
  UP,
  DOWN,
}

// ========================================
// MAIN CLASS
// ========================================

export default class SnakeWorld extends Container {

  private food!: GridEntity;
  private snake: GridEntity[] = [];

  // Game state
  private currentDirection!: Direction;
  private snakeHeadLocation!: Location;

  // Display properties
  private gridEntityWidthHeight!: number;
  private devBackground!: Graphics;
  private snakeGridSize!: number;

  // Constants
  private readonly gridDivision: number = 20;

  // ========================================
  // CONSTRUCTOR & INITIALIZATION
  // ========================================

  constructor() {
    super();
    this.initializeDisplay();
    this.initializeGameState();
    this.initializeGameEntities();
  }

  private initializeDisplay(): void {
    this.gridEntityWidthHeight =
      window.innerWidth > window.innerHeight
        ? window.innerHeight
        : window.innerWidth;
    this.snakeGridSize = this.gridEntityWidthHeight / this.gridDivision;

    this.devBackground = new Graphics().rect(
      0,
      0,
      this.gridEntityWidthHeight,
      this.gridEntityWidthHeight
    );

    this.centerWorld();
    this.addChild(this.devBackground);
  }

  private initializeGameState(): void {
    this.snakeHeadLocation = {
      x: this.getRandomGridLocation(),
      y: this.getRandomGridLocation(),
    };
    this.currentDirection = this.getRandomDirection();
  }

  private initializeGameEntities(): void {
    // Create initial snake
    this.snake.push(
      this.createSnakeSegment(this.snakeHeadLocation, this.currentDirection)
    );

    // Create food
    this.food = this.createFood();
  }

  // ========================================
  // FACTORY METHODS
  // ========================================

  private createGraphic(
    isFood: boolean,
    gridX: number,
    gridY: number
  ): Graphics {
    const fill = isFood ? WorldColors.C : WorldColors.B;

    const graphic = new Graphics()
      .roundRect(
        gridX * this.snakeGridSize,
        gridY * this.snakeGridSize,
        this.snakeGridSize,
        this.snakeGridSize,
        10
      )
      .fill(fill);

    this.addChild(graphic);
    return graphic;
  }

  private createFood(): GridEntity {
    const x = this.getRandomGridLocation();
    const y = this.getRandomGridLocation();
    const graphic = this.createGraphic(true, x, y);

    return {
      Location: { x, y },
      Graphic: graphic,
    };
  }

  private createSnakeSegment(
    location: Location,
    direction: Direction
  ): GridEntity {
    const newLocation = this.calculateNewPosition(location, direction);
    const graphic = this.createGraphic(false, newLocation.x, newLocation.y);

    return {
      Location: newLocation,
      Graphic: graphic,
    };
  }

  // ========================================
  // GAME LOGIC METHODS
  // ========================================

  private calculateNewPosition(
    location: Location,
    direction: Direction
  ): Location {
    let { x, y } = location;

    switch (direction) {
      case Direction.DOWN:
        y = (y + 1) % this.gridDivision;
        break;
      case Direction.UP:
        y = y - 1 < 0 ? this.gridDivision - 1 : y - 1;
        break;
      case Direction.LEFT:
        x = x - 1 < 0 ? this.gridDivision - 1 : x - 1;
        break;
      case Direction.RIGHT:
        x = (x + 1) % this.gridDivision;
        break;
    }

    return { x, y };
  }

  private moveSnake(): void {
    // Store old tail before adding new head
    const oldTail = this.snake[this.snake.length - 1];

    // Add new head
    const newHead = this.createSnakeSegment(
      this.snake[0].Location,
      this.currentDirection
    );
    this.snake.unshift(newHead);

    // Remove old tail
    this.removeChild(oldTail.Graphic);
    this.snake.pop();

    // Update snake head location reference
    this.snakeHeadLocation = this.snake[0].Location;
  }

  private shouldChangeDirection(): boolean {
    return Math.floor(Math.random() * 10) < 2; // 20% chance
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  private getRandomGridLocation(): number {
    return Math.floor(Math.random() * this.gridDivision);
  }

  private getRandomDirection(): Direction {
    return Math.floor(Math.random() * 4) as Direction;
  }

  public getSnakeHeadPosition(): Location {
    return this.snakeHeadLocation;
  }

  private centerWorld(): void {
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isLandscape) {
      this.position.set((Manager.width - this.gridEntityWidthHeight) / 2, 0);
    } else {
      this.position.set(0, (Manager.height - this.gridEntityWidthHeight) / 2);
    }
  }

  // ========================================
  // Update
  // ========================================

  public update(): void {
    if (this.shouldChangeDirection()) {
      this.currentDirection = this.getRandomDirection();
    }

    this.moveSnake();
  }
}
