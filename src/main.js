// 手势梦幻圣诞树 - 主程序
console.log('🎄 手势梦幻圣诞树 v2.0 正在启动...');

// 全局变量
let scene, camera, renderer;
let particles = [];
let particleSystem;
let isTreeMode = false;
let particleCount = 1500; // 减少粒子数量提高性能
let clock = new THREE.Clock();

// 初始化函数
async function init() {
    try {
        console.log('1. 初始化Three.js场景...');
        await initThreeJS();
        
        console.log('2. 创建粒子系统...');
        initParticles();
        
        console.log('3. 设置场景效果...');
        setupSceneEffects();
        
        console.log('4. 开始动画循环...');
        animate();
        
        console.log('✅ 系统初始化完成！');
        
        // 导出给UI控制
        window.app = {
            toggleTreeMode,
            onGestureDetected,
            scene,
            camera,
            particleSystem
        };
        
    } catch (error) {
        console.error('初始化失败:', error);
        document.getElementById('loading-hint').textContent = `错误: ${error.message}`;
        document.getElementById('loading-hint').style.color = '#ff4444';
    }
}

// 初始化Three.js
function initThreeJS() {
    return new Promise((resolve) => {
        // 更新加载提示
        document.getElementById('loading-hint').textContent = '正在创建3D场景...';
        
        // 创建场景
        scene = new THREE.Scene();
        
        // 创建相机
        camera = new THREE.PerspectiveCamera(
            60, // 更广的视角
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.set(0, 5, 20);
        
        // 创建渲染器
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // 添加到DOM
        const container = document.querySelector('.canvas-wrapper');
        container.appendChild(renderer.domElement);
        
        // 添加样式到canvas
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        
        resolve();
    });
}

// 创建粒子系统
function initParticles() {
    document.getElementById('loading-hint').textContent = '正在创建魔法粒子...';
    
    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // 初始化粒子数据
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // 随机初始位置
        positions[i3] = (Math.random() - 0.5) * 40;
        positions[i3 + 1] = (Math.random() - 0.5) * 30;
        positions[i3 + 2] = (Math.random() - 0.5) * 40;
        
        // 随机颜色 - 圣诞主题
        const colorType = Math.random();
        if (colorType < 0.4) {
            // 金色粒子
            colors[i3] = 1.0;     // R
            colors[i3 + 1] = 0.85; // G
            colors[i3 + 2] = 0.1;  // B
        } else if (colorType < 0.7) {
            // 粉色粒子
            colors[i3] = 1.0;     // R
            colors[i3 + 1] = 0.4;  // G
            colors[i3 + 2] = 0.7;  // B
        } else {
            // 白色/银色粒子
            colors[i3] = 1.0;     // R
            colors[i3 + 1] = 1.0;  // G
            colors[i3 + 2] = 1.0;  // B
        }
        
        // 随机大小
        sizes[i] = Math.random() * 0.15 + 0.05;
    }
    
    // 设置几何体属性
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // 创建自定义着色器材质
    const vertexShader = `
        attribute float size;
        varying vec3 vColor;
        
        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;
    
    const fragmentShader = `
        varying vec3 vColor;
        
        void main() {
            // 创建圆形粒子
            float distanceToCenter = distance(gl_PointCoord, vec2(0.5, 0.5));
            if (distanceToCenter > 0.5) {
                discard;
            }
            
            // 添加光晕效果
            float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
            alpha *= 0.8;
            
            gl_FragColor = vec4(vColor, alpha);
        }
    `;
    
    const material = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    // 创建粒子系统
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    
    document.getElementById('loading-hint').textContent = '粒子系统创建完成！';
}

// 设置场景效果
function setupSceneEffects() {
    document.getElementById('loading-hint').textContent = '正在添加魔法效果...';
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // 添加主光源（粉色调）
    const mainLight = new THREE.DirectionalLight(0xffccff, 0.8);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    scene.add(mainLight);
    
    // 添加彩色点光源
    const colors = [0xff6b9d, 0x4dffea, 0xffcc00, 0x9d4dff];
    colors.forEach((color, i) => {
        const pointLight = new THREE.PointLight(color, 0.5, 50);
        const angle = (i / colors.length) * Math.PI * 2;
        pointLight.position.set(
            Math.cos(angle) * 15,
            Math.random() * 10 + 5,
            Math.sin(angle) * 15
        );
        scene.add(pointLight);
    });
    
    // 添加雾效
    scene.fog = new THREE.Fog(0x0a0a1a, 10, 60);
    
    document.getElementById('loading-hint').textContent = '场景效果设置完成！';
}

// 手势检测回调
function onGestureDetected(gesture) {
    console.log(`检测到手势: ${gesture}`);
    
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
    isTreeMode = !isTreeMode;
    
    if (isTreeMode) {
        transitionToTree();
        updateUIStatus('🎄 正在形成圣诞树...', 'success');
    } else {
        transitionToFloat();
        updateUIStatus('✨ 返回粒子漂浮模式', 'info');
    }
}

// 过渡到圣诞树模式
function transitionToTree() {
    const positions = particleSystem.geometry.attributes.position.array;
    const colors = particleSystem.geometry.attributes.color.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        const index = i / 3;
        const progress = gsap.utils.random(0.8, 2.5);
        
        // 计算圣诞树形状的目标位置
        const layer = Math.floor(index / (particleCount / 8)); // 分成8层
        const layerHeight = layer * 3;
        const radius = (8 - layer) * 0.8;
        const angle = (index * 137.5) * Math.PI / 180; // 黄金角度
        
        const targetX = Math.cos(angle) * radius * (0.8 + Math.random() * 0.4);
        const targetY = layerHeight + (Math.random() - 0.5) * 1.5;
        const targetZ = Math.sin(angle) * radius * (0.8 + Math.random() * 0.4);
        
        // 动画到目标位置
        gsap.to(positions, {
            duration: progress,
            [i]: targetX,
            [i + 1]: targetY,
            [i + 2]: targetZ,
            ease: "power2.out",
            onUpdate: () => {
                particleSystem.geometry.attributes.position.needsUpdate = true;
            }
        });
        
        // 改变颜色为粉色系
        gsap.to(colors, {
            duration: progress * 0.8,
            [i]: 1.0, // R
            [i + 1]: () => gsap.utils.random(0.3, 0.6), // G
            [i + 2]: () => gsap.utils.random(0.5, 0.9), // B
            ease: "power2.inOut",
            onUpdate: () => {
                particleSystem.geometry.attributes.color.needsUpdate = true;
            }
        });
    }
}

// 过渡到漂浮模式
function transitionToFloat() {
    const positions = particleSystem.geometry.attributes.position.array;
    const colors = particleSystem.geometry.attributes.color.array;
    
    for (let i = 0; i < positions.length; i += 3) {
        const progress = gsap.utils.random(0.5, 2);
        
        // 随机目标位置
        const targetX = (Math.random() - 0.5) * 40;
        const targetY = (Math.random() - 0.5) * 30;
        const targetZ = (Math.random() - 0.5) * 40;
        
        gsap.to(positions, {
            duration: progress,
            [i]: targetX,
            [i + 1]: targetY,
            [i + 2]: targetZ,
            ease: "power2.out",
            onUpdate: () => {
                particleSystem.geometry.attributes.position.needsUpdate = true;
            }
        });
        
        // 恢复原色
        const colorType = Math.random();
        let targetR, targetG, targetB;
        
        if (colorType < 0.4) {
            // 金色
            targetR = 1.0; targetG = 0.85; targetB = 0.1;
        } else if (colorType < 0.7) {
            // 粉色
            targetR = 1.0; targetG = 0.4; targetB = 0.7;
        } else {
            // 白色
            targetR = 1.0; targetG = 1.0; targetB = 1.0;
        }
        
        gsap.to(colors, {
            duration: progress * 0.8,
            [i]: targetR,
            [i + 1]: targetG,
            [i + 2]: targetB,
            ease: "power2.inOut",
            onUpdate: () => {
                particleSystem.geometry.attributes.color.needsUpdate = true;
            }
        });
    }
}

// 调整粒子大小
function adjustParticleSize() {
    const sizes = particleSystem.geometry.attributes.size.array;
    
    for (let i = 0; i < sizes.length; i++) {
        const targetSize = isTreeMode ? 
            gsap.utils.random(0.08, 0.2) : 
            gsap.utils.random(0.05, 0.15);
        
        gsap.to(sizes, {
            duration: 0.5,
            [i]: targetSize,
            ease: "power2.inOut",
            onUpdate: () => {
                particleSystem.geometry.attributes.size.needsUpdate = true;
            }
        });
    }
    
    updateUIStatus('🔍 调整粒子大小...', 'info');
}

// 更新UI状态
function updateUIStatus(message, type = 'info') {
    if (window.updateStatus) {
        window.updateStatus(message, type);
    }
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    const time = clock.getElapsedTime();
    
    // 粒子动画
    if (particleSystem) {
        const positions = particleSystem.geometry.attributes.position.array;
        
        if (!isTreeMode) {
            // 漂浮模式的粒子运动
            for (let i = 0; i < positions.length; i += 3) {
                // 添加轻微的漂浮运动
                positions[i] += Math.sin(time * 0.5 + i * 0.01) * 0.02;
                positions[i + 1] += Math.cos(time * 0.7 + i * 0.01) * 0.02;
                positions[i + 2] += Math.sin(time * 0.3 + i * 0.01) * 0.02;
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
        } else {
            // 圣诞树模式的轻微脉动
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(time * 2 + i * 0.1) * 0.01;
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
        }
    }
    
    // 缓慢旋转相机
    camera.position.x = Math.sin(time * 0.1) * 20;
    camera.position.z = Math.cos(time * 0.1) * 20;
    camera.lookAt(0, 5, 0);
    
    // 渲染场景
    renderer.render(scene, camera);
}

// 窗口大小调整
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 防止右键菜单
renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

// 页面加载完成后启动
window.addEventListener('DOMContentLoaded', () => {
    // 延迟启动，确保UI先加载
    setTimeout(() => {
        init();
    }, 100);
});

console.log('🚀 手势梦幻圣诞树UI优化版已加载！');
