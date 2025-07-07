<template>
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
import { ref, onMounted, watch } from "vue";

const props = defineProps({
  nodes: Array,
  edges: Array,
  onClick: Function,
});

const nodeWidth = 140;
const nodeHeight = 24; // smaller height
const levelHeight = 200;
const spacing = 20; // reduced vertical spacing
const margin = 20;
const verticalCompression = 0.8; // compress vertical spacing by 20%

const canvasWidth = ref(0);
const canvasHeight = ref(0);
const flatNodes = ref([]);
const idToNode = ref({});
const selectedNodeId = ref(null);
const hoveredNodeId = ref(null);
const canvas = ref(null);

// Tree building and layout
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
  let y = 0;
  const dfs = (node, depth = 0) => {
    node.x = depth * levelHeight;
    if (!node.children.length) {
      node.y = y * (nodeHeight + spacing) * verticalCompression;
      y++;
    } else {
      node.children.forEach((child) => dfs(child, depth + 1));
      const first = node.children[0];
      const last = node.children.at(-1);
      node.y = (first.y + last.y) / 2;
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

function computeCanvasSize() {
  let maxX = 0,
    maxY = 0;
  flatNodes.value.forEach((node) => {
    const right = node.x + nodeWidth + 32; // added extra space for description
    const bottom = node.y + nodeHeight;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  });
  canvasWidth.value = Math.min(maxX + margin * 2, 1800);
  canvasHeight.value = Math.min(maxY + margin * 2, 600); // reduced max canvas height
}

// Draw functions
function drawNode(ctx, node) {
  const x = node.x + margin;
  const y = node.y + margin;
  const { ID, Title, Description } = node;

  // Node background
  ctx.fillStyle =
    selectedNodeId.value === ID
      ? "#228833"
      : hoveredNodeId.value === ID
        ? "#005577"
        : "#2b70c9";

  const radius = 8;
  roundedRect(ctx, x, y, nodeWidth, nodeHeight, radius);
  ctx.fill();

  // Title (single line centered with ellipsis)
  ctx.fillStyle = "white";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const maxTitleWidth = nodeWidth - 10;
  const displayedTitle = truncateText(ctx, Title, maxTitleWidth);

  ctx.fillText(displayedTitle, x + nodeWidth / 2, y + nodeHeight / 2);

  // Description (to the right, vertically centered)
  ctx.fillStyle = "#444";
  ctx.font = "12px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const descX = x + nodeWidth + 10; // 10px padding from node box
  const descY = y + nodeHeight / 2;
  ctx.fillText(Description, descX, descY);
}

function truncateText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (
    ctx.measureText(truncated + "…").width > maxWidth &&
    truncated.length > 0
  ) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "…";
}

function drawEdge(ctx, from, to) {
  ctx.strokeStyle = "#444";
  ctx.beginPath();
  ctx.moveTo(from.x + nodeWidth + margin, from.y + nodeHeight / 2 + margin);
  ctx.lineTo(to.x + margin, to.y + nodeHeight / 2 + margin);
  ctx.stroke();
}

function redrawCanvas() {
  const ctx = canvas.value.getContext("2d");
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
  props.edges.forEach(([fromId, toId]) => {
    drawEdge(ctx, idToNode.value[fromId], idToNode.value[toId]);
  });
  flatNodes.value.forEach((node) => drawNode(ctx, node));
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Interaction
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
      if (props.onClick) props.onClick(node.ID);
      return;
    }
  }
  selectedNodeId.value = null;
  redrawCanvas();
  if (props.onClick) props.onClick("");
}

// Main render
function renderGraph() {
  if (!props.nodes.length || !props.edges.length) return;

  const root = buildTree(props.nodes, props.edges);
  layoutTree(root);
  flatNodes.value = flattenTree(root);
  idToNode.value = Object.fromEntries(flatNodes.value.map((n) => [n.ID, n]));
  computeCanvasSize();

  requestAnimationFrame(() => {
    redrawCanvas();
  });
}

// Lifecycle
onMounted(renderGraph);
watch([() => props.nodes, () => props.edges], renderGraph);
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
