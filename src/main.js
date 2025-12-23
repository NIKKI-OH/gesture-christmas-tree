console.log('🎄 Gesture Christmas Tree starting...');

// 简单的Three.js场景
const sceneInfo = {
  status: '正在初始化...',
  version: '1.0.0',
  features: [
    '手势控制',
    '3D粒子效果',
    '圣诞树变换'
  ]
};

console.log('项目信息:', sceneInfo);

// 检查Three.js是否可用
if (typeof THREE !== 'undefined') {
  console.log('✅ Three.js已加载');
} else {
  console.log('⚠️ Three.js未加载，请在HTML中引入');
}

// 手势检测模拟
let gesture = 'none';
setInterval(() => {
  const gestures = ['open', 'fist', 'pinch'];
  gesture = gestures[Math.floor(Math.random() * gestures.length)];
  console.log(`当前手势: ${gesture}`);
}, 3000);
