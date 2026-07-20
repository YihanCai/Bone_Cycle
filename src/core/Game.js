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

// 游戏状态枚举
export const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  VICTORY: 'victory'
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
      if (this.gameState === GameState.GAME_OVER || this.gameState === GameState.VICTORY) {
        if (keyCode === 'KeyR') {
          this.restart();
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
    this.maxDistance = 0; // 最远距离（用于计分）
    
    // 加载第一关
    this.terrain.loadLevel(level1Data);
    
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
    
    // 使用物理引擎更新玩家
    const fellOff = this.physics.updatePlayer(this.player, this.input, deltaTime, this.terrain);
    
    // 如果玩家掉落，减少生命值
    if (fellOff) {
      this.lives--;
      if (this.lives <= 0) {
        this.gameState = GameState.GAME_OVER;
      }
    }
    
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
    
    // 胜利文字
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('恭喜通关！', this.width / 2, this.height / 2 - 20);
    
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText(`最终得分: ${this.score}`, this.width / 2, this.height / 2 + 20);
    this.ctx.fillText('按R重新开始', this.width / 2, this.height / 2 + 50);
    this.ctx.textAlign = 'left';
  }

  renderUI() {
    // 更新UI显示
    document.getElementById('score').textContent = `分数: ${this.score}`;
    document.getElementById('lives').textContent = `生命: ${'❤️'.repeat(this.lives)}`;
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
    this.playerColor = '#ffffff';
    this.bikeColor = '#0f3460';
    
    // 重置地形
    this.terrain.loadLevel(level1Data);
    
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
