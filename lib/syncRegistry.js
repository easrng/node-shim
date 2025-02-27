let hooks = [];
exports.register = hooks.push.bind(hooks);
exports.sync = () => hooks.forEach((fn) => fn());
