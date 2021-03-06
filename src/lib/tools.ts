import { fabric } from "fabric";

// projects the point x2, y2 to the vector with origin ox, oy and direction vx, vy. returns the square distance and the coordinates of the projection.
const project = (
  ox: number,
  oy: number,
  vx: number,
  vy: number,
  x2: number,
  y2: number
): number[] => {
  const x = x2 - ox,
    y = y2 - oy;
  const side = vx * y - vy * x;
  const sq = vx * vx + vy * vy;
  return [
    Math.abs(side) / sq,
    ox + x + (vy * side) / sq,
    oy + y - (vx * side) / sq,
  ];
};

// given the origin x, y, snaps the point x2, y2 to the nearest vector in dirs
const rectify = (
  dirs: number[][],
  x: number,
  y: number,
  x2: number,
  y2: number
): number[] => {
  return dirs
    .map((d) => project(x, y, d[0], d[1], x2, y2))
    .reduce((acc, cur) => (acc[0] < cur[0] ? acc : cur));
};

export const enum Tool {
  Move,
  Pen,
  Eraser,
  Laser,
  Line,
  Rectangle,
  Ellipse,
}

export interface ToolHandler {
  tool: Tool;
  isBrush: boolean;

  draw?: (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ) => Promise<fabric.Object>;

  resize?: (
    object: fabric.Object,
    x2: number,
    y2: number,
    strict: boolean
  ) => Promise<fabric.Object>;

  setBrush?: (brush: any, options: fabric.IObjectOptions) => Promise<void>;
}

export class MoveHandler implements ToolHandler {
  tool: Tool = Tool.Move;
  isBrush: boolean = false;

  setBrush = async (
    brush: any,
    options: fabric.IObjectOptions
  ): Promise<void> => {};
}

export class PenHandler implements ToolHandler {
  tool: Tool = Tool.Pen;
  isBrush: boolean = true;

  setBrush = async (
    brush: any,
    options: fabric.IObjectOptions
  ): Promise<void> => {
    brush.color = options.stroke;
    brush.strokeDashArray = options.strokeDashArray;
    brush.width = options.strokeWidth;
  };
}

export class EraserHandler implements ToolHandler {
  tool: Tool = Tool.Eraser;
  isBrush: boolean = true;

  setBrush = async (
    brush: any,
    options: fabric.IObjectOptions
  ): Promise<void> => {
    brush.color = "#ff005455";
    brush.strokeDashArray = [0, 0];
    brush.width = 5 * options.strokeWidth;
  };
}

export class LaserHandler implements ToolHandler {
  tool: Tool = Tool.Laser;
  isBrush: boolean = true;

  setBrush = async (
    brush: any,
    options: fabric.IObjectOptions
  ): Promise<void> => {
    brush.color = "#f23523";
    brush.strokeDashArray = [0, 0];
    brush.width = options.strokeWidth;
  };
}

export class LineHandler implements ToolHandler {
  tool: Tool = Tool.Line;
  isBrush: boolean = false;
  x: number;
  y: number;

  dirs: number[][] = [
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
  ];

  draw = async (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<fabric.Line> => {
    this.x = x;
    this.y = y;

    return new Promise<fabric.Line>((resolve) => {
      resolve(new fabric.Line([x, y, x2, y2], options));
    });
  };

  resize = async (
    object: fabric.Line,
    x2: number,
    y2: number,
    strict: boolean
  ): Promise<fabric.Line> => {
    if (strict) {
      const rect = rectify(this.dirs, this.x, this.y, x2, y2);
      x2 = rect[1];
      y2 = rect[2];
    }
    object.set({ x2, y2 }).setCoords();
    return new Promise<fabric.Line>((resolve) => {
      resolve(object);
    });
  };
}

export class RectangleHandler implements ToolHandler {
  tool: Tool = Tool.Rectangle;
  isBrush: boolean = false;
  x: number;
  y: number;

  dirs: number[][] = [
    [1, 1],
    [-1, 1],
  ];

  draw = async (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<fabric.Rect> => {
    this.x = x;
    this.y = y;

    return new Promise<fabric.Rect>((resolve) => {
      resolve(
        new fabric.Rect({ left: x, top: y, width: x2, height: y2, ...options })
      );
    });
  };

  resize = async (
    object: fabric.Rect,
    x2: number,
    y2: number,
    strict: boolean
  ): Promise<fabric.Rect> => {
    if (strict) {
      const rect = rectify(this.dirs, this.x, this.y, x2, y2);
      x2 = rect[1];
      y2 = rect[2];
    }
    object
      .set({
        originX: this.x > x2 ? "right" : "left",
        originY: this.y > y2 ? "bottom" : "top",
        width: Math.abs(this.x - x2),
        height: Math.abs(this.y - y2),
      })
      .setCoords();

    return new Promise<fabric.Rect>((resolve) => {
      resolve(object);
    });
  };
}

export class EllipseHandler implements ToolHandler {
  tool: Tool = Tool.Ellipse;
  isBrush: boolean = false;
  x: number;
  y: number;

  dirs: number[][] = [
    [1, 1],
    [-1, 1],
  ];

  draw = async (
    x: number,
    y: number,
    options: fabric.IObjectOptions,
    x2?: number,
    y2?: number
  ): Promise<fabric.Ellipse> => {
    this.x = x;
    this.y = y;

    return new Promise<fabric.Ellipse>((resolve) => {
      resolve(
        new fabric.Ellipse({ left: x, top: y, rx: x2, ry: y2, ...options })
      );
    });
  };

  resize = async (
    object: fabric.Ellipse,
    x2: number,
    y2: number,
    strict: boolean
  ): Promise<fabric.Ellipse> => {
    if (strict) {
      const rect = rectify(this.dirs, this.x, this.y, x2, y2);
      x2 = rect[1];
      y2 = rect[2];
    }
    object
      .set({
        originX: this.x > x2 ? "right" : "left",
        originY: this.y > y2 ? "bottom" : "top",
        rx: Math.abs(x2 - object.left) / 2,
        ry: Math.abs(y2 - object.top) / 2,
      })
      .setCoords();

    return new Promise<fabric.Ellipse>((resolve) => {
      resolve(object);
    });
  };
}

export const Handlers = [
  new MoveHandler(),
  new PenHandler(),
  new EraserHandler(),
  new LaserHandler(),
  new LineHandler(),
  new RectangleHandler(),
  new EllipseHandler(),
];
