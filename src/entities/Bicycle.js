/**
 * 自行车类 - 处理自行车的绘制和状态
 */
export class Bicycle {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    // 位置
    this.x = 100;
    this.y = 400;
    
    // 尺寸
    this.width = 60;
    this.height = 30;
    
    // 轮子
    this.wheelRadius = 12;
    this.wheelRotation = 0;
    
    // 颜色
    this.color = '#0f3460';
    
    // 速度（用于轮子旋转）
    this.speed = 0;
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
   * 设置速度
   * @param {number} speed - 速度值
   */
  setSpeed(speed) {
    this.speed = speed;
  }

  /**
   * 更新自行车状态
   * @param {number} deltaTime - 时间差
   */
  update(deltaTime) {
    // 更新轮子旋转
    this.wheelRotation += this.speed * deltaTime * 10;
  }

  /**
   * 渲染自行车
   */
  render() {
    this.ctx.save();
    
    // 移动到自行车中心
    this.ctx.translate(this.x, this.y);
    
    // 绘制自行车
    this.drawBicycle();
    
    this.ctx.restore();
  }

  /**
   * 绘制自行车
   */
  drawBicycle() {
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    
    // 后轮
    this.drawWheel(-25, 0);
    
    // 前轮
    this.drawWheel(25, 0);
    
    // 车架
    this.drawFrame();
    
    // 车把
    this.drawHandlebar();
    
    // 车座
    this.drawSeat();
    
    // 踏板
    this.drawPedals();
  }

  /**
   * 绘制轮子
   * @param {number} x - X坐标
   * @param {number} y - Y坐标
   */
  drawWheel(x, y) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.wheelRadius, 0, Math.PI * 2);
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    // 轮辐
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8 + this.wheelRotation;
      const endX = x + Math.cos(angle) * this.wheelRadius;
      const endY = y + Math.sin(angle) * this.wheelRadius;
      
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }
    
    // 轮毂
    this.ctx.beginPath();
    this.ctx.arc(x, y, 3, 0, Math.PI * 2);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }

  /**
   * 绘制车架
   */
  drawFrame() {
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = 3;
    
    // 后轮到车座
    this.ctx.beginPath();
    this.ctx.moveTo(-25, 0);
    this.ctx.lineTo(-5, -20);
    this.ctx.stroke();
    
    // 车座到前轮
    this.ctx.beginPath();
    this.ctx.moveTo(-5, -20);
    this.ctx.lineTo(25, 0);
    this.ctx.stroke();
    
    // 后轮到踏板
    this.ctx.beginPath();
    this.ctx.moveTo(-25, 0);
    this.ctx.lineTo(0, 0);
    this.ctx.stroke();
    
    // 踏板到前轮
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(25, 0);
    this.ctx.stroke();
    
    // 车座竖杆
    this.ctx.beginPath();
    this.ctx.moveTo(-5, -20);
    this.ctx.lineTo(-5, -30);
    this.ctx.stroke();
  }

  /**
   * 绘制车把
   */
  drawHandlebar() {
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = 3;
    
    // 车把立管
    this.ctx.beginPath();
    this.ctx.moveTo(20, 0);
    this.ctx.lineTo(25, -15);
    this.ctx.stroke();
    
    // 车把横杆
    this.ctx.beginPath();
    this.ctx.moveTo(20, -15);
    this.ctx.lineTo(30, -15);
    this.ctx.stroke();
  }

  /**
   * 绘制车座
   */
  drawSeat() {
    this.ctx.fillStyle = this.color;
    
    // 车座
    this.ctx.beginPath();
    this.ctx.ellipse(-5, -32, 8, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * 绘制踏板
   */
  drawPedals() {
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = 2;
    
    // 踏板曲柄
    const pedalAngle = this.wheelRotation * 2;
    const pedalLength = 8;
    
    // 左踏板
    const leftPedalX = Math.cos(pedalAngle) * pedalLength;
    const leftPedalY = Math.sin(pedalAngle) * pedalLength;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(leftPedalX, leftPedalY);
    this.ctx.stroke();
    
    // 右踏板
    const rightPedalX = Math.cos(pedalAngle + Math.PI) * pedalLength;
    const rightPedalY = Math.sin(pedalAngle + Math.PI) * pedalLength;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(rightPedalX, rightPedalY);
    this.ctx.stroke();
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
