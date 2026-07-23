module.exports = { ...module.exports, ...require("./registration.controller") };
module.exports = { ...module.exports, ...require("./activation.controller") };
module.exports = { ...module.exports, ...require("./session.controller") };
module.exports = { ...module.exports, ...require("./password.controller") };
module.exports = { ...module.exports, ...require("./profile.controller") };
module.exports = { ...module.exports, ...require("./emailChange.controller") };
module.exports = {
  ...module.exports,
  ...require("./accountDeletion.controller"),
};
