const createError = require("http-errors");
const User = require("../models/User");
const Message = require("../models/Message");

//Search for messages by id's from user's list
//Combine all messages into an array for response
exports.readMessages = async (req, res, next) => {
  const sender = req.user.id;
  await User.findById({ _id: sender }, async (err, user) => {
    if (err) return next(createError(400, "Internal error occurred"));
    if (!user) return next(createError(400, "User wasn't found"));
    if (user) {
      let messageList = await Promise.all(
        user.messages.map(async msg => {
          return await Message.findById({ _id: msg });
        })
      );
      res.json({ error: false, messages: messageList });
    }
  });
};

exports.sendMessage = async (req, res, next) => {
  const { receiver, content } = req.body;
  const sender = req.user.id;
  //add message to database collection
  const newMessage = new Message({
    sender: sender,
    receiver,
    content,
    timeStamp: new Date(),
  });
  await newMessage.save();
  //update sender's message list
  await User.findById({ _id: sender }, async (err, user) => {
    if (err) return next(createError(400, "Internal error occurred"));
    if (!user) return next(createError(400, "User wasn't found"));
    if (user) {
      user.messages.push(newMessage._id);
      await user.save();
    }
  });
  //update receiver's message list
  await User.findById({ _id: receiver }, async (err, user) => {
    if (err) return next(createError(400, "Internal error occurred"));
    if (!user) return next(createError(400, "User wasn't found"));
    if (user) {
      user.messages.push(newMessage._id);
      await user.save();
    }
  });

  //front-end should handle updating UI with new message
  res.json({ error: false });
};
