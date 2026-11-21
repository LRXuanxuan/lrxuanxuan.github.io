/* Editable Bézier paths stay with their layers until they are painted. */
(function () {
  'use strict';
  window.createStudioPenPath = function (overlay, updateControls) {
    const ns = 'http://www.w3.org/2000/svg';
    const maxNodes = 2048, coordinateLimit = 1000000;
    let layer = null, drag = null;

    function read(value, id) {
      const empty = { nodes: [], selected: -1 };
      if (!value || value.layerId !== id || !Array.isArray(value.nodes) ||
          !value.nodes.length || value.nodes.length > maxNodes) return empty;
      const nodes = [];
      for (const node of value.nodes) {
        if (!node || !['x', 'y', 'dx', 'dy'].every(key => Number.isFinite(node[key]) && Math.abs(node[key]) <= coordinateLimit)) return empty;
        nodes.push({ x: node.x, y: node.y, dx: node.dx, dy: node.dy });
      }
      const selected = Number.isInteger(value.selected) && value.selected >= 0 && value.selected < nodes.length ? value.selected : nodes.length - 1;
      const size = value.size, opacity = value.opacity;
      return { nodes, selected, ...(Number.isInteger(size) && size >= 1 && size <= 240 &&
        Number.isFinite(opacity) && opacity >= .01 && opacity <= 1 ? { size, opacity } : {}) };
    }
    function serialize(owner) {
      const state = owner.penDraft;
      if (!state?.nodes.length) return null;
      return { layerId: owner.id, nodes: state.nodes.map(node => ({ ...node })), selected: state.selected,
        ...(state.size != null ? { size: state.size, opacity: state.opacity } : {}) };
    }
    function element(tag, attrs) {
      const el = document.createElementNS(ns, tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      return el;
    }
    function segments(nodes, closed, visit) {
      for (let i = 1; i < nodes.length + (closed ? 1 : 0); i++) {
        const a = nodes[i - 1], b = nodes[i % nodes.length];
        visit(a.x + a.dx, a.y + a.dy, b.x - b.dx, b.y - b.dy, b.x, b.y);
      }
    }
    function show(zoom) {
      const nodes = layer?.penDraft.nodes || [];
      overlay.replaceChildren(); updateControls(nodes.length);
      if (!nodes.length) return;
      const selected = layer.penDraft.selected, scale = zoom * layer.scale;
      let d = 'M' + nodes[0].x + ' ' + nodes[0].y;
      segments(nodes, false, (...v) => { d += 'C' + v.join(' '); });
      const group = element('g', { class: 'pen-geometry', transform: 'translate(' + layer.x + ' ' + layer.y + ') scale(' + layer.scale + ')' });
      group.append(element('path', { d, class: 'pen-underlay' }), element('path', { d, class: 'pen-centerline' }));
      for (const [i, p] of nodes.entries()) {
        if (i === selected && (p.dx || p.dy)) {
          group.append(element('line', { x1: p.x - p.dx, y1: p.y - p.dy, x2: p.x + p.dx, y2: p.y + p.dy }));
          for (const sign of [-1, 1]) group.append(element('circle', { cx: p.x + sign*p.dx, cy: p.y + sign*p.dy, r: 3/scale }));
        }
        const r = 3.5 / scale;
        group.append(element('rect', { x: p.x-r, y: p.y-r, width: 2*r, height: 2*r, class: i === selected ? 'selected' : '' }));
      }
      overlay.append(group);
    }
    function attach(owner, zoom) {
      if (owner !== layer) drag = null;
      layer = owner; show(zoom);
    }
    function local(p) {
      const bound = n => Math.min(coordinateLimit, Math.max(-coordinateLimit, n));
      return { x: bound((p.x-layer.x)/layer.scale), y: bound((p.y-layer.y)/layer.scale) };
    }
    function start(point, zoom) {
      if (!layer) return false;
      const p = local(point), scale = zoom * layer.scale;
      const near = (x, y) => Math.hypot(x-p.x, y-p.y) <= 7 / scale;
      const state = layer.penDraft, nodes = state.nodes, current = nodes[state.selected];
      if (current && Math.hypot(current.dx, current.dy) > 8 / scale) {
        for (const sign of [-1,1]) if (near(current.x + sign*current.dx, current.y + sign*current.dy)) {
          drag = { kind:'handle', sign, before:{...current} }; return true;
        }
      }
      const hit = nodes.findIndex(n => near(n.x,n.y));
      if (hit >= 0) {
        state.selected = hit; drag = { kind:'move', before:{...nodes[hit]}, start:p };
      } else {
        if (nodes.length >= maxNodes) throw new Error('一条路径最多可放置 2048 个锚点，请先描边或闭合填色。');
        state.selected = nodes.length; nodes.push({ x:p.x, y:p.y, dx:0, dy:0 }); drag = { kind:'new', sign:1 };
      }
      show(zoom); return true;
    }
    function move(point, zoom) {
      if (!drag || !layer) return;
      const p = local(point), state = layer.penDraft, n = state.nodes[state.selected];
      const bound = v => Math.max(-coordinateLimit, Math.min(coordinateLimit, v));
      if (drag.kind === 'move') {
        n.x = bound(drag.before.x + p.x - drag.start.x); n.y = bound(drag.before.y + p.y - drag.start.y);
      } else {
        n.dx = bound(drag.sign*(p.x-n.x)); n.dy = bound(drag.sign*(p.y-n.y));
      }
      show(zoom);
    }
    function stop(cancelled, zoom) {
      if (!drag || !layer) return false;
      const state = layer.penDraft, nodes = state.nodes, before = drag.before;
      let edited = false;
      if (cancelled) {
        if (drag.kind === 'new') { nodes.pop(); state.selected = nodes.length-1; }
        else nodes[state.selected] = before;
      } else edited = drag.kind === 'new' || ['x','y','dx','dy'].some(key => nodes[state.selected][key] !== before[key]);
      drag = null; show(zoom); return edited;
    }
    function reset() {
      if (!layer?.penDraft.nodes.length) return false;
      layer.penDraft.nodes = []; layer.penDraft.selected = -1; drag = null; show(1); return true;
    }
    function remove(zoom) {
      if (!layer || layer.penDraft.selected < 0) return false;
      const state = layer.penDraft;
      state.nodes.splice(state.selected, 1); state.selected = Math.min(state.selected, state.nodes.length-1); show(zoom); return true;
    }
    function paint(ctx, owner, closed, width, color) {
      const nodes = layer?.penDraft.nodes;
      if (owner !== layer || !nodes || nodes.length < (closed ? 3 : 2)) return null;
      ctx.save(); ctx.beginPath(); ctx.moveTo(nodes[0].x,nodes[0].y);
      segments(nodes,closed,(...v) => ctx.bezierCurveTo(...v));
      if (closed) { ctx.closePath(); ctx.fillStyle = color; ctx.fill(); }
      else { ctx.strokeStyle = color; ctx.lineWidth = width/layer.scale; ctx.lineCap = ctx.lineJoin = 'round'; ctx.stroke(); }
      ctx.restore();
      let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
      for (const n of nodes) {
        left = Math.min(left, n.x-Math.abs(n.dx)); right = Math.max(right,n.x+Math.abs(n.dx));
        top = Math.min(top,n.y-Math.abs(n.dy)); bottom = Math.max(bottom,n.y+Math.abs(n.dy));
      }
      const padding = (closed ? 0 : width/(2*layer.scale)) + 2;
      return { x:left-padding, y:top-padding, width:right-left+padding*2, height:bottom-top+padding*2 };
    }
    return { read, serialize, attach, start, move, stop, reset, remove, show, paint, get length(){ return layer?.penDraft.nodes.length || 0; } };
  };
})();
