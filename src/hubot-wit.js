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
const sessions = {};

module.exports = function(robot) {

  const firstEntityValue = (entities, entity) => {
    const val = entities && entities[entity] &&
      Array.isArray(entities[entity]) &&
      entities[entity].length > 0 &&
      entities[entity][0].value
    ;
    if (!val) {
      return null;
    }
    return typeof val === 'object' ? val.value : val;
  };

  const findOrCreateSession = (userid) => {
    let sessionId;
    // Let's see if we already have a session for the user userid
    Object.keys(sessions).forEach(k => {
      if (sessions[k].userid === userid) {
        // Yep, got it!
        sessionId = k;
      }
    });
    if (!sessionId) {
      // No session found for user userid, let's create a new one
      // Also possible to create a sessionId depending on the Date, e.g.: sessionId = new Date().toISOString();
      sessionId = "session-" + userid;
      sessions[sessionId] = {userid: userid, context: {}};
    }
    return sessionId;
  };

  robot.respond(/(.*)/i, function(res) {
    const query = res.match[1];
    sessionId = findOrCreateSession(res.message.user["id"]);
    if (sessions[sessionId].context !== {}) {
      context = sessions[sessionId].context;
    }

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
        const { entities, context } = request;
        console.log(entities);
        const botCommand = firstEntityValue(entities, "command");

        return new Promise(function(resolve, reject) {
          robot.emit(botCommand, res);

          return resolve();
        });
      }
    };

    const client = new Wit({accessToken: WIT_TOKEN, actions});

    client.runActions(findOrCreateSession(res.message.user["id"]), query, context)
      .then((ctx) => {
        context = ctx;
        // Save Context
        sessionId = findOrCreateSession(res.message.user["id"]);
        sessions[sessionId].context = ctx;
      })
      .catch(err => console.error(err))

    return;
  });

};
