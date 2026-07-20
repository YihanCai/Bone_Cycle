/**
 * 输入管理类 - 处理键盘输入
 */
export class Input {
  constructor() {
    // 按键状态
    this.keys = {};
    this.keysJustPressed = {};
    
    // 按键事件回调
    this.keyDownCallbacks = [];
    this.keyUpCallbacks = [];
    
    // 便捷方法：常用按键状态
    this.isDPressed = false;
    this.isAPressed = false;
    this.isSPressed = false;
    this.isSpacePressed = false;
    this.spaceJustPressed = false;
    
    // 初始化
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 键盘按下事件
    window.addEventListener('keydown', (e) => {
      if (!this.keys[e.code]) {
        this.keysJustPressed[e.code] = true;
      }
      this.keys[e.code] = true;
      
      // 更新便捷按键状态
      this.updateKeyStates();
      
      // 触发所有回调
      this.keyDownCallbacks.forEach(callback => callback(e.code));
    });

    // 键盘释放事件
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      
      // 更新便捷按键状态
      this.updateKeyStates();
      
      // 触发所有回调
      this.keyUpCallbacks.forEach(callback => callback(e.code));
    });
  }

  // 更新便捷按键状态
  updateKeyStates() {
    this.isDPressed = this.isKeyDown('KeyD');
    this.isAPressed = this.isKeyDown('KeyA');
    this.isSPressed = this.isKeyDown('KeyS');
    this.isSpacePressed = this.isKeyDown('Space');
    this.spaceJustPressed = this.isKeyJustPressed('Space');
  }

  // 检查按键是否按下
  isKeyDown(keyCode) {
    return this.keys[keyCode] === true;
  }

  // 检查按键是否刚刚按下
  isKeyJustPressed(keyCode) {
    return this.keysJustPressed[keyCode] === true;
  }

  // 清除刚刚按下的状态
  clearJustPressed() {
    this.keysJustPressed = {};
  }

  // 注册按键按下回调
  onKeyDown(callback) {
    this.keyDownCallbacks.push(callback);
  }

  // 注册按键释放回调
  onKeyUp(callback) {
    this.keyUpCallbacks.push(callback);
  }

  // 移除回调
  removeKeyDownCallback(callback) {
    this.keyDownCallbacks = this.keyDownCallbacks.filter(cb => cb !== callback);
  }

  removeKeyUpCallback(callback) {
    this.keyUpCallbacks = this.keyUpCallbacks.filter(cb => cb !== callback);
  }

  // 清除所有回调
  clearCallbacks() {
    this.keyDownCallbacks = [];
    this.keyUpCallbacks = [];
  }
}
