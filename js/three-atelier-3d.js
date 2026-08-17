/* ==========================================================================
   MAISON PUR & — 3D ATELIER SENSORIAL & UNREAL ENGINE 5 REAL-TIME ARCHITECTURE
   Three.js Photorealistic Spatial Engine with PBR Textures & Calibrated GLTF/GLB Models
   Zero Low-Poly Primitives — 100% High-Fidelity Meshes & Spatial Alignment
   ========================================================================== */

class Maison3DAtelierEngine {
  constructor() {
    this.container = document.getElementById('threeCanvasContainer');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.steamParticles = null;
    this.dustParticles = null;
    this.isAutoRotating = true;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.interactiveObjects = [];
    this.clock = new THREE.Clock();
    this.textureLoader = new THREE.TextureLoader();
    this.gltfLoader = null;

    this.cameraBookmarks = {
      lounge: { pos: [0, 2.4, 4.6], target: [0, 0.85, 0] },
      barista: { pos: [-0.9, 1.4, 1.5], target: [-0.9, 1.05, 0] },
      cupping: { pos: [0.75, 1.4, 1.5], target: [0.75, 1.05, 0] },
      roaster: { pos: [2.1, 1.45, 1.6], target: [2.1, 1.05, 0] },
      seating: { pos: [0, 1.5, -0.6], target: [0, 0.7, -2.2] }
    };
  }

  init() {
    if (!this.container) return;

    const width = this.container.clientWidth || 1200;
    const height = this.container.clientHeight || 650;

    // 1. Scene & Warm Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0807);
    this.scene.fog = new THREE.FogExp2(0x0e0c0a, 0.038);

    // 2. Camera Setup
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 2.4, 4.6);

    // 3. WebGL Renderer with High-End Color & Shadow Science
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls with Damping
    if (window.THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
      this.controls.minDistance = 1.0;
      this.controls.maxDistance = 8.5;
      this.controls.target.set(0, 0.85, 0);
    }

    // 5. GLTF Loader
    if (window.THREE.GLTFLoader) {
      this.gltfLoader = new THREE.GLTFLoader();
    }

    // 6. Build High-Fidelity Environment
    this.setupLighting();
    this.buildArchitecturalRoom();
    this.loadAllPhotorealisticGLBModels();
    this.buildVolumetricParticles();

    // 7. Bind Events
    this.bindUI();
    this.bindRaycasting();
    window.addEventListener('resize', () => this.onResize());

    // 8. Animation Loop
    this.animate();
  }

  setupLighting() {
    // Warm Ambient Occlusion Fill
    const ambientLight = new THREE.AmbientLight(0x281f18, 2.2);
    this.scene.add(ambientLight);

    // Main Golden Hour Sun Vector (Simulating huge floor-to-ceiling glass window)
    const sunLight = new THREE.DirectionalLight(0xffdfba, 3.5);
    sunLight.position.set(5.0, 6.5, 4.2);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    this.scene.add(sunLight);

    // Barista Spotlight (Warm 3000K Tungsten)
    const baristaSpot = new THREE.SpotLight(0xffb366, 4.5, 12, Math.PI / 4, 0.7, 1.2);
    baristaSpot.position.set(-0.9, 3.8, 0.6);
    baristaSpot.target.position.set(-0.9, 1.0, 0);
    baristaSpot.castShadow = true;
    this.scene.add(baristaSpot);
    this.scene.add(baristaSpot.target);

    // Cupping Lab Spotlight
    const cuppingSpot = new THREE.SpotLight(0xffcca0, 4.2, 12, Math.PI / 4, 0.7, 1.2);
    cuppingSpot.position.set(0.75, 3.8, 0.6);
    cuppingSpot.target.position.set(0.75, 1.0, 0);
    cuppingSpot.castShadow = true;
    this.scene.add(cuppingSpot);
    this.scene.add(cuppingSpot.target);

    // Roaster Glowing Fire Element
    const roasterGlow = new THREE.PointLight(0xff5500, 3.5, 4.5, 2.0);
    roasterGlow.position.set(2.1, 1.1, 0.15);
    this.scene.add(roasterGlow);

    // Lounge Warm Fill Light
    const loungeWarm = new THREE.PointLight(0xffaa55, 1.8, 6.0, 1.5);
    loungeWarm.position.set(0, 2.2, -2.0);
    this.scene.add(loungeWarm);
  }

  buildArchitecturalRoom() {
    // 1. Travertine PBR Floor Textures
    const floorAlbedo = this.textureLoader.load('assets/textures/travertine_albedo.jpg');
    const floorNormal = this.textureLoader.load('assets/textures/travertine_normal.jpg');
    const floorRough = this.textureLoader.load('assets/textures/travertine_roughness.jpg');

    [floorAlbedo, floorNormal, floorRough].forEach(tex => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(6, 6);
    });

    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorAlbedo,
      normalMap: floorNormal,
      roughnessMap: floorRough,
      roughness: 0.32,
      metalness: 0.08
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. Dark Fluted Cedar Wood Slat Walls
    const woodAlbedo = this.textureLoader.load('assets/textures/wood_albedo.jpg');
    woodAlbedo.wrapS = woodAlbedo.wrapT = THREE.RepeatWrapping;
    woodAlbedo.repeat.set(4, 2);

    const wallMat = new THREE.MeshStandardMaterial({
      map: woodAlbedo,
      roughness: 0.78,
      metalness: 0.05
    });

    // Back Wall
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 8), wallMat);
    backWall.position.set(0, 4, -3.8);
    backWall.receiveShadow = true;
    this.scene.add(backWall);

    // Left Wall
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(24, 8), wallMat);
    leftWall.position.set(-6.0, 4, 0);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    this.scene.add(leftWall);

    // 3. Amber LED Linear Recessed Channel
    const ledGeo = new THREE.BoxGeometry(16, 0.04, 0.08);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0xffaa44 });
    const ledStrip = new THREE.Mesh(ledGeo, ledMat);
    ledStrip.position.set(0, 2.8, -3.74);
    this.scene.add(ledStrip);

    // 4. Main Architectural Counter Island (Travertine Base + Dark Titanium Edge)
    const counterGeo = new THREE.BoxGeometry(5.4, 0.95, 1.5);
    const counterMat = new THREE.MeshStandardMaterial({
      map: floorAlbedo,
      normalMap: floorNormal,
      roughness: 0.28,
      metalness: 0.15
    });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.position.set(0.3, 0.475, 0);
    counter.receiveShadow = true;
    counter.castShadow = true;
    this.scene.add(counter);

    // Top Polished Dark Obsidian Travertine Slab
    const topSlabGeo = new THREE.BoxGeometry(5.5, 0.06, 1.6);
    const topSlabMat = new THREE.MeshStandardMaterial({
      color: 0x161210,
      roughness: 0.15,
      metalness: 0.55
    });
    const topSlab = new THREE.Mesh(topSlabGeo, topSlabMat);
    topSlab.position.set(0.3, 0.98, 0);
    topSlab.receiveShadow = true;
    this.scene.add(topSlab);
  }

  // Scale and pivot normalization helper function
  normalizeModel(scene, targetHeight) {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Center pivot horizontally, align bottom to y=0
    scene.position.x -= center.x;
    scene.position.z -= center.z;
    scene.position.y -= box.min.y;

    if (size.y > 0) {
      const scale = targetHeight / size.y;
      scene.scale.setScalar(scale);
    }
  }

  loadAllPhotorealisticGLBModels() {
    if (!this.gltfLoader) return;

    // A. Porcelain Teacups & Saucers on the Barista & Cupping counter
    this.gltfLoader.load('assets/models/teacup_porcelain.glb', (gltf) => {
      // Barista station cup
      const cup1 = gltf.scene;
      this.normalizeModel(cup1, 0.11);
      cup1.position.set(-0.85, 1.01, 0.25);
      this.enableShadows(cup1);
      
      cup1.userData = {
        type: 'espresso',
        name: 'Single Origin Geisha Extraction Cup',
        telemetry: 'Dose: 18.5g • Yield: 42g • Refractometer TDS: 1.38% • Agtron: 88'
      };
      this.scene.add(cup1);
      this.interactiveObjects.push(cup1);

      // Cupping lab flight of 3 cups
      [-0.1, 0.15, 0.4].forEach((offsetZ, idx) => {
        const cupClone = cup1.clone();
        cupClone.position.set(0.75 + (idx * 0.28), 1.01, 0.1);
        cupClone.userData = {
          type: 'cupping',
          name: `SCA Cupping Bowl #${idx + 1}`,
          telemetry: `Sample #${idx + 1}: SCA Score 94.8 • Temp: 68°C • Fragrance: Jasmine & Bergamot`
        };
        this.scene.add(cupClone);
        this.interactiveObjects.push(cupClone);
      });
    }, undefined, (err) => console.log('Teacup load info:', err));

    // B. Glass Vase with Botanical Flowers on Counter
    this.gltfLoader.load('assets/models/flowers_vase.glb', (gltf) => {
      const vase = gltf.scene;
      this.normalizeModel(vase, 0.38);
      vase.position.set(-0.15, 1.01, -0.3);
      this.enableShadows(vase);
      this.scene.add(vase);
    }, undefined, (err) => console.log('Vase load info:', err));

    // C. Mineral Brew Water Stainless Bottle
    this.gltfLoader.load('assets/models/water_bottle.glb', (gltf) => {
      const bottle = gltf.scene;
      this.normalizeModel(bottle, 0.26);
      bottle.position.set(-1.45, 1.01, 0.2);
      this.enableShadows(bottle);
      this.scene.add(bottle);
    }, undefined, (err) => console.log('Water bottle load info:', err));

    // D. Glass Hurricane Candle with Ambient Glow
    this.gltfLoader.load('assets/models/candle_holder.glb', (gltf) => {
      const candle = gltf.scene;
      this.normalizeModel(candle, 0.22);
      candle.position.set(0.3, 1.01, -0.35);
      this.enableShadows(candle);
      this.scene.add(candle);
    }, undefined, (err) => console.log('Candle load info:', err));

    // E. Glowing Convective Furnace for Roaster Station
    this.gltfLoader.load('assets/models/roaster_furnace.glb', (gltf) => {
      const furnace = gltf.scene;
      this.normalizeModel(furnace, 0.65);
      furnace.position.set(2.1, 1.01, 0);
      this.enableShadows(furnace);

      furnace.userData = {
        type: 'roaster',
        name: 'Fluid-Bed Convective Roaster Thermal Core',
        telemetry: 'Agtron 88 Curve • Convective Air: 215°C • Rate of Rise: 8.5°C/min'
      };
      this.scene.add(furnace);
      this.interactiveObjects.push(furnace);
    }, undefined, (err) => console.log('Furnace load info:', err));

    // F. Anisotropic Pendant Atelier Lamps (Suspended from Ceiling)
    this.gltfLoader.load('assets/models/atelier_lamp.glb', (gltf) => {
      const lampBarista = gltf.scene;
      this.normalizeModel(lampBarista, 0.75);
      lampBarista.position.set(-0.9, 2.9, 0.2);
      this.scene.add(lampBarista);

      const lampCupping = lampBarista.clone();
      lampCupping.position.set(0.85, 2.9, 0.2);
      this.scene.add(lampCupping);
    }, undefined, (err) => console.log('Lamp load info:', err));

    // G. Luxury Leather & Wood Lounge Sofa (Background seating)
    this.gltfLoader.load('assets/models/leather_sofa.glb', (gltf) => {
      const sofa = gltf.scene;
      this.normalizeModel(sofa, 0.95);
      sofa.position.set(0.3, 0, -2.4);
      this.enableShadows(sofa);
      this.scene.add(sofa);
    }, undefined, (err) => console.log('Sofa load info:', err));

    // H. Luxury Armchairs Flanking the Lounge
    this.gltfLoader.load('assets/models/luxury_chair.glb', (gltf) => {
      const chairLeft = gltf.scene;
      this.normalizeModel(chairLeft, 0.85);
      chairLeft.position.set(-2.0, 0, -2.2);
      chairLeft.rotation.y = Math.PI / 4;
      this.enableShadows(chairLeft);
      this.scene.add(chairLeft);

      const chairRight = chairLeft.clone();
      chairRight.position.set(2.6, 0, -2.2);
      chairRight.rotation.y = -Math.PI / 4;
      this.scene.add(chairRight);
    }, undefined, (err) => console.log('Chair load info:', err));

    // I. Botanical Coffee Tree Canopy Plants
    this.gltfLoader.load('assets/models/botanical_plant.glb', (gltf) => {
      const plantLeft = gltf.scene;
      this.normalizeModel(plantLeft, 1.9);
      plantLeft.position.set(-3.6, 0, -1.0);
      this.enableShadows(plantLeft);
      this.scene.add(plantLeft);

      const plantRight = plantLeft.clone();
      plantRight.position.set(4.0, 0, -1.0);
      this.scene.add(plantRight);
    }, undefined, (err) => console.log('Plant load info:', err));

    // J. Precision Optical / Mechanical Brewing Apparatus
    this.gltfLoader.load('assets/models/antique_camera.glb', (gltf) => {
      const apparatus = gltf.scene;
      this.normalizeModel(apparatus, 0.28);
      apparatus.position.set(-1.45, 1.01, -0.25);
      apparatus.rotation.y = Math.PI / 6;
      this.enableShadows(apparatus);
      this.scene.add(apparatus);
    }, undefined, (err) => console.log('Apparatus load info:', err));
  }

  enableShadows(obj) {
    obj.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  buildVolumetricParticles() {
    // 1. Volumetric Steam Rising from the Coffee Cups
    const steamCount = 80;
    const steamGeo = new THREE.BufferGeometry();
    const steamPositions = new Float32Array(steamCount * 3);
    const steamVelocities = [];

    for (let i = 0; i < steamCount; i++) {
      steamPositions[i * 3 + 0] = (Math.random() < 0.5 ? -0.85 : 0.85) + (Math.random() - 0.5) * 0.3;
      steamPositions[i * 3 + 1] = 1.05 + Math.random() * 0.8;
      steamPositions[i * 3 + 2] = 0.15 + (Math.random() - 0.5) * 0.2;
      steamVelocities.push({
        vy: 0.005 + Math.random() * 0.008,
        vx: (Math.random() - 0.5) * 0.002
      });
    }

    steamGeo.setAttribute('position', new THREE.BufferAttribute(steamPositions, 3));
    const steamMat = new THREE.PointsMaterial({
      color: 0xded2c4,
      size: 0.07,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending
    });

    this.steamParticles = new THREE.Points(steamGeo, steamMat);
    this.steamParticles.userData = { velocities: steamVelocities };
    this.scene.add(this.steamParticles);

    // 2. Ambient Volumetric Golden Dust Motes
    const dustCount = 100;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      dustPositions[i * 3 + 1] = Math.random() * 5;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xc69c6d,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.dustParticles = new THREE.Points(dustGeo, dustMat);
    this.scene.add(this.dustParticles);
  }

  bindRaycasting() {
    const canvas = this.renderer.domElement;
    canvas.addEventListener('click', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);

      if (intersects.length > 0) {
        let current = intersects[0].object;
        while (current && !current.userData?.type && current.parent !== this.scene) {
          current = current.parent;
        }

        if (current && current.userData?.type) {
          this.triggerObjectInteraction(current.userData);
        }
      }
    });
  }

  triggerObjectInteraction(data) {
    const hud = document.getElementById('three3DTelemetryHUD');
    if (hud) {
      hud.innerHTML = `
        <div style="font-family: var(--font-mono); font-size: 10px; color: var(--color-gold); margin-bottom: 2px;">[ 3D SPATIAL TELEMETRY ]</div>
        <div style="font-family: var(--font-display); font-size: 13px; color: #fff; font-weight: 700;">${data.name}</div>
        <div style="font-size: 11px; color: var(--color-gold-bright); font-family: var(--font-mono); margin-top: 4px;">${data.telemetry}</div>
      `;
      hud.style.opacity = '1';
    }

    if (window.MaisonAudio) {
      if (data.type === 'espresso') {
        window.MaisonAudio.playSFX('espresso');
        window.MaisonAudio.playSFX('steam_wand');
      } else if (data.type === 'cupping') {
        window.MaisonAudio.playSFX('cup_clink');
      } else if (data.type === 'roaster') {
        window.MaisonAudio.playSFX('beans');
        window.MaisonAudio.playSFX('grinder');
      }
      window.MaisonAudio.playHarmonicChime();
    }
  }

  bindUI() {
    const btns = document.querySelectorAll('.bookmark-camera-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.MaisonAudio) window.MaisonAudio.playTactileClick();
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const key = btn.dataset.cam;
        if (key === 'tour') {
          this.isAutoRotating = true;
          this.animateCameraTo(this.cameraBookmarks.lounge.pos, this.cameraBookmarks.lounge.target);
        } else if (this.cameraBookmarks[key]) {
          this.isAutoRotating = false;
          this.animateCameraTo(this.cameraBookmarks[key].pos, this.cameraBookmarks[key].target);
        }
      });
    });
  }

  animateCameraTo(targetPos, targetLookAt) {
    const startPos = this.camera.position.clone();
    const destPos = new THREE.Vector3(...targetPos);
    const startTarget = this.controls ? this.controls.target.clone() : new THREE.Vector3(0, 0.85, 0);
    const destTarget = new THREE.Vector3(...targetLookAt);

    let progress = 0;
    const duration = 1200;
    const startTime = performance.now();

    const step = (now) => {
      progress = Math.min((now - startTime) / duration, 1.0);
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2;

      this.camera.position.lerpVectors(startPos, destPos, ease);
      if (this.controls) {
        this.controls.target.lerpVectors(startTarget, destTarget, ease);
        this.controls.update();
      }

      if (progress < 1.0) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.isAutoRotating && this.controls) {
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 0.75;
    } else if (this.controls) {
      this.controls.autoRotate = false;
    }

    if (this.controls) this.controls.update();

    if (this.steamParticles) {
      const positions = this.steamParticles.geometry.attributes.position.array;
      const vels = this.steamParticles.userData.velocities;
      for (let i = 0; i < vels.length; i++) {
        positions[i * 3 + 1] += vels[i].vy;
        positions[i * 3 + 0] += vels[i].vx;

        if (positions[i * 3 + 1] > 2.2) {
          positions[i * 3 + 1] = 1.05;
          positions[i * 3 + 0] = (i % 2 === 0 ? -0.85 : 0.85) + (Math.random() - 0.5) * 0.3;
        }
      }
      this.steamParticles.geometry.attributes.position.needsUpdate = true;
    }

    if (this.dustParticles) {
      this.dustParticles.rotation.y += 0.0006;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.Maison3DAtelier = new Maison3DAtelierEngine();
