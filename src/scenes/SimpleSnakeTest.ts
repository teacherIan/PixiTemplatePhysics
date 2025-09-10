import { Container, Graphics } from "pixi.js";
import WorldColors from "../WorldColors";

export default class SimpleSnakeTest extends Container {
  constructor() {
    super();
    
    console.log("=== SIMPLE SNAKE TEST START ===");
    
    // Create a simple background
    const bg = new Graphics()
      .rect(0, 0, 400, 400)
      .fill({ color: WorldColors.C, alpha: 0.2 });
    
    // Create some test squares
    const square1 = new Graphics()
      .rect(50, 50, 30, 30)
      .fill(WorldColors.B);
      
    const square2 = new Graphics()
      .rect(100, 100, 30, 30)
      .fill(WorldColors.D);
      
    const square3 = new Graphics()
      .rect(150, 150, 30, 30)
      .fill(WorldColors.A);
    
    // Position this container in the center of screen
    this.position.set(
      (window.innerWidth - 400) / 2,
      (window.innerHeight - 400) / 2
    );
    
    this.addChild(bg);
    this.addChild(square1);
    this.addChild(square2);
    this.addChild(square3);
    
    console.log("Simple snake test created with", this.children.length, "children");
    console.log("Position:", this.position);
  }
}
