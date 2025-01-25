const beforeAspect = value => {
  return [`plugin ${value}`];
};

class DemoPlugin {
  onMount() {
    console.log("Hello, demo plugin!");
    window.sdk.aspect.registerBefore("postThem.homePage.sayHello", beforeAspect);
  }
}

module.exports = new DemoPlugin();
