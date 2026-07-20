/**
 * 地形管理类 - 处理平台和坑洞
 */
export class Terrain {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    
    // 地形数据
    this.platforms = [];
    this.gaps = [];
    
    // 关卡长度
    this.levelLength = 0;
    
    // 摄像机偏移
    this.cameraX = 0;
    
    // 地形颜色
    this.platformColor = '#4ecdc4';  // 平台颜色（青色）
    this.gapColor = '#e94560';       // 坑洞标记颜色（红色）
    this.borderColor = '#ffffff';    // 边框颜色
  }

  /**
   * 加载关卡数据
   * @param {Object} levelData - 关卡数据
   */
  loadLevel(levelData) {
    this.platforms = levelData.platforms || [];
    this.gaps = levelData.gaps || [];
    this.levelLength = levelData.length || 3000;
  }

  /**
   * 更新摄像机位置
   * @param {number} playerX - 玩家X坐标
   */
  updateCamera(playerX) {
    // 摄像机跟随玩家，但不超出关卡边界
    const targetX = playerX - this.width / 3;
    this.cameraX = Math.max(0, Math.min(targetX, this.levelLength - this.width));
  }

  /**
   * 渲染地形
   */
  render() {
    // 清空画布背景
    this.ctx.fillStyle = '#16213e';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 绘制平台
    this.renderPlatforms();
    
    // 绘制坑洞标记
    this.renderGaps();
    
    // 绘制关卡边界
    this.renderBorders();
  }

  /**
   * 渲染所有平台
   */
  renderPlatforms() {
    this.platforms.forEach(platform => {
      // 计算平台在屏幕上的位置
      const screenX = platform.x - this.cameraX;
      
      // 只渲染可见的平台
      if (screenX + platform.width > 0 && screenX < this.width) {
        // 绘制平台主体
        this.ctx.fillStyle = this.platformColor;
        this.ctx.fillRect(screenX, platform.y, platform.width, platform.height);
        
        // 绘制平台边框
        this.ctx.strokeStyle = this.borderColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenX, platform.y, platform.width, platform.height);
        
        // 绘制平台顶部装饰线
        this.ctx.beginPath();
        this.ctx.moveTo(screenX, platform.y);
        this.ctx.lineTo(screenX + platform.width, platform.y);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
      }
    });
  }

  /**
   * 渲染坑洞标记 - 在平台之间的空隙处绘制深渊效果
   */
  renderGaps() {
    this.gaps.forEach(gap => {
      // 计算坑洞在屏幕上的位置
      const screenX = gap.x - this.cameraX;
      
      // 只渲染可见的坑洞
      if (screenX + gap.width > 0 && screenX < this.width) {
        // 找到坑洞左侧的平台（玩家走过来的那个平台）
        let pitTop = 400; // 默认平台高度
        for (const platform of this.platforms) {
          // 左侧平台：平台右边缘刚好在坑洞起始位置
          if (platform.x + platform.width >= gap.x - 5 && platform.x + platform.width <= gap.x + 10) {
            pitTop = platform.y;
            break; // 取第一个匹配的（最近的左侧平台）
          }
        }
        
        const pitBottom = this.height + 50; // 底部延伸到屏幕外
        
        // 深渊背景（暗色渐变）
        const gradient = this.ctx.createLinearGradient(screenX, pitTop, screenX, pitBottom);
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(screenX, pitTop, gap.width, pitBottom - pitTop);
        
        // 坑洞两侧边缘线（红色警告）
        this.ctx.strokeStyle = '#e94560';
        this.ctx.lineWidth = 2;
        
        // 左边缘
        this.ctx.beginPath();
        this.ctx.moveTo(screenX, pitTop);
        this.ctx.lineTo(screenX, pitBottom);
        this.ctx.stroke();
        
        // 右边缘
        this.ctx.beginPath();
        this.ctx.moveTo(screenX + gap.width, pitTop);
        this.ctx.lineTo(screenX + gap.width, pitBottom);
        this.ctx.stroke();
        
        // 顶部危险标记
        this.ctx.fillStyle = '#e94560';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('⚠', screenX + gap.width / 2, pitTop - 8);
        this.ctx.textAlign = 'left';
      }
    });
  }

  /**
   * 渲染关卡边界 + 终点黑白格子旗
   */
  renderBorders() {
    // 起点边界
    const startScreenX = 0 - this.cameraX;
    this.ctx.fillStyle = '#4ecdc4';
    this.ctx.fillRect(startScreenX, 0, 5, this.height);
    
    // 终点线位置
    const finishX = this.levelLength - 50;
    const finishScreenX = finishX - this.cameraX;
    
    // 只在可见范围内渲染
    if (finishScreenX > -100 && finishScreenX < this.width + 100) {
      // === 终点立柱 ===
      const poleX = finishScreenX;
      const poleTop = 250;
      const poleBottom = 400;
      
      // 左立柱
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(poleX - 3, poleTop, 6, poleBottom - poleTop);
      
      // 右立柱
      this.ctx.fillRect(poleX + 55, poleTop, 6, poleBottom - poleTop);
      
      // === 黑白格子横幅 ===
      const flagTop = poleTop;
      const flagHeight = 30;
      const cellSize = 10;
      const cols = 6;
      
      for (let row = 0; row < Math.ceil(flagHeight / cellSize); row++) {
        for (let col = 0; col < cols; col++) {
          const isBlack = (row + col) % 2 === 0;
          this.ctx.fillStyle = isBlack ? '#000000' : '#ffffff';
          this.ctx.fillRect(
            poleX + col * cellSize,
            flagTop + row * cellSize,
            cellSize,
            cellSize
          );
        }
      }
      
      // 横幅边框
      this.ctx.strokeStyle = '#888888';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(poleX, flagTop, cols * cellSize, flagHeight);
      
      // === 终点文字 ===
      this.ctx.fillStyle = '#ffd700';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('🏁 FINISH', poleX + 30, poleTop - 12);
      this.ctx.textAlign = 'left';
    }
  }

  /**
   * 检查玩家是否在平台上
   * @param {number} x - 玩家X坐标
   * @param {number} y - 玩家Y坐标
   * @param {number} width - 玩家宽度
   * @param {number} height - 玩家高度
   * @returns {Object|null} 碰撞的平台信息
   */
  checkPlatformCollision(x, y, width, height) {
    for (const platform of this.platforms) {
      // 检查水平碰撞
      if (x + width > platform.x && x < platform.x + platform.width) {
        // 检查垂直碰撞（玩家底部是否在平台顶部附近）
        const playerBottom = y + height;
        if (playerBottom >= platform.y && playerBottom <= platform.y + 20) {
          return {
            platform: platform,
            top: platform.y
          };
        }
      }
    }
    return null;
  }

  /**
   * 检查玩家是否掉入坑洞
   * @param {number} x - 玩家X坐标
   * @param {number} y - 玩家Y坐标
   * @returns {boolean} 是否掉入坑洞
   */
  checkGapFall(x, y) {
    for (const gap of this.gaps) {
      if (x > gap.x && x < gap.x + gap.width) {
        // 玩家在坑洞上方，且Y坐标超过屏幕底部
        if (y > this.height) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 获取玩家的起始位置
   * @returns {Object} 起始位置 {x, y}
   */
  getStartPosition() {
    if (this.platforms.length > 0) {
      const firstPlatform = this.platforms[0];
      return {
        x: firstPlatform.x + 50,
        y: firstPlatform.y - 50  // 站在平台上
      };
    }
    return { x: 100, y: 400 };
  }
}
