import React, { Component } from 'react';

class Timeago extends Component {
  constructor(props) {
    super(props);
    this.state = {
      timeago: this.props.timestamp
    }
  }
  
  componentDidMount() {
    if ( Number.isInteger(this.props.timestamp) ) {
      this.tick();
      this.interval = setInterval(this.tick.bind(this), 20000);
    }
  }
  
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  
  tick() {
    this.setState({ timeago: this.transform(this.props.timestamp) });
  }
  
  transform(timestamp) {
    let periods = [
        {name: 'a moment', division: 60 * 1000}, 
        {name: 'minutes', division: 60}, 
        {name: 'hours', division: 24}, 
        {name: 'days', division: 7}, 
        {name: 'weeks', division: 4.333}, 
        {name: 'months', division: 31}, 
        {name: 'years', division: 12}];
      let smallestInt = Date.now() - timestamp;
      let period = periods.find( (p, i) => (smallestInt /= p.division) < 1 );
      let figure = period.name === 'a moment' ? 'just' : Math.floor(smallestInt * period.division);
      let periodName = figure === 1 ? period.name.replace(/s$/,'') : period.name;
      return `${figure} ${periodName} ago`;
  }
  
  render() {
    return (
      <div className="timeago">{ this.state.timeago }</div>
    )
  }
}

export default Timeago;