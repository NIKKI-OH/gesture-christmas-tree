// 手势圣诞树 - 主程序
console.log('🎄 手势圣诞树 v1.0 正在启动...');

// 全局变量
let scene, camera, renderer;
let particles = [];
let particleSystem;
let isTreeMode = false;
let handDetected = false;
let cameraStream = null;

// DOM元素
const loading = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');
const statusDiv = document.getElementById('status');
const cameraVideo = document.getElementById('camera-video');
const cameraFeed = document.querySelector('.camera-feed');

// 初始化函数
async function init() {
    try {
        // 步骤1: 初始化Three.js场景
        await initThreeJS();
        
        // 步骤2: 请求摄像头权限
        await initCamera();
        
        // 步骤3: 初始化粒子系统
        initParticles();
        
        // 步骤4: 开始动画循环
        animate();
        
        // 步骤5: 隐藏加载界面
        setTimeout(() => {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
                updateStatus('✅ 系统就绪！用手势控制吧！', 'success');
            }, 1000);
        }, 2000);
        
    } catch (error) {
        console.error('初始化失败:', error);
        loadingText.innerHTML = '❌ 初始化失败<br>' + error.message;
        loadingText.style.color = '#ff4444';
    }
}

// 初始化Three.js
function initThreeJS() {
    return new Promise((resolve) => {
        loadingText.textContent = '正在创建3D场景...';
        
        // 创建场景
        scene = new THREE.Scene();
        
        // 创建相机
        camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        camera.position.z = 15;
        camera.position.y = 5;
        
        // 创建渲染器
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        
        // 添加到DOM
        const container = document.getElementById('canvas-container');
        container.appendChild(renderer.domElement);
        
        // 添加环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        // 添加主光源
        const mainLight = new THREE.DirectionalLight(0xffccff, 0.8);
        mainLight.position.set(10, 20, 10);
        scene.add(mainLight);
        
        // 添加雾效
        scene.fog = new THREE.Fog(0x000022, 5, 50);
        
        loadingText.textContent = '3D场景创建完成！';
        resolve();
    });
}

// 初始化摄像头
async function initCamera() {
    loadingText.textContent = '正在请求摄像头权限...';
    
    try {
        // 请求摄像头访问
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            }
        });
        
        // 显示摄像头画面
        cameraVideo.srcObject = cameraStream;
        cameraFeed.style.display = 'block';
        
        // 模拟手势检测（后续会替换为MediaPipe）
        simulateHandDetection();
        
        loadingText.textContent = '摄像头就绪！开始检测手势...';
        updateStatus('📷 摄像头已开启', 'info');
        
    } catch (error) {
        console.warn('摄像头访问失败，将使用模拟模式:', error);
        loadingText.textContent = '⚠️ 摄像头未启用，使用模拟手势';
        simulateHandDetection();
    }
}

// 初始化粒子系统
function initParticles() {
    loadingText.textContent = '正在创建粒子系统...';
    
    // 粒子数量
    const particleCount = 2000;
    
    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // 创建粒子材质
    const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    // 初始化粒子位置和颜色
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // 随机位置
        positions[i3] = (Math.random() - 0.5) * 30;
        positions[i3 + 1] = (Math.random() - 0.5) * 20;
        positions[i3 + 2] = (Math.random() - 0.5) * 30;
        
        // 颜色 - 金色和粉色渐变
        const isGold = Math.random() > 0.5;
        if (isGold) {
            // 金色粒子
            colors[i3] = 1.0;     // R
            colors[i3 + 1] = 0.8; // G
            colors[i3 + 2] = 0.2; // B
        } else {
            // 粉色粒子
            colors[i3] = 1.0;     // R
            colors[i3 + 1] = 0.4; // G
            colors[i3 + 2] = 0.7; // B
        }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // 创建粒子系统
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    
    loadingText.textContent = '粒子系统创建完成！';
}

// 模拟手势检测（后续会替换为MediaPipe）
function simulateHandDetection() {
    let currentGesture = 'open';
    
    // 每隔3秒随机切换手势（模拟）
    setInterval(() => {
        const gestures = ['open', 'fist', 'pinch'];
        const newGesture = gestures[Math.floor(Math.random() * gestures.length)];
        
        if (newGesture !== currentGesture) {
            currentGesture = newGesture;
            onGestureDetected(newGesture);
        }
    }, 3000);
    
    // 键盘控制（用于测试）
    document.addEventListener('keydown', (e) => {
        if (e.key === '1') onGestureDetected('open');
        if (e.key === '2') onGestureDetected('fist');
        if (e.key === '3') onGestureDetected('pinch');
        if (e.key === ' ') toggleTreeMode();
    });
}

// 手势检测回调
function onGestureDetected(gesture) {
    handDetected = true;
    
    switch (gesture) {
        case 'open':
            updateStatus('🖐️ 检测到：张开手掌 - 粒子漂浮', 'info');
            if (isTreeMode) {
                toggleTreeMode();
            }
            break;
            
        case 'fist':
            updateStatus('✊ 检测到：握拳 - 正在形成圣诞树', 'success');
            if (!isTreeMode) {
                toggleTreeMode();
            }
            break;
            
        case 'pinch':
            updateStatus('🤏 检测到：捏合 - 调整大小', 'warning');
            adjustParticleSize();
            break;
    }
}

// 切换圣诞树模式
function toggleTreeMode() {
    isTreeMode = !isTreeMode;
    
    if (isTreeMode) {
        // 切换到圣诞树模式
        transitionToTree();
        updateStatus('🎄 正在形成圣诞树...', 'success');
    } else {
        // 切换到漂浮模式
        transitionToFloat();
        updateStatus('✨ 返回粒子漂浮模式', 'info');
    }
}

// 过渡到圣诞树模式
function transitionToTree() {
    const positions = particleSystem.geometry.attributes.position.array;
    
    // 创建圣诞树形状的粒子位置
    for (let i = 0; i < positions.length; i += 3) {
        // 将粒子移动到圣诞树形状
        const progress = gsap.utils.random(0.5, 2); // 随机过渡时间
        
        gsap.to(positions, {
            duration: progress,
            [i]: () => {
                // 树形：圆锥分布
                const radius = Math.random() * 3;
                const angle = Math.random() * Math.PI * 2;
                return Math.cos(angle) * radius;
            },
            [i + 1]: () => {
                // 高度：从底部到顶部
                const height = Math.random() * 8 + 2;
                return height;
            },
            [i + 2]: () => {
                const radius = Math.random() * 3;
                const angle = Math.random() * Math.PI * 2;
                return Math.sin(angle) * radius;
            },
            ease: "power2.out",
            onUpdate: () => {
                particleSystem.geometry.attributes.position.needsUpdate = true;
            }
        });
    }
    
    // 改变粒子颜色为粉色系
    const colors = particleSystem.geometry.attributes.color.array;
    gsap.to(colors, {
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
            for (let i = 0; i < colors.length; i += 3) {
                // 渐变到粉色
                colors[i] = 1.0;      // R: 保持最高
                colors[i + 1] = 0.4;  // G: 降低
                colors[i + 2] = 0.7;  // B: 增加
            }
            particleSystem.geometry.attributes.color.needsUpdate = true;
        }
    });
}

// 过渡到漂浮模式
function transitionToFloat() {
    const positions = particleSystem.geometry.attributes.position.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        const progress = gsap.utils.random(0.5, 2);
        
        gsap.to(positions, {
            duration: progress,
            [i]: () => (Math.random() - 0.5) * 30,
            [i + 1]: () => (Math.random() - 0.5) * 20,
            [i + 2]: () => (Math.random() - 0.5) * 30,
            ease: "power2.out",
            onUpdate: () => {
                particleSystem.geometry.attributes.position.needsUpdate = true;
            }
        });
    }
    
    // 恢复原色
    const colors = particleSystem.geometry.attributes.color.array;
    gsap.to(colors, {
        duration: 1.5,
        ease: "power2.inOut",
        onUpdate: () => {
            for (let i = 0; i < colors.length; i += 3) {
                const isGold = Math.random() > 0.5;
                if (isGold) {
                    colors[i] = 1.0;
                    colors[i + 1] = 0.8;
                    colors[i + 2] = 0.2;
                } else {
                    colors[i] = 1.0;
                    colors[i + 1] = 0.4;
                    colors[i + 2] = 0.7;
                }
            }
            particleSystem.geometry.attributes.color.needsUpdate = true;
        }
    });
}

// 调整粒子大小
function adjustParticleSize() {
    const targetSize = isTreeMode ? 0.15 : 0.1;
    gsap.to(particleSystem.material, {
        duration: 0.5,
        size: targetSize,
        ease: "power2.inOut"
    });
}

// 更新状态显示
function updateStatus(message, type = 'info') {
    statusDiv.textContent = message;
    statusDiv.style.display = 'block';
    statusDiv.style.background = type === 'success' ? 'rgba(0, 200, 0, 0.8)' :
                               type === 'warning' ? 'rgba(255, 165, 0, 0.8)' :
                               'rgba(0, 0, 0, 0.8)';
    
    // 3秒后隐藏
    clearTimeout(window.statusTimeout);
    window.statusTimeout = setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    // 粒子动画
    if (particleSystem && !isTreeMode) {
        const positions = particleSystem.geometry.attributes.position.array;
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < positions.length; i += 3) {
            // 漂浮动画
            positions[i] += Math.sin(time + i) * 0.005;
            positions[i + 1] += Math.cos(time * 0.7 + i) * 0.005;
            positions[i + 2] += Math.sin(time * 1.3 + i) * 0.005;
        }
        
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    // 旋转相机（缓慢）
    camera.position.x = Math.sin(Date.now() * 0.0005) * 15;
    camera.position.z = Math.cos(Date.now() * 0.0005) * 15;
    camera.lookAt(0, 0, 0);
    
    // 渲染
    renderer.render(scene, camera);
}

// 窗口大小调整
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 启动应用
init();

// 导出给调试使用
window.app = {
    toggleTreeMode,
    onGestureDetected,
    scene,
    camera,
    particleSystem
};

console.log('🚀 手势圣诞树启动完成！');
