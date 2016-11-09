'use strict';
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
var Messenger = function () {
    function Messenger() {
        _classCallCheck(this, Messenger);
        this.messageList = [];
        this.deletedList = [];
        this.me = 1;
        this.them = 5;
        this.onRecieve = function (message) {
            return console.log('Recieved: ' + message.text);
        };
        this.onSend = function (message) {
            return console.log('Sent: ' + message.text);
        };
        this.onDelete = function (message) {
            return console.log('Deleted: ' + message.text);
        };
    }
    Messenger.prototype.send = function send() {
        var text = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        var nickname = arguments[1] === undefined ? '' : arguments[1];
        text = this.filter(text);
        if (this.validate(text)) {
            var message = {
                user: this.me,
                text: text,
                time: new Date().getTime(),
                nickname: nickname
            };
            this.messageList.push(message);
            this.onSend(message);
        }
    };
    Messenger.prototype.recieve = function recieve() {
        var text = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        var nickname = arguments[1] === undefined ? '' : arguments[1];
        text = this.filter(text);
        if (this.validate(text)) {
            var message = {
                user: this.them,
                text: text,
                time: new Date().getTime(),
                nickname: nickname
            };
            this.messageList.push(message);
            this.onRecieve(message);
        }
    };
    Messenger.prototype.delete = function _delete(index) {
        index = index || this.messageLength - 1;
        var deleted = this.messageLength.pop();
        this.deletedList.push(deleted);
        this.onDelete(deleted);
    };
    Messenger.prototype.filter = function filter(input) {
        var output = input.replace('bad input', 'good output');
        return output;
    };
    Messenger.prototype.validate = function validate(input) {
        return !!input.length;
    };
    return Messenger;
}();
var BuildHTML = function () {
    function BuildHTML() {
        _classCallCheck(this, BuildHTML);
        this.messageWrapper = 'message-wrapper';
        this.circleWrapper = 'circle-wrapper';
        this.textWrapper = 'text-wrapper';
        this.meClass = 'me';
        this.themClass = 'them';
    }
    BuildHTML.prototype._build = function _build(text, who, nickname) {
        return '<div class="' + this.messageWrapper + ' ' + this[who + 'Class'] + '">\n              <div class="' + this.circleWrapper + ' animated bounceIn">' + nickname.substring(0,1) + '</div>\n              <div class="' + this.textWrapper + '">...</div>\n            </div>';
    };
    BuildHTML.prototype.me = function me(text, nickname) {
        return this._build(text, 'me', nickname);
    };
    BuildHTML.prototype.them = function them(text, nickname) {
        return this._build(text, 'them', nickname);
    };
    return BuildHTML;
}();
$(document).ready(function () {
    var messenger = new Messenger();
    var buildHTML = new BuildHTML();
    var $input = $('#input');
    var $send = $('#send');
    var $content = $('#content');
    var $inner = $('#inner');
    var nickField = $('#nickField');
    var nickname;
    var socket = io();

    // Check if nickname stored in localStorage
    if('localStorage' in window && localStorage.getItem('nickname')) {
      nickname = localStorage.getItem('nickname');
    } else {
      // If not in localStorage, prompt user for nickname
      nickname = prompt('Please enter your nickname');
      if('localStorage' in window) {
        localStorage.setItem('nickname', nickname);
      }
    }
    // Send message to server that user has joined
    socket.emit('join', nickname);
    nickField.html(nickname);

    function safeText(text) {
        $content.find('.message-wrapper').last().find('.text-wrapper').text(text);
    }
    function animateText() {
        setTimeout(function () {
            $content.find('.message-wrapper').last().find('.text-wrapper').addClass('animated fadeIn');
        }, 350);
    }
    function scrollBottom() {
        $($inner).animate({ scrollTop: $($content).offset().top + $($content).outerHeight(true) }, {
            queue: false,
            duration: 'ease'
        });
    }
    function buildSent(message) {
        console.log('sending: ', message.text);
        $content.append(buildHTML.me(message.text, message.nickname));
        safeText(message.text);
        animateText();
        scrollBottom();
        var data = { msg: message.text, nickname: message.nickname, when: new Date(), senderid: socket.id };
        console.log(socket.id);
        socket.emit('msg', data);
    }
    function buildRecieved(message) {
        console.log('recieving: ', message.text);
        $content.append(buildHTML.them(message.text, message.nickname));
        safeText(message.text);
        animateText();
        scrollBottom();
    }
    function sendMessage() {
        var text = $input.val();
        messenger.send(text, nickname);
        $input.val('');
        $input.focus();
    }
    messenger.onSend = buildSent;
    messenger.onRecieve = buildRecieved;

    $input.focus();
    $send.on('click', function (e) {
        sendMessage();
    });
    $input.on('keydown', function (e) {
        var key = e.which || e.keyCode;
        if (key === 13) {
            e.preventDefault();
            sendMessage();
        }
    });
    socket.on('msg', function(data) {
      console.log('New message received');
      messenger.recieve(data.msg, data.nickname);
    });
});
