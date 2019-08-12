const Dev = require("../models/Dev");

module.exports = {
  async store(req, res) {
    const { devId } = req.params;
    const { user } = req.headers;

    const loggedDev = await Dev.findById(user);
    const targetDev = await Dev.findById(devId);

    if (!targetDev) res.status(400).json({ error: "dev not exists" });

    if (targetDev.likes.includes(loggedDev._id)) {
      const loggedSocket = req.connectedUsers[user];
      const targetSocket = req.connectedUsers[devId];

      if (loggedSocket) {
        console.log("loggedSocket");
        req.io.to(loggedSocket).emit("match", targetDev);
      }

      if (targetSocket) {
        console.log("targetSocket");
        req.io.to(targetSocket).emit("match", loggedDev);
      }
    }

    loggedDev.likes.push(targetDev._id);

    await loggedDev.save();

    return res.json(loggedDev);
  }
};
