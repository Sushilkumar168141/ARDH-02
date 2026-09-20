/**
 * ============================================================================
 * SCRIPT.JS - MULTI-PROJECT VIEWER CONTROLLER
 * ============================================================================
 */

// Line 8-36: Define the projects and list of local image files.
// Edit this array to match your project folder names and filenames in /images/
const PROJECTS_DATA = [
  {
    id: "bus-stop",
    name: "Modern Bus Stop",
    images: [
      { file: "bus-stop_01.jpg", title: "Front Left View", category: "External" },
      { file: "bus-stop_02.jpg", title: "Front Right View", category: "External" },
      { file: "bus-stop_03.jpg", title: "Front View", category: "External" },
      { file: "bus-stop_04.jpg", title: "Bus view", category: "Bus" },
      { file: "bus-stop_05.jpg", title: "Inside Right View", category: "Internal" },
      { file: "bus-stop_06.jpg", title: "Front Left Close View", category: "External" },
      { file: "bus-stop_07.jpg", title: "Top Left View", category: "Top" },
      { file: "bus-stop_08.jpg", title: "Front Left Wireframe", category: "Wireframe" },
      { file: "bus-stop_09.jpg", title: "Front Wireframe", category: "Wireframe" },
      { file: "bus-stop_10.jpg", title: "Right View", category: "External" },
      { file: "bus-stop_11.jpg", title: "Left View", category: "External" },
      { file: "bus-stop_12.jpg", title: "Front Close View", category: "External" }
    ]
  },
  {
    id: "residence-01",
    name: "Residence at Jhajjar - 01",
    images: [
      { file: "residence-01_01.jpg", title: "Front Left View", category: "External" },
      { file: "residence-01_02.jpg", title: "Front View", category: "External" },
      { file: "residence-01_03.jpg", title: "Top Right View", category: "External" },
      { file: "residence-01_04.jpg", title: "Front Left Close View", category: "External" },
      { file: "residence-01_05.jpg", title: "Front Close View", category: "External" },
      { file: "residence-01_06.jpg", title: "Night View Right", category: "External" },
      { file: "residence-01_07.jpg", title: "Night View Left", category: "External" },
      { file: "residence-01_08.jpg", title: "Night View Front", category: "External" },
      { file: "residence-01_09.jpg", title: "Front View Parking", category: "External" },
      { file: "residence-01_10.jpg", title: "Right View", category: "External" },
      { file: "residence-01_11.jpg", title: "Front View Parking", category: "External" }
    ]
  }//,
  //{
  //  id: "project-3",
  //  name: "Urban Landscape Masterplan",
  //  images: [
  //    { file: "aerial-map.jpg", title: "Site Boundary & Topo Map", category: "Site Plan" },
  //    { file: "model-view.jpg", title: "3D Massing Perspective", category: "Massing" }
  //  ]
  //}
];

// Line 41-43: Application state variables tracking current project and active image
let currentProjectId = PROJECTS_DATA[0].id;
let activeImageIndex = 0;

// Line 46-60: Cache DOM element references for fast access
// Reliable inline SVG placeholder (never fails or triggers network errors)
const FALLBACK_IMAGE = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="#111827">
    <rect width="600" height="400" fill="#1f2937"/>
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="20">Image Not Found</text>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="sans-serif" font-size="14">Check local path in /images</text>
  </svg>
`);
// Cache the new dropdown element reference
const projectDropdown = document.getElementById("projectDropdown");
const thumbnailRail = document.getElementById("thumbnailRail");
const assetCountBadge = document.getElementById("assetCountBadge");
const mainImage = document.getElementById("mainImage");
const activeProjectBadge = document.getElementById("activeProjectBadge");
const activeImageTitle = document.getElementById("activeImageTitle");
const activeImagePath = document.getElementById("activeImagePath");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const copyPathBtn = document.getElementById("copyPathBtn");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const closeLightboxBtn = document.getElementById("closeLightboxBtn");

/**
 * Line 65-72: Helper to build relative path for local images
 * Matches: images/{projectId}/{filename}
 */
function getImagePath(projectId, filename) {
  return `images/${projectId}/${filename}`;
}

/**
 * Populates the dropdown menu with project options
 * and binds the 'change' event listener.
 */
function renderProjectSelector() {
  projectDropdown.innerHTML = "";

  PROJECTS_DATA.forEach((proj) => {
    const option = document.createElement("option");
    option.value = proj.id;
    option.textContent = `${proj.name} (${proj.images.length} items)`;
    
    // Select the currently active project
    if (proj.id === currentProjectId) {
      option.selected = true;
    }
    
    projectDropdown.appendChild(option);
  });

  // Listen for dropdown selection changes
  projectDropdown.addEventListener("change", (e) => {
    currentProjectId = e.target.value;
    activeImageIndex = 0; // Reset index to the first image of the selected project
    renderThumbnails();
    updateStageView();
  });
}

/**
 * Line 109-158: Render Left 1/4th Thumbnail Rail
 */
function renderThumbnails() {
  const currentProject = PROJECTS_DATA.find((p) => p.id === currentProjectId);
  if (!currentProject) return;

  thumbnailRail.innerHTML = "";
  assetCountBadge.textContent = `${currentProject.images.length} Assets`;

  currentProject.images.forEach((img, index) => {
    const filePath = getImagePath(currentProject.id, img.file);

    // Line 121-137: Build thumbnail card item
    const item = document.createElement("div");
    item.className = `thumb-item ${index === activeImageIndex ? "active" : ""}`;

    // In renderThumbnails():
    item.innerHTML = `
      <img class="thumb-preview" 
           src="${filePath}" 
           alt="${img.title}" 
           onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';">
      <div class="thumb-details">
        <span class="thumb-title">${img.title}</span>
        <span class="thumb-meta">${img.category} • #${index + 1}</span>
      </div>
    `;

    // Line 140-145: On click, select image and update stage view
    item.addEventListener("click", () => {
      activeImageIndex = index;
      highlightActiveThumbnail();
      updateStageView();
    });

    thumbnailRail.appendChild(item);
  });
}

/**
 * Line 163-172: Highlights currently selected thumbnail in the rail
 */
function highlightActiveThumbnail() {
  const items = thumbnailRail.querySelectorAll(".thumb-item");
  items.forEach((elem, idx) => {
    elem.classList.toggle("active", idx === activeImageIndex);
  });
}

/**
 * Line 177-200: Update Right 3/4th Stage View
 */
function updateStageView() {
  const currentProject = PROJECTS_DATA.find((p) => p.id === currentProjectId);
  if (!currentProject || currentProject.images.length === 0) return;

  const activeImg = currentProject.images[activeImageIndex];
  const fullPath = getImagePath(currentProject.id, activeImg.file);

  // Line 186-194: Update DOM elements with active image info
  mainImage.src = fullPath;
  mainImage.alt = activeImg.title;
  activeProjectBadge.textContent = currentProject.name;
  activeImageTitle.textContent = activeImg.title;
  activeImagePath.textContent = fullPath;

  // Fallback if local file not yet placed in directory
  // In updateStageView():
  mainImage.onerror = function () {
    this.onerror = null; // PREVENTS THE INFINITE LOOP
    this.src = FALLBACK_IMAGE;
  };

  // Set src AFTER defining onerror
  mainImage.src = fullPath;
  mainImage.alt = activeImg.title;
  activeProjectBadge.textContent = currentProject.name;
  activeImageTitle.textContent = activeImg.title;
  activeImagePath.textContent = fullPath;
  }   

/**
 * Line 205-219: Navigate to Next / Previous image
 */
function cycleImage(direction) {
  const currentProject = PROJECTS_DATA.find((p) => p.id === currentProjectId);
  if (!currentProject) return;

  const total = currentProject.images.length;
  if (direction === "next") {
    activeImageIndex = (activeImageIndex + 1) % total;
  } else {
    activeImageIndex = (activeImageIndex - 1 + total) % total;
  }

  highlightActiveThumbnail();
  updateStageView();
}

/**
 * Line 224-250: Navigation Tabs switching (Home, About Us, Contact Us)
 */
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page-view");
const mobileNav = document.getElementById("mobileNav");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");


navLinks.forEach((button) => {
  button.addEventListener("click", (e) => {
    const targetId = `view-${button.getAttribute("data-target")}`;

    // Line 233-238: Switch visible section
    pages.forEach((p) => p.classList.add("hidden"));
    document.getElementById(targetId)?.classList.remove("hidden");

    // Line 240-244: Update active tab styling
    navLinks.forEach((l) => l.classList.remove("active"));
    button.classList.add("active");

    // Close mobile menu if open
    mobileNav.classList.add("hidden");
  });
});

// Line 251: Toggle mobile menu drawer
mobileMenuBtn.addEventListener("click", () => {
  mobileNav.classList.toggle("hidden");
});

/**
 * Line 257-285: Event Listeners for controls, lightbox, and keyboard arrows
 */
prevBtn.addEventListener("click", () => cycleImage("prev"));
nextBtn.addEventListener("click", () => cycleImage("next"));

// Lightbox modal toggle
fullscreenBtn.addEventListener("click", () => {
  lightboxImg.src = mainImage.src;
  lightbox.classList.remove("hidden");
});
closeLightboxBtn.addEventListener("click", () => lightbox.classList.add("hidden"));

// Copy path to clipboard
copyPathBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(activeImagePath.textContent).then(() => {
    alert("Path copied to clipboard!");
  });
});

// Line 275-285: Keyboard arrow controls
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") cycleImage("prev");
  if (e.key === "ArrowRight") cycleImage("next");
  if (e.key === "Escape") lightbox.classList.add("hidden");
});

/**
 * Line 290-295: Initial page load bootstrapper
 */
document.addEventListener("DOMContentLoaded", () => {
  renderProjectSelector();
  renderThumbnails();
  updateStageView();
  lucide.createIcons(); // Initialize Lucide SVG icons
});