---
name: practical-ui-physics
description: David DeSandro (Flickity/Isotope) UI physics engine formulas including Hooke's Law attraction, momentum friction, resting position calculation, and rubber-band bounds for smooth React UI carousels.
---

# Practical UI Physics Engine Guide (by David DeSandro)

This skill provides physics algorithms derived from David DeSandro's `practical-ui-physics` library (`.agents/skills/practical-ui-physics/`). Use these formulas whenever building interactive carousels, spring drag components, sliders, or canvas animations.

## Core Physics Concepts

### 1. Velocity Integration & Friction
In each frame (`requestAnimationFrame`):
```javascript
velocityX *= friction; // default friction = 0.95 or 0.93
positionX += velocityX;
```

### 2. Drag Force (Direct Track Mouse/Touch Follow)
While dragging:
```javascript
function applyDragForce() {
  if (!isDragging) return;
  var dragVelocity = dragPositionX - positionX;
  var dragForce = dragVelocity - velocityX;
  velocityX += dragForce;
}
```

### 3. Boundary Spring Attraction (David DeSandro Algorithm)
```javascript
function applyBoundForce(bound, isForward) {
  var isInside = isForward ? positionX < bound : positionX > bound;
  if (isDragging || isInside) return;

  var distance = bound - positionX;
  var force = distance * 0.1;
  var restX = positionX + (velocityX + force) * friction / (1 - friction);
  var isRestOutside = isForward ? restX > bound : restX < bound;

  if (isRestOutside) {
    velocityX += force;
    return;
  }
  // bounce back to align exactly at boundary
  force = distance * 0.1 - velocityX;
  velocityX += force;
}
```

### 4. Resting Position Calculation
Calculates where a particle will land after coasting with friction:
```javascript
var restX = positionX + (velocityX / (1 - friction));
```

### 5. Hooke's Law Target Attraction (Flickity Cell Snapping)
To attract an element to a target cell position:
```javascript
function applyAttraction(targetX) {
  var distance = targetX - positionX;
  var force = distance * 0.05; // spring constant
  velocityX += force;
}
```

## React Integration Pattern
- Use `requestAnimationFrame` loop.
- Apply transforms via GPU-accelerated `translate3d(positionX, 0, 0)`.
- Keep state mutations inside `useRef` to prevent React re-renders during 60 FPS / 120 FPS animation loops.
