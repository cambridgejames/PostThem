const LOGGER = window.log.getLogger();

const beforeAspect = value => {
  return [`plugin ${value}`];
};

const aroundAspect = target => {
  target.getArgs()[0] = `demo ${target.getArgs()[0]}`;
  LOGGER.trace(`function "postThem.aspect.homePage.sayHello" has been called, args: ${target.getArgs()}`);
  return `${target.proceed()} Welcome!`;
};

const afterAspect = value => {
  return `${value} Start time is ${new Date().toDateString()}.`;
};

class DemoPlugin {
  onMount() {
    window.sdk.aspect.registerBefore("postThem.aspect.homePage.sayHello", beforeAspect);
    window.sdk.aspect.registerAround("postThem.aspect.homePage.sayHello", aroundAspect);
    window.sdk.aspect.registerAfter("postThem.aspect.homePage.sayHello", afterAspect);
  }
}

module.exports = new DemoPlugin();
