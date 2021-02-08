let trackClients = {};
function rateLimit(value){
  value = Object.assign({maxClient: 10, time: 1 * 6000, statusCode: 429});
  function checkClient(req, res, next){
    let currentTime = Date.now(); 
    let difference = currentTime - value.time;
    let clientIP = req.ip;
    let track = trackClients[clientIP];
    if(track == null){
      let newClient = [];
      let newRequest = { clientTime: currentTime, clientCount: 1};
      newClient.push(newRequest);
      trackClients[clientIP] = JSON.stringify(newClient);
      return next(); //Make sure to not trigger a callback a second time.
    }
    let data = JSON.parse(track);
    let acceptedTime = data.filter(entry => { return entry.clientTime > difference;});
    trackClients[clientIP] = JSON.stringify(acceptedTime);
    let currentCount = acceptedTime.reduce((accumlator, entry) => { return accumlator + entry.clientCount;}, 0);
    if(currentCount >= value.maxClient){
      return res.status(value.statusCode).send("Client submitted too many messages, try again later");
    } else {
      data.push({clientTime: currentTime, clientCount: 1});
      trackClients[clientIP] = JSON.stringify(data); 
    }
    return next();
  }
    return checkClient;
};
module.exports = rateLimit;