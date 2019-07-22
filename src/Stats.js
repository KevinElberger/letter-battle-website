import React, { Component } from 'react';

const Stats = (props) => {
  return (
    <div className="header">
      <h1>Round: { props.round }</h1>
      <p className="seconds">{ props.seconds }</p>
      <p className="score">Score: { Object.keys(props.foundWords).length }</p>
    </div>
  );
};

export default Stats;