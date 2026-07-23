module.exports = { ...module.exports, ...require("./registration.service") };
module.exports = { ...module.exports, ...require("./activation.service") };
module.exports = { ...module.exports, ...require("./authentication.service") };
module.exports = {
  ...module.exports,
  ...require("./passwordRecovery.service"),
};
module.exports = { ...module.exports, ...require("./profile.service") };
module.exports = { ...module.exports, ...require("./passwordChange.service") };
module.exports = { ...module.exports, ...require("./session.service") };
module.exports = { ...module.exports, ...require("./emailChange.service") };
module.exports = { ...module.exports, ...require("./accountDeletion.service") };
