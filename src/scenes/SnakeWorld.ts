import { Container, Graphics } from 'pixi.js';
import WorldColors from '../WorldColors';
import { Manager } from '../Manager';

interface Location {
  // grid coordinate ( will be multiplied by grid size)
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
  }

  private gameElementGraphicFactory(
    isFood: boolean,
    x?: number,
    y?: number
  ): Graphics {
    const fill = isFood ? WorldColors.C : WorldColors.B;
    let gridX = x ?? this.getRandomGridLocation();
    let gridY = y ?? this.getRandomGridLocation();

    const graphic = new Graphics()
      .roundRect(
        gridX * this.cellSize,
        gridY * this.cellSize,
        this.cellSize,
        this.cellSize,
        10
      )

      .fill(fill);
    this.addChild(graphic);
    return graphic;
  }

  private updateFood(): GridEntity {
    const x = this.getRandomGridLocation();
    const y = this.getRandomGridLocation();

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
  }
}
