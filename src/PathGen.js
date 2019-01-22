const java = require('java');
const mvn = require('node-java-maven');

module.exports = {};

mvn((err, mvnResults) => {
  if (err) {
    return console.error('could not resolve maven dependencies', err);
  }
  mvnResults.classpath.forEach((c) => {
    console.log(`adding ${c} to classpath`);
    java.classpath.push(c);
  });

  const Vector2 = java.import('org.team5499.monkeyLib.math.geometry.Vector2');
  const Rotation2d = java.import('org.team5499.monkeyLib.math.geometry.Rotation2d');
  const Pose2d = java.import('org.team5499.monkeyLib.math.geometry.Pose2d');
  const PathGenerator = java.import('org.team5499.monkeyLib.path.PathGenerator');

  function generatePath(points) {
    console.log('running generatePath()');
    const generator = new PathGenerator(1.1, 1.1, 1.1, 1.1);
    const waypoints = [];
    // var x = Double($(".x").val());
    // var y = Double($(".y").val());
    // var x = [0.0, 1.0, 3.0];
    // var y = [0.0, 1.0, 3.0];
    for (let i = 0; i < points.length; i += 1) {
      waypoints.push(
        Pose2d(Vector2(points[i][0], points[i][1]),
          Rotation2d(points[i][0], points[i][1], false)),
      );
    }
    const waypointsJava = java.newArray('org.team5499.monkeyLib.math.geometry.Pose2d', waypoints);
    const generated = generator.generatePathSync(false, waypointsJava, 1.1, 1.1, 1.1, 1.1);
    return (generated);
  }

  module.exports.generatePath = () => generatePath();
  return console.log('Path generation initialized');
});
