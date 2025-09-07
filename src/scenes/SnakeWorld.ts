import { Container, Graphics } from "pixi.js";
import WorldColors from "../WorldColors";
import { Manager } from "../Manager";

interface Location { // grid coordinate ( will be multiplied by grid size)
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
  private GridEntityWidthHeight: number;
  private devBackground: Graphics;
  private snakeGridSize: number;
  private _snake: GridEntity[] = [];
  private _currentDirection: Direction;
  private _snakeHeadLocation: Location;
  private _gridDivision: number = 20

  constructor() {
    super();
    this._snakeHeadLocation = {
      x: this.getRandomGridLocation(),
      y: this.getRandomGridLocation(),
    };
    this._currentDirection = this.getRandomDirection();
    this._snake.push(
      this.updateSnakeArray(this._snakeHeadLocation, this._currentDirection)
    );

    this.GridEntityWidthHeight =
      window.innerWidth > window.innerHeight
        ? window.innerHeight
        : window.innerWidth;
    this.snakeGridSize = this.GridEntityWidthHeight / this._gridDivision;

    this.devBackground = new Graphics().rect(
      0,
      0,
      this.GridEntityWidthHeight,
      this.GridEntityWidthHeight
    );

    this.centerWorld();

    this.addChild(this.devBackground);

    this.food = this.updateFood();
    // this.addChild(this.food.Graphic);
  }

  private gameElementGraphicFactory(
    isFood: boolean,
    x?: number,
    y?: number
  ): Graphics {
    const fill = isFood ? WorldColors.C : WorldColors.B;
    let gridX = x ?? this.getRandomGridLocation() 
    let gridY = y ?? this.getRandomGridLocation()
     
    const graphic = new Graphics()
      .roundRect(
        gridX * this.snakeGridSize,
        gridY * this.snakeGridSize,
        this.snakeGridSize,
        this.snakeGridSize,
        10
      )

      .fill(fill);
      this.addChild(graphic)
      return graphic
      
  }

  private updateFood(): GridEntity {
    const x = this.getRandomGridLocation();
    const y = this.getRandomGridLocation();

    const graphic = this.gameElementGraphicFactory(true, x,y);
    const gridEntity: GridEntity = { Location: { x, y }, Graphic: graphic };
    

    return gridEntity;
  }

  private updateSnakeArray(location: Location, direction: Direction): GridEntity {
    let x = location.x;
    let y = location.y;

    if (direction === Direction.DOWN) {
      y = y + 1;
      if(y >= this._gridDivision) {
        y = 0
      }
    }
    if (direction === Direction.UP) {
      y = y - 1;
      if(y < 0) {
        y = this._gridDivision - 1
      }
    }
    if (direction === Direction.LEFT) {
      x = x - 1;
      if(x < 0) {
        x = this._gridDivision - 1
      }
    }
    if (direction === Direction.RIGHT) {
      x = x + 1;
      if (x >=this._gridDivision) {
        x = 0
      }
    }

    const graphic = this.gameElementGraphicFactory(
      false,
      x,
      y
    );
    const updatedLocation: Location = {x:x,y:y}

    const snakeEntity: GridEntity = {Location: updatedLocation, Graphic: graphic}
    return snakeEntity
  }

  private getRandomGridLocation() {
    return Math.floor(Math.random() * this._gridDivision);
  }

  private removeGraphic(graphic: Graphics) {
    this.removeChild(graphic)
    this._snake.pop()
  }

  private centerWorld(): void {
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isLandscape) {
      // Center horizontally, align to top
      this.position.set((Manager.width - this.GridEntityWidthHeight) / 2, 0);
    } else {
      // Center vertically, align to left
      this.position.set(0, (Manager.height - this.GridEntityWidthHeight) / 2);
    }
  }

  private stepSnake() {
    this._snake = [this.updateSnakeArray(this._snake[0].Location,this._currentDirection),...this._snake]
    this.removeGraphic(this._snake[this._snake.length - 1].Graphic)
    
  }

  //getters

  private getRandomDirection(): Direction {
    return Math.floor(Math.random() * 4) as Direction;
  }

  public update() {
    const rand = Math.floor(Math.random() * 10) 

    if(rand < 2) { // change direction 20% of the time
        this._currentDirection = this.getRandomDirection();
    }
    
    this.stepSnake()
  }
}
