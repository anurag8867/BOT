const verifyWebhook = (req, res) => {
  let VERIFY_TOKEN = 'pusher-bot';

  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token === VERIFY_TOKEN) {
    console.log("200 as sttaus code in verify webhooks@11");
    res.status(200).send(challenge);
  } else {
    console.log("403 as sttaus code in verify webhooks@11");
      res.sendStatus(403);
    }
};

module.exports = verifyWebhook;
