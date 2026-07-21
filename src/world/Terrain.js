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
    this.flames = [];
    this.flameTimers = [];
    
    // 关卡长度
    this.levelLength = 0;
    
    // 摄像机偏移
    this.cameraX = 0;
    
    // 地形颜色
    this.grassColor = '#4a7c3f';     // 草地颜色（绿色）
    this.dirtColor = '#8b5a2b';      // 土地颜色（棕色）
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
    this.flames = levelData.flames || [];
    this.levelLength = levelData.length || 3000;
    // 初始化每个火焰的计时器
    this.flameTimers = this.flames.map((f, i) => ({
      timer: Math.random() * f.interval, // 随机起始偏移，避免同时喷火
      active: false
    }));
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
    // 清空画布背景（天空蓝）
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 绘制平台
    this.renderPlatforms();
    
    // 绘制坑洞标记
    this.renderGaps();
    
    // 绘制关卡边界
    this.renderBorders();
    
    // 绘制火焰陷阱
    this.renderFlames();
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
        // 绘制土地（地下部分）
        this.ctx.fillStyle = this.dirtColor;
        this.ctx.fillRect(screenX, platform.y, platform.width, platform.height);
        
        // 绘制草地（地面顶部）
        this.ctx.fillStyle = this.grassColor;
        this.ctx.fillRect(screenX, platform.y, platform.width, 12);
        
        // 绘制平台边框
        this.ctx.strokeStyle = this.borderColor;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(screenX, platform.y, platform.width, platform.height);
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
    this.ctx.fillStyle = this.dirtColor;
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

  /**
   * 更新火焰状态（周期性喷火）
   * @param {number} deltaTime - 时间差
   */
  updateFlames(deltaTime) {
    for (let i = 0; i < this.flames.length; i++) {
      const flame = this.flames[i];
      const state = this.flameTimers[i];
      state.timer += deltaTime;
      // 周期：duration 时间内喷火，剩余时间熄灭
      state.active = (state.timer % flame.interval) < flame.duration;
    }
  }

  /**
   * 检查玩家是否碰到火焰
   * @param {number} playerX - 玩家X坐标（世界坐标）
   * @param {number} playerY - 玩家Y坐标（底部）
   * @param {number} playerW - 玩家宽度
   * @param {number} playerH - 玩家高度
   * @returns {boolean} 是否碰到火焰
   */
  checkFlameCollision(playerX, playerY, playerW, playerH) {
    const halfW = playerW / 2;
    const pLeft = playerX - halfW;
    const pRight = playerX + halfW;
    const pTop = playerY - playerH;
    const pBottom = playerY;

    for (let i = 0; i < this.flames.length; i++) {
      if (!this.flameTimers[i].active) continue;
      const f = this.flames[i];
      // AABB 碰撞（玩家与火焰区域）
      if (pRight > f.x && pLeft < f.x + f.width &&
          pBottom > f.y - f.height && pTop < f.y) {
        return true;
      }
    }
    return false;
  }

  /**
   * 渲染火焰陷阱（周期性喷火动画）
   */
  renderFlames() {
    const now = performance.now() / 1000;

    for (let i = 0; i < this.flames.length; i++) {
      const flame = this.flames[i];
      const state = this.flameTimers[i];
      const screenX = flame.x - this.cameraX;

      // 跳过屏幕外的
      if (screenX + flame.width < 0 || screenX > this.width) continue;

      // 火焰底部在平台上
      const baseY = flame.y;

      // --- 火焰喷射口（固定） ---
      this.ctx.fillStyle = '#555555';
      this.ctx.fillRect(screenX, baseY - 6, flame.width, 6);

      if (state.active) {
        // 喷火阶段：绘制火焰柱
        const flameH = flame.height + 10 * Math.sin(now * 12 + i); // 微抖
        const cx = screenX + flame.width / 2;

        // 外焰（红色）
        const grad = this.ctx.createLinearGradient(cx, baseY - flameH, cx, baseY);
        grad.addColorStop(0, 'rgba(255,60,0,0.2)');
        grad.addColorStop(0.4, 'rgba(255,120,0,0.7)');
        grad.addColorStop(1, 'rgba(255,200,0,1)');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.moveTo(screenX - 4, baseY);
        this.ctx.lineTo(cx, baseY - flameH);
        this.ctx.lineTo(screenX + flame.width + 4, baseY);
        this.ctx.closePath();
        this.ctx.fill();

        // 内焰（黄色/白色）
        const innerH = flameH * 0.55;
        this.ctx.fillStyle = 'rgba(255,255,180,0.9)';
        this.ctx.beginPath();
        this.ctx.moveTo(screenX + 4, baseY);
        this.ctx.lineTo(cx, baseY - innerH);
        this.ctx.lineTo(screenX + flame.width - 4, baseY);
        this.ctx.closePath();
        this.ctx.fill();

        // 火花粒子
        for (let p = 0; p < 3; p++) {
          const px = cx + Math.sin(now * 8 + p * 2.1 + i) * 8;
          const py = baseY - flameH * (0.5 + 0.5 * Math.cos(now * 6 + p + i));
          this.ctx.fillStyle = `rgba(255,${180 + Math.floor(Math.random()*75)},0,0.8)`;
          this.ctx.fillRect(px - 1, py - 1, 2, 2);
        }
      } else {
        // 冷却阶段：小烟雾提示
        this.ctx.fillStyle = 'rgba(120,120,120,0.3)';
        this.ctx.beginPath();
        this.ctx.arc(screenX + flame.width / 2, baseY - 12, 4, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }
}
