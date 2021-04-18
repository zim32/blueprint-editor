export function getElementCenterPoint(el) {
    const bbox = el.getBoundingClientRect();

    return {
        x: bbox.x + bbox.width/2,
        y: bbox.y + bbox.height/2,
    }
}