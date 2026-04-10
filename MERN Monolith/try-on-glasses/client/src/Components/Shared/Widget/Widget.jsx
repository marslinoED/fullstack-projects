import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FaceMesh } from '@mediapipe/face_mesh';
import './Widget.css';

const MODEL_GET_ENDPOINT = '/api/v1/model/get-model';
const DEFAULT_MODEL_NAME = '1.glb';
const MODEL_ROTATION_FIX_Z = Math.PI;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export default function Widget() {
  const videoRef = useRef(null);
  const rendererHostRef = useRef(null);

  const streamRef = useRef(null);
  const faceMeshRef = useRef(null);
  const detectRafRef = useRef(null);

  const threeRef = useRef({
    renderer: null,
    scene: null,
    camera: null,
    glassesModel: null,
    width: 0,
    height: 0,
  });

  const [modelName, setModelName] = useState(DEFAULT_MODEL_NAME);
  const [status, setStatus] = useState('Idle. Load glasses and start camera.');
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [hasModel, setHasModel] = useState(false);

  const updateRendererSize = useCallback((videoWidth, videoHeight) => {
    const three = threeRef.current;
    if (!three.renderer || !three.camera || !videoWidth || !videoHeight) {
      return;
    }

    three.width = videoWidth;
    three.height = videoHeight;
    three.renderer.setSize(videoWidth, videoHeight, false);
    three.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    three.camera.left = 0;
    three.camera.right = videoWidth;
    three.camera.top = 0;
    three.camera.bottom = videoHeight;
    three.camera.updateProjectionMatrix();
  }, []);

  const renderScene = useCallback(() => {
    const three = threeRef.current;
    if (three.renderer && three.scene && three.camera) {
      three.renderer.render(three.scene, three.camera);
    }
  }, []);

  const cleanupTracking = useCallback(() => {
    if (detectRafRef.current) {
      cancelAnimationFrame(detectRafRef.current);
      detectRafRef.current = null;
    }

    if (faceMeshRef.current) {
      faceMeshRef.current.close();
      faceMeshRef.current = null;
    }
  }, []);

  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const cleanupThree = useCallback(() => {
    const three = threeRef.current;

    if (three.scene && three.glassesModel) {
      three.scene.remove(three.glassesModel);
      three.glassesModel.traverse((obj) => {
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      three.glassesModel = null;
    }

    if (three.renderer) {
      three.renderer.dispose();
      if (three.renderer.domElement && three.renderer.domElement.parentNode) {
        three.renderer.domElement.parentNode.removeChild(three.renderer.domElement);
      }
    }

    threeRef.current = {
      renderer: null,
      scene: null,
      camera: null,
      glassesModel: null,
      width: 0,
      height: 0,
    };
  }, []);

  const stop = useCallback(() => {
    cleanupTracking();
    cleanupCamera();
    setIsRunning(false);
    setStatus('Camera stopped.');
  }, [cleanupCamera, cleanupTracking]);

  useEffect(() => {
    return () => {
      cleanupTracking();
      cleanupCamera();
      cleanupThree();
    };
  }, [cleanupCamera, cleanupThree, cleanupTracking]);

  const ensureThree = useCallback(() => {
    const host = rendererHostRef.current;
    if (!host) {
      throw new Error('Renderer host element is not ready.');
    }

    const three = threeRef.current;
    if (three.renderer && three.scene && three.camera) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'Widget-overlayCanvas';
    host.innerHTML = '';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -5000, 5000);
    camera.position.set(0, 0, 1000);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 0.65);
    directional.position.set(0, -0.2, 1);
    directional.castShadow = true;
    directional.shadow.mapSize.width = 1024;
    directional.shadow.mapSize.height = 1024;
    scene.add(directional);

    threeRef.current = {
      ...three,
      renderer,
      scene,
      camera,
    };
  }, []);

  const loadGlasses = useCallback(async () => {
    if (!modelName.trim()) {
      setStatus('Please enter a valid model name.');
      return;
    }

    try {
      ensureThree();
      setIsLoadingModel(true);
      setStatus('Downloading GLB model...');

      const modelUrl = `${API_BASE_URL}${MODEL_GET_ENDPOINT}/${encodeURIComponent(modelName.trim())}`;

      const response = await fetch(modelUrl, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Model request failed: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const loader = new GLTFLoader();
      const gltf = await new Promise((resolve, reject) => {
        loader.load(objectUrl, resolve, undefined, reject);
      });
      URL.revokeObjectURL(objectUrl);

      const three = threeRef.current;
      if (three.scene && three.glassesModel) {
        three.scene.remove(three.glassesModel);
      }

      const model = gltf.scene;
      model.visible = false;

      // Keep source model materials/textures and re-enable mesh shadows.
      model.traverse((obj) => {
        if (!obj.isMesh) {
          return;
        }

        obj.castShadow = true;
        obj.receiveShadow = true;
      });

      const box = new THREE.Box3().setFromObject(model);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      model.scale.setScalar(1 / maxDim);
      model.position.sub(center.multiplyScalar(1 / maxDim));

      if (three.scene) {
        three.scene.add(model);
      }
      three.glassesModel = model;

      setHasModel(true);
      setStatus('GLB loaded. Start camera to try-on.');
      renderScene();
    } catch (error) {
      setHasModel(false);
      setStatus(`Failed to load GLB: ${error.message}. Check API URL and CORS in production.`);
    } finally {
      setIsLoadingModel(false);
    }
  }, [modelName, ensureThree, renderScene]);

  const onFaceResults = useCallback(
    (results) => {
      const three = threeRef.current;
      const model = three.glassesModel;
      if (!model || !three.width || !three.height) {
        return;
      }

      const landmarks = results.multiFaceLandmarks?.[0];
      if (!landmarks) {
        model.visible = false;
        renderScene();
        return;
      }

      // FaceMesh indices used for anchoring: left temple, right temple, and eye corners.
      const leftTemple = landmarks[234];
      const rightTemple = landmarks[454];
      const leftEyeOuter = landmarks[33];
      const rightEyeOuter = landmarks[263];
      const noseBridge = landmarks[168];

      const width = three.width;
      const height = three.height;

      const ltx = leftTemple.x * width;
      const lty = leftTemple.y * height;
      const rtx = rightTemple.x * width;
      const rty = rightTemple.y * height;

      const lex = leftEyeOuter.x * width;
      const ley = leftEyeOuter.y * height;
      const rex = rightEyeOuter.x * width;
      const rey = rightEyeOuter.y * height;

      const centerX = (lex + rex) * 0.5;
      const centerY = (ley + rey) * 0.5;

      const faceWidth = Math.hypot(rtx - ltx, rty - lty);
      const eyeLineAngle = Math.atan2(rey - ley, rex - lex);
      const yaw = -(leftTemple.z - rightTemple.z) * 3.2;
      const pitch = (noseBridge.y - (leftEyeOuter.y + rightEyeOuter.y) * 0.5) * 7.5;

      const glassesWidth = faceWidth * 0.95;

      model.visible = true;
      model.position.set(centerX, centerY + faceWidth * 0.02, 0);
      model.scale.setScalar(glassesWidth);
      model.rotation.set(pitch, yaw, -eyeLineAngle + MODEL_ROTATION_FIX_Z);

      renderScene();
    },
    [renderScene],
  );

  const getCameraStream = useCallback((constraints) => {
    if (navigator.mediaDevices?.getUserMedia) {
      return navigator.mediaDevices.getUserMedia(constraints);
    }

    const legacyGetUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    if (legacyGetUserMedia) {
      return new Promise((resolve, reject) => {
        legacyGetUserMedia.call(navigator, constraints, resolve, reject);
      });
    }

    throw new Error('No camera API available in this browser/context.');
  }, []);

  const startCamera = useCallback(async () => {
    if (!hasModel) {
      setStatus('Load a GLB model first.');
      return;
    }

    try {
      cleanupTracking();
      cleanupCamera();
      ensureThree();

      const isLocalHost =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '::1';

      if (!window.isSecureContext && !isLocalHost) {
        setStatus('Non-HTTPS context detected. Trying camera access...');
      }

      setStatus('Requesting camera access...');

      const stream = await getCameraStream({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;

      const videoEl = videoRef.current;
      if (!videoEl) {
        throw new Error('Video element not found.');
      }

      videoEl.srcObject = stream;
      await videoEl.play();

      updateRendererSize(videoEl.videoWidth, videoEl.videoHeight);

      const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      faceMesh.onResults(onFaceResults);
      faceMeshRef.current = faceMesh;

      setIsRunning(true);
      setStatus('Camera running. Tracking face...');

      const detect = async () => {
        if (!faceMeshRef.current || !videoRef.current) {
          return;
        }

        try {
          await faceMeshRef.current.send({ image: videoRef.current });
        } catch (err) {
          setStatus(`Face tracking error: ${err.message}`);
          stop();
          return;
        }
        detectRafRef.current = requestAnimationFrame(detect);
      };

      detectRafRef.current = requestAnimationFrame(detect);
    } catch (error) {
      stop();
      if (error.name === 'NotAllowedError') {
        setStatus('Unable to start camera: permission denied. Allow camera access in browser/site settings.');
        return;
      }

      if (error.name === 'NotFoundError') {
        setStatus('Unable to start camera: no camera device found.');
        return;
      }

      if (!window.isSecureContext) {
        setStatus(
          `Unable to start camera on ${window.location.origin}. Browser blocked camera on insecure context. Use HTTPS or localhost.`,
        );
        return;
      }

      setStatus(`Unable to start camera: ${error.message}`);
    }
  }, [cleanupCamera, cleanupTracking, ensureThree, getCameraStream, hasModel, onFaceResults, stop, updateRendererSize]);

  return (
    <div className='Widget-Content'>
      <h2>Virtual Try-On Widget</h2>

      <div className='Widget-controls'>
        <label htmlFor='model-name'>Model name</label>
        <input
          id='model-name'
          type='text'
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          placeholder='1.glb'
        />

        <div className='Widget-actions'>
          <button type='button' onClick={loadGlasses} disabled={isLoadingModel}>
            {isLoadingModel ? 'Loading model...' : 'Load GLB'}
          </button>
          <button type='button' onClick={startCamera} disabled={!hasModel || isRunning}>
            Start Camera
          </button>
          <button type='button' onClick={stop} disabled={!isRunning}>
            Stop Camera
          </button>
        </div>
      </div>

      <p className='Widget-status'>{status}</p>

      <div className='Widget-stage'>
        <video ref={videoRef} className='Widget-video' playsInline muted />
        <div ref={rendererHostRef} className='Widget-overlay' />
      </div>
    </div>
  );
}
