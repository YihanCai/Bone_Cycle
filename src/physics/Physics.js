/**
 * 物理引擎类 - 处理重力、碰撞和运动
 */
export class Physics {
  constructor() {
    // 重力参数
    this.gravity = 980; // 重力加速度 (像素/秒²)
    this.maxFallSpeed = 800; // 最大下落速度
    
    // 玩家物理参数
    this.playerSpeed = 300; // 玩家移动速度
    this.playerReverseSpeed = 180; // 倒车速度
    this.playerAcceleration = 800; // 加速度
    this.playerDeceleration = 1200; // 减速度
    this.playerJumpForce = -450; // 跳跃力度（负数向上）
    
    // 惯性参数
    this.friction = 0.85; // 摩擦系数
    this.minSpeed = 0.5; // 最小速度阈值
    
    // 安全位置记录（掉坑后回到这里）
    this.lastSafeX = 0;
    this.lastSafeY = 0;
  }

  /**
   * 更新玩家物理
   * @param {Object} player - 玩家对象
   * @param {Object} input - 输入状态
   * @param {number} deltaTime - 时间差
   * @param {Object} terrain - 地形对象
   */
  updatePlayer(player, input, deltaTime, terrain) {
    // 应用重力
    this.applyGravity(player, deltaTime);
    
    // 处理水平移动
    this.handleHorizontalMovement(player, input, deltaTime);
    
    // 更新位置
    player.x += player.velocityX * deltaTime;
    player.y += player.velocityY * deltaTime;
    
    // 检查平台碰撞
    this.checkPlatformCollision(player, terrain);
    
    // 检查掉落（返回是否掉坑）
    const fellOff = this.checkFallReset(player, terrain);
    
    // 更新玩家状态
    this.updatePlayerState(player);
    
    return fellOff;
  }

  /**
   * 应用重力
   */
  applyGravity(player, deltaTime) {
    if (!player.isGrounded) {
      player.velocityY += this.gravity * deltaTime;
      
      // 限制最大下落速度
      if (player.velocityY > this.maxFallSpeed) {
        player.velocityY = this.maxFallSpeed;
      }
    }
  }

  /**
   * 处理水平移动
   */
  handleHorizontalMovement(player, input, deltaTime) {
    let targetVelocityX = 0;
    let direction = 0;
    
    // D键前进
    if (input.isDPressed) {
      targetVelocityX = this.playerSpeed;
      direction = 1;
    }
    // A键倒车
    else if (input.isAPressed) {
      targetVelocityX = -this.playerReverseSpeed;
      direction = -1;
    }
    // S键停止
    else if (input.isSPressed) {
      targetVelocityX = 0;
      direction = 0;
    }
    
    // 平滑加速/减速
    if (targetVelocityX !== 0) {
      // 加速
      const acceleration = this.playerAcceleration * deltaTime;
      if (Math.abs(player.velocityX) < Math.abs(targetVelocityX)) {
        player.velocityX += acceleration * Math.sign(targetVelocityX);
        // 确保不超过目标速度
        if (Math.abs(player.velocityX) > Math.abs(targetVelocityX)) {
          player.velocityX = targetVelocityX;
        }
      }
    } else {
      // 减速（惯性）
      player.velocityX *= this.friction;
      if (Math.abs(player.velocityX) < this.minSpeed) {
        player.velocityX = 0;
      }
    }
    
    // 设置方向
    if (direction !== 0) {
      player.setDirection(direction);
    } else if (Math.abs(player.velocityX) > this.minSpeed) {
      player.setDirection(Math.sign(player.velocityX));
    }
    
    // 更新移动状态
    player.isMoving = Math.abs(player.velocityX) > this.minSpeed;
  }

  /**
   * 检查平台碰撞
   */
  checkPlatformCollision(player, terrain) {
    const playerBottom = player.y;
    const playerLeft = player.x - player.width / 2;
    const playerRight = player.x + player.width / 2;
    
    let wasGrounded = player.isGrounded;
    player.isGrounded = false;
    
    for (const platform of terrain.platforms) {
      // 检查水平范围
      if (playerRight > platform.x && playerLeft < platform.x + platform.width) {
        // 检查垂直碰撞（玩家底部是否在平台顶部附近）
        // 容差：上方8px用于着陆检测，下方15px用于高速下落穿透补偿
        if (playerBottom >= platform.y - 8 && playerBottom <= platform.y + 15) {
          // 碰撞检测：玩家站在平台上
          if (player.velocityY >= 0) {
            player.y = platform.y;
            player.velocityY = 0;
            player.isGrounded = true;
            
            // 记录安全位置：平台右边缘前方一点（掉坑后回到这里）
            this.lastSafeX = platform.x + platform.width - 15;
            this.lastSafeY = platform.y;
            
            break;
          }
        }
      }
    }
  }

  /**
   * 检查掉落重置 - 回到坑前面的安全位置
   */
  checkFallReset(player, terrain) {
    // 如果玩家掉出屏幕底部
    if (player.y > terrain.height + 100) {
      // 回到最后的安全位置（坑前面的平台边缘）
      player.x = this.lastSafeX;
      player.y = this.lastSafeY;
      player.velocityX = 0;
      player.velocityY = 0;
      player.isGrounded = true;
      
      return true; // 表示发生了重置
    }
    return false;
  }

  /**
   * 更新玩家状态
   */
  updatePlayerState(player) {
    // 更新跳跃状态
    if (!player.isGrounded) {
      player.isJumping = true;
    } else {
      player.isJumping = false;
    }
  }

  /**
   * 玩家跳跃
   */
  jump(player) {
    if (player.isGrounded) {
      player.velocityY = this.playerJumpForce;
      player.isGrounded = false;
      player.isJumping = true;
    }
  }

  /**
   * 检查是否到达终点
   */
  checkFinish(player, terrain) {
    return player.x >= terrain.levelLength - 50;
  }

  /**
   * 初始化安全位置（游戏开始时调用）
   * @param {number} x - 起始X
   * @param {number} y - 起始Y
   */
  setSafePosition(x, y) {
    this.lastSafeX = x;
    this.lastSafeY = y;
  }
}
