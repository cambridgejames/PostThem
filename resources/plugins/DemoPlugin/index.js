const beforeAspect = value => {
  return [`plugin ${value}`];
};

const afterAspect = value => {
  return `${value} Start time: ${new Date().toISOString()}.`;
};

class DemoPlugin {
  onMount() {
    console.log("Hello, demo plugin!");
    window.sdk.aspect.registerBefore("postThem.homePage.sayHello", beforeAspect);
    window.sdk.aspect.registerAfter("postThem.homePage.sayHello", afterAspect);
  }
}

module.exports = new DemoPlugin();
