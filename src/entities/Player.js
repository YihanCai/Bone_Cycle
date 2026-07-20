/**
 * 火柴人角色类 - 处理玩家角色的绘制和状态
 */
export class Player {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    // 位置
    this.x = 100;
    this.y = 400;
    
    // 速度
    this.velocityX = 0;
    this.velocityY = 0;
    
    // 尺寸
    this.width = 20;
    this.height = 50;
    
    // 状态
    this.isGrounded = false;
    this.isJumping = false;
    this.isMoving = false;
    this.direction = 1; // 1向右，-1向左
    
    // 动画
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.animationSpeed = 0.1;
    
    // 颜色
    this.color = '#ffffff';
    
    // 骑行状态
    this.isRiding = true;
    
    // 踏板角度（从自行车同步）
    this.pedalAngle = 0;
  }

  /**
   * 设置位置
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * 设置颜色
   * @param {string} color - 颜色值
   */
  setColor(color) {
    this.color = color;
  }

  /**
   * 更新玩家状态
   * @param {number} deltaTime - 时间差
   */
  update(deltaTime) {
    // 更新动画
    if (this.isMoving) {
      this.animationTimer += deltaTime;
      if (this.animationTimer >= this.animationSpeed) {
        this.animationTimer = 0;
        this.animationFrame = (this.animationFrame + 1) % 4;
      }
    } else {
      this.animationFrame = 0;
    }
    
    // 更新跳跃状态
    if (!this.isGrounded) {
      this.isJumping = true;
    } else {
      this.isJumping = false;
    }
  }

  /**
   * 渲染火柴人
   */
  render() {
    this.ctx.save();
    
    // 移动到火柴人底部（脚/踏板位置）
    this.ctx.translate(this.x, this.y);
    
    // 根据方向翻转
    if (this.direction === -1) {
      this.ctx.scale(-1, 1);
    }
    
    // 绘制火柴人
    this.drawStickman();
    
    this.ctx.restore();
  }

  /**
   * 绘制火柴人
   */
  drawStickman() {
    this.ctx.strokeStyle = this.color;
    this.ctx.fillStyle = this.color;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    
    if (this.isRiding) {
      if (this.isJumping) {
        this.drawRidingJumpPose();
      } else {
        this.drawRidingPose();
      }
    } else if (this.isJumping) {
      this.drawJumpingPose();
    } else {
      this.drawWalkingPose();
    }
  }

  /**
   * 绘制骑行姿态 - 火柴人坐在自行车上，腿蹬踏板
   * y=0 为地面（player.y = platform.y），向上为负
   * 
   * 布局:
   *   头部:  y = -67
   *   肩膀:  y = -52
   *   臀部:  y = -38 (车座)
   *   踏板:  y = -12 (轮心高度)
   *   地面:  y = 0
   */
  drawRidingPose() {
    const headRadius = 9;
    const headY = -67;
    const shoulderY = -52;
    const hipY = -38;
    const pedalCenterY = -12;
    const pedalLength = 12;
    
    // 车把位置（相对玩家）
    const handlebarX = 20;
    const handlebarY = -27;
    
    // --- 头部 ---
    this.ctx.beginPath();
    this.ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    // --- 身体（肩膀到臀部）---
    this.ctx.beginPath();
    this.ctx.moveTo(0, shoulderY);
    this.ctx.lineTo(0, hipY);
    this.ctx.stroke();
    
    // --- 手臂（握车把）---
    this.ctx.beginPath();
    this.ctx.moveTo(0, shoulderY + 3);
    this.ctx.lineTo(handlebarX, handlebarY);
    this.ctx.stroke();
    
    // --- 腿部蹬踏板动画 ---
    // 左脚：踏板曲柄末端
    const leftFootX = Math.cos(this.pedalAngle) * pedalLength;
    const leftFootY = pedalCenterY + Math.sin(this.pedalAngle) * pedalLength;
    
    // 右脚：对面踏板
    const rightFootX = Math.cos(this.pedalAngle + Math.PI) * pedalLength;
    const rightFootY = pedalCenterY + Math.sin(this.pedalAngle + Math.PI) * pedalLength;
    
    // 左腿：臀部 → 膝盖 → 脚（踏板）
    const leftKneeX = (0 + leftFootX) * 0.4;
    const leftKneeY = hipY + (leftFootY - hipY) * 0.5 + 4;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, hipY);
    this.ctx.lineTo(leftKneeX, leftKneeY);
    this.ctx.lineTo(leftFootX, leftFootY);
    this.ctx.stroke();
    
    // 右腿：臀部 → 膝盖 → 脚
    const rightKneeX = (0 + rightFootX) * 0.4;
    const rightKneeY = hipY + (rightFootY - hipY) * 0.5 + 4;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, hipY);
    this.ctx.lineTo(rightKneeX, rightKneeY);
    this.ctx.lineTo(rightFootX, rightFootY);
    this.ctx.stroke();
  }

  /**
   * 绘制骑行跳跃姿态 - 腿收起
   */
  drawRidingJumpPose() {
    const headRadius = 9;
    const headY = -67;
    const shoulderY = -52;
    const hipY = -38;
    
    const handlebarX = 20;
    const handlebarY = -27;
    
    // 头部
    this.ctx.beginPath();
    this.ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    // 身体
    this.ctx.beginPath();
    this.ctx.moveTo(0, shoulderY);
    this.ctx.lineTo(0, hipY);
    this.ctx.stroke();
    
    // 手臂（握车把）
    this.ctx.beginPath();
    this.ctx.moveTo(0, shoulderY + 3);
    this.ctx.lineTo(handlebarX, handlebarY);
    this.ctx.stroke();
    
    // 腿部（跳起收腿，膝盖弯曲）
    this.ctx.beginPath();
    this.ctx.moveTo(0, hipY);
    this.ctx.lineTo(-10, hipY + 12);
    this.ctx.lineTo(-6, hipY + 6);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, hipY);
    this.ctx.lineTo(6, hipY + 12);
    this.ctx.lineTo(2, hipY + 6);
    this.ctx.stroke();
  }

  /**
   * 绘制跳跃姿态（非骑行）
   */
  drawJumpingPose() {
    const headRadius = 10;
    const bodyLength = 25;
    
    // 头部
    this.ctx.beginPath();
    this.ctx.arc(0, -bodyLength - headRadius, headRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    // 身体
    this.ctx.beginPath();
    this.ctx.moveTo(0, -bodyLength);
    this.ctx.lineTo(0, 0);
    this.ctx.stroke();
    
    // 手臂（向上）
    this.ctx.beginPath();
    this.ctx.moveTo(0, -bodyLength + 10);
    this.ctx.lineTo(-15, -bodyLength - 5);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, -bodyLength + 10);
    this.ctx.lineTo(15, -bodyLength - 5);
    this.ctx.stroke();
    
    // 腿部（伸直）
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-10, 15);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(10, 15);
    this.ctx.stroke();
  }

  /**
   * 绘制行走姿态
   */
  drawWalkingPose() {
    const headRadius = 10;
    const bodyLength = 25;
    const walkOffset = Math.sin(this.animationFrame * Math.PI / 2) * 5;
    
    // 头部
    this.ctx.beginPath();
    this.ctx.arc(0, -bodyLength - headRadius, headRadius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    
    // 身体
    this.ctx.beginPath();
    this.ctx.moveTo(0, -bodyLength);
    this.ctx.lineTo(0, 0);
    this.ctx.stroke();
    
    // 手臂（摆动）
    this.ctx.beginPath();
    this.ctx.moveTo(0, -bodyLength + 10);
    this.ctx.lineTo(-10, -bodyLength + 20 + walkOffset);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, -bodyLength + 10);
    this.ctx.lineTo(10, -bodyLength + 20 - walkOffset);
    this.ctx.stroke();
    
    // 腿部（迈步）
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-8, 15 + walkOffset);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(8, 15 - walkOffset);
    this.ctx.stroke();
  }

  /**
   * 玩家跳跃
   */
  jump() {
    if (this.isGrounded) {
      this.velocityY = -15;
      this.isGrounded = false;
      this.isJumping = true;
    }
  }

  /**
   * 设置移动方向
   * @param {number} direction - 1向右，-1向左，0停止
   */
  setDirection(direction) {
    this.direction = direction;
    this.isMoving = direction !== 0;
  }

  /**
   * 获取碰撞框
   * @returns {Object} 碰撞框 {x, y, width, height}
   */
  getCollisionBox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height,
      width: this.width,
      height: this.height
    };
  }
}
