import React, { Component } from 'react';
import './Messages.css';

import Timeago from './../timeago/timeago.js';
import defaultUserImage from './../assets/images/tomatoes-default-user-image.png';

class Messages extends Component {
  constructor (props) {
    super(props)
    this.state = {
      allMessages: [],
      displayedMessages: [],
      newMessageText: ''
    }
    this.messagesRef = this.props.firebase.database().ref('messages')
  }
  
  componentDidMount() {
    this.watchFirebaseForMessages();
    this.scrollToBottom();
  }
  
  componentWillReceiveProps(nextProps) {
    this.updateDisplayedMessages( nextProps.activeRoom );
  }
  
  createMessage(newMessageText) {
    if (!this.props.activeRoom || !newMessageText) { return }
    this.messagesRef.push({
        content: newMessageText,
        sentAt: Date.now(),
        roomId: this.props.activeRoom.key,
        creator: this.props.user ? {email: this.props.user.email, displayName: this.props.user.displayName, photoURL: this.props.user.photoURL} : {email: null, displayName: 'Timid Tomato', photoURL: null }
      });
    this.setState({ newMessageText: '' });
  }
  
  handleChange(event) {
    this.setState({newMessageText: event.target.value });
  }
  
  removeMessage(room) {
    this.messagesRef.child(room.key).remove();
  }
  
  scrollToBottom() {
    this.bottomOfMessages.scrollIntoView();
  }
  
  updateDisplayedMessages(activeRoom) {
    if (!activeRoom) { return }
    this.setState({ displayedMessages: this.state.allMessages.filter( message => message.roomId === activeRoom.key ) }, () => this.scrollToBottom() );
  }
  
  watchFirebaseForMessages() {
    this.messagesRef.on('child_added', snapshot  => {
      let message = Object.assign(snapshot.val(), {key: snapshot.key})
      this.setState({ allMessages: this.state.allMessages.concat( message ) }, () => {
        this.updateDisplayedMessages( this.props.activeRoom )
        this.scrollToBottom();
      });
    });
    this.messagesRef.on('child_removed', snapshot  => {
      this.setState({ allMessages: this.state.allMessages.filter( message => message.key !== snapshot.key )  }, () => {
        this.updateDisplayedMessages( this.props.activeRoom )
      });
    });
  }
  
  render() {
    return (
      <main id="messages-component">
        <h2 className="room-name">{ this.props.activeRoom ? this.props.activeRoom.name : '' }</h2>
        <ul id="message-list">
          {this.state.displayedMessages.map( message => 
            <li key={message.key}>
              <div className="photo-url">
                <img src={ (message.creator && message.creator.photoURL) ? message.creator.photoURL : defaultUserImage } alt="user" />
              </div>
              <div className="info">
                <div className="display-name">{ message.creator ? message.creator.displayName : 'Timid Tomato' }</div>
                <Timeago timestamp={ message.sentAt || 'sometime' } />
              </div>
              <div className="content">
                 { message.content }
                 { message.creator && this.props.user && message.creator.email === this.props.user.email &&
                   <button onClick={ () => this.removeMessage(message) } className="remove remove-message-button">&times;</button>
                 }
              </div>
            </li>
          )}
          <div ref={(thisDiv) => this.bottomOfMessages = thisDiv}></div>
        </ul>
        <form id="create-message" onSubmit={ (e) => { e.preventDefault(); this.createMessage(this.state.newMessageText) } }>
          <input type="text" value={ this.state.newMessageText } onChange={ this.handleChange.bind(this) }  name="newMessageText" placeholder="Say something" />
          <input type="submit" />
        </form>
      </main>
    );
  }
}

export default Messages;