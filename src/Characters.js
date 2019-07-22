import React, { Component } from 'react';

const Characters = (props) => {
  return props.letters.split('').map((character, i) => {
    return (
      <div className={'character' + (props.word.indexOf(character) > -1 ? ' active' : '')} key={i}>
        <h3>{ character } </h3>
      </div>
    );
  });
};

export default Characters;