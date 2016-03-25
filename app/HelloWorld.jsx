import React from 'react';

export default class HelloWorld extends React.Component {
  render() {
    return (
      <h2 className="hello-world">
        <span className="hello-world__i">Hello, {this.props.name}</span>
      </h2>
    );
  }
}
