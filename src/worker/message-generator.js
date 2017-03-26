
function arrayRandom(array) {
  const randomizedIndex = Math.round(Math.random() * (array.length - 1));
  return array[randomizedIndex];
}

function generateFirstCheckInMessage(eventName, userName) {
  const praises = [
    '<eventName> is on! <userName> just appeared on scene!'
  ];

  const praise = arrayRandom(praises);
  return praise.replace('<eventName>', eventName)
    .replace('<userName>', userName);
}

function generateEventCheckInMessage(eventName, checkIns) {
  const praises = [
    '<eventName> is buzzing! <checkIns> people have checked in!'
  ];

  const praise = arrayRandom(praises);
  return praise.replace('<eventName>', eventName)
    .replace('<checkIns>', checkIns);
}

function generateFirstSimaMessage(name) {
  const praises = [
    '<name> is on it. First sima down!',
    '<name> just started wappu with first sima.',
    '<name> starts wappu! Congratulations on the first sima!'
  ];

  const praise = arrayRandom(praises);
  return praise.replace('<name>', name);
}

function generateTeamSimaMessage(team, simas) {
  // jscs:disable maximumLineLength
  const teamPraises = [
    '<team> might have some issues with breathalyzer tests, considering their <simas> simas.',
    '<team> must be really thirsty! They\'ve had <simas> simas.',
    'Keep <team> away from the bar. They\'re at <simas> simas already.',
    '<team> must have received a shipment from Estonia. They\'re chugging at <simas> simas already.',
    '<team> has gone full Sokka irti with <simas> simas.',
  ];
  // jscs:enable maximumLineLength

  const praise = arrayRandom(teamPraises);
  return praise.replace('<team>', team).replace('<simas>', simas);
}

function generateUserSimaMessage(name, simas) {
  const userPraises = [
    'Enjoy that <simas>th sima, <name>!',
    '<name> might have some issues with breathalyzer tests, considering her <simas> simas.',
    '<name> must be really thirsty! She\'s had <simas> simas.',
    'Keep <name> away from the bar. He\’s at <simas> simas already.',
    '<name> must have received a shipment from Estonia. She’s chugging at <simas> simas already',
    '<name> has gone full Sokka irti with <simas> simas',
  ];

  const praise = arrayRandom(userPraises);
  return praise.replace('<name>', name).replace('<simas>', simas);
}

function generateTeamScoreMessage(team, points) {
  const teamPraises = [
    'Jeden tag so schnell! <team> is now at <points> points!',
    'Look at <team>! They just crossed <points> points!',
    'Those fine folks at <team> just can\'t stop. <points> points already!'
  ];

  const praise = arrayRandom(teamPraises);
  return praise.replace('<team>', team).replace('<points>', points);
}

function generateUserScoreMessage(name, points) {
  const userPraises = [
    'Jeden tag so schnell! <name> is now at <points> points!',
    'That <name> just keeps on scoring. <points> already!',
    'This fine person <name> just can\'t stop. <points> points already!'
  ];

  const praise = arrayRandom(userPraises);
  return praise.replace('<name>', name).replace('<points>', points);
}

export {
  generateFirstSimaMessage,
  generateTeamSimaMessage,
  generateUserSimaMessage,
  generateTeamScoreMessage,
  generateUserScoreMessage,
  generateFirstCheckInMessage,
  generateEventCheckInMessage
};
