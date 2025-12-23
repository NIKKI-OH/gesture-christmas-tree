// 手势梦幻圣诞树 - 修复版
console.log('🎄 手势梦幻圣诞树 v2.1 正在启动...');

// 全局变量
let scene, camera, renderer;
let particleSystem = null;
let isTreeMode = false;
let particleCount = 1000; // 减少粒子数量提高性能
let clock = new THREE.Clock();
let isInitialized = false;

// DOM元素
const loadingOverlay = document.getElementById('loading-overlay');
const loadingHint = document.getElementById('loading-hint');
const progressFill = document.getElementById('progress-fill');

// 简化版初始化函数
async function init() {
    try {
        console.log('1. 初始化Three.js...');
        updateLoadingText('正在初始化3D引擎...');
        await initThreeJS();
        
        console.log('2. 创建粒子系统...');
        updateLoadingText('正在创建魔法粒子...');
        initParticles();
        
        console.log('3. 设置灯光和效果...');
        updateLoadingText('正在设置场景效果...');
        setupSceneEffects();
        
        console.log('4. 启动动画...');
        updateLoadingText('启动动画循环...');
        animate();
        
        console.log('✅ 系统初始化完成！');
        isInitialized = true;
        
        // 隐藏加载界面
        setTimeout(() => {
            loadingOverlay.style.opacity = '0';
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
                if (window.updateStatus) {
                    window.updateStatus('✨ 欢迎来到手势梦幻圣诞树！', 'success');
                }
            }, 1000);
        }, 500);
        
        // 导出API给UI使用
        window.app = {
            toggleTreeMode: () => toggleTreeMode(),
            onGestureDetected: (gesture) => onGestureDetected(gesture),
            scene: scene,
            camera: camera
        };
        
    } catch (error) {
        console.error('初始化失败:', error);
        updateLoadingText(`错误: ${error.message}`, true);
    }
}

// 更新加载文本
function updateLoadingText(text, isError = false) {
    if (loadingHint) {
        loadingHint.textContent = text;
        if (isError) {
            loadingHint.style.color = '#ff4444';
        }
    }
    
    // 模拟进度条
    if (progressFill) {
        const currentWidth = parseInt(progressFill.style.width) || 0;
        const newWidth = Math.min(currentWidth + 20, 100);
        progressFill.style.width = `${newWidth}%`;
    }
}

// 初始化Three.js - 简化版
function initThreeJS() {
    return new Promise((resolve) => {
        // 创建场景
        scene = new THREE.Scene();
        
        // 创建相机
        camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 8, 25);
        
        // 创建渲染器 - 确保透明度正确
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        
        // 设置渲染器大小
        updateRendererSize();
        
        // 添加到DOM
        const container = document.querySelector('.canvas-wrapper');
        if (container) {
            // 清空容器
            container.innerHTML = '';
            container.appendChild(renderer.domElement);
            
            // 设置canvas样式
            const canvas = renderer.domElement;
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.display = 'block';
        } else {
            console.error('找不到画布容器！');
        }
        
        resolve();
    });
}

// 更新渲染器大小
function updateRendererSize() {
    if (!renderer || !camera) return;
    
    const container = document.getElementById('canvas-container');
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    if (width > 0 && height > 0) {
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }
}

// 创建粒子系统 - 确保可见
function initParticles() {
    if (particleSystem) {
        scene.remove(particleSystem);
    }
    
    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // 初始化粒子数据
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // 随机位置 - 确保在视野内
        positions[i3] = (Math.random() - 0.5) * 30;      // X: -15 到 15
        positions[i3 + 1] = (Math.random() - 0.5) * 20;  // Y: -10 到 10
        positions[i3 + 2] = (Math.random() - 0.5) * 30;  // Z: -15 到 15
        
        // 随机颜色
        const r = Math.random();
        if (r < 0.4) {
            // 金色
            colors[i3] = 1.0;
            colors[i3 + 1] = 0.8 + Math.random() * 0.2;
            colors[i3 + 2] = 0.2;
        } else if (r < 0.7) {
            // 粉色
            colors[i3] = 1.0;
            colors[i3 + 1] = 0.3 + Math.random() * 0.3;
            colors[i3 + 2] = 0.6 + Math.random() * 0.3;
        } else {
            // 白色
            colors[i3] = 1.0;
            colors[i3 + 1] = 1.0;
            colors[i3 + 2] = 1.0;
        }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // 使用PointsMaterial确保兼容性
    const material = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
    });
    
    // 创建粒子系统
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    
    console.log('✅ 粒子系统创建完成，粒子数量:', particleCount);
}

// 设置场景效果
function setupSceneEffects() {
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // 添加主光源
    const mainLight = new THREE.DirectionalLight(0xffccff, 0.8);
    mainLight.position.set(10, 20, 10);
    scene.add(mainLight);
    
    // 添加彩色点光源
    const pointLight1 = new THREE.PointLight(0xff6b9d, 0.5, 50);
    pointLight1.position.set(15, 10, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x4dffea, 0.5, 50);
    pointLight2.position.set(-15, 10, -5);
    scene.add(pointLight2);
    
    // 添加雾效
    scene.fog = new THREE.Fog(0x0a0a1a, 5, 50);
    
    console.log('✅ 场景效果设置完成');
}

// 手势检测回调
function onGestureDetected(gesture) {
    console.log(`🎯 检测到手势: ${gesture}`);
    
    switch (gesture) {
        case 'open':
            if (isTreeMode) {
                toggleTreeMode();
            }
            break;
            
        case 'fist':
            if (!isTreeMode) {
                toggleTreeMode();
            }
            break;
            
        case 'pinch':
            adjustParticleSize();
            break;
    }
}

// 切换圣诞树模式
function toggleTreeMode() {
    if (!isInitialized || !particleSystem) {
        console.warn('系统未初始化，无法切换模式');
        return;
    }
    
    isTreeMode = !isTreeMode;
    
    if (isTreeMode) {
        console.log('🎄 切换到圣诞树模式');
        transitionToTree();
        if (window.updateStatus) {
            window.updateStatus('🎄 正在形成圣诞树...', 'success');
        }
    } else {
        console.log('✨ 切换到漂浮模式');
        transitionToFloat();
        if (window.updateStatus) {
            window.updateStatus('✨ 返回粒子漂浮模式', 'info');
        }
    }
}

// 过渡到圣诞树模式
function transitionToTree() {
    const positions = particleSystem.geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        const index = i / 3;
        const progress = 1.0 + Math.random() * 1.0; // 1-2秒
        
        // 计算圣诞树形状
        const layer = Math.floor(index / (particleCount / 6)); // 6层
        const layerHeight = layer * 2.5;
        const radius = (6 - layer) * 1.5;
        const angle = (index * 137.5) * Math.PI / 180;
        
        const targetX = Math.cos(angle) * radius * (0.7 + Math.random() * 0.6);
        const targetY = layerHeight + (Math.random() - 0.5) * 2;
        const targetZ = Math.sin(angle) * radius * (0.7 + Math.random() * 0.6);
        
        // 使用setTimeout实现简单动画
        setTimeout(() => {
            positions[i] = targetX;
            positions[i + 1] = targetY;
            positions[i + 2] = targetZ;
            particleSystem.geometry.attributes.position.needsUpdate = true;
        }, progress * 1000 * Math.random());
    }
    
    // 改变颜色
    const colors = particleSystem.geometry.attributes.color.array;
    for (let i = 0; i < colors.length; i += 3) {
        colors[i] = 1.0; // R
        colors[i + 1] = 0.4 + Math.random() * 0.3; // G
        colors[i + 2] = 0.6 + Math.random() * 0.3; // B
    }
    particleSystem.geometry.attributes.color.needsUpdate = true;
}

// 过渡到漂浮模式
function transitionToFloat() {
    const positions = particleSystem.geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        const progress = 0.5 + Math.random() * 1.0; // 0.5-1.5秒
        
        // 随机目标位置
        const targetX = (Math.random() - 0.5) * 30;
        const targetY = (Math.random() - 0.5) * 20;
        const targetZ = (Math.random() - 0.5) * 30;
        
        // 使用setTimeout实现简单动画
        setTimeout(() => {
            positions[i] = targetX;
            positions[i + 1] = targetY;
            positions[i + 2] = targetZ;
            particleSystem.geometry.attributes.position.needsUpdate = true;
        }, progress * 1000 * Math.random());
    }
    
    // 恢复随机颜色
    const colors = particleSystem.geometry.attributes.color.array;
    for (let i = 0; i < colors.length; i += 3) {
        const r = Math.random();
        if (r < 0.4) {
            colors[i] = 1.0;
            colors[i + 1] = 0.8 + Math.random() * 0.2;
            colors[i + 2] = 0.2;
        } else if (r < 0.7) {
            colors[i] = 1.0;
            colors[i + 1] = 0.3 + Math.random() * 0.3;
            colors[i + 2] = 0.6 + Math.random() * 0.3;
        } else {
            colors[i] = 1.0;
            colors[i + 1] = 1.0;
            colors[i + 2] = 1.0;
        }
    }
    particleSystem.geometry.attributes.color.needsUpdate = true;
}

// 调整粒子大小
function adjustParticleSize() {
    if (!particleSystem) return;
    
    const currentSize = particleSystem.material.size;
    const newSize = isTreeMode ? 
        (currentSize === 0.3 ? 0.15 : 0.3) : 
        (currentSize === 0.2 ? 0.1 : 0.2);
    
    particleSystem.material.size = newSize;
    particleSystem.material.needsUpdate = true;
    
    console.log(`🔍 调整粒子大小: ${newSize}`);
    
    if (window.updateStatus) {
        window.updateStatus(`粒子大小: ${newSize.toFixed(2)}`, 'info');
    }
}

// 动画循环 - 简化版
function animate() {
    if (!isInitialized) {
        requestAnimationFrame(animate);
        return;
    }
    
    const time = clock.getElapsedTime();
    
    // 粒子动画（仅漂浮模式）
    if (particleSystem && !isTreeMode) {
        const positions = particleSystem.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // 添加轻微的漂浮运动
            positions[i] += Math.sin(time * 0.5 + i * 0.01) * 0.01;
            positions[i + 1] += Math.cos(time * 0.7 + i * 0.01) * 0.01;
            positions[i + 2] += Math.sin(time * 0.3 + i * 0.01) * 0.01;
            
            // 边界检查
            if (Math.abs(positions[i]) > 20) positions[i] *= 0.95;
            if (Math.abs(positions[i + 1]) > 15) positions[i + 1] *= 0.95;
            if (Math.abs(positions[i + 2]) > 20) positions[i + 2] *= 0.95;
        }
        
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    // 缓慢旋转相机
    camera.position.x = Math.sin(time * 0.1) * 20;
    camera.position.z = Math.cos(time * 0.1) * 20;
    camera.lookAt(0, 5, 0);
    
    // 渲染
    renderer.render(scene, camera);
    
    // 继续动画循环
    requestAnimationFrame(animate);
}

// 窗口大小调整
window.addEventListener('resize', () => {
    updateRendererSize();
});

// 页面加载完成后启动
window.addEventListener('DOMContentLoaded', () => {
    console.log('📱 页面加载完成，开始初始化...');
    
    // 延迟启动，确保Three.js库已加载
    setTimeout(() => {
        if (typeof THREE === 'undefined') {
            console.error('❌ Three.js库未加载！');
            updateLoadingText('错误：Three.js库加载失败', true);
            return;
        }
        
        console.log('✅ Three.js库已加载，版本:', THREE.REVISION);
        init();
    }, 1000);
});

// 调试：检查Three.js状态
function checkThreeJSStatus() {
    console.log('🔍 Three.js状态检查:');
    console.log('- THREE 对象:', typeof THREE);
    console.log('- 场景:', scene ? '已创建' : '未创建');
    console.log('- 相机:', camera ? '已创建' : '未创建');
    console.log('- 渲染器:', renderer ? '已创建' : '未创建');
    console.log('- 粒子系统:', particleSystem ? '已创建' : '未创建');
    console.log('- 初始化状态:', isInitialized ? '完成' : '未完成');
}

// 导出调试函数
window.checkThreeJSStatus = checkThreeJSStatus;
console.log('🚀 手势梦幻圣诞树脚本加载完成');
