/* =========================================
   ロード画面の制御ロジック
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  const progressBar = document.querySelector(".progress-bar");
  const progressText = document.getElementById("progress-text");
  const body = document.body;

  body.classList.add("loading");

  // ロードシミュレーション
  let width = 0;
  const interval = setInterval(() => {
    if (width >= 100) {
      clearInterval(interval);
      // フェードアウト
      setTimeout(() => {
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
        body.classList.remove("loading");

        // ロード完了後に他のアニメーションを開始
        initHeroAnimations();
      }, 500);
    } else {
      // リアルな挙動のためのランダム増分
      width += Math.floor(Math.random() * 5) + 1;
      if (width > 100) width = 100;

      progressBar.style.width = width + "%";
      progressText.textContent = width + "%";
    }
  }, 30); // ロード速度
});

function initHeroAnimations() {
  // GSAP ヒーローアニメーション (ロード完了後に開始)
  const tl = gsap.timeline();

  // CSSで opacity: 0 に設定されているため、opacity: 1 へアニメーション
  tl.to(".hero-box", {
    y: 0, // 元の位置へアニメーション
    opacity: 1,
    duration: 1.2,
    ease: "power3.out",
  })
    .to(
      ".hero-stats",
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
      },
      "-=0.8",
    )
    .to(
      ".scroll-indicator",
      {
        y: 0, // 元の位置へアニメーション
        opacity: 1,
        duration: 1,
        ease: "power3.out",
      },
      "-=0.6",
    );
}

/* =========================================
   Three.js 背景アニメーション
   ========================================= */
const canvas = document.querySelector("#bg-canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(10, 10, 10);
scene.add(dirLight);

const geometry = new THREE.IcosahedronGeometry(1, 1);
const material = new THREE.MeshBasicMaterial({
  color: 0x2563eb,
  wireframe: true,
  transparent: true,
  opacity: 0.5,
});
const objects = [];

for (let i = 0; i < 25; i++) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.x = (Math.random() - 0.5) * 25;
  mesh.position.y = (Math.random() - 0.5) * 25;
  mesh.position.z = (Math.random() - 0.5) * 15;
  const scale = Math.random() * 1 + 0.5;
  mesh.scale.set(scale, scale, scale);
  mesh.userData = {
    rotX: (Math.random() - 0.5) * 0.002,
    rotY: (Math.random() - 0.5) * 0.002,
  };
  scene.add(mesh);
  objects.push(mesh);
}

camera.position.z = 5;

let mouseX = 0;
let mouseY = 0;
document.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

let isActive = true;
document.addEventListener("visibilitychange", () => {
  isActive = !document.hidden;
});

function animate() {
  if (!isActive) return;
  requestAnimationFrame(animate);
  camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
  camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.02;
  camera.lookAt(scene.position);
  objects.forEach((mesh) => {
    mesh.rotation.x += mesh.userData.rotX;
    mesh.rotation.y += mesh.userData.rotY;
    mesh.position.y += Math.sin(Date.now() * 0.0005 + mesh.position.x) * 0.001;
  });
  renderer.render(scene, camera);
}
animate();

/* 2. GSAP アニメーション */
const heroItems = document.querySelectorAll(".hero-box > *");
if (heroItems.length) {
  gsap.from(heroItems, {
    y: 50,
    opacity: 0,
    duration: 1.5,
    stagger: 0.2,
    ease: "power4.out",
    delay: 0.2,
  });
}
gsap.utils.toArray(".glass-panel").forEach((panel) => {
  if (panel.classList.contains("hero-box")) return;
  gsap.from(panel, {
    scrollTrigger: {
      trigger: panel,
      start: "top 90%",
      toggleActions: "play none none reverse",
    },
    y: 80,
    opacity: 0,
    duration: 1.2,
    ease: "power3.out",
  });
});

/* 3. VanillaTilt (グラスモーフィズム効果) */
VanillaTilt.init(document.querySelectorAll(".glass-panel"), {
  max: 5,
  speed: 1000,
  glare: true,
  "max-glare": 0.2,
  scale: 1.01,
  gyroscope: false,
});

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* 4. アクティブナビゲーション (スクロールスパイ) */
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-links a");

const observerOptions = {
  root: null,
  rootMargin: "0px",
  threshold: 0.3, // セクションが30%見えたら検知
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute("id");
      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${id}`) {
          link.classList.add("active");
        }
      });
    }
  });
}, observerOptions);

sections.forEach((section) => {
  observer.observe(section);
});

/* 5. お問い合わせフォーム (Formspree) */
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

if (contactForm) {
  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const data = new FormData(event.target);

    // UI更新: 送信中...
    formStatus.textContent = "Sending...";
    formStatus.className = ""; // クラスリセット

    // 重要: 本番環境用にFormspree IDを設定済み
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvzbkwab";

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        formStatus.textContent = "Thank you! Message sent successfully.";
        formStatus.classList.add("success");
        contactForm.reset();
      } else {
        const errorData = await response.json();
        // Formspreeが詳細なエラーを返した場合
        if (Object.hasOwn(errorData, "errors")) {
          formStatus.textContent = errorData["errors"]
            .map((error) => error["message"])
            .join(", ");
        } else {
          formStatus.textContent =
            "Oops! There was a problem sending your message.";
        }
        formStatus.classList.add("error");
      }
    } catch (error) {
      formStatus.textContent = "Network error. Please try again later.";
      formStatus.classList.add("error");
    }
  });
}
