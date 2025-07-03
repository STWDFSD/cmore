<template>
  <!-- Graph canvas container -->
  <div :style="{ top: `-${canvasHeight}px` }">
    <canvas
      ref="canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousemove="handleMouseMove"
      @click="handleCanvasClick"
    ></canvas>
  </div>
</template>

<script setup>
// --- Imports and Props ---
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  nodes: Array,
  edges: Array,
  onClick: Function,
});

// --- Graph Layout Constants ---
const nodeWidth = 140;
const nodeHeight = 50;
const levelHeight = 100;
const spacing = 40;
const margin = 20;

// --- Reactive State ---
const animationIndex = ref(0);
const canvasWidth = ref(0);
const canvasHeight = ref(0);
const flatNodes = ref([]);
const idToNode = ref({});
const selectedNodeId = ref(null);
const hoveredNodeId = ref(null);
const canvas = ref(null);

// --- Tree Building and Layout Functions ---
function buildTree(nodes, edges) {
  const map = {};
  nodes.forEach((n) => (map[n.ID] = { ...n, children: [] }));
  const childSet = new Set();
  edges.forEach(([p, c]) => {
    map[p].children.push(map[c]);
    childSet.add(c);
  });
  const root = nodes.find((n) => !childSet.has(n.ID));
  return map[root.ID];
}

function layoutTree(root) {
  let x = 0;
  const dfs = (node, depth = 0) => {
    node.y = depth * levelHeight;
    if (!node.children.length) {
      node.x = x * (nodeWidth + spacing);
      x++;
    } else {
      node.children.forEach((child) => dfs(child, depth + 1));
      const first = node.children[0],
        last = node.children.at(-1);
      node.x = (first.x + last.x) / 2;
    }
  };
  dfs(root);
}

function flattenTree(root) {
  const result = [];
  const walk = (node) => {
    result.push(node);
    node.children.forEach(walk);
  };
  walk(root);
  return result;
}

// --- Canvas Size Calculation ---
function computeCanvasSize() {
  let maxX = 0,
    maxY = 0;
  flatNodes.value.forEach((node) => {
    const right = node.x + nodeWidth;
    const bottom = node.y + nodeHeight;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  });
  canvasWidth.value = maxX + margin * 2;
  canvasHeight.value = maxY + margin * 2;
}

// --- Drawing Functions ---
function drawNode(ctx, node) {
  const x = node.x + margin;
  const y = node.y + margin;
  const { ID, Title, Description } = node;
  if (selectedNodeId.value === ID) {
    ctx.fillStyle = "#228833";
  } else if (hoveredNodeId.value === ID) {
    ctx.fillStyle = "#005577";
  } else {
    ctx.fillStyle = "#004466";
  }
  ctx.fillRect(x, y, nodeWidth, nodeHeight);
  ctx.fillStyle = "white";
  ctx.font = "12px Satoshi";
  ctx.textAlign = "center";
  const labelShort = getEllipsedText(ctx, Title, nodeWidth - 10);
  ctx.fillText(labelShort, x + nodeWidth / 2, y + 20);
  ctx.fillStyle = "#e0e0e0";
  ctx.fillRect(x + 20, y + 30, 100, 15);
  ctx.fillStyle = "black";
  ctx.font = "12px Satoshi";
  ctx.fillText(Description, x + nodeWidth / 2, y + 42);
}

function getEllipsedText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  while (text.length > 0) {
    text = text.slice(0, -1);
    if (ctx.measureText(text + "…").width <= maxWidth) return text + "…";
  }
  return "…";
}

function drawEdge(ctx, from, to) {
  ctx.strokeStyle = "#444";
  ctx.beginPath();
  ctx.moveTo(from.x + nodeWidth / 2 + margin, from.y + nodeHeight + margin);
  ctx.lineTo(to.x + nodeWidth / 2 + margin, to.y + margin);
  ctx.stroke();
}

// --- Animation and Redraw ---
function animateDrawing(ctx) {
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
  props.edges.forEach(([fromId, toId]) => {
    drawEdge(ctx, idToNode.value[fromId], idToNode.value[toId]);
  });
  for (let i = 0; i <= animationIndex.value; i++) {
    drawNode(ctx, flatNodes.value[i]);
  }
  if (animationIndex.value < flatNodes.value.length - 1) {
    animationIndex.value++;
    requestAnimationFrame(() => animateDrawing(ctx));
  }
}

function redrawCanvas() {
  const ctx = canvas.value.getContext("2d");
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
  props.edges.forEach(([fromId, toId]) => {
    drawEdge(ctx, idToNode.value[fromId], idToNode.value[toId]);
  });
  flatNodes.value.forEach((node) => drawNode(ctx, node));
}

// --- Mouse Events ---
function handleMouseMove(event) {
  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left - margin;
  const y = event.clientY - rect.top - margin;
  const node = flatNodes.value.find(
    (n) => x >= n.x && x <= n.x + nodeWidth && y >= n.y && y <= n.y + nodeHeight
  );
  const hoveredId = node ? node.ID : null;
  if (hoveredNodeId.value !== hoveredId) {
    hoveredNodeId.value = hoveredId;
    redrawCanvas();
    canvas.value.style.cursor = hoveredId ? "pointer" : "default";
  }
}

function handleCanvasClick(event) {
  const ID = ((event) => {
    const rect = canvas.value.getBoundingClientRect();
    const x = event.clientX - rect.left - margin;
    const y = event.clientY - rect.top - margin;
    for (const node of flatNodes.value) {
      if (
        x >= node.x &&
        x <= node.x + nodeWidth &&
        y >= node.y &&
        y <= node.y + nodeHeight
      ) {
        selectedNodeId.value = node.ID;
        redrawCanvas();

        return node.ID;
      }
    }
    selectedNodeId.value = null;
    redrawCanvas();
    return "";
  })(event);

  if (props.onClick) props.onClick(ID);
}

// --- Lifecycle: Build and Draw Graph ---
onMounted(() => {
  if (!props.nodes.length || !props.edges.length) {
    canvasWidth.value = 0;
    canvasHeight.value = 0;
    return;
  }
  const ctx = canvas.value.getContext("2d");
  const root = buildTree(props.nodes, props.edges);
  layoutTree(root);
  flatNodes.value = flattenTree(root);
  idToNode.value = Object.fromEntries(flatNodes.value.map((n) => [n.ID, n]));
  computeCanvasSize();
  animateDrawing(ctx);
});

watch([() => props.nodes, () => props.edges], ([newNodes, newEdges]) => {
  if (!newNodes.length || !newEdges.length) {
    canvasWidth.value = 0;
    canvasHeight.value = 0;
    return;
  }

  const ctx = canvas.value.getContext("2d");
  const root = buildTree(newNodes, newEdges);
  layoutTree(root);
  flatNodes.value = flattenTree(root);
  idToNode.value = Object.fromEntries(flatNodes.value.map((n) => [n.ID, n]));
  computeCanvasSize();
  animationIndex.value = 0;
  animateDrawing(ctx);
});
</script>

<style scoped>
div {
  text-align: center;
  position: sticky;
  background: #fffffff0;
  z-index: 10;
  overflow: auto;
  transition: 0.3s ease-in-out;
}
div:hover {
  top: 0 !important;
}
</style>
