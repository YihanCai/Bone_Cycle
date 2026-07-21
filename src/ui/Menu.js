/**
 * 菜单管理类 - 处理开始页面和颜色选择
 */
export class Menu {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    
    // 颜色选项
    this.playerColors = [
      { name: '白色', color: '#ffffff' },
      { name: '金色', color: '#ffd700' },
      { name: '红色', color: '#ff6b6b' },
      { name: '黑色', color: '#333333' }
    ];
    
    this.bikeColors = [
      { name: '蓝色', color: '#0f3460' },
      { name: '绿色', color: '#4ecdc4' },
      { name: '橙色', color: '#ff8c42' },
      { name: '白色', color: '#ffffff' }
    ];
    
    // 当前选择（默认第一个）
    this.selectedPlayerColor = 0;
    this.selectedBikeColor = 0;
    
    // 按钮区域
    this.buttons = {};
    
    // 鼠标状态
    this.mouseX = 0;
    this.mouseY = 0;
    this.isMouseClicked = false;
    
    // 回调
    this.onStartGame = null;
    
    // 初始化
    this.setupEventListeners();
  }

  setupEventListeners() {
    // 鼠标移动
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    // 鼠标点击
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      this.handleClick(clickX, clickY);
    });
  }

  handleClick(x, y) {
    // 检查火柴人颜色按钮
    for (let i = 0; i < this.playerColors.length; i++) {
      const btn = this.buttons[`player_${i}`];
      if (btn && this.isPointInRect(x, y, btn)) {
        this.selectedPlayerColor = i;
        return;
      }
    }
    
    // 检查自行车颜色按钮
    for (let i = 0; i < this.bikeColors.length; i++) {
      const btn = this.buttons[`bike_${i}`];
      if (btn && this.isPointInRect(x, y, btn)) {
        this.selectedBikeColor = i;
        return;
      }
    }
    
    // 检查开始游戏按钮
    if (this.buttons.start && this.isPointInRect(x, y, this.buttons.start)) {
      if (this.onStartGame) {
        this.onStartGame(this.getPlayerColor(), this.getBikeColor());
      }
    }
  }

  isPointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
  }

  getPlayerColor() {
    return this.playerColors[this.selectedPlayerColor].color;
  }

  getBikeColor() {
    return this.bikeColors[this.selectedBikeColor].color;
  }

  render() {
    // 清空画布
    this.ctx.fillStyle = '#16213e';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // 绘制标题
    this.renderTitle();
    
    // 绘制颜色选择区域
    this.renderColorSelection();
    
    // 绘制预览区域
    this.renderPreview();
    
    // 绘制开始按钮
    this.renderStartButton();
  }

  renderTitle() {
    // 标题
    this.ctx.fillStyle = '#e94560';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🚴 Bone Cycle', this.width / 2, 80);
    
    // 副标题
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('火柴人自行车闯关游戏', this.width / 2, 120);
    
    this.ctx.textAlign = 'left';
  }

  renderColorSelection() {
    // 火柴人颜色选择
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('火柴人颜色:', 100, 180);
    
    for (let i = 0; i < this.playerColors.length; i++) {
      const x = 100 + i * 75;
      const y = 200;
      const size = 50;
      
      // 保存按钮区域
      this.buttons[`player_${i}`] = { x, y, width: size, height: size };
      
      // 绘制颜色方块
      this.ctx.fillStyle = this.playerColors[i].color;
      this.ctx.fillRect(x, y, size, size);
      
      // 绘制边框
      this.ctx.strokeStyle = i === this.selectedPlayerColor ? '#ffd700' : '#ffffff';
      this.ctx.lineWidth = i === this.selectedPlayerColor ? 4 : 2;
      this.ctx.strokeRect(x, y, size, size);
      
      // 绘制颜色名称
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.playerColors[i].name, x + size / 2, y + size + 20);
      this.ctx.textAlign = 'left';
    }
    
    // 自行车颜色选择
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('自行车颜色:', 100, 300);
    
    for (let i = 0; i < this.bikeColors.length; i++) {
      const x = 100 + i * 75;
      const y = 320;
      const size = 50;
      
      // 保存按钮区域
      this.buttons[`bike_${i}`] = { x, y, width: size, height: size };
      
      // 绘制颜色方块
      this.ctx.fillStyle = this.bikeColors[i].color;
      this.ctx.fillRect(x, y, size, size);
      
      // 绘制边框
      this.ctx.strokeStyle = i === this.selectedBikeColor ? '#ffd700' : '#ffffff';
      this.ctx.lineWidth = i === this.selectedBikeColor ? 4 : 2;
      this.ctx.strokeRect(x, y, size, size);
      
      // 绘制颜色名称
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.bikeColors[i].name, x + size / 2, y + size + 20);
      this.ctx.textAlign = 'left';
    }
  }

  renderPreview() {
    // 预览区域标题
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText('预览:', 650, 180);
    
    // 绘制预览的火柴人和自行车
    const previewX = 700;
    const previewY = 350;
    
    // 绘制自行车
    this.drawBicycle(previewX, previewY, this.getBikeColor());
    
    // 绘制火柴人（骑在自行车上）
    this.drawStickman(previewX, previewY - 30, this.getPlayerColor());
  }

  drawBicycle(x, y, color) {
    // 后轮
    this.ctx.beginPath();
    this.ctx.arc(x - 30, y, 20, 0, Math.PI * 2);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    // 前轮
    this.ctx.beginPath();
    this.ctx.arc(x + 30, y, 20, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // 车架
    this.ctx.beginPath();
    this.ctx.moveTo(x - 30, y);
    this.ctx.lineTo(x - 10, y - 25);
    this.ctx.lineTo(x + 10, y - 25);
    this.ctx.lineTo(x + 30, y);
    this.ctx.stroke();
    
    // 车把
    this.ctx.beginPath();
    this.ctx.moveTo(x + 10, y - 25);
    this.ctx.lineTo(x + 20, y - 40);
    this.ctx.stroke();
    
    // 车座
    this.ctx.beginPath();
    this.ctx.moveTo(x - 15, y - 25);
    this.ctx.lineTo(x - 10, y - 35);
    this.ctx.stroke();
  }

  drawStickman(x, y, color) {
    // 头
    this.ctx.beginPath();
    this.ctx.arc(x, y - 30, 10, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    
    // 身体
    this.ctx.beginPath();
    this.ctx.moveTo(x, y - 20);
    this.ctx.lineTo(x, y + 10);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    // 手臂
    this.ctx.beginPath();
    this.ctx.moveTo(x - 15, y - 5);
    this.ctx.lineTo(x + 15, y - 5);
    this.ctx.stroke();
    
    // 腿
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + 10);
    this.ctx.lineTo(x - 10, y + 30);
    this.ctx.moveTo(x, y + 10);
    this.ctx.lineTo(x + 10, y + 30);
    this.ctx.stroke();
  }

  renderStartButton() {
    const x = this.width / 2 - 100;
    const y = 450;
    const width = 200;
    const height = 50;
    
    // 保存按钮区域
    this.buttons.start = { x, y, width, height };
    
    // 检查鼠标是否悬停
    const isHover = this.isPointInRect(this.mouseX, this.mouseY, { x, y, width, height });
    
    // 绘制按钮背景
    this.ctx.fillStyle = isHover ? '#e94560' : '#c0392b';
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, 10);
    this.ctx.fill();
    
    // 绘制按钮边框
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    
    // 绘制按钮文字
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('开始游戏', this.width / 2, y + 33);
    this.ctx.textAlign = 'left';
  }
}
