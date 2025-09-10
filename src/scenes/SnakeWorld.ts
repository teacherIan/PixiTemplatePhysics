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

export default class SnakeWorld extends Container {
  private cameraFollowSpeed: number = 0.1;

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
  private readonly gridDivision: number = 60; // Good balance between world size and segment visibility

  constructor() {
    super();
    
    this.initializeDisplay();
    this.initializeGameState();
    this.initializeGameEntities();
    this.setupCamera();

  }

  private initializeDisplay(): void {
    
    // Create a larger world for viewport navigation
    this.gridEntityWidthHeight =
      Math.max(window.innerWidth, window.innerHeight) * 2;
    this.snakeGridSize = this.gridEntityWidthHeight / this.gridDivision;

    this.devBackground = new Graphics()
      .rect(0, 0, this.gridEntityWidthHeight, this.gridEntityWidthHeight)
      .fill({ color: WorldColors.A, alpha: 0.1 }); // Subtle background

    // Position world at origin for viewport
    this.position.set(0, 0);

    
    this.addChild(this.devBackground);
    
  }

  private initializeGameState(): void {
    // Start snake near center of the large world
    this.snakeHeadLocation = {
      x: Math.floor(this.gridDivision / 2),
      y: Math.floor(this.gridDivision / 2),
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

  private setupCamera(): void {
    const viewport = Manager.getViewport();
    if (viewport && this.snake.length > 0) {
      // Move viewport to snake head initially
      const snakeHead = this.snake[0];
      const worldX = snakeHead.Location.x * this.snakeGridSize;
      const worldY = snakeHead.Location.y * this.snakeGridSize;

      viewport.moveCenter(worldX, worldY);

      viewport.follow(snakeHead.Graphic, {
        acceleration: 0.1,
        speed: this.cameraFollowSpeed * 30, // Viewport uses different speed scale
        radius: 50, // Stop following when within this radius
      });

      
      
    }
  }

  private createGraphic(
    isFood: boolean,
    gridX: number,
    gridY: number
  ): Graphics {
    const fill = isFood ? WorldColors.E : WorldColors.B; // Use more contrasting colors

    const graphic = new Graphics()
      .roundRect(
        0, // Start at local 0,0
        0,
        this.snakeGridSize * 0.9,
        this.snakeGridSize * 0.9,
        5
      )
      .fill(fill);

    // Position the graphic in world space
    graphic.x = gridX * this.snakeGridSize;
    graphic.y = gridY * this.snakeGridSize;

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

  private calculateNewPosition(
    location: Location,
    direction: Direction
  ): Location {
    let { x, y } = location;

    switch (direction) {
      case Direction.DOWN:
        y = y + 1;
        break;
      case Direction.UP:
        y = y - 1;
        break;
      case Direction.LEFT:
        x = x - 1;
        break;
      case Direction.RIGHT:
        x = x + 1;
        break;
    }

    return { x, y };
  }

  private moveSnake(): void {
    const newHeadLocation = this.calculateNewPosition(
      this.snake[0].Location,
      this.currentDirection
    );
    
    this.removeChild(this.snake[0].Graphic);

    this.snake[0].Location = newHeadLocation;
    
    this.snake[0].Graphic = this.createGraphic(false, newHeadLocation.x, newHeadLocation.y);
    
    this.updateCameraTarget();
    
    this.snakeHeadLocation = this.snake[0].Location;
  }

  private updateCameraTarget(): void {
    const viewport = Manager.getViewport();
    if (viewport && this.snake.length > 0) {
      const snakeHead = this.snake[0];
      
      // Update the follow target to the new head graphic
      viewport.follow(snakeHead.Graphic, {
        acceleration: 0.02,
        speed: this.cameraFollowSpeed * 10,
        radius: 50,
      });
      
    }
  }

  private shouldChangeDirection(): boolean {
    return Math.floor(Math.random() * 10) < 2; // 20% chance
  }

  private getRandomGridLocation(): number {
    return Math.floor(Math.random() * this.gridDivision);
  }

  private getRandomDirection(): Direction {
    return Math.floor(Math.random() * 4) as Direction;
  }

  public getSnakeHeadPosition(): Location {
    return this.snakeHeadLocation;
  }

  public update(): void {
    if (this.shouldChangeDirection()) {
      this.currentDirection = this.getRandomDirection();
    }

    this.moveSnake();
    // this.followSnakeHead();
  }
}
