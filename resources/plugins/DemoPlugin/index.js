const beforeAspect = value => {
  return [`plugin ${value}`];
};

const aroundAspect = target => {
  target.getArgs()[0] = `demo ${target.getArgs()[0]}`;
  window.logger.trace(`function "postThem.homePage.sayHello" has been called, args: ${target.getArgs()}`);
  return `${target.proceed()} Welcome!`;
};

const afterAspect = value => {
  return `${value} Start time is ${new Date().toDateString()}.`;
};

class DemoPlugin {
  onMount() {
    window.sdk.aspect.registerBefore("postThem.homePage.sayHello", beforeAspect);
    window.sdk.aspect.registerAround("postThem.homePage.sayHello", aroundAspect);
    window.sdk.aspect.registerAfter("postThem.homePage.sayHello", afterAspect);
  }
}

module.exports = new DemoPlugin();
