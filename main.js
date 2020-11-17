import { createElement, Component, render } from "./toy-react";
class MyComponet extends Component {
  render() {
    return (
      <div>
        <h1>my component</h1>
        {this.children}
      </div>
    );
  }
}

render(
  <MyComponet id="a" class="c">
    <div>abc</div>
    <div></div>
    <div></div>
  </MyComponet>,
  document.body
);
