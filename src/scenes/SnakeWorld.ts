<<<<<<< HEAD
import { Container, Graphics } from "pixi.js";
import WorldColors from "../WorldColors";
import { Manager } from "../Manager";
interface Location {
=======
import { Container, Graphics } from 'pixi.js';
import WorldColors from '../WorldColors';
import { Manager } from '../Manager';

interface Location {
  // grid coordinate ( will be multiplied by grid size)
>>>>>>> 2a3ddd8ecd9e4d89a699eda077e1a826bcb900ac
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
<<<<<<< HEAD
  // ========================================
  // PROPERTIES
  // ========================================

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
=======
  private food: GridEntity;
  private gameAreaSize: number;
  // private devBackground: Graphics;
  private cellSize: number;
  private snake: GridEntity[] = [];
  private currentDirection: Direction;
  private snakeHeadLocation: Location;
  private gridDivision: number = 20;

  constructor() {
    super();
    this.snakeHeadLocation = {
      x: this.getRandomGridLocation(),
      y: this.getRandomGridLocation(),
    };
    this.currentDirection = this.getRandomDirection();
    this.snake.push(
      this.updateSnakeArray(this.snakeHeadLocation, this.currentDirection)
    );

    this.gameAreaSize =
      window.innerWidth > window.innerHeight
        ? window.innerHeight
        : window.innerWidth;
    this.cellSize = this.gameAreaSize / this.gridDivision;

    // this.devBackground = new Graphics().rect(
    //   0,
    //   0,
    //   this.gameAreaSize,
    //   this.gameAreaSize
    // );

    // this.addChild(this.devBackground);

    this.centerWorld();
    this.food = this.updateFood();
  }

  private centerWorld(): void {
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isLandscape) {
      // Center horizontally, align to top
      this.position.set((Manager.width - this.gameAreaSize) / 2, 0);
    } else {
      // Center vertically, align to left
      this.position.set(0, (Manager.height - this.gameAreaSize) / 2);
    }
>>>>>>> 2a3ddd8ecd9e4d89a699eda077e1a826bcb900ac
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
<<<<<<< HEAD
=======
    let gridX = x ?? this.getRandomGridLocation();
    let gridY = y ?? this.getRandomGridLocation();
>>>>>>> 2a3ddd8ecd9e4d89a699eda077e1a826bcb900ac

    const graphic = new Graphics()
      .roundRect(
        gridX * this.cellSize,
        gridY * this.cellSize,
        this.cellSize,
        this.cellSize,
        10
      )
      .fill(fill);
<<<<<<< HEAD

=======
>>>>>>> 2a3ddd8ecd9e4d89a699eda077e1a826bcb900ac
    this.addChild(graphic);
    return graphic;
  }

  private createFood(): GridEntity {
    const x = this.getRandomGridLocation();
    const y = this.getRandomGridLocation();
    const graphic = this.createGraphic(true, x, y);

<<<<<<< HEAD
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
=======
    const graphic = this.gameElementGraphicFactory(true, x, y);
    const gridEntity: GridEntity = { Location: { x, y }, Graphic: graphic };

    return gridEntity;
  }

  private updateSnakeArray(
    location: Location,
    direction: Direction
  ): GridEntity {
    let x = location.x;
    let y = location.y;

    if (direction === Direction.DOWN) {
      y = y + 1;
      if (y >= this.gridDivision) {
        y = 0;
      }
    }
    if (direction === Direction.UP) {
      y = y - 1;
      if (y < 0) {
        y = this.gridDivision - 1;
      }
    }
    if (direction === Direction.LEFT) {
      x = x - 1;
      if (x < 0) {
        x = this.gridDivision - 1;
      }
    }
    if (direction === Direction.RIGHT) {
      x = x + 1;
      if (x >= this.gridDivision) {
        x = 0;
      }
    }

    const graphic = this.gameElementGraphicFactory(false, x, y);
    const updatedLocation: Location = { x, y };

    const snakeEntity: GridEntity = {
      Location: updatedLocation,
      Graphic: graphic,
    };
    return snakeEntity;
  }

  private getRandomGridLocation() {
    return Math.floor(Math.random() * this.gridDivision);
  }

  private removeGraphic(graphic: Graphics) {
    this.removeChild(graphic);
    graphic.destroy();
  }

  private getRandomDirection(): Direction {
    return Math.floor(Math.random() * 4) as Direction;
  }

  private stepSnake() {
    this.snake.unshift(
      this.updateSnakeArray(this.snake[0].Location, this.currentDirection)
    );

    this.removeGraphic(this.snake[this.snake.length - 1].Graphic);
    this.snake.pop();
  }

  public update() {
    const rand = Math.floor(Math.random() * 10);

    if (rand < 2) {
      // change direction 20% of the time
      this.currentDirection = this.getRandomDirection();
    }

    this.stepSnake();
>>>>>>> 2a3ddd8ecd9e4d89a699eda077e1a826bcb900ac
  }
}
