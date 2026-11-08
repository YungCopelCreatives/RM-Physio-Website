// 3D pain locator: a simple rotatable body the patient taps to show where it hurts.
// Fires a "painselect" event on the container with { region, label, options }.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const BODY_HEIGHT = 1.72;

const BLUE = 0x155f82;
const BODY = 0xe9f1f5;
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

function buildBody(material) {
    const body = new THREE.Group();
    const add = (part, geometry, x, y, z = 0, rotZ = 0) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.rotation.z = rotZ;
        mesh.userData.part = part;
        body.add(mesh);
        return mesh;
    };
    const capsule = (r, len) => new THREE.CapsuleGeometry(r, len, 8, 16);
    const sphere = (r) => new THREE.SphereGeometry(r, 24, 16);

    const head = add('head', sphere(0.12), 0, 1.62);
    head.scale.set(0.9, 1.08, 1);
    add('neck', new THREE.CylinderGeometry(0.05, 0.06, 0.1, 16), 0, 1.47);

    const upper = add('torsoUpper', capsule(0.16, 0.16), 0, 1.25);
    upper.scale.set(1.2, 1, 0.68);
    const lower = add('torsoLower', capsule(0.14, 0.1), 0, 1.02);
    lower.scale.set(1.08, 1, 0.66);
    const pelvis = add('hip', sphere(0.17), 0, 0.88);
    pelvis.scale.set(1.05, 0.7, 0.7);

    for (const side of [-1, 1]) {
        add('shoulder', sphere(0.075), side * 0.23, 1.38);
        add('arm', capsule(0.045, 0.22), side * 0.27, 1.19, 0, side * 0.12);
        add('arm', capsule(0.04, 0.22), side * 0.31, 0.92, 0, side * 0.05);
        add('arm', sphere(0.045), side * 0.325, 0.76);

        add('thigh', capsule(0.07, 0.28), side * 0.1, 0.62);
        add('knee', sphere(0.062), side * 0.1, 0.43);
        add('lowerLeg', capsule(0.052, 0.28), side * 0.1, 0.24);
        add('foot', new THREE.BoxGeometry(0.08, 0.05, 0.2), side * 0.1, 0.04, 0.04);
    }
    return body;
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

    const material = new THREE.MeshStandardMaterial({ color: BODY, roughness: 0.65, metalness: 0 });
    let body = buildBody(material);
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

    // Glowing pain marker: a solid dot plus a pulsing halo
    const marker = new THREE.Group();
    marker.add(new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 12), new THREE.MeshBasicMaterial({ color: PAIN })));
    const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 20, 14),
        new THREE.MeshBasicMaterial({ color: PAIN, transparent: true, opacity: 0.35, depthWrite: false })
    );
    marker.add(halo);
    marker.visible = false;
    scene.add(marker);

    let highlighted = null;
    const highlightMaterial = material.clone();
    highlightMaterial.color.set(0xf7d4d2);

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
        if (highlighted) highlighted.material = material;
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
            const s = 1 + 0.35 * Math.sin(clock.getElapsedTime() * 4);
            halo.scale.setScalar(s);
            halo.material.opacity = 0.45 - 0.15 * s;
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
            if (highlighted) highlighted.material = material;
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
