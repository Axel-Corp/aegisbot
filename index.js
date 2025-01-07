const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { REST, Routes } = require('discord.js');
require('dotenv').config();

// Initialisation du client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Configuration du REST pour enregistrer les commandes
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Chargement des commandes
const commands = [
    {
        name: 'ban',
        description: 'Bannir un utilisateur',
        options: [
            {
                name: 'utilisateur',
                type: 6, // USER
                description: 'L utilisateur à bannir',
                required: true
            }
        ]
    },
    {
        name: 'mute',
        description: 'Rendre un utilisateur muet pour un certain temps',
        options: [
            {
                name: 'utilisateur',
                type: 6, // USER
                description: 'L utilisateur à rendre muet',
                required: true
            },
            {
                name: 'durée',
                type: 3, // STRING
                description: 'Durée pour rendre l utilisateur muet (ex: 1 minute, 1 jour)',
                required: true
            }
        ]
    },
    {
        name: 'warn',
        description: 'Avertir un utilisateur',
        options: [
            {
                name: 'utilisateur',
                type: 6, // USER
                description: 'L utilisateur à avertir',
                required: true
            },
            {
                name: 'raison',
                type: 3, // STRING
                description: 'La raison de l\'avertissement',
                required: true
            }
        ]
    },
    {
        name: 'clear',
        description: 'Supprimer un certain nombre de messages',
        options: [
            {
                name: 'nombre',
                type: 4, // INTEGER
                description: 'Le nombre de messages à supprimer',
                required: true
            }
        ]
    },
    {
        name: 'kick',
        description: 'Expulser un utilisateur',
        options: [
            {
                name: 'utilisateur',
                type: 6, // USER
                description: 'L utilisateur à expulser',
                required: true
            }
        ]
    },
    {
        name: 'unmute',
        description: 'Annuler un mute',
        options: [
            {
                name: 'utilisateur',
                type: 6, // USER
                description: 'L utilisateur à unmute',
                required: true
            }
        ]
    }
];

// Enregistrement des commandes slash
(async () => {
    try {
        console.log('🔄 Enregistrement des commandes slash...');
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
        console.log('✅ Commandes enregistrées avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement des commandes:', error);
    }
})();

// Fonction pour envoyer un embed
function createEmbed(title, description, color = 0x3498db) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
}

// Fonction pour envoyer un log
async function sendLog(guild, embed) {
    const logChannel = guild.channels.cache.get(process.env.LOG_CHANNEL_ID);
    if (!logChannel) return console.error('Canal de log introuvable.');
    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Erreur lors de l\'envoi des logs:', error);
    }
}

// Commandes
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    // Commande /ban
    if (commandName === 'ban') {
        const user = interaction.options.getUser('utilisateur');
        try {
            await interaction.guild.members.ban(user);

            const embed = createEmbed(
                'Bannissement',
                `${user.tag} a été banni du serveur.`,
                0xe74c3c
            );
            await interaction.reply({ embeds: [embed] });

            sendLog(interaction.guild, embed);
        } catch (error) {
            console.error('Erreur lors du bannissement:', error);
            interaction.reply('Une erreur est survenue lors du bannissement.');
        }
    }

    // Commande /mute
    if (commandName === 'mute') {
        const user = interaction.options.getUser('utilisateur');
        const durationStr = interaction.options.getString('durée');
        const durationMs = parseTime(durationStr);

        if (!durationMs) {
            return interaction.reply('Le format de la durée est incorrect. Utilisez des formats comme "1 minute", "2 heures", "1 jour", etc.');
        }

        try {
            const member = interaction.guild.members.cache.get(user.id);
            await member.timeout(durationMs);

            const embed = createEmbed(
                'Mute',
                `${user.tag} a été rendu muet pour ${durationStr}.`,
                0xf39c12
            );
            await interaction.reply({ embeds: [embed] });

            sendLog(interaction.guild, embed);
        } catch (error) {
            console.error('Erreur lors du mute:', error);
            interaction.reply('Une erreur est survenue lors de la mise en sourdine de l\'utilisateur.');
        }
    }

    // Commande /warn
    if (commandName === 'warn') {
        const user = interaction.options.getUser('utilisateur');
        const reason = interaction.options.getString('raison');

        try {
            const embed = createEmbed(
                'Avertissement',
                `${user.tag} a été averti pour : ${reason}`,
                0xf39c12
            );
            await interaction.reply({ embeds: [embed] });

            sendLog(interaction.guild, embed);
            
            // Envoie d'un MP à la personne avertie
            const dmEmbed = createEmbed('Avertissement', `Vous avez été averti pour : ${reason}`, 0xf39c12);
            await user.send({ embeds: [dmEmbed] });

        } catch (error) {
            console.error('Erreur lors de l\'avertissement:', error);
            interaction.reply('Une erreur est survenue lors de l\'avertissement.');
        }
    }

    // Commande /clear
    if (commandName === 'clear') {
        const number = interaction.options.getInteger('nombre');
        try {
            const messages = await interaction.channel.messages.fetch({ limit: number });
            await interaction.channel.bulkDelete(messages);

            const embed = createEmbed(
                'Messages supprimés',
                `${number} messages ont été supprimés.`,
                0x2ecc71
            );
            await interaction.reply({ embeds: [embed] });

            sendLog(interaction.guild, embed);
        } catch (error) {
            console.error('Erreur lors de la suppression des messages:', error);
            interaction.reply('Une erreur est survenue lors de la suppression des messages.');
        }
    }

    // Commande /kick
    if (commandName === 'kick') {
        const user = interaction.options.getUser('utilisateur');
        try {
            await interaction.guild.members.kick(user);

            const embed = createEmbed(
                'Expulsion',
                `${user.tag} a été expulsé du serveur.`,
                0xe74c3c
            );
            await interaction.reply({ embeds: [embed] });

            sendLog(interaction.guild, embed);
        } catch (error) {
            console.error('Erreur lors de l\'expulsion:', error);
            interaction.reply('Une erreur est survenue lors de l\'expulsion de l\'utilisateur.');
        }
    }

    // Commande /unmute
    if (commandName === 'unmute') {
        const user = interaction.options.getUser('utilisateur');
        try {
            const member = interaction.guild.members.cache.get(user.id);
            await member.timeout(null);

            const embed = createEmbed(
                'Unmute',
                `${user.tag} a été unmuté.`,
                0xf39c12
            );
            await interaction.reply({ embeds: [embed] });

            sendLog(interaction.guild, embed);
        } catch (error) {
            console.error('Erreur lors du unmute:', error);
            interaction.reply('Une erreur est survenue lors de la levée du mute.');
        }
    }
});

// Fonction pour analyser une durée au format (1 minute, 2 heures, etc.)
function parseTime(timeStr) {
    const timeRegex = /(\d+)\s*(secondes?|minutes?|heures?|jours?)/i;
    const match = timeStr.match(timeRegex);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
        case 'seconde':
        case 'secondes':
            return value * 1000;
        case 'minute':
        case 'minutes':
            return value * 60 * 1000;
        case 'heure':
        case 'heures':
            return value * 60 * 60 * 1000;
        case 'jour':
        case 'jours':
            return value * 24 * 60 * 60 * 1000;
        default:
            return null;
    }
}

// Fonction d'auto-modération (filtrage de spam et de mots offensants)
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Liste des mots offensants
    const offensiveWords = ['motOffensant1', 'motOffensant2']; // Remplace par des mots réels
    if (offensiveWords.some(word => message.content.toLowerCase().includes(word))) {
        await message.delete();
        message.reply({ content: 'Votre message a été supprimé en raison d\'un contenu inapproprié.' });

        const embed = createEmbed(
            'Suppression de message',
            `Un message de ${message.author.tag} a été supprimé pour contenu offensant.`,
            0xe74c3c
        );
        sendLog(message.guild, embed);
    }

    // Détection de spam (trop de messages en peu de temps)
    // A adapter selon le besoin
    const recentMessages = await message.channel.messages.fetch({ limit: 5 });
    const userMessages = recentMessages.filter(m => m.author.id === message.author.id);
    if (userMessages.size > 3) {
        await message.delete();
        message.reply({ content: 'Vous êtes spammé, vos messages ont été supprimés.' });

        const embed = createEmbed(
            'Spam détecté',
            `Un utilisateur a été détecté en train de spammer: ${message.author.tag}`,
            0xf39c12
        );
        sendLog(message.guild, embed);
    }
});

// Connexion du bot
client.login(process.env.TOKEN);
