export default class Keyboard {
  public static keyboardState: Map<string, boolean>;

  public static initialize() {
    document.addEventListener('keydown', Keyboard.handleKeyDown);
    document.addEventListener('keyup', Keyboard.handleKeyUp);
    this.keyboardState = new Map();
  }

  public static handleKeyDown(e: KeyboardEvent) {
    Keyboard.keyboardState.set(e.code, true);
  }

  public static handleKeyUp(e: KeyboardEvent) {
    Keyboard.keyboardState.set(e.code, false);
  }
}
