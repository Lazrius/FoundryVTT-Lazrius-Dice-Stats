class DiceStatsLayer extends CanvasLayer {
    constructor() {
        super();
    }

    static get layerOptions() {
        return foundry.utils.mergeObject(super.layerOptions, {
            name: "dice-stats",
            zIndex: 255,
        });
    }

    activate() {
        CanvasLayer.prototype.activate.apply(this);
        return this;
    }

    deactivate() {
        CanvasLayer.prototype.deactivate.apply(this);
        return this;
    }

    draw() {
        super.draw();
        return this;
    }
}

export const RegisterLayer = (): void => {
    const layers = {
        "dice-stats": {
            layerClass: DiceStatsLayer,
            group: "primary"
        }
    };

    CONFIG.Canvas.layers = foundry.utils.mergeObject(Canvas.layers, layers);

    if (!Object.is(Canvas.layers, CONFIG.Canvas.layers)) {
        const layers = Canvas.layers;
        Object.defineProperty(Canvas, 'layers', {
            get: function () {
                return {...layers, ...CONFIG.Canvas.layers};
            }
        })
    }
};