class Pose2d {
  constructor(translation, rotation) {
    this.translation = translation;
    this.rotation = rotation;
  }
  
  get getTranslation() {
    return this.translation;
  }

  get getRotation() {
    return this.rotation;
  }

  transformBy(other) {
    return new Pose2d(this.translation.translateBy(other.translation.rotateBy(this.rotation)),
      this.rotation.rotateBy(other.rotation));
  }

  inverse() {
    const rotationInverted = this.rotation.inverse();
    return new Pose2d(this.translation.inverse().rotateBy(rotationInverted), rotationInverted);
  }

  normal() {
    return new Pose2d(this.translation, this.rotation.normal());
  }

  heading(other) {
    return Math.atan2(this.translation.y - other.translation.y,
      this.translation.x - other.translation.x);
  }
  
  distance(other) {
    return Math.hypot(this.translation.x - other.translation.x, this.translation.y - other.translation.y)
  }

  draw(drawHeading, radius, ctx) {
    this.translation.draw(null, radius, ctx);

    if (!drawHeading) {
      return;
    }

    const x = this.translation.drawX;
    const y = this.translation.drawY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 25 * Math.cos(-this.rotation.getRadians()),
      y + 25 * Math.sin(-this.rotation.getRadians()));
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();
  }

  setPoint(x,y,heading){
    this.x = x || this.x;
    this.y = y || this.y;
    this.heading = heading || this.heading;
    // $($(this.row.children()[1]).children()[0]).val(this.x);
    // $($(this.row.children()[2]).children()[0]).val(this.y);
  }

  toString() {
    return `${this.translation.x}, ${this.translation.y}, ${this.rotation.getDegrees()}`
  }

  transform(other) {
    other.position.rotate(this.rotation);
    this.translation.translate(other.translation);
    this.rotation.rotate(other.rotation);
  }

  get x() { return this.translation.x; }
  get y() { return this.translation.y; }
  get heading() { return this.rotation.getDegrees(); }

  set x(val){ this.translation.x = val; }
  set y(val){ this.translation.y = val; }
  set heading(val) {this.rotation = Rotation2d.fromDegrees(val)}
}

module.exports = Pose2d;
