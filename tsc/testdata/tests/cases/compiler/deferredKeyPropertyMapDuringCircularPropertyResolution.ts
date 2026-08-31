interface ObjectFor {
    AmbientLight: { layer: typeof LightingLayer };
    AmbientSound: { a: 1 };
    Drawing: { a: 1 };
    MeasuredTemplate: { a: 1 };
    Note: { a: 1 };
    Region: { a: 1 };
    Tile: { a: 1 };
    Token: { a: 1 };
    Wall: { a: 1 };
}

declare class PlaceablesLayer<N extends keyof ObjectFor> {
    onWheel(): Promise<ObjectFor[N] | ObjectFor[N][]>;
}

declare abstract class AnyPlaceablesLayer extends PlaceablesLayer<keyof ObjectFor> {
    constructor(...args: never);
}

declare function ShapeLayerMixin<B extends typeof AnyPlaceablesLayer>(Base: B): B;

declare class AmbientLightPlaceablesLayer extends PlaceablesLayer<"AmbientLight"> {}

declare class LightingLayer extends ShapeLayerMixin(AmbientLightPlaceablesLayer) {}
