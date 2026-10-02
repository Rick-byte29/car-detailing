import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const carHost=document.querySelector('#car-canvas'), detailHost=document.querySelector('#detail-canvas'),wheelHost=document.querySelector('#wheel-canvas');
let car, detailCar, bodyMaterial, detailBody, scrollProgress=0, craftProgress=0, loadFailed=false;
const rendererOptions={antialias:true,alpha:true,powerPreference:'high-performance'};
function makeStage(host,cameraPosition={x:5,y:2.8,z:7}){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.set(cameraPosition.x,cameraPosition.y,cameraPosition.z);camera.lookAt(0,.55,0);
 const renderer=new THREE.WebGLRenderer({...rendererOptions});renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(host.clientWidth||innerWidth,host.clientHeight||innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 host.appendChild(renderer.domElement);const pmrem=new THREE.PMREMGenerator(renderer),env=pmrem.fromScene(new RoomEnvironment(),.035).texture;pmrem.dispose();scene.environment=env;
 scene.add(new THREE.HemisphereLight(0xdce5ff,0x242529,1.8));
 const key=new THREE.DirectionalLight(0xf6f7ff,4.2);key.position.set(-4,8,5);scene.add(key);
 const rim=new THREE.DirectionalLight(0xff5425,5.5);rim.position.set(5,3,-5);scene.add(rim);
 const fill=new THREE.DirectionalLight(0x7fa2ff,2);fill.position.set(-5,3,-7);scene.add(fill);
 const sweep=new THREE.PointLight(0xffc7a0,2,14);scene.add(sweep);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshBasicMaterial({color:0x151719,transparent:true,opacity:.48}));floor.rotation.x=-Math.PI/2;floor.position.y=-.11;scene.add(floor);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(3.5,.014,6,120),new THREE.MeshBasicMaterial({color:0xff6335,transparent:true,opacity:.0,depthWrite:false}));ring.rotation.x=Math.PI/2;ring.position.y=.02;scene.add(ring);
 const halo=new THREE.Mesh(new THREE.CircleGeometry(4.1,64),new THREE.MeshBasicMaterial({color:0xff5a27,transparent:true,opacity:.045,depthWrite:false}));halo.rotation.x=-Math.PI/2;halo.scale.set(1.4,.62,1);halo.position.y=-.08;scene.add(halo);
 const points=new Float32Array(160*3);for(let i=0;i<160;i++){let a=Math.random()*Math.PI*2,r=2.6+Math.random()*1.5;points[i*3]=Math.cos(a)*r;points[i*3+1]=.15+Math.random()*1.3;points[i*3+2]=Math.sin(a)*r}
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(points,3));const particles=new THREE.Points(pg,new THREE.PointsMaterial({color:0xffb37b,size:.045,transparent:true,opacity:0,depthWrite:false}));scene.add(particles);
 const ro=new ResizeObserver(()=>{const w=host.clientWidth||innerWidth,h=host.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()});ro.observe(host);
 return {scene,camera,renderer,sweep,ring,particles};
}
const main=makeStage(carHost,{x:5,y:2.8,z:7});
const details=makeStage(detailHost,{x:5.2,y:2.4,z:7.7});
window.addEventListener('scroll',()=>{scrollProgress=window.apexScroll||0;craftProgress=window.apexCraftScroll||0},{passive:true});
window.addEventListener('apex-color',e=>{if(bodyMaterial)bodyMaterial.color.set(e.detail)});
const draco=new DRACOLoader();draco.setDecoderPath('./vendor/draco/');const loader=new GLTFLoader();loader.setDRACOLoader(draco);
function fitModel(model,material){
 model.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;if(o.name==='body')o.material=material});
 const box=new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),scale=5.3/Math.max(size.x,size.y,size.z);model.scale.setScalar(scale);model.position.set(-center.x*scale,-box.min.y*scale+.07,-center.z*scale);return model;
}
loader.load('./assets/car.glb',gltf=>{
 car=gltf.scene;bodyMaterial=new THREE.MeshPhysicalMaterial({color:0xaeb5bc,metalness:.82,roughness:.2,clearcoat:1,clearcoatRoughness:.045,envMapIntensity:1.45});fitModel(car,bodyMaterial);main.scene.add(car);
 detailCar=gltf.scene.clone(true);detailBody=new THREE.MeshPhysicalMaterial({color:0xc5cbd0,metalness:.78,roughness:.15,clearcoat:1,clearcoatRoughness:.025,envMapIntensity:1.6});fitModel(detailCar,detailBody);details.scene.add(detailCar);
},undefined,e=>{loadFailed=true;carHost.parentElement.querySelector('.scene-fallback').hidden=false;console.warn('3D vehicle could not load; showing studio image.',e)});
try{const el=document.createElement('canvas');const wr=new THREE.WebGLRenderer({canvas:el,alpha:true,antialias:true});wr.setPixelRatio(Math.min(devicePixelRatio,1.4));wr.setClearColor(0,0);wheelHost.appendChild(wr.domElement);const ws=new THREE.Scene(),wc=new THREE.PerspectiveCamera(35,1,.1,50);wc.position.set(0,0,9);ws.add(new THREE.AmbientLight(0xffffff,1.5));const wl=new THREE.DirectionalLight(0xffffff,4);wl.position.set(-4,4,8);ws.add(wl);const orange=new THREE.PointLight(0xff5129,10,12);orange.position.set(-2,-1,2);ws.add(orange);const wg=new THREE.Group();ws.add(wg);
 const rubber=new THREE.Mesh(new THREE.TorusGeometry(1.16,.28,22,96),new THREE.MeshStandardMaterial({color:0x101112,roughness:.78}));wg.add(rubber);const sidewall=new THREE.Mesh(new THREE.TorusGeometry(1.04,.11,12,96),new THREE.MeshStandardMaterial({color:0x292b2d,roughness:.42,metalness:.18}));sidewall.position.z=.14;wg.add(sidewall);const rim=new THREE.Mesh(new THREE.TorusGeometry(.76,.045,8,72),new THREE.MeshStandardMaterial({color:0xaeb6bb,metalness:.9,roughness:.2}));rim.position.z=.2;wg.add(rim);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.18,32),new THREE.MeshStandardMaterial({color:0xdce0e0,metalness:.9,roughness:.18}));hub.rotation.x=Math.PI/2;hub.position.z=.18;wg.add(hub);const sm=new THREE.MeshStandardMaterial({color:0xcbd1d3,metalness:.92,roughness:.21});for(let i=0;i<10;i++){const a=i*Math.PI/5,s=new THREE.Mesh(new THREE.BoxGeometry(.055,.77,.065),sm);s.position.set(Math.sin(a)*.43,Math.cos(a)*.43,.19);s.rotation.z=-a;wg.add(s)}const tm=new THREE.MeshStandardMaterial({color:0x2d3032,roughness:.88});for(let i=0;i<42;i++){const a=i*Math.PI*2/42,t=new THREE.Mesh(new THREE.BoxGeometry(.11,.095,.31),tm);t.position.set(Math.sin(a)*1.17,Math.cos(a)*1.17,0);t.rotation.z=-a;wg.add(t)}
 function resizeWheel(){const w=innerWidth,h=innerHeight;wr.setSize(w,h,false);wc.aspect=w/h;wc.position.z=w/h<.8?11:9;wc.updateProjectionMatrix();wg.position.x=w/h<.8?.4:2}addEventListener('resize',resizeWheel);resizeWheel();
 const sparks=document.querySelector('#sparks'),ctx=sparks.getContext('2d');let ps=[],sw=0,sh=0,lastBurst=0;function sizeSparks(){const d=Math.min(devicePixelRatio,1.5);sw=innerWidth;sh=innerHeight;sparks.width=sw*d;sparks.height=sh*d;ctx.setTransform(d,0,0,d,0,0)}addEventListener('resize',sizeSparks);sizeSparks();function burst(){const x=sw*(sw<700?.5:.62),y=sh*.53;for(let i=0;i<72;i++){const a=Math.random()*Math.PI*2,v=1+Math.random()*6;ps.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,life:25+Math.random()*30,max:55,r:.6+Math.random()*1.8})}}function drawSparks(now){ctx.clearRect(0,0,sw,sh);if(now-lastBurst>480){burst();lastBurst=now}ps=ps.filter(p=>p.life-->0);for(const p of ps){p.x+=p.vx;p.y+=p.vy;p.vx*=.97;p.vy=p.vy*.98+.035;ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.life%3?'#ff7337':'#fff1ad';ctx.shadowColor='#ff5a27';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;ctx.shadowBlur=0}
 let colorPhase=0;
 function render(now){requestAnimationFrame(render);const t=now*.00028;
  if(window.apexLoading){const q=(now-(window.apexIgnitionStart||now))/1000;wg.rotation.z=-q*2.7;wg.position.x=(innerWidth<700?.4:2)+Math.sin(q*3.6)*.24;wg.position.y=Math.sin(q*2.2)*.09;wg.scale.setScalar(1+Math.min(q,2)*.065);wr.render(ws,wc);drawSparks(now)}else if(window.apexIgnitionStart&&now-window.apexIgnitionStart<3600){wr.render(ws,wc)}else ctx.clearRect(0,0,sw,sh);
  if(car){const p=scrollProgress,sceneNumber=Math.min(5,Math.floor(p*6)),phase=[.1,.25,.18,.04,.13,.06][sceneNumber];car.rotation.y=-.38+p*Math.PI*2.1+Math.sin(t)*.012;car.rotation.x=.015+Math.sin(p*Math.PI*3)*.025;const zoom=sceneNumber===2?.7:sceneNumber===3?.3:0;main.camera.position.x=5+p*2.8;main.camera.position.y=2.65+Math.sin(p*Math.PI*2)*.45;main.camera.position.z=7.3-p*.8-zoom;main.camera.fov=sceneNumber===2?31:35;main.camera.updateProjectionMatrix();main.camera.lookAt(0,.58,0);main.sweep.position.set(-5+((p*6)%1)*10,2.4,1.5);main.ring.material.opacity=phase;main.ring.rotation.z=t*.3+p*2;main.particles.rotation.y=t*.12+p*1.5;main.particles.material.opacity=[.14,.85,.23,.48,.9,.28][sceneNumber];if(bodyMaterial){bodyMaterial.roughness=.21-.1*Math.max(0,Math.sin(p*Math.PI*6));bodyMaterial.clearcoatRoughness=.025+.055*Math.abs(Math.sin(p*Math.PI*3))}main.renderer.render(main.scene,main.camera)}
  if(detailCar){const p=craftProgress,step=Math.min(3,Math.floor(p*4));detailCar.rotation.y=-.5+p*Math.PI*1.6+Math.sin(t*.7)*.01;detailCar.rotation.x=Math.sin(p*Math.PI*4)*.018;details.camera.position.x=5.2+Math.sin(p*Math.PI*2)*1.4;details.camera.position.y=2.4+Math.max(0,Math.sin(p*Math.PI*4))*.25;details.camera.position.z=7.7-(step===2?.8:0);details.camera.lookAt(0,.58,0);details.sweep.position.set(-4+((p*4)%1)*8,2,2);details.ring.material.opacity=[.07,.33,.7,.18][step];details.ring.rotation.z=t*.25+p;details.particles.rotation.y=t*.15-p;details.particles.material.opacity=[.25,.5,.88,.38][step];if(detailBody)detailBody.roughness=[.21,.34,.12,.18][step];details.renderer.render(details.scene,details.camera)}
 }
 requestAnimationFrame(render);
}catch(e){console.warn('Ignition wheel animation could not load.',e)}
