module.exports = { ...module.exports, ...require("./shared.validation") };
module.exports = { ...module.exports, ...require("./registration.validation") };
module.exports = { ...module.exports, ...require("./activation.validation") };
module.exports = { ...module.exports, ...require("./session.validation") };
module.exports = { ...module.exports, ...require("./password.validation") };
module.exports = { ...module.exports, ...require("./profile.validation") };
module.exports = { ...module.exports, ...require("./emailChange.validation") };
module.exports = {
  ...module.exports,
  ...require("./accountDeletion.validation"),
};
