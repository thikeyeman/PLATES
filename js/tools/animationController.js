class AnimationController {
    constructor() {
        this.animations = [];
    }

    addAnimation(name, animation) {
        this.animations[name] = animation;
    }

    runAnimation(obj, animationName) {
        const animation = this.animations[animationName];
        if (animation) {
            animation(obj);
        }

    }
}

const animationController = new AnimationController();

// Fade in animation
animationController.addAnimation("FadeIn", (obj) => {
    gsap.fromTo(obj, {}, {
        opacity: 1,
        duration: 4,
        ease: "power4.out",
        onUpdate: canvas.renderAll.bind(canvas),
        onStart: function () {
            canvas.on('object:modified', function () {
                subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
            });

            canvas.on('after:render', function () {
                subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
            });
        },
        onComplete: function () {
            canvas.off('object:modified');
            canvas.off('after:render');
        }
    });
});

// Fade out animation
animationController.addAnimation("FadeOut", (obj) => {
    gsap.fromTo(obj, {}, {
        opacity: 0,
        duration: 1,
        ease: "power4.out",
        onUpdate: canvas.renderAll.bind(canvas),
        onStart: function () {
            canvas.on('object:modified', function () {
                subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
            });

            canvas.on('after:render', function () {
                subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
            });
        },
        onComplete: function () {
            canvas.off('object:modified');
            canvas.off('after:render');
        }
    });
});

//FlyIn animation
animationController.addAnimation("FloatIn", (obj => {
    gsap.fromTo(obj, {
        opacity: 0,
        top: obj.height,
    }, {
        opacity: 1,
        top: obj.top,
        duration: 2,
        ease: "Power2.Out",
        onUpdate: canvas.renderAll.bind(canvas),
        onStart: function () {
            canvas.on('object:modified', function () {
                subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
            });

            canvas.on('after:render', function () {
                subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
            });
        },
        onComplete: function () {
            canvas.off('object:modified');
            canvas.off('after:render');
        }
    });
}));
// Move animation
animationController.addAnimation("SlideIn", (obj) => {
    gsap.fromTo(obj, {
        left: -obj.width,
    }, {
        left: obj.left,
        duration: 1,
        ease: "Power2.Out",
        onUpdate: canvas.renderAll.bind(canvas),
        onStart: function () {
            canvas.on('object:modified', function () {
                subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
            });

            canvas.on('after:render', function () {
                subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
            });
        },
        onComplete: function () {
            canvas.off('object:modified');
            canvas.off('after:render');
        }
    });
});

animationController.addAnimation("ZoomOut", (obj) => {
    gsap.fromTo(obj, {}, {
        scaleX: 0,
        scaleY: 0,
        duration: 1,
        ease: "Power2.Out",
        onUpdate: canvas.renderAll.bind(canvas),
        onStart: function () {
            canvas.on('object:modified', function () {
                subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
            });

            canvas.on('after:render', function () {
                subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
            });
        },
        onComplete: function () {
            canvas.off('object:modified');
            canvas.off('after:render');
        }
    });
});

// Rotate animation
animationController.addAnimation("spin", (obj) => {
    gsap.fromTo(obj, {}, {
        rotate: 360,
        duration: 2,
        ease: "Power2.inOut",
        onUpdate: canvas.renderAll.bind(canvas),
        onStart: function () {
            canvas.on('object:modified', function () {
                subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
            });

            canvas.on('after:render', function () {
                subCanvasInstance.loadFromJSON(canvas.toObject(), subCanvasInstance.renderAll.bind(subCanvasInstance));
            });
        },
        onComplete: function () {
            canvas.off('object:modified');
            canvas.off('after:render');
        }
    });
});
