// 3D pain locator: a rotatable muscle-style body the patient taps to show where it hurts.
// Fires a "painselect" event on the container with { region, label, options }.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const BODY_HEIGHT = 1.72;

const BLUE = 0x155f82;
const PAIN = 0xe53935;

// Region labels and the condition options (from the booking dropdown) each one suggests
export const REGIONS = {
    head: { label: 'Head or jaw', options: ['Headaches / TMJ (jaw issues)', 'Sinus treatment'] },
    neck: { label: 'Neck', options: ['Neck pain'] },
    shoulder: { label: 'Shoulder', options: ['Shoulder pain / injuries'] },
    chest: { label: 'Chest or breathing', options: ['Breathing impairment conditions', 'COPD / bronchitis / lung infections', 'Paediatric and adult lung conditions', 'Cardiac and lung intolerance'] },
    upperBack: { label: 'Upper back', options: ['Back pain'] },
    abdomen: { label: 'Abdomen', options: ['Oedema (lymph drainage)', 'Other'] },
    lowerBack: { label: 'Lower back', options: ['Back pain', 'Sciatica'] },
    arm: { label: 'Arm, elbow or wrist', options: ['Joint pain', 'Arthritis'] },
    hip: { label: 'Hip', options: ['Joint pain', 'Arthritis'] },
    thigh: { label: 'Thigh', options: ['Sciatica', 'Running biomechanical issues'] },
    knee: { label: 'Knee', options: ["Runner's knee", 'Joint pain', 'Arthritis'] },
    shin: { label: 'Shin', options: ['Running biomechanical issues'] },
    calf: { label: 'Calf or Achilles', options: ['Achilles tendinopathy', 'Running biomechanical issues'] },
    heel: { label: 'Heel', options: ['Plantar fasciitis (heel pain)', 'Achilles tendinopathy'] },
    foot: { label: 'Foot', options: ['Plantar fasciitis (heel pain)', 'Joint pain'] },
};

// Turn a hit on a body part into a region, using which side (front/back) was touched
function regionFor(part, localPoint) {
    const back = localPoint.z < 0;
    switch (part) {
        case 'torsoUpper': return back ? 'upperBack' : 'chest';
        case 'torsoLower': return back ? 'lowerBack' : 'abdomen';
        case 'lowerLeg': return back ? 'calf' : 'shin';
        case 'foot': return localPoint.z < -0.02 ? 'heel' : 'foot';
        default: return part;
    }
}

// For a single-mesh anatomy model, work out the region from where on the body the hit landed.
// Heights are fractions of standing height; the hit's surface normal tells front from back.
function regionForZone(point, normal) {
    const y = point.y / BODY_HEIGHT;
    const x = Math.abs(point.x) / BODY_HEIGHT;
    const back = normal.z < 0;
    if (y > 0.87) return 'head';
    if (y > 0.82) return x > 0.07 ? 'shoulder' : 'neck';
    if (x > 0.15 && y > 0.4) return y > 0.76 ? 'shoulder' : 'arm';
    if (y > 0.76 && x > 0.1) return 'shoulder';
    if (y > 0.62) return back ? 'upperBack' : 'chest';
    if (y > 0.53) return back ? 'lowerBack' : 'abdomen';
    if (y > 0.46) return 'hip';
    if (y > 0.31) return 'thigh';
    if (y > 0.25) return 'knee';
    if (y > 0.06) return back ? 'calf' : 'shin';
    return back ? 'heel' : 'foot';
}

// Scale a loaded model to standing height with its feet on the floor, centred
function fitModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.scale.multiplyScalar(BODY_HEIGHT / size.y);
    box.setFromObject(model);
    const centre = box.getCenter(new THREE.Vector3());
    model.position.x -= centre.x;
    model.position.z -= centre.z;
    model.position.y -= box.min.y;
}

// Muscle-fibre texture: fine vertical streaks so limbs read as muscle rather than plastic
function fibreTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#d27c6d';
    ctx.fillRect(0, 0, 256, 256);
    for (let x = 0; x < 256; x += 2) {
        const shade = Math.random();
        ctx.fillStyle = shade > 0.5 ? `rgba(255, 214, 200, ${0.08 + shade * 0.12})` : `rgba(120, 40, 35, ${0.06 + shade * 0.1})`;
        ctx.fillRect(x, 0, 1 + Math.round(shade), 256);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 1);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function buildBody() {
    const muscle = new THREE.MeshPhysicalMaterial({ map: fibreTexture(), roughness: 0.55, sheen: 0.4, sheenColor: 0xffd2c4, clearcoat: 0.15 });
    const tendon = new THREE.MeshPhysicalMaterial({ color: 0xf2ebe4, roughness: 0.45, clearcoat: 0.3 });
    const body = new THREE.Group();

    const add = (part, geometry, material, x, y, z = 0, scale = [1, 1, 1], rotZ = 0) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.scale.set(...scale);
        mesh.rotation.z = rotZ;
        mesh.userData.part = part;
        mesh.userData.base = material;
        body.add(mesh);
        return mesh;
    };
    const sphere = (r) => new THREE.SphereGeometry(r, 32, 20);
    // Lathe a limb or torso from a [radius, height] profile, base at y = 0
    const lathe = (profile) => new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), 32);

    // Head, neck and trapezius
    add('head', sphere(0.1), muscle, 0, 1.615, 0.005, [0.84, 1.02, 0.95]);
    add('head', sphere(0.06), muscle, 0, 1.555, 0.03, [1.05, 0.7, 0.9]);
    add('neck', lathe([[0.058, 0], [0.047, 0.06], [0.048, 0.13]]), muscle, 0, 1.42);
    for (const side of [-1, 1]) {
        add('neck', sphere(0.06), muscle, side * 0.085, 1.43, -0.02, [1.7, 0.5, 0.75], side * -0.38);
    }

    // Rib cage, chest muscles and abdomen
    add('torsoUpper', lathe([[0.125, 0], [0.135, 0.08], [0.15, 0.2], [0.155, 0.3], [0.13, 0.38], [0.06, 0.43]]), muscle, 0, 1.0, 0, [1.35, 1, 0.76]);
    for (const side of [-1, 1]) {
        add('torsoUpper', sphere(0.075), muscle, side * 0.07, 1.31, 0.085, [1.15, 0.72, 0.45]);
    }
    add('torsoLower', lathe([[0.135, 0], [0.122, 0.08], [0.128, 0.17]]), muscle, 0, 0.86, 0, [1.25, 1, 0.8]);
    add('torsoLower', new THREE.BoxGeometry(0.008, 0.3, 0.01), tendon, 0, 1.1, 0.112);
    for (const side of [-1, 1]) {
        // Lats and the spinal muscles either side of the spine
        add('torsoUpper', sphere(0.07), muscle, side * 0.1, 1.2, -0.07, [1, 1.8, 0.45]);
        add('torsoLower', sphere(0.045), muscle, side * 0.035, 1.03, -0.085, [0.55, 2.6, 0.4]);
    }
    add('torsoLower', sphere(0.06), tendon, 0, 0.97, -0.088, [1.3, 0.8, 0.22]);

    // Pelvis and glutes
    add('hip', sphere(0.16), muscle, 0, 0.88, -0.01, [1.02, 0.55, 0.62]);
    for (const side of [-1, 1]) {
        add('hip', sphere(0.085), muscle, side * 0.066, 0.82, -0.07, [1, 1, 0.8]);
    }

    for (const side of [-1, 1]) {
        // Arm: deltoid, upper arm, elbow, forearm, wrist, hand
        add('shoulder', sphere(0.068), muscle, side * 0.215, 1.37, 0, [1, 1.15, 1]);
        add('arm', lathe([[0.035, 0], [0.042, 0.1], [0.047, 0.18], [0.04, 0.27]]), muscle, side * 0.262, 1.08, 0, [1, 1, 1], side * 0.17);
        add('arm', sphere(0.034), tendon, side * 0.262, 1.075);
        add('arm', lathe([[0.025, 0], [0.03, 0.06], [0.04, 0.18], [0.035, 0.26]]), muscle, side * 0.3, 0.8, 0, [1, 1, 1], side * 0.15);
        add('arm', sphere(0.024), tendon, side * 0.3, 0.795);
        add('arm', sphere(0.04), tendon, side * 0.305, 0.725, 0, [0.6, 1.45, 0.32]);

        // Leg: thigh, knee, lower leg, ankle, foot
        add('thigh', lathe([[0.055, 0], [0.06, 0.08], [0.075, 0.25], [0.085, 0.37], [0.08, 0.42]]), muscle, side * 0.09, 0.47);
        add('thigh', sphere(0.06), muscle, side * 0.09, 0.68, 0.03, [0.85, 2.2, 0.6]);
        add('knee', sphere(0.05), tendon, side * 0.09, 0.46, 0.005, [1, 1.1, 0.9]);
        add('knee', sphere(0.032), tendon, side * 0.09, 0.465, 0.045, [1, 1.15, 0.6]);
        add('lowerLeg', lathe([[0.03, 0], [0.035, 0.05], [0.05, 0.2], [0.055, 0.28], [0.045, 0.38]]), muscle, side * 0.09, 0.07);
        add('lowerLeg', sphere(0.045), muscle, side * 0.09, 0.31, -0.022, [1, 2.1, 0.9]);
        add('lowerLeg', sphere(0.03), tendon, side * 0.09, 0.07);
        add('foot', sphere(0.05), tendon, side * 0.09, 0.035, 0.045, [0.85, 0.45, 2.1]);
    }
    return body;
}

// A camera-facing glowing dot so the pain marker stays visible on the red muscle
function markerTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const glow = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
    glow.addColorStop(0, 'rgba(255, 40, 40, 0.9)');
    glow.addColorStop(1, 'rgba(255, 40, 40, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 128, 128);
    ctx.beginPath();
    ctx.arc(64, 64, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#e53935';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

export function createPainLocator(container, modelUrl) {
    const width = () => container.clientWidth;
    const height = () => container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width(), height());
    renderer.domElement.setAttribute('aria-hidden', 'true');
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, width() / height(), 0.1, 20);
    camera.position.set(0, 0.95, 3.5);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xb7cdd8, 2.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(1.5, 2.5, 2);
    scene.add(key);

    let body = buildBody();
    let zoned = false;
    scene.add(body);

    // Swap in a realistic anatomy model when one is configured; keep the simple body if it fails
    if (modelUrl) {
        const loader = new GLTFLoader();
        const draco = new DRACOLoader();
        draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/libs/draco/gltf/');
        loader.setDRACOLoader(draco);
        container.classList.add('loading-model');
        loader.load(modelUrl, (gltf) => {
            const model = gltf.scene;
            fitModel(model);
            const group = new THREE.Group();
            group.add(model);
            scene.remove(body);
            body = group;
            zoned = true;
            scene.add(body);
            container.classList.remove('loading-model');
        }, undefined, () => container.classList.remove('loading-model'));
    }

    // Subtle brand-blue floor ring
    const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.32, 0.36, 48),
        new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0.35, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.86, 0);
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minDistance = 1.4;
    controls.maxDistance = 4.2;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = Math.PI - 0.35;
    controls.update();

    // Glowing pain marker, always drawn on top so it reads against the muscle colour
    const marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: markerTexture(), depthTest: false, transparent: true }));
    marker.renderOrder = 10;
    marker.scale.setScalar(0.09);
    marker.visible = false;
    scene.add(marker);

    let highlighted = null;
    const highlightMaterial = new THREE.MeshPhysicalMaterial({ color: 0xff8a80, emissive: 0x7a0000, emissiveIntensity: 0.45, roughness: 0.5 });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downAt = null;

    function pick(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(body.children, true)[0];
        if (!hit) return;

        let region;
        if (zoned) {
            const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
            region = regionForZone(hit.point, normal);
        } else {
            const local = hit.object.worldToLocal(hit.point.clone());
            region = regionFor(hit.object.userData.part, local);
        }

        marker.position.copy(hit.point);
        marker.visible = true;
        if (highlighted) highlighted.material = highlighted.userData.base;
        highlighted = null;
        if (!zoned) {
            highlighted = hit.object;
            highlighted.material = highlightMaterial;
        }

        container.dispatchEvent(new CustomEvent('painselect', {
            detail: { region, ...REGIONS[region] },
        }));
    }

    // Treat a short press without dragging as a tap, so rotating doesn't drop markers
    renderer.domElement.addEventListener('pointerdown', (e) => { downAt = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    renderer.domElement.addEventListener('pointerup', (e) => {
        if (!downAt) return;
        const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
        if (moved < 6 && performance.now() - downAt.t < 500) pick(e);
        downAt = null;
    });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
        if (marker.visible && !reduceMotion) {
            marker.scale.setScalar(0.09 * (1 + 0.18 * Math.sin(clock.getElapsedTime() * 4)));
        }
        controls.update();
        renderer.render(scene, camera);
    });

    new ResizeObserver(() => {
        camera.aspect = width() / height();
        camera.updateProjectionMatrix();
        renderer.setSize(width(), height());
    }).observe(container);

    return {
        // Turn the model to show the back or front
        showSide(side) {
            const angle = side === 'back' ? Math.PI : 0;
            const r = camera.position.distanceTo(controls.target);
            camera.position.set(Math.sin(angle) * r, controls.target.y + 0.05, Math.cos(angle) * r);
            controls.update();
        },
        clear() {
            marker.visible = false;
            if (highlighted) highlighted.material = highlighted.userData.base;
            highlighted = null;
        },
    };
}

// Mount on every [data-pain-locator]; the wizard script listens for "painselect"
function hasWebGL() {
    try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
    } catch (e) {
        return false;
    }
}

document.querySelectorAll('[data-pain-locator]').forEach((container) => {
    if (!hasWebGL()) {
        container.closest('.pain-locator')?.classList.add('no-3d');
        return;
    }
    const locator = createPainLocator(container, container.dataset.model);
    container.closest('.pain-locator')?.classList.add('ready');
    container.closest('.pain-locator')?.querySelectorAll('[data-show-side]').forEach((button) => {
        button.addEventListener('click', () => locator.showSide(button.dataset.showSide));
    });
    container.addEventListener('painclear', () => locator.clear());
});
