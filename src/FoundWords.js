import React, { Component } from 'react';

const FoundWords = (props) => {
  return Object.keys(props.foundWords).map((word, index) => {
    return (
      <div className="found-word--container" key={word}>
        <div className="found-word"><p>{word}</p></div>
      </div>
    );
  });
};

export default FoundWords;