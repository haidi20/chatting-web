from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app)

list_users = []
active_users = []
messages = {}
main_user = {}

def caesar(plainText, shift, status): 
    cipherText = "" 

    if status == 'encrypt' :
        for ch in plainText: 
            if ch.isalpha(): 
                stayInAlphabet = ord(ch) + shift 
            if stayInAlphabet > ord('z'): 
                stayInAlphabet -= 26 
            
            finalLetter = chr(stayInAlphabet) 
            cipherText += finalLetter 
    elif status == 'descript' :
        for ch in plainText: 
            if ch.isalpha(): 
                stayInAlphabet = ord(ch) - shift 
            if stayInAlphabet < ord('a'): 
                stayInAlphabet += 26 
            
            finalLetter = chr(stayInAlphabet) 
            cipherText += finalLetter 

    return cipherText

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/coba')
def coba():

    plainText = "haidi"
    shift = 1

    result = caesar(plainText, shift, 'encrypt')
    return result 

@socketio.on('connect')
def test_connect():
    emit('after connect', {'data': 'terkoneksi'})

@socketio.on('new user')
def new_user(message):
    user = {}

    sid         = request.sid
    username    = message['username']

    user['sid']         = sid
    user['username']    = username

    if not username in list_users:
        list_users.append(username)
        active_users.append(user)
        messages[username] = {}

    emit('active users updated', active_users, broadcast=True)

# ketika klik nama user, maka langsung muncul chatting di room chat
@socketio.on('fetch chat')
def fetch_chat(data):
    userid      = data['userid']
    username    = data['username']


    msgs = []
    if messages[userid] and messages[userid]:
        msgs = messages[username][userid]

    emit('display chat', msgs, broadcast=False, json=True)

@socketio.on('new message')
def new_message(data):
    message         = data['message']
    username        = data['from']
    chatting_with   = data['to']

    msg1 = {'message': message, 'sender': username}
    msg2 = {'message': message, 'sender': username}

    if not chatting_with in messages[username]:
       messages[username][chatting_with] = []
    
    if not username in messages[chatting_with]:
        messages[chatting_with][username] = []

    # messages[username][chatting_with].append(caesar(msg1, 1, 'encrypt'))
    # messages[username][chatting_with].append(caesar(msg2, 1, 'encrypt'))
    messages[username][chatting_with].append(msg1)
    messages[chatting_with][username].append(msg2)          

    emit('incoming message', {'message':message, 'from':username}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='localhost', debug=True)