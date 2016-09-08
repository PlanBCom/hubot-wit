// Description
//   Talking with a Wit robot
//
// Configuration:
//   WIT_TOKEN
//
// Commands:
//   None
//
// Notes:
//   <optional notes required for the script>
//
// Author:
//   Adriano Godoy

const {Wit, log, interactive} = require('node-wit');
const WIT_TOKEN = process.env.WIT_TOKEN;

module.exports = function(robot) {

  robot.respond(/(.*)/i, function(res) {
    const query = res.match[1];
    let context = {};

    const actions = {
      send(request, response) {
        const {sessionId, context, entities} = request;
        const {text, quickreplies} = response;

        return new Promise(function(resolve, reject) {
          res.reply(text);
          return resolve();
        });
      },
      missing(request) {
        const { entities } = request;
        const botCommand = firstEntityValue(entities, "command");

        robot.emit(botCommand);

        return new Promise(function(resolve, reject) {
          return reject();
        });
      }
    };

    const client = new Wit({accessToken: WIT_TOKEN, actions});

    client.runActions("session-" + res.message.user["id"], query, context)
      .then((ctx) => {
        context = ctx;
      })
      .catch(err => console.error(err))

    return;
  });

};
