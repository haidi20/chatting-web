$(document).ready(function(){
    var socket = io.connect('http://localhost:5000');
    var username = []; 
    var user_id;
    var checkUser = [];
    var chatting_with;
    var exitSubmit = false;
    var alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '!', ',', '.', '\'', '@', '*', '$', '^', '?', '+', '-', '%'];
    var al = alphabet.length;

    socket.on('after connect', function(data){
        // console.log(data);
    });

    $.get('http://localhost:5000/coba').then(function(ress){
        // console.log(ress);
    })

    $('#user-name-submit').click(function(){
        username = $('#user-name-field').val();
        if(username.length == 0) return false;

        socket.emit('new user', {username: username}); 

        $('.user-name').hide();
        $('.main').show();
    });

    socket.on('active users updated', function(users){
        var list = '';

        users.filter(function(user){
            if(user.username === username)
                return false;
            if(checkUser.includes(user.username))
                return false;
            return true;
        }).map(function(user){
            checkUser.push(user.username);
            // console.log('check user '+checkUser);
            list = list+'<li id="'+user.username+'" class="list-group-item d-flex justify-content-between align-items-center active-user">'+user.username+'</li>';
        })

        $('.online-list > .list-group').append(list)
    });

    $(document).on('click', '.active-user', function(){
        var userid = $(this).attr('id');

        socket.emit('fetch chat', {username: username, userid: userid})

        chatting_with = userid
        // console.log(chatting_with)
        return false;
    });

    socket.on('display chat', function(messages){
        // console.log(messages);
        let $list = $('.msg-list');
        $list.html(``);
        if(messages.length == 0)
            return;
        let list_item_array = messages.map(function(message){
            // console.log(message);
            let $li = $("<li>", {"class": "list-group-item msg-item"});
            if(message['sender'] === username)
                $li.addClass('right');
            else
                $li.addClass('left');
            $li.html(message['message']);
            return $li;
        });
        list_item_array.forEach(function(list_item){
            // console.log(list_item);
            $list.append(list_item);
        });
        // console.log($list);	
    })

    $('#send_message').click(function(){
        let message = $('#chat-box').val();

        if(message.length == 0) return;

        // console.log('ini caesar di javascript = '+caesar(message, 1))

        add_message_to_chat(message, username);

        message = caesar(message, 1)
        socket.emit('new message', {message: message, from: username, to: chatting_with});

        exitSubmit = true
        // console.log('exit submit = '+exitSubmit)
    })
    
    // funsi ini yg langsung munculkan pesan di bagian user di tuju
    socket.on('incoming message', function(message){
        // console.log('data message'+message)
        // console.log('exit socket = '+exitSubmit)
        if(!exitSubmit){
            let add_message = caesar(message['message'], -1);
            add_message_to_chat(add_message, message['from']);

            exitSubmit = false;
        }

        if(exitSubmit){
            exitSubmit = false;
        }
    });

    function add_message_to_chat(message, sender)
    {
        let $list = $('.msg-list');
        let $li = $("<li>", {"class": "list-group-item msg-item"});
        console.log('sender = '+sender, 'message = '+message);
        if(sender === username)
            $li.addClass('right');
        else if(sender === chatting_with)
            $li.addClass('left');
        else
            return;
        $li.html(message);
        $list.append($li);
    }

    // const caesarLong = (text, shift) => {
    //     return String.fromCharCode(
    //         ...text.split('').map(char => ((char.charCodeAt() - 97 - shift) % 26) + 97),
    //     );
    // };

    function caesar(text, key) {

        var letters = text.split("");
        var result = "";
        
        for (var o = 0; o <= letters.length; o++) {
    
            for (var i = 0; i <= al - 2; i++) {
    
                if (alphabet[i] == letters[o]) {
                   
                    /* Encrypts if Key is positive, Decrypts if negative */
                    if (key > 0) {
                        result = result + alphabet[(i + key) % al];
                     
                        
                    } else {
                        if (i + key >= 0) {
                            result = result + alphabet[(i + key) % al];
                        } else {
                            result = result + alphabet[i + al + key];
                
    
                        }
                    }
    
                } else if (letters[o] == " " && i == 0) {
    
                    result = result + letters[o];
                }
            } 
        } 
    
        return result;    
    } 
    
});