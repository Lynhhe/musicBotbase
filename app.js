const Discord = require("discord.js");
const { userInfo } = require("os");
const ytdl = require("ytdl-core");

const { Clients, MessageEmbed } = require('discord.js');
const { info, Console } = require("console");
const { disconnect, connected } = require("process");
const { connect } = require("http2");

const Client = new Discord.Client;

var list = [];

let prefix = ">";


Client.on("ready" , () => {
    console.log('Bot en operationnel');

    Client.user.setActivity( prefix + 'help', { type: 'WATCHING' })
    .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
    .catch(console.error);
    console.log(`[#] connected as \x1b[31m ${Client.user.tag} \x1b[0m!`)
});

Client.on("message", async message => {
    if(message.content === prefix + "playlist" ){
        let msg = " ";

        for(var i = 0; i < list.length; i++){
            let name;
            
            

        
            let getinfo = await ytdl.getBasicInfo(list[i]);
            name = getinfo.videoDetails.title;
            await  ytdl.getInfo(list[i], (err , info) => {
                if(err){
                    console.log("erreur de lien :" + err);
                    list.slice(i, 1);
                } else {
                    name = info.title;
                }
            });
            let durationVideo = getinfo.videoDetails.lengthSeconds /60 ;
            //msg += " " + i + " - " + name + "\n";
            msg += `${i + 1} - ${name} (${durationVideo.toFixed(2)} minutes +/-)\n\n`
        }
        //embed playlist
        const embed = new MessageEmbed()
        .setTitle('**playlist actuelle**')
        .setDescription(msg)
        .setColor('#00eaff')
        .setTimestamp();
        message.channel.send(embed);
    } else if(message.content.startsWith(prefix + "play")){
        if(message.member.voice.channel){
            let args = message.content.split(" ");

            if(args[1] == undefined){
                message.reply("lien de la vidéo non valide ! ");
            } else {
                if(list.length > 0){
                    list.push(args[1]);
                    message.reply("vidéo ajouté à la liste de lecture ! ");
                } else if(args[1].startsWith("https://www.youtube.com/watch?v=" )){
                    list.push(args[1]);
                    message.reply("vidéo ajouté à la liste de lecture ! ");

                    message.member.voice.channel.join().then( connection => {
                        playMusic(connection);
                        connection.on("disconnect", () => {
                            list = [];
                        });

                    }).catch( err => {
                        console.log(" erreur lors de la connection :" + err);
                    })
                } else if(args[1].startsWith("https://m.youtube.com/")){
                    list.push(args[1]);
                    message.reply("vidéo ajouté à la liste de lecture ! ");

                    message.member.voice.channel.join().then( connection => {
                        playMusic(connection);
                        connection.on("disconnect", () => {
                            list = [];
                        });

                    }).catch( err => {
                        console.log(" erreur lors de la connection :" + err);
                    })
                } else if(args[1].startsWith("https://youtu.be/")){
                    list.push(args[1]);
                    message.reply("vidéo ajouté à la liste de lecture ! ");

                    message.member.voice.channel.join().then( connection => {
                        playMusic(connection);
                        connection.on("disconnect", () => {
                            list = [];
                        });

                    }).catch( err => {
                        console.log(" erreur lors de la connection :" + err);
                    })
                } else {
                    message.channel.send("lien de la vidéo non valide ")
                } 
            }
        }
    } else if(message.content == prefix + "leave" || message.content == prefix + "disconnect"){
        list = [];
        message.member.voice.channel.join().then( connection => {
            playMusic(connection);
            connection.on("disconnect", () => {
                list = [];
            });

        }).catch( err => {
            console.log(" erreur lors de la connection :" + err);
        })
        message.member.voice.channel.leave();
    } else if(message.content == prefix + "skip"){
        if(message.member.voice.channel && list.length > 0){
            let name;
        
            let getinfo = await ytdl.getBasicInfo(list[1]);
            name = getinfo.videoDetails.title;
            
            list.shift();
            
            message.member.voice.channel.join().then( connection => {
                playMusic(connection);
                connection.on("disconnect", () => {
                    list = [];
                });

            }).catch( err => {
                console.log(" erreur lors de la connection :" + err);
            })
            if(list.length > 0){
            message.channel.send(" la musique à était skip, nous ecoutons maintenant : \n__" + name +"__.");
            } else if(list.length == 0){
                message.channel.send("la musique à était skip ( c'est la fin de la playlist) ");
            }
        } else if(!message.member.voice.channel){
            message.channel.send(" erreur, tu n'es pas dans un salon vocal ")
        } else if(list.length == 0){
            message.channel.send(" erreur, la playlist est deja vide ")
        }
            
        
    } else if(message.content == prefix + "help"){
        const embed = new MessageEmbed()
        .setTitle("help commands")
        .addFields(
            { name: '>play <lien_d\'une_video_youtube>', value: 'Permet au Bot de jouer votre musique pour tous les utilisateurs présents dans le vocal' },
            { name: '>playlist', value: 'Affiche les musiques qui vont être jouées et la musique actuelle',  },
            { name: '>skip', value: 'passe à la musique suivante dans l\'ordre de la playlist',  },
            { name: '>leave', value: 'le bot quitte le salon vocal et ne joue plus de musique ( sauf si vous refaites >play)',  },
        )
        .setColor('#00eaff');
        message.channel.send(embed)
    }

});


function playMusic(connection){
    let dispatcher = connection.play(ytdl(list[0], { quality : "highestaudio"}));

    dispatcher.on("finish", () => {
        list.shift();
        dispatcher.destroy();

        if(list.length > 0 ){
            playMusic(connection);
        } else {
            connection.disconnect();
        }
    });

    dispatcher.on("Error" , Err =>{
        console.log(" erreur de dispatcher :" + Err);
        dispatcher.destroy();
        connection.disconnect();
    })
}

Client.login('xxx');