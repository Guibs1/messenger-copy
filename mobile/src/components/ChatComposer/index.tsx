import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { AppLoading } from 'expo'
import { GiftedChat, IMessage } from 'react-native-gifted-chat';

import api from '../../services/api';
// Sample: https://github.com/FaridSafi/react-native-gifted-chat/blob/master/App.tsx

interface User {
    _id: number,
    name: string,
    avatar: string
}

const ChatComposer = (props: any) => {
    const [message, setMessage] = useState<IMessage[]>([]);
    const [user, setUser] = useState<User>();

    async function handleSendMessage(messages: IMessage[]) {
        const {_id, createdAt, received, sent, text, user} = { ...messages[0], sent: true, received: true };
        const sentDate = `${new Date(createdAt).toISOString().replace('T', ' ').substring(0,(new Date(createdAt).toISOString().replace('T', ' ').length -5))}`;
        const data = {
            _id,
            createdAt: sentDate,
            text,
            from_user_id: user._id,
            to_user_id: 2
        };
        await api.post('messages', data);
        // setMessage([messages[0],...message]);
        return;
    }

    const onSend = async (newMessages= []) => {
        // console.log(newMessages[0]);
        const {_id, createdAt, received, sent, text, user} = { ...newMessages[0], sent: true, received: true };
        const sentDate = `${new Date(createdAt).toISOString().replace('T', ' ').substring(0,(new Date(createdAt).toISOString().replace('T', ' ').length -5))}`;
        const data = {
            _id,
            createdAt: sentDate,
            text,
            from_user_id: user._id,
            to_user_id: 2
        };
        // console.log(data);
        await api.post('messages', data);
        setMessage((prevMessages) => GiftedChat.append(prevMessages, newMessages));
    };

    useEffect(()=> {
        const to_id = props.user.id === 1? 2 : 1;
        
        api.get('/messages', {
            params: {
                from_user_id: props.user.id,
                to_user_id: to_id
            }
        }).then(response => {
            const messages = response.data;
            const oldMessages = [];
            for(let i = 0; i < messages.length; i++){
                const {_id, text, createdAt, from_user_id, image, video} = messages[i];
                oldMessages.push({
                    _id,
                    text,
                    createdAt,
                    user: {
                      _id: from_user_id,
                      name: 'React Native',
                      avatar: 'https://facebook.github.io/react/img/logo_og.png',
                    },
                    image,
                    video,
                });
            }
            setMessage(oldMessages);
        })
    }, [setUser, GiftedChat.bind(GiftedChat)]);

    useEffect(()=>{
        const {id, name, avatar} = props.user;
        setUser({
            _id: id, 
            name, 
            avatar
        });
    },[])

    if (!message) {
        return <AppLoading />
    }

    return (
        <View style={styles.container}>
            <GiftedChat
                messages={message}
                onSend={onSend}
                user={user}
                loadEarlier={false}
                scrollToBottom
                onLongPressAvatar={user => alert(JSON.stringify(user))}
                onPressAvatar={() => alert('short press')}
                
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
});


export default ChatComposer;