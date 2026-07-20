/**
 * 游戏主类 - 管理游戏循环和状态
 */
export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    
    // 游戏状态
    this.isRunning = false;
    this.isPaused = false;
    this.score = 0;
    this.lives = 3;
    
    // 时间管理
    this.lastTime = 0;
    this.deltaTime = 0;
    
    // 输入状态
    this.keys = {};
    
    // 初始化
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 键盘事件
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      
      // 暂停切换
      if (e.code === 'Escape') {
        this.togglePause();
      }
      
      // 重新开始
      if (e.code === 'KeyR') {
        this.restart();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  gameLoop(currentTime) {
    if (!this.isRunning) return;

    // 计算时间差
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // 更新游戏状态
    if (!this.isPaused) {
      this.update(this.deltaTime);
    }

    // 渲染画面
    this.render();

    // 请求下一帧
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(deltaTime) {
    // TODO: 更新游戏实体
    // this.player.update(deltaTime);
    // this.obstacles.forEach(obstacle => obstacle.update(deltaTime));
  }

  render() {
    // 清空画布
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // TODO: 渲染游戏内容
    this.renderUI();
  }

  renderUI() {
    // 更新UI显示
    document.getElementById('score').textContent = `分数: ${this.score}`;
    document.getElementById('lives').textContent = `生命: ${'❤️'.repeat(this.lives)}`;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    console.log(this.isPaused ? '游戏暂停' : '游戏继续');
  }

  restart() {
    this.score = 0;
    this.lives = 3;
    this.isPaused = false;
    console.log('游戏重新开始');
  }
}
