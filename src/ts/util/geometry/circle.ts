export class Circle {
  public x: number;

  public y: number;

  public radius: number;

  constructor(x: number, y: number, radius: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  clone() {
    return new Circle(this.x, this.y, this.radius);
  }

  containsPoint({ x, y }: Readonly<{ x: number; y: number }>) {
    return (this.x - x) ** 2 + (this.y - y) ** 2 <= this.radius ** 2;
  }

  containsCircle(circle: Readonly<Circle>, threshold = 0) {
    const distance = Math.sqrt(
      (this.x - circle.x) ** 2 + (this.y - circle.y) ** 2,
    );
    return distance + circle.radius <= this.radius + threshold;
  }

  static toCircumcircle(rect: DOMRect | DOMRectReadOnly) {
    const x = rect.x + rect.width / 2;
    const y = rect.y + rect.height / 2;
    const radius = Math.sqrt(rect.width ** 2 + rect.height ** 2) / 2;
    return new Circle(x, y, radius);
  }

  static toIncircle(rect: DOMRect | DOMRectReadOnly) {
    const x = rect.x + rect.width / 2;
    const y = rect.y + rect.height / 2;
    const radius = Math.min(rect.width, rect.height) / 2;
    return new Circle(x, y, radius);
  }
}
