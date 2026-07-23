/**
 * 游戏主类 - 管理游戏循环和状态
 */
import { Input } from './Input.js';
import { Menu } from '../ui/Menu.js';
import { Terrain } from '../world/Terrain.js';
import { Player } from '../entities/Player.js';
import { Bicycle } from '../entities/Bicycle.js';
import { Physics } from '../physics/Physics.js';
import level1Data from '../../assets/levels/level1.json';
import level2Data from '../../assets/levels/level2.json';

// 关卡列表
const levels = [level1Data, level2Data];

// 游戏状态枚举
export const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  VICTORY: 'victory',
  GAME_COMPLETE: 'game_complete',
  LEVEL_TRANSITION: 'level_transition'
};

export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    
    // 游戏状态
    this.gameState = GameState.MENU;
    this.score = 0;
    this.lives = 3;
    
    // 关卡系统
    this.currentLevel = 0;
    this.totalLevels = levels.length;
    
    // 时间管理
    this.lastTime = 0;
    this.deltaTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;
    
    // 输入管理
    this.input = new Input();
    
    // 菜单
    this.menu = new Menu(canvas, ctx);
    this.menu.onStartGame = (playerColor, bikeColor) => this.startGame(playerColor, bikeColor);
    
    // 地形
    this.terrain = new Terrain(canvas, ctx);
    
    // 玩家
    this.player = new Player(canvas, ctx);
    
    // 自行车
    this.bicycle = new Bicycle(canvas, ctx);
    
    // 物理引擎
    this.physics = new Physics();
    
    // 玩家选择的颜色
    this.playerColor = '#ffffff';
    this.bikeColor = '#0f3460';
    
    // 初始化
    this.setupEventListeners();
    
    // 过渡动画
    this.transitionTimer = 0;
    this.transitionDuration = 1.5; // 过渡时间（秒）
    this.transitionLevelName = '';
  }

  setupEventListeners() {
    // 使用Input类处理键盘事件
    this.input.onKeyDown((keyCode) => {
      // 在菜单状态时，按任意键开始游戏
      if (this.gameState === GameState.MENU) {
        if (keyCode === 'Space' || keyCode === 'Enter') {
          this.startGame(this.playerColor, this.bikeColor);
        }
      }
      
      // 在游戏状态时，暂停切换
      if (this.gameState === GameState.PLAYING || this.gameState === GameState.PAUSED) {
        if (keyCode === 'Escape') {
          this.togglePause();
        }
        
        // 重新开始
        if (keyCode === 'KeyR') {
          this.restart();
        }
      }
      
      // 在游戏结束或胜利状态时，按R重新开始
      if (this.gameState === GameState.GAME_OVER || this.gameState === GameState.VICTORY || this.gameState === GameState.GAME_COMPLETE) {
        if (keyCode === 'KeyR') {
          this.restart();
        }
        // 通关后按空格/Enter进入下一关
        if (this.gameState === GameState.VICTORY && (keyCode === 'Space' || keyCode === 'Enter')) {
          this.nextLevel();
        }
      }
    });
  }

  start() {
    this.gameState = GameState.MENU;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  startGame(playerColor, bikeColor) {
    this.gameState = GameState.PLAYING;
    this.playerColor = playerColor;
    this.bikeColor = bikeColor;
    this.score = 0;
    this.lives = 3;
    this.maxDistance = 0;
    this.currentLevel = 0;
    
    // 加载当前关卡
    this.loadCurrentLevel();
    
    // 获取玩家起始位置
    const startPos = this.terrain.getStartPosition();
    this.player.setPosition(startPos.x, startPos.y);
    this.player.setColor(playerColor);
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    this.player.isGrounded = true;
    
    // 设置自行车位置和颜色 - 轮子底部贴地
    this.bicycle.setPosition(startPos.x, startPos.y - 12);
    this.bicycle.setColor(bikeColor);
    this.bicycle.setSpeed(0);
    
    // 初始化物理引擎的安全位置
    this.physics.setSafePosition(startPos.x, startPos.y);
  }

  loadCurrentLevel() {
    const levelData = levels[this.currentLevel];
    this.terrain.loadLevel(levelData);
    
    // 获取玩家起始位置
    const startPos = this.terrain.getStartPosition();
    this.player.setPosition(startPos.x, startPos.y);
    this.player.setColor(this.playerColor);
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    this.player.isGrounded = true;
    
    // 设置自行车位置和颜色
    this.bicycle.setPosition(startPos.x, startPos.y - 12);
    this.bicycle.setColor(this.bikeColor);
    this.bicycle.setSpeed(0);
    
    // 初始化物理引擎的安全位置
    this.physics.setSafePosition(startPos.x, startPos.y);
  }

  nextLevel() {
    this.currentLevel++;
    if (this.currentLevel >= levels.length) {
      // 所有关卡通关
      this.gameState = GameState.GAME_COMPLETE;
    } else {
      // 进入过渡动画，预加载下一关
      this.transitionTimer = 0;
      this.transitionLevelName = levels[this.currentLevel]?.name || `第${this.currentLevel + 1}关`;
      this.gameState = GameState.LEVEL_TRANSITION;
      this.loadCurrentLevel();
    }
  }

  gameLoop(currentTime) {
    // 计算时间差（限制最大deltaTime防止跳帧）
    this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // 计算FPS
    this.frameCount++;
    this.fpsTimer += this.deltaTime;
    if (this.fpsTimer >= 1.0) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    // 根据游戏状态更新
    if (this.gameState === GameState.PLAYING) {
      this.update(this.deltaTime);
    } else if (this.gameState === GameState.LEVEL_TRANSITION) {
      this.updateTransition(this.deltaTime);
    }

    // 清除刚刚按下的状态
    this.input.clearJustPressed();

    // 渲染画面
    this.render();

    // 请求下一帧
    requestAnimationFrame((time) => this.gameLoop(time));
  }

  update(deltaTime) {
    // 处理跳跃输入
    this.handleInput();
    
    // 更新火焰状态
    this.terrain.updateFlames(deltaTime);
    
    // 使用物理引擎更新玩家
    const fellOff = this.physics.updatePlayer(this.player, this.input, deltaTime, this.terrain);
    
    // 如果玩家掉落，减少生命值
    if (fellOff) {
      this.lives--;
      if (this.lives <= 0) {
        this.gameState = GameState.GAME_OVER;
      }
    }
    
    // 检查火焰碰撞（碰到火焰 = 变红闪烁 + 扣血，不传送）
    if (!this.player.invincible && this.terrain.checkFlameCollision(this.player.x, this.player.y, this.player.width, this.player.height)) {
      this.player.takeDamage();
      this.lives--;
      if (this.lives <= 0) {
        this.gameState = GameState.GAME_OVER;
      }
    }
    
    // 更新玩家状态（含无敌闪烁计时）
    this.player.update(deltaTime);
    
    // 更新自行车位置 - 轮子底部贴地：wheel center = player.y - wheelRadius
    this.bicycle.setPosition(this.player.x, this.player.y - 12);
    this.bicycle.setSpeed(this.player.velocityX);
    this.bicycle.update(deltaTime);
    
    // 同步踏板角度给玩家（用于蹬车动画）
    this.player.pedalAngle = this.bicycle.wheelRotation * 2;
    
    // 更新摄像机
    this.terrain.updateCamera(this.player.x);
    
    // 更新分数 = 剩余生命对应的分值（满分100，3条命=100分，2条命=66分，1条命=33分）
    this.score = Math.round((this.lives / 3) * 100);
    
    // 检查是否到达终点
    if (this.physics.checkFinish(this.player, this.terrain)) {
      this.gameState = GameState.VICTORY;
    }
  }

  handleInput() {
    // 空格跳跃 - 只在按下时触发一次
    if (this.input.spaceJustPressed) {
      this.physics.jump(this.player);
    }
  }

  /**
   * 更新过渡动画（进度条从0走到1，完成后切到PLAYING）
   */
  updateTransition(deltaTime) {
    this.transitionTimer += deltaTime;
    this.bicycle.wheelRotation += deltaTime * 6; // 车轮旋转动画
    if (this.transitionTimer >= this.transitionDuration) {
      this.gameState = GameState.PLAYING;
    }
  }

  render() {
    // 根据游戏状态渲染不同的画面
    switch (this.gameState) {
      case GameState.MENU:
        this.menu.render();
        break;
        
      case GameState.PLAYING:
        this.renderGame();
        break;
        
      case GameState.PAUSED:
        this.renderGame();
        this.renderPauseOverlay();
        break;
        
      case GameState.GAME_OVER:
        this.renderGame();
        this.renderGameOverOverlay();
        break;
        
      case GameState.VICTORY:
        this.renderGame();
        this.renderVictoryOverlay();
        break;
        
      case GameState.GAME_COMPLETE:
        this.renderGame();
        this.renderGameCompleteOverlay();
        break;
        
      case GameState.LEVEL_TRANSITION:
        this.renderGame();
        this.renderTransitionOverlay();
        break;
    }
    
    // 显示FPS（所有状态都显示）
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '14px Arial';
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
    
    // 更新UI显示
    this.renderUI();
  }

  renderGame() {
    // 渲染地形（内部已处理cameraX偏移）
    this.terrain.render();
    
    // 应用摄像机偏移，让玩家和自行车跟随地形滚动
    this.ctx.save();
    this.ctx.translate(-this.terrain.cameraX, 0);
    
    // 渲染自行车
    this.bicycle.render();
    
    // 渲染玩家
    this.player.render();
    
    this.ctx.restore();
  }

  renderPauseOverlay() {
    // 半透明遮罩
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 暂停文字
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('游戏暂停', this.width / 2, this.height / 2 - 20);
    
    this.ctx.font = '20px Arial';
    this.ctx.fillText('按ESC继续', this.width / 2, this.height / 2 + 20);
    this.ctx.textAlign = 'left';
  }

  renderGameOverOverlay() {
    // 半透明遮罩
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 游戏结束文字
    this.ctx.fillStyle = '#e94560';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('游戏结束', this.width / 2, this.height / 2 - 20);
    
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`最终得分: ${this.score}`, this.width / 2, this.height / 2 + 20);
    this.ctx.fillText('按R重新开始', this.width / 2, this.height / 2 + 50);
    this.ctx.textAlign = 'left';
  }

  renderVictoryOverlay() {
    // 半透明遮罩
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 关卡名称
    const levelName = levels[this.currentLevel]?.name || `第${this.currentLevel + 1}关`;
    
    // 标题
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${levelName} 通关！`, this.width / 2, this.height / 2 - 50);
    
    // 得分
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`得分: ${this.score}`, this.width / 2, this.height / 2);
    
    // 提示
    this.ctx.fillStyle = '#4ecdc4';
    this.ctx.fillText('按 空格/Enter 进入下一关', this.width / 2, this.height / 2 + 40);
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.fillText('按 R 重新开始', this.width / 2, this.height / 2 + 70);
    this.ctx.textAlign = 'left';
  }
  
  renderGameCompleteOverlay() {
    // 半透明遮罩
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 恭喜文字
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🎉 恭喜通关全部关卡！', this.width / 2, this.height / 2 - 50);
    
    // 得分
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`最终得分: ${this.score}`, this.width / 2, this.height / 2);
    
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('按 R 重新开始', this.width / 2, this.height / 2 + 50);
    this.ctx.textAlign = 'left';
  }

  /**
   * 关卡过渡画面 - 进度条 + 小火柴人骑自行车
   */
  renderTransitionOverlay() {
    const progress = Math.min(this.transitionTimer / this.transitionDuration, 1);
    const cx = this.width / 2;
    const cy = this.height / 2;

    // 半透明遮罩
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // 关卡名称
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.transitionLevelName, cx, cy - 120);

    // === 小火柴人骑自行车 ===
    const bikeX = cx;
    const bikeY = cy - 20;
    const scale = 0.8;
    const wheelR = 18 * scale;
    const pedalR = 10 * scale;
    const angle = this.bicycle.wheelRotation || 0;

    this.ctx.save();
    this.ctx.translate(bikeX, bikeY);

    // 后轮（左）
    this.ctx.strokeStyle = this.bikeColor;
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.arc(-wheelR, 0, wheelR, 0, Math.PI * 2);
    this.ctx.stroke();
    // 后轮辐条
    for (let i = 0; i < 5; i++) {
      const a = angle + i * Math.PI * 2 / 5;
      this.ctx.beginPath();
      this.ctx.moveTo(-wheelR, 0);
      this.ctx.lineTo(-wheelR + Math.cos(a) * wheelR, Math.sin(a) * wheelR);
      this.ctx.stroke();
    }

    // 前轮（右）
    this.ctx.beginPath();
    this.ctx.arc(wheelR, 0, wheelR, 0, Math.PI * 2);
    this.ctx.stroke();
    // 前轮辐条
    for (let i = 0; i < 5; i++) {
      const a = angle + i * Math.PI * 2 / 5;
      this.ctx.beginPath();
      this.ctx.moveTo(wheelR, 0);
      this.ctx.lineTo(wheelR + Math.cos(a) * wheelR, Math.sin(a) * wheelR);
      this.ctx.stroke();
    }

    // 车架（三角形）
    this.ctx.beginPath();
    this.ctx.moveTo(-wheelR, 0);       // 后轮轴
    this.ctx.lineTo(0, -wheelR * 0.8); // 车座
    this.ctx.lineTo(wheelR * 0.6, -wheelR * 0.8); // 车把
    this.ctx.lineTo(wheelR, 0);        // 前轮轴
    this.ctx.stroke();
    // 车座到前轮轴连线
    this.ctx.beginPath();
    this.ctx.moveTo(0, -wheelR * 0.8);
    this.ctx.lineTo(wheelR, 0);
    this.ctx.stroke();

    // 踏板曲柄
    const pedalAngle = angle * 2;
    const leftPx = Math.cos(pedalAngle) * pedalR;
    const leftPy = Math.sin(pedalAngle) * pedalR;
    const rightPx = Math.cos(pedalAngle + Math.PI) * pedalR;
    const rightPy = Math.sin(pedalAngle + Math.PI) * pedalR;
    this.ctx.beginPath();
    this.ctx.moveTo(leftPx, leftPy);
    this.ctx.lineTo(0, 0);
    this.ctx.lineTo(rightPx, rightPy);
    this.ctx.stroke();

    // 火柴人
    this.ctx.strokeStyle = this.playerColor;
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';

    const headR = 7 * scale;
    const headY = -wheelR * 0.8 - 18 * scale;
    const shoulderY = -wheelR * 0.8 - 8 * scale;
    const hipY = -wheelR * 0.8;

    // 头部（圆）
    this.ctx.beginPath();
    this.ctx.arc(0, headY, headR, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.fillStyle = this.playerColor;
    this.ctx.fill();

    // 身体
    this.ctx.beginPath();
    this.ctx.moveTo(0, shoulderY);
    this.ctx.lineTo(0, hipY);
    this.ctx.stroke();

    // 手臂（握车把）
    this.ctx.beginPath();
    this.ctx.moveTo(0, shoulderY + 2);
    this.ctx.lineTo(wheelR * 0.6, -wheelR * 0.8);
    this.ctx.stroke();

    // 腿（蹬踏板）
    this.ctx.beginPath();
    this.ctx.moveTo(0, hipY);
    this.ctx.lineTo(leftPx * 0.6, hipY + (leftPy - hipY) * 0.5);
    this.ctx.lineTo(leftPx, leftPy);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(0, hipY);
    this.ctx.lineTo(rightPx * 0.6, hipY + (rightPy - hipY) * 0.5);
    this.ctx.lineTo(rightPx, rightPy);
    this.ctx.stroke();

    this.ctx.restore();

    // === 进度条 ===
    const barW = 320;
    const barH = 18;
    const barX = cx - barW / 2;
    const barY = cy + 60;

    // 进度条背景
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.lineWidth = 2;
    this.roundRect(barX, barY, barW, barH, 9);
    this.ctx.fill();
    this.ctx.stroke();

    // 进度条填充（从左到右渐变）
    const fillW = barW * progress;
    if (fillW > 0) {
      const grad = this.ctx.createLinearGradient(barX, barY, barX + barW, barY);
      grad.addColorStop(0, '#4ecdc4');
      grad.addColorStop(1, '#44a8e0');
      this.ctx.fillStyle = grad;
      this.roundRect(barX, barY, fillW, barH, 9);
      this.ctx.fill();
    }

    // 百分比文字
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${Math.round(progress * 100)}%`, cx, barY + barH + 24);

    // 底部提示
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.font = '13px Arial';
    this.ctx.fillText('加载中...', cx, barY + barH + 46);
    this.ctx.textAlign = 'left';
  }

  /**
   * 绘制圆角矩形
   */
  roundRect(x, y, w, h, r) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }

  renderUI() {
    // 更新UI显示
    document.getElementById('score').textContent = `分数: ${this.score}`;
    document.getElementById('lives').textContent = `生命: ${'❤️'.repeat(this.lives)}`;
    document.getElementById('level').textContent = `关卡: ${this.currentLevel + 1}/${this.totalLevels}`;
  }

  togglePause() {
    if (this.gameState === GameState.PLAYING) {
      this.gameState = GameState.PAUSED;
    } else if (this.gameState === GameState.PAUSED) {
      this.gameState = GameState.PLAYING;
    }
  }

  restart() {
    this.gameState = GameState.MENU;
    this.score = 0;
    this.maxDistance = 0;
    this.lives = 3;
    this.currentLevel = 0;
    this.playerColor = '#ffffff';
    this.bikeColor = '#0f3460';
    
    // 重置地形
    this.terrain.loadLevel(levels[0]);
    
    // 重置玩家
    this.player.setPosition(100, 350);
    this.player.setColor('#ffffff');
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    this.player.isGrounded = true;
    
    // 重置自行车
    this.bicycle.setPosition(100, 338);
    this.bicycle.setColor('#0f3460');
    this.bicycle.setSpeed(0);
    
    // 重置安全位置
    this.physics.setSafePosition(100, 350);
  }
}
