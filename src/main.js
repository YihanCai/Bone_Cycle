/**
 * Bone Cycle - 火柴人自行车闯关游戏
 * 游戏入口文件
 */

import { Game } from './core/Game.js';

// 等待DOM加载完成
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  
  // 创建游戏实例
  const game = new Game(canvas, ctx);
  
  // 开始游戏循环
  game.start();
  
  // 控制台输出
  console.log('🚴 Bone Cycle 游戏已加载！');
  console.log('操作说明: 方向键移动, 空格跳跃, R重来, ESC暂停');
});
